import React from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";

/**
 * Custom Rich Text & Markdown Parser for Article / Guide / Right details
 * Converts markdown headers, bold highlights, lists, steps, and links into beautiful Tailwind UI.
 */
export default function FormattedArticleContent({ content = "" }) {
  if (!content) return null;

  // Split into blocks by double newline or single newline headers
  const lines = content.split("\n");
  const elements = [];
  let currentList = [];
  let currentListType = null; // 'ul' or 'ol'

  const flushList = (keyPrefix) => {
    if (currentList.length === 0) return;
    if (currentListType === "ol") {
      elements.push(
        <ol key={`ol-${keyPrefix}`} className="my-4 space-y-3 pl-1">
          {currentList.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1">{parseInlineFormatting(item)}</div>
            </li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul key={`ul-${keyPrefix}`} className="my-4 space-y-2.5">
          {currentList.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{parseInlineFormatting(item)}</div>
            </li>
          ))}
        </ul>
      );
    }
    currentList = [];
    currentListType = null;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(index);
      return;
    }

    // Header 3 (###)
    if (trimmed.startsWith("###")) {
      flushList(index);
      const headerText = trimmed.replace(/^###\s*/, "");
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5"
        >
          <span className="w-2 h-6 rounded-full bg-emerald-500 inline-block" />
          <span>{parseInlineFormatting(headerText)}</span>
        </h3>
      );
      return;
    }

    // Numbered list item (1. 2. 3. etc.)
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (currentListType && currentListType !== "ol") flushList(index);
      currentListType = "ol";
      currentList.push(olMatch[2]);
      return;
    }

    // Bullet list item (- or *)
    const ulMatch = trimmed.match(/^[-*]\s+(.*)/);
    if (ulMatch) {
      if (currentListType && currentListType !== "ul") flushList(index);
      currentListType = "ul";
      currentList.push(ulMatch[1]);
      return;
    }

    // Regular paragraph
    flushList(index);
    elements.push(
      <p
        key={`p-${index}`}
        className="my-3 text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed"
      >
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });

  flushList("final");

  return <div className="formatted-article-body space-y-2">{elements}</div>;
}

/**
 * Parses inline bold **text**, links http(s)://..., and tamil bold strings cleanly
 */
function parseInlineFormatting(text) {
  if (!text) return "";

  // Split by bold pattern **text**
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
          {parseLinks(boldText)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{parseLinks(part)}</React.Fragment>;
  });
}

/**
 * Helper to turn raw domain names and URLs into clickable links
 */
function parseLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9-]+\.(?:gov|com|org|in|co\.in)[^\s]*)/gi;
  const parts = text.split(urlRegex);

  return parts.map((part, idx) => {
    if (part.match(urlRegex)) {
      let href = part;
      if (!href.startsWith("http://") && !href.startsWith("https://")) {
        href = `https://${href}`;
      }
      return (
        <a
          key={idx}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold underline hover:text-emerald-700 dark:hover:text-emerald-300 break-all"
        >
          <span>{part}</span>
          <ExternalLink className="w-3 h-3 inline ml-0.5 opacity-80" />
        </a>
      );
    }
    return part;
  });
}
