"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X, ZoomIn, ZoomOut, RotateCw, RefreshCw,
  Image as ImageIcon, Sparkles, Crop, Maximize2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/api/supabaseClient";

/**
 * Format bytes to human readable format (KB, MB)
 */
function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Target Card Dimensions:
 * 16:9 Standard HD Article Card / OpenGraph / Discover Banner
 */
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 675;

export default function TnTodayImageCropModal({
  isOpen,
  imageFile,
  onClose,
  onUploadComplete,
  articleSlug = "tn-today-news",
}) {
  const [imageObj, setImageObj] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [originalFileSize, setOriginalFileSize] = useState(0);

  // Crop Controls
  const [zoom, setZoom] = useState(1.0); // Range: 0.4 to 3.0
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState("fit"); // "fit" (Fit Whole Graphic) | "cover" (Cover Card)
  const [bgStyle, setBgStyle] = useState("blur"); // "blur" (Frosted Glass) | "dark" (Slate-950)
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [showGrid, setShowGrid] = useState(true);

  // Processing / Uploading state
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // References
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startDragPos = useRef({ x: 0, y: 0 });
  const startPanPos = useRef({ x: 0, y: 0 });

  // 1. Load Image from incoming File / Blob / Object URL
  useEffect(() => {
    if (!isOpen || !imageFile) {
      setImageObj(null);
      return;
    }

    let urlToRevoke = null;
    let srcUrl = "";

    if (imageFile instanceof File || imageFile instanceof Blob) {
      setOriginalFileSize(imageFile.size);
      srcUrl = URL.createObjectURL(imageFile);
      urlToRevoke = srcUrl;
    } else if (typeof imageFile === "string") {
      srcUrl = imageFile;
      setOriginalFileSize(0);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageObj(img);
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      // Reset controls to clean default
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
      setRotation(0);
      setMode("fit"); // Default: Fit Whole Graphic (Prevents 4x-5x Zoom Glitch!)
      setBgStyle("blur");
    };
    img.onerror = () => {
      console.error("Failed to load image for crop modal");
    };
    img.src = srcUrl;

    return () => {
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [isOpen, imageFile]);

  // 2. Render Viewport Canvas
  const drawViewport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Effective dimensions taking rotation into account
    const isRotated90or270 = rotation === 90 || rotation === 270;
    const effWidth = isRotated90or270 ? naturalSize.height : naturalSize.width;
    const effHeight = isRotated90or270 ? naturalSize.width : naturalSize.height;

    if (!effWidth || !effHeight) return;

    // Calculate base scale factors
    const fitScale = Math.min(width / effWidth, height / effHeight);
    const coverScale = Math.max(width / effWidth, height / effHeight);

    // Base scale depending on mode:
    // In "fit" mode: 1.0x zoom means 100% of the graphic fits inside with 0 pixels clipped!
    // In "cover" mode: 1.0x zoom means graphic covers the viewport.
    const baseScale = mode === "fit" ? fitScale : coverScale;
    const currentScale = baseScale * zoom;

    // --- STEP A: Background Layer for "fit" mode ---
    if (mode === "fit") {
      if (bgStyle === "blur") {
        ctx.save();
        ctx.filter = "blur(18px) brightness(0.6) saturate(1.2)";
        // Draw background scaled to cover the entire canvas
        const bgCoverScale = Math.max(width / effWidth, height / effHeight) * 1.15;
        ctx.translate(width / 2, height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(
          imageObj,
          (-naturalSize.width / 2) * bgCoverScale,
          (-naturalSize.height / 2) * bgCoverScale,
          naturalSize.width * bgCoverScale,
          naturalSize.height * bgCoverScale
        );
        ctx.restore();

        // Subtle dark tint over blur to ensure foreground graphic pops
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      } else {
        // Dark slate fill
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      // In cover mode: dark background behind image (if panned away)
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, width, height);
    }

    // --- STEP B: Foreground Main Image ---
    ctx.save();
    // Center of viewport + user pan offset
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);

    const drawW = naturalSize.width * currentScale;
    const drawH = naturalSize.height * currentScale;

    // High quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      imageObj,
      -drawW / 2,
      -drawH / 2,
      drawW,
      drawH
    );
    ctx.restore();

    // --- STEP C: Rule-of-Thirds Grid Overlay (Optional) ---
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical 1/3 lines
      ctx.beginPath();
      ctx.moveTo(width / 3, 0);
      ctx.lineTo(width / 3, height);
      ctx.moveTo((width * 2) / 3, 0);
      ctx.lineTo((width * 2) / 3, height);

      // Horizontal 1/3 lines
      ctx.moveTo(0, height / 3);
      ctx.lineTo(width, height / 3);
      ctx.moveTo(0, (height * 2) / 3);
      ctx.lineTo(width, (height * 2) / 3);
      ctx.stroke();
      ctx.restore();
    }
  }, [imageObj, naturalSize, zoom, pan, mode, bgStyle, rotation, showGrid]);

  // Redraw whenever parameters change or canvas resizes
  useEffect(() => {
    drawViewport();
  }, [drawViewport]);

  // Adjust canvas internal resolution to match container CSS size
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = Math.round(rect.width);
        canvas.height = Math.round(rect.height);
        drawViewport();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [drawViewport]);

  // 3. Mouse & Touch Dragging (Pan)
  const handlePointerDown = (e) => {
    if (e.button !== 0) return; // Primary click only
    isDraggingRef.current = true;
    startDragPos.current = { x: e.clientX, y: e.clientY };
    startPanPos.current = { ...pan };
    if (canvasRef.current) {
      canvasRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startDragPos.current.x;
    const deltaY = e.clientY - startDragPos.current.y;
    setPan({
      x: startPanPos.current.x + deltaX,
      y: startPanPos.current.y + deltaY,
    });
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    if (canvasRef.current) {
      try {
        canvasRef.current.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // 4. Smooth Mouse Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.0015;
    setZoom((prev) => {
      const next = Math.min(Math.max(prev + zoomDelta, 0.4), 3.0);
      return Math.round(next * 100) / 100;
    });
  };

  // 5. Rotation handler
  const handleRotate = (deg = 90) => {
    setRotation((prev) => (prev + deg + 360) % 360);
    setPan({ x: 0, y: 0 }); // Reset pan on rotation
  };

  // 6. Reset all adjustments
  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setMode("fit");
  };

  // 7. 1:1 WYSIWYG Canvas Export & Auto-Compression
  const handleApplyAndUpload = async () => {
    if (!imageObj) return;

    setIsProcessing(true);
    setUploadProgress("Compressing to WebP (1200×675)...");

    try {
      // Create offscreen export canvas at 1200 x 675
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = TARGET_WIDTH;
      exportCanvas.height = TARGET_HEIGHT;
      const ctx = exportCanvas.getContext("2d");

      // Scale multiplier from preview viewport to target 1200x675
      const previewCanvas = canvasRef.current;
      const scaleMultiplier = previewCanvas ? TARGET_WIDTH / previewCanvas.width : 1;

      const isRotated90or270 = rotation === 90 || rotation === 270;
      const effWidth = isRotated90or270 ? naturalSize.height : naturalSize.width;
      const effHeight = isRotated90or270 ? naturalSize.width : naturalSize.height;

      const fitScale = Math.min(TARGET_WIDTH / effWidth, TARGET_HEIGHT / effHeight);
      const coverScale = Math.max(TARGET_WIDTH / effWidth, TARGET_HEIGHT / effHeight);
      const baseScale = mode === "fit" ? fitScale : coverScale;
      const currentScale = baseScale * zoom;

      // STEP A: Background
      if (mode === "fit") {
        if (bgStyle === "blur") {
          ctx.save();
          ctx.filter = "blur(24px) brightness(0.6) saturate(1.2)";
          const bgCoverScale = Math.max(TARGET_WIDTH / effWidth, TARGET_HEIGHT / effHeight) * 1.15;
          ctx.translate(TARGET_WIDTH / 2, TARGET_HEIGHT / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(
            imageObj,
            (-naturalSize.width / 2) * bgCoverScale,
            (-naturalSize.height / 2) * bgCoverScale,
            naturalSize.width * bgCoverScale,
            naturalSize.height * bgCoverScale
          );
          ctx.restore();

          // Dark overlay
          ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
          ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
        } else {
          ctx.fillStyle = "#090d16";
          ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
        }
      } else {
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
      }

      // STEP B: Foreground Image
      ctx.save();
      const exportPanX = pan.x * scaleMultiplier;
      const exportPanY = pan.y * scaleMultiplier;
      ctx.translate(TARGET_WIDTH / 2 + exportPanX, TARGET_HEIGHT / 2 + exportPanY);
      ctx.rotate((rotation * Math.PI) / 180);

      const drawW = naturalSize.width * currentScale;
      const drawH = naturalSize.height * currentScale;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        imageObj,
        -drawW / 2,
        -drawH / 2,
        drawW,
        drawH
      );
      ctx.restore();

      // STEP C: In-Browser WebP Auto-Compression (<85 KB target)
      setUploadProgress("Optimizing compression (WebP 0.82)...");

      const blob = await new Promise((resolve) => {
        exportCanvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else {
              // Fallback to jpeg if browser lacks webp canvas export
              exportCanvas.toBlob((jb) => resolve(jb), "image/jpeg", 0.82);
            }
          },
          "image/webp",
          0.82
        );
      });

      if (!blob) throw new Error("Could not compress image");

      setUploadProgress(`Uploading ${formatBytes(blob.size)} to Storage...`);

      // STEP D: Direct Upload to Supabase Storage ('media' bucket)
      const sanitizedSlug = (articleSlug || "tn-today")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .substring(0, 40);
      const fileName = `tntoday-${sanitizedSlug}-${Date.now()}.webp`;

      const { data, error } = await supabase.storage
        .from("media")
        .upload(fileName, blob, {
          contentType: "image/webp",
          cacheControl: "31536000", // 1 year cache
          upsert: true,
        });

      if (error) throw error;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);

      let finalUrl = publicUrl;
      if (finalUrl && !finalUrl.includes("/storage/v1/object/public/")) {
        finalUrl = finalUrl.replace(
          "/storage/v1/object/media/",
          "/storage/v1/object/public/media/"
        );
      }

      setUploadProgress("Done!");
      if (onUploadComplete) {
        onUploadComplete({
          url: finalUrl,
          size: blob.size,
          originalSize: originalFileSize,
          width: TARGET_WIDTH,
          height: TARGET_HEIGHT,
        });
      }
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Image compression or upload failed: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
      setUploadProgress("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* --- HEADER --- */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  TN Today Article Image Studio
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  16:9 Card
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pan, zoom, and auto-compress without forced clipping
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- CANVAS VIEWPORT (Interactive 16:9 Card) --- */}
        <div className="relative p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center overflow-hidden flex-1 min-h-[260px]">
          <div
            ref={containerRef}
            onWheel={handleWheel}
            className="relative w-full max-w-[620px] aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border-2 border-blue-500/50 cursor-grab active:cursor-grabbing select-none bg-slate-900"
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full h-full block touch-none"
            />

            {/* Viewfinder Badge */}
            <div className="absolute top-2.5 left-2.5 pointer-events-none flex items-center gap-2">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-sm">
                1200 × 675 px (WYSIWYG)
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-600/80 backdrop-blur-md text-white shadow-sm">
                {mode === "fit" ? "🖼️ Fit Graphic (100%)" : "✂️ Cover Bleed"}
              </span>
            </div>

            {/* Pan Hint Overlay */}
            <div className="absolute bottom-2.5 right-2.5 pointer-events-none text-[10px] font-medium text-white/70 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs">
              ✋ Drag to pan • 🔍 Scroll to zoom
            </div>
          </div>
        </div>

        {/* --- TOOLBAR CONTROLS --- */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 space-y-3.5 flex-shrink-0">
          {/* Row 1: Mode Switcher & Tools */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Mode Toggle (Eliminates forced 4x-5x zoom) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode("fit");
                  setZoom(1.0);
                  setPan({ x: 0, y: 0 });
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  mode === "fit"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
                title="Keep 100% of the graphic visible with aesthetic blurred backdrop (Recommended for posters & announcements)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Fit Graphic (100%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("cover");
                  setZoom(1.0);
                  setPan({ x: 0, y: 0 });
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                  mode === "cover"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                )}
                title="Fill the entire 16:9 card box (Best for scenic photos)"
              >
                <Crop className="w-3.5 h-3.5" />
                Cover Card
              </button>
            </div>

            {/* Backing Style (when in Fit Mode) */}
            {mode === "fit" && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px] font-medium hidden sm:inline">Margins:</span>
                <button
                  type="button"
                  onClick={() => setBgStyle("blur")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors",
                    bgStyle === "blur"
                      ? "bg-slate-800 text-blue-400 border-blue-500/40"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  )}
                >
                  ✨ Blur
                </button>
                <button
                  type="button"
                  onClick={() => setBgStyle("dark")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors",
                    bgStyle === "dark"
                      ? "bg-slate-800 text-blue-400 border-blue-500/40"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  )}
                >
                  ⬛ Dark
                </button>
              </div>
            )}

            {/* Utility buttons */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => handleRotate(90)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rotate</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors",
                  showGrid ? "bg-blue-600/30 text-blue-300 border border-blue-500/40" : "bg-slate-800 text-slate-400 hover:text-white"
                )}
                title="Toggle Rule-of-Thirds Grid"
              >
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
                title="Reset Position and Zoom"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Row 2: Expanded Zoom Slider (0.4x to 3.0x) */}
          <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10))}
              className="text-slate-400 hover:text-white p-1"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="0.4"
              max="3.0"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3.0, Math.round((z + 0.1) * 10) / 10))}
              className="text-slate-400 hover:text-white p-1"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-bold text-blue-400 w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>

            {/* Quick preset chips */}
            <div className="hidden sm:flex items-center gap-1 border-l border-slate-800 pl-2">
              <button
                type="button"
                onClick={() => setZoom(0.5)}
                className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                0.5×
              </button>
              <button
                type="button"
                onClick={() => setZoom(1.0)}
                className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-600/30 text-blue-300 border border-blue-500/30"
              >
                1.0×
              </button>
              <button
                type="button"
                onClick={() => setZoom(1.5)}
                className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                1.5×
              </button>
              <button
                type="button"
                onClick={() => setZoom(2.0)}
                className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                2.0×
              </button>
            </div>
          </div>

          {/* Row 3: Live Compression & Action Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Compression Stats */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Original:{" "}
                <strong className="text-slate-200">
                  {originalFileSize ? formatBytes(originalFileSize) : "Direct file"}
                </strong>
              </span>
              <span>➔</span>
              <span>
                Target:{" "}
                <strong className="text-emerald-400">
                  WebP ~50–85 KB (1200×675)
                </strong>
              </span>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isProcessing}
                className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleApplyAndUpload}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 px-5 py-2.5 rounded-xl"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{uploadProgress || "Processing..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Apply & Upload to TN Today</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
