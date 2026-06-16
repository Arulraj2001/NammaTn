import React, { useRef, useState } from "react";
import { Upload, X, FileText, Image, Film, Music, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { validateFile } from "@/lib/security";
import { supabase } from "@/api/supabaseClient";
import { formatBytes } from "@/lib/performance";
import { useLanguage } from "@/context/LanguageContext";

const MAX_FILES = 5;

function FileIcon({ type }) {
  if (type.startsWith("image/")) return <Image className="w-8 h-8 text-blue-400" />;
  if (type.startsWith("video/")) return <Film className="w-8 h-8 text-purple-400" />;
  if (type.startsWith("audio/")) return <Music className="w-8 h-8 text-green-400" />;
  return <FileText className="w-8 h-8 text-slate-400" />;
}

/**
 * Production-grade media uploader with:
 * - File type & size validation
 * - Per-file upload progress
 * - Preview thumbnails for images
 * - Accessible drag-and-drop zone
 *
 * Props:
 *   onUrlsChange(urls: string[]) — called whenever uploaded URL list changes
 *   maxFiles (default: 5)
 */
export default function MediaUploader({ onUrlsChange, maxFiles = MAX_FILES }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const inputRef = useRef();
  const [files, setFiles] = useState([]); // { file, preview, status: 'pending'|'uploading'|'done'|'error', url, error }
  const [dragging, setDragging] = useState(false);

  const processFiles = (incoming) => {
    const newEntries = [];
    for (const file of incoming) {
      if (files.length + newEntries.length >= maxFiles) break;
      const { valid, errors } = validateFile(file);
      newEntries.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        status: valid ? "pending" : "error",
        error: valid ? null : errors[0],
        url: null,
      });
    }

    setFiles((prev) => {
      const updated = [...prev, ...newEntries].slice(0, maxFiles);
      // Auto-upload valid pending files
      updated.forEach((entry) => {
        if (entry.status === "pending") uploadFile(entry, updated);
      });
      return updated;
    });
  };

  const uploadFile = async (entry, currentFiles) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === entry.id ? { ...f, status: "uploading" } : f))
    );
    try {
      const fileExt = entry.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, entry.file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      let file_url = publicUrl;
      if (file_url && !file_url.includes('/storage/v1/object/public/')) {
        file_url = file_url.replace('/storage/v1/object/media/', '/storage/v1/object/public/media/');
      }

      setFiles((prev) => {
        const updated = prev.map((f) =>
          f.id === entry.id ? { ...f, status: "done", url: file_url } : f
        );
        onUrlsChange(updated.filter((f) => f.url).map((f) => f.url));
        return updated;
      });
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id ? { ...f, status: "error", error: "Upload failed. Try again." } : f
        )
      );
    }
  };

  const remove = (id) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      onUrlsChange(updated.filter((f) => f.url).map((f) => f.url));
      return updated;
    });
  };

  const retryUpload = (entry) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === entry.id ? { ...f, status: "pending", error: null } : f))
    );
    uploadFile(entry, files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label={T("Upload media files", "மீடியா கோப்புகளை பதிவேற்றவும்")}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          dragging
            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
            : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"
        }`}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {T(
            `Click or drag to upload (images, video, audio, PDF — max 10 MB each)`,
            `கிளிக் அல்லது இழுக்கவும் (படங்கள், வீடியோ, ஆடியோ, PDF - அதிகபட்சம் 10 MB)`
          )}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {T(`Up to ${maxFiles} files`, `${maxFiles} கோப்புகள் வரை`)}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,audio/*,.pdf"
        multiple
        className="hidden"
        onChange={(e) => processFiles(Array.from(e.target.files || []))}
      />

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {files.map((entry) => (
            <div
              key={entry.id}
              className="relative bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center gap-3"
            >
              {/* Thumbnail or icon */}
              {entry.preview ? (
                <img
                  src={entry.preview}
                  alt=""
                  className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <FileIcon type={entry.file.type} />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{entry.file.name}</p>
                <p className="text-xs text-slate-400">{formatBytes(entry.file.size)}</p>
                {entry.status === "uploading" && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-blue-500">
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading…
                  </div>
                )}
                {entry.status === "done" && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
                    <CheckCircle className="w-3 h-3" /> Uploaded
                  </div>
                )}
                {entry.status === "error" && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    <span className="truncate">{entry.error}</span>
                    {entry.error === "Upload failed. Try again." && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); retryUpload(entry); }}
                        className="ml-1 underline"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => remove(entry.id)}
                aria-label="Remove file"
                className="flex-shrink-0 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}