"use client";
/**
 * RichEditor — Three-mode content editor for TN Today CMS
 * Modes: Visual (Quill), HTML Source, Live Preview
 *
 * Uses react-quill which is already installed in the project.
 */
import React, { useState, useRef, useCallback } from "react";
import { Eye, Code, Edit3, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Quill toolbar config
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  ["link", "image"],
  [{ align: [] }],
  [{ color: [] }, { background: [] }],
  ["clean"],
];

// Lazy-load Quill only on client (Next.js SSR safe)
let ReactQuill = null;
if (typeof window !== "undefined") {
  try {
    ReactQuill = require("react-quill");
    // Quill CSS
    require("react-quill/dist/quill.snow.css");
  } catch {
    // react-quill not available — will fall back to textarea
  }
}

const MODES = [
  { id: "visual", label: "Visual", icon: Edit3 },
  { id: "html", label: "HTML", icon: Code },
  { id: "preview", label: "Preview", icon: Eye },
];

/**
 * @param {string} value - HTML string
 * @param {function} onChange - (html: string) => void
 * @param {string} placeholder
 * @param {string} minHeight - tailwind class e.g. "min-h-[300px]"
 */
export default function RichEditor({ value = "", onChange, placeholder = "Start writing...", minHeight = "min-h-[300px]" }) {
  const [mode, setMode] = useState("visual");
  const htmlRef = useRef(null);

  const handleQuillChange = useCallback((content) => {
    onChange?.(content);
  }, [onChange]);

  const handleHtmlChange = useCallback((e) => {
    onChange?.(e.target.value);
  }, [onChange]);

  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
      {/* Mode tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              mode === id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">
            {value?.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length || 0} words
          </span>
        </div>
      </div>

      {/* Visual Mode — Quill Editor */}
      <div className={cn("quill-tn-today", minHeight, mode !== "visual" && "hidden")}>
        {ReactQuill ? (
          <ReactQuill
            theme="snow"
            value={value}
            onChange={handleQuillChange}
            placeholder={placeholder}
            modules={{
              toolbar: TOOLBAR_OPTIONS,
            }}
            style={{ height: "100%", minHeight: "280px" }}
          />
        ) : (
          // Fallback: simple contenteditable if Quill fails
          <div
            contentEditable
            suppressContentEditableWarning
            className={cn("p-4 outline-none text-sm text-slate-800 dark:text-slate-200 leading-relaxed", minHeight)}
            dangerouslySetInnerHTML={{ __html: value }}
            onInput={(e) => onChange?.(e.currentTarget.innerHTML)}
          />
        )}
      </div>

      {/* HTML Source Mode */}
      <textarea
        ref={htmlRef}
        value={value}
        onChange={handleHtmlChange}
        className={cn(
          "w-full p-4 font-mono text-xs text-green-400 bg-slate-900 outline-none resize-none leading-relaxed",
          minHeight,
          mode !== "html" && "hidden"
        )}
        placeholder="<p>Enter HTML here...</p>"
        spellCheck={false}
      />

      {/* Live Preview Mode */}
      <div
        className={cn(
          "p-5 prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed overflow-auto",
          minHeight,
          "prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-img:rounded-xl prose-img:shadow-md",
          mode !== "preview" && "hidden"
        )}
        dangerouslySetInnerHTML={{ __html: value || "<p class='text-slate-400'>Nothing to preview yet...</p>" }}
      />
    </div>
  );
}
