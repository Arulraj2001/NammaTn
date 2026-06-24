'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, Film, Image as ImageIcon, AlertCircle } from 'lucide-react';

const MAX_FILES   = 10;
const MAX_SIZE_MB = 50;
const MAX_SIZE_B  = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED    = ['image/', 'video/'];

function humanSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAccepted(file) {
  return ACCEPTED.some((prefix) => file.type.startsWith(prefix));
}

export default function EvidenceUploader({ files = [], onChange }) {
  const inputRef               = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors]     = useState([]);

  // Validate and append new files to existing list
  const addFiles = useCallback(
    (incoming) => {
      const newErrors = [];
      const valid     = [];

      Array.from(incoming).forEach((file) => {
        if (!isAccepted(file)) {
          newErrors.push(`"${file.name}" — unsupported type. Only images and videos allowed.`);
          return;
        }
        if (file.size > MAX_SIZE_B) {
          newErrors.push(`"${file.name}" is too large (${humanSize(file.size)}). Max ${MAX_SIZE_MB} MB.`);
          return;
        }
        valid.push(file);
      });

      setErrors(newErrors);

      const combined = [...files, ...valid];
      if (combined.length > MAX_FILES) {
        setErrors((prev) => [...prev, `Maximum ${MAX_FILES} files allowed.`]);
        onChange(combined.slice(0, MAX_FILES));
      } else {
        onChange(combined);
      }
    },
    [files, onChange]
  );

  function removeFile(index) {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
    setErrors([]);
  }

  // Drag-and-drop handlers
  function onDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }
  function onDragLeave() {
    setDragOver(false);
  }
  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
  }
  function onInputChange(e) {
    if (e.target.files) {
      addFiles(e.target.files);
      // Reset input so same file can be re-selected after removal
      e.target.value = '';
    }
  }

  const hasFiles     = files.length > 0;
  const remaining    = MAX_FILES - files.length;
  const isAtCapacity = files.length >= MAX_FILES;

  return (
    <div className="w-full space-y-3">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={onInputChange}
        aria-label="Upload evidence files"
      />

      {/* Dropzone / tap target */}
      {!isAtCapacity && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Click or drag to upload photos and videos"
          className={[
            'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150 p-6 text-center',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            dragOver
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-900/10',
          ].join(' ')}
        >
          <div
            className={[
              'flex items-center justify-center w-12 h-12 rounded-full transition-colors',
              dragOver
                ? 'bg-blue-100 dark:bg-blue-800'
                : 'bg-gray-100 dark:bg-gray-700',
            ].join(' ')}
          >
            <Upload
              className={[
                'w-6 h-6 transition-colors',
                dragOver
                  ? 'text-blue-500'
                  : 'text-gray-400 dark:text-gray-500',
              ].join(' ')}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {dragOver ? 'Drop files here' : 'Tap to add photos or videos'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Drag &amp; drop on desktop — up to {MAX_FILES} files, {MAX_SIZE_MB} MB each
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              Photos
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="flex items-center gap-1">
              <Film className="w-3.5 h-3.5" />
              Videos
            </span>
          </div>
          {hasFiles && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
              {remaining > 0 ? ` — ${remaining} more allowed` : ''}
            </p>
          )}
        </div>
      )}

      {isAtCapacity && (
        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium px-1">
          ⚠ Maximum {MAX_FILES} files reached. Remove a file to add another.
        </p>
      )}

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-300">{err}</p>
            </div>
          ))}
        </div>
      )}

      {/* Preview grid */}
      {hasFiles && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {files.map((file, index) => {
            const isVideo = file.type.startsWith('video/');
            const previewUrl = !isVideo ? URL.createObjectURL(file) : null;

            return (
              <div
                key={index}
                className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-square"
              >
                {isVideo ? (
                  /* Video preview */
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                    <Film className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center break-all leading-tight line-clamp-2 px-1">
                      {file.name}
                    </span>
                    <span className="text-[9px] text-gray-400 dark:text-gray-500">
                      {humanSize(file.size)}
                    </span>
                  </div>
                ) : (
                  /* Image thumbnail */
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onLoad={() => URL.revokeObjectURL(previewUrl)}
                  />
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={`Remove ${file.name}`}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gray-900/70 dark:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-red-600 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* File size badge */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[9px] text-white text-center">{humanSize(file.size)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
