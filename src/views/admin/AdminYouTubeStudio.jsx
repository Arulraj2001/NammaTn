"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Video, Upload, Plus, Search, Filter, Calendar, CheckCircle2,
  Clock, AlertCircle, Sparkles, ExternalLink, RefreshCw, X,
  FileSpreadsheet, FileText, ChevronRight, Play, Eye, Share2,
  Trash2, Copy, Check, BarChart2, Download
} from "lucide-react";
import * as XLSX from "xlsx";
import { youtubeContentService } from "@/services/youtubeContentService";

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "finance", label: "Money & Finance", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" },
  { id: "scams", label: "Scams & Cyber Defense", color: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300" },
  { id: "rights", label: "Citizen Rights & Laws", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" },
  { id: "health", label: "Healthcare & Habits", color: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300" },
  { id: "career", label: "Career & Skills", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
  { id: "parenting", label: "Parenting & Education", color: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300" },
];

const STATUS_OPTIONS = [
  { id: "all", label: "All Statuses" },
  { id: "draft", label: "Draft", badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  { id: "script_ready", label: "Script Ready", badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300" },
  { id: "rendering", label: "Rendering", badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300" },
  { id: "published", label: "Published", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300" },
  { id: "failed", label: "Failed", badge: "bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300" },
];

export default function AdminYouTubeStudio() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer / Modal State
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [shortExtracting, setShortExtracting] = useState(false);

  // Bulk Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Bulk Scripts Modal State
  const [showScriptsModal, setShowScriptsModal] = useState(false);
  const [scriptsPreview, setScriptsPreview] = useState([]);
  const [importingScripts, setImportingScripts] = useState(false);
  const scriptsFileInputRef = useRef(null);

  // Fetch episodes on mount
  const loadEpisodes = async () => {
    setLoading(true);
    const { data } = await youtubeContentService.getAllEpisodes();
    setEpisodes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadEpisodes();
  }, []);

  // Filtered episodes
  const filteredEpisodes = useMemo(() => {
    return episodes.filter((ep) => {
      const matchCat = selectedCategory === "all" || ep.category?.toLowerCase() === selectedCategory;
      const matchStat = selectedStatus === "all" || ep.youtube_status === selectedStatus;
      const matchQuery =
        !searchQuery.trim() ||
        ep.topic_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(ep.episode_number).includes(searchQuery) ||
        ep.scheduled_date?.includes(searchQuery);
      return matchCat && matchStat && matchQuery;
    });
  }, [episodes, selectedCategory, selectedStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = episodes.length;
    const published = episodes.filter((e) => e.youtube_status === "published").length;
    const ready = episodes.filter((e) => e.youtube_status === "script_ready").length;
    const drafts = episodes.filter((e) => e.youtube_status === "draft").length;
    const shortsPublished = episodes.filter((e) => e.shorts_youtube_status === "published").length;
    return { total, published, ready, drafts, shortsPublished };
  }, [episodes]);

  // Open editor for an episode
  const handleEdit = (episode) => {
    setActiveEpisode({
      ...episode,
      tags_input: Array.isArray(episode.tags) ? episode.tags.join(", ") : (episode.tags || ""),
      hashtags_input: Array.isArray(episode.hashtags) ? episode.hashtags.join(" ") : (episode.hashtags || ""),
    });
    setIsEditing(true);
  };

  // Create blank new episode
  const handleCreateNew = () => {
    const nextNum = episodes.length > 0 ? Math.max(...episodes.map((e) => e.episode_number)) + 1 : 1;
    const today = new Date().toISOString().split("T")[0];
    setActiveEpisode({
      episode_number: nextNum,
      scheduled_date: today,
      category: "finance",
      topic_title: "",
      seo_description: "",
      tags_input: "vizhitn, tamil podcast, personal finance",
      hashtags_input: "#VizhiTN #Finance #TamilPodcast",
      thumbnail_text_overlay: "",
      podcast_script: "",
      podcast_word_count: 0,
      estimated_duration_sec: 0,
      short_hook: "",
      short_script: "",
      youtube_status: "draft",
      instagram_status: "draft",
      facebook_status: "draft",
      shorts_youtube_status: "draft",
      shorts_instagram_status: "draft",
      shorts_facebook_status: "draft",
    });
    setIsEditing(true);
  };

  // Save Episode
  const handleSaveEpisode = async () => {
    if (!activeEpisode.topic_title?.trim()) {
      alert("Please enter a Topic Title");
      return;
    }
    setSaving(true);
    
    const wordCount = (activeEpisode.podcast_script || "").trim().split(/\s+/).filter(Boolean).length;
    const estSec = Math.round((wordCount / 135) * 60);

    const payload = {
      ...activeEpisode,
      podcast_word_count: wordCount,
      estimated_duration_sec: estSec,
      tags: String(activeEpisode.tags_input || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      hashtags: String(activeEpisode.hashtags_input || "")
        .split(/[\s,]+/)
        .map((h) => (h.startsWith("#") ? h : `#${h}`))
        .filter((h) => h.length > 1),
    };
    delete payload.tags_input;
    delete payload.hashtags_input;

    const { error } = await youtubeContentService.upsertEpisode(payload);
    setSaving(false);

    if (error) {
      alert("Failed to save: " + error.message);
    } else {
      setIsEditing(false);
      loadEpisodes();
    }
  };

  // AI Generate Script via Gemini
  const handleAiGenerateScript = async () => {
    if (!activeEpisode.topic_title) {
      alert("Please provide a topic title first!");
      return;
    }
    setAiGenerating(true);
    try {
      const res = await youtubeContentService.generateScriptOnline(
        activeEpisode.topic_title,
        activeEpisode.category
      );
      if (res.script) {
        setActiveEpisode((prev) => ({
          ...prev,
          podcast_script: res.script,
          podcast_script_source: "ai_generated",
          podcast_word_count: res.word_count,
          estimated_duration_sec: res.estimated_duration_sec,
          youtube_status: prev.youtube_status === "draft" ? "script_ready" : prev.youtube_status,
        }));
      } else {
        alert("Failed to generate script: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      alert("AI Generation failed: " + err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  // AI Extract 50s Short
  const handleExtractShort = async () => {
    if (!activeEpisode.podcast_script) {
      alert("Please provide or generate the podcast script first!");
      return;
    }
    setShortExtracting(true);
    try {
      const res = await youtubeContentService.extractShortOnline(activeEpisode.podcast_script);
      if (res.short_script) {
        setActiveEpisode((prev) => ({
          ...prev,
          short_hook: res.hook || prev.short_hook,
          short_script: res.short_script,
        }));
      } else {
        alert("Extraction failed: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      alert("Extraction failed: " + err.message);
    } finally {
      setShortExtracting(false);
    }
  };

  // Handle Excel File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        
        let bestData = [];
        let targetSheetName = "";

        // Scan all sheets in workbook to find the table with 90 days (skip "Read Me" notes)
        for (const sName of wb.SheetNames) {
          if (/read\s*me|notes|instructions|overview/i.test(sName)) {
            continue;
          }

          const sheet = wb.Sheets[sName];
          const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          
          let headerRowIdx = -1;
          for (let r = 0; r < Math.min(rawRows.length, 30); r++) {
            const rowStr = (rawRows[r] || []).map(cell => String(cell || "")).join(" ").toLowerCase();
            if ((rowStr.includes("date") || rowStr.includes("episode") || rowStr.includes("day")) &&
                (rowStr.includes("title") || rowStr.includes("podcast") || rowStr.includes("topic"))) {
              headerRowIdx = r;
              break;
            }
          }

          if (headerRowIdx !== -1) {
            const parsed = XLSX.utils.sheet_to_json(sheet, { range: headerRowIdx });
            if (parsed.length > bestData.length) {
              bestData = parsed;
              targetSheetName = sName;
            }
          }
        }

        if (bestData.length === 0) {
          alert("No calendar data rows found in the uploaded file");
          return;
        }

        console.log(`[EXCEL PARSER] Successfully parsed ${bestData.length} rows from sheet "${targetSheetName}"`);
        setImportPreview(bestData);
        setShowImportModal(true);
      } catch (err) {
        alert("Failed to parse file: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Confirm Bulk Import
  const handleConfirmImport = async () => {
    setImporting(true);
    const { count, error } = await youtubeContentService.bulkImportEpisodes(importPreview);
    setImporting(false);

    if (error) {
      alert("Import failed: " + error.message);
    } else {
      alert(`Successfully imported ${count} episodes!`);
      setShowImportModal(false);
      setImportPreview([]);
      loadEpisodes();
    }
  };

  // Download Script Template Excel Sheet
  const handleDownloadScriptTemplate = () => {
    if (!episodes || episodes.length === 0) {
      alert("No episodes found to export");
      return;
    }

    const templateData = episodes.map((ep) => ({
      "Episode Number": ep.episode_number,
      "Scheduled Date": ep.scheduled_date,
      "Category": ep.category,
      "Topic Title": ep.topic_title,
      "Podcast Script (Host: ... Expert: ...)": ep.podcast_script || "",
      "Companion Short Script (Optional)": ep.short_script || "",
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws["!cols"] = [
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 45 },
      { wch: 80 },
      { wch: 50 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Podcast_Scripts");
    XLSX.writeFile(wb, "VizhiTN_Podcast_Scripts_Template.xlsx");
  };

  // Handle Scripts File Upload
  const handleScriptsFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });

        let bestData = [];
        for (const sName of wb.SheetNames) {
          if (/read\s*me|notes|instructions|overview/i.test(sName)) continue;
          const sheet = wb.Sheets[sName];
          const parsed = XLSX.utils.sheet_to_json(sheet);
          if (parsed.length > bestData.length) {
            bestData = parsed;
          }
        }

        if (bestData.length === 0) {
          alert("No data found in uploaded script file");
          return;
        }

        setScriptsPreview(bestData);
        setShowScriptsModal(true);
      } catch (err) {
        alert("Failed to parse script file: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
    // reset input so same file can be selected again
    e.target.value = "";
  };

  // Confirm Bulk Scripts Import
  const handleConfirmScriptsImport = async () => {
    setImportingScripts(true);
    const res = await youtubeContentService.bulkUpdateScripts(scriptsPreview);
    setImportingScripts(false);

    if (res.error) {
      alert("Failed to update scripts: " + res.error.message);
    } else {
      alert(`✅ Successfully updated scripts for ${res.count} episodes!`);
      setShowScriptsModal(false);
      setScriptsPreview([]);
      loadEpisodes();
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs tracking-wider uppercase">
            <Video className="w-4 h-4" /> YouTube Studio & Uncut Podcast
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            90-Day Content Automation Studio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your daily 13–15m unscripted/scripted podcasts, companion 50s shorts, and multi-platform staging.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <input
            type="file"
            ref={scriptsFileInputRef}
            onChange={handleScriptsFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button
            onClick={handleDownloadScriptTemplate}
            title="Download an Excel template containing all your scheduled episode titles and dates ready for script writing"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-all border border-slate-300 dark:border-slate-700 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Script Template
          </button>
          <button
            onClick={() => scriptsFileInputRef.current?.click()}
            title="Upload completed podcast scripts in bulk from Excel or CSV"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg transition-all border border-indigo-200 dark:border-indigo-800 shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            Bulk Upload Scripts (.xlsx)
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-all border border-slate-300 dark:border-slate-700 shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Upload Calendar
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-all shadow-xs shadow-rose-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            New Episode
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Calendar</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
          <span className="text-xs text-slate-400">90-Day Schedule</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Scripts Ready</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.ready}</div>
          <span className="text-xs text-slate-400">Ready to Render</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Podcasts Live</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.published}</div>
          <span className="text-xs text-slate-400">On YouTube</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Shorts Live</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.shortsPublished}</div>
          <span className="text-xs text-slate-400">Companion 50s</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs col-span-2 md:col-span-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Drafts Left</span>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{stats.drafts}</div>
          <span className="text-xs text-slate-400">Needs Script/AI</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by topic title, Day number, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          <button
            onClick={loadEpisodes}
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Day #</th>
                <th className="py-3 px-4">Schedule Date</th>
                <th className="py-3 px-4">Category & Topic</th>
                <th className="py-3 px-4">Est. Duration</th>
                <th className="py-3 px-4">Long-Form (YouTube)</th>
                <th className="py-3 px-4">Companion Short</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                    Loading content schedule...
                  </td>
                </tr>
              ) : filteredEpisodes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <Video className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No episodes found. Click <strong>"Upload Calendar (.xlsx)"</strong> or <strong>"New Episode"</strong> above!
                  </td>
                </tr>
              ) : (
                filteredEpisodes.map((ep) => {
                  const catMeta = CATEGORIES.find((c) => c.id === ep.category) || CATEGORIES[1];
                  const statMeta = STATUS_OPTIONS.find((s) => s.id === ep.youtube_status) || STATUS_OPTIONS[1];
                  const hasCustomScript = !!ep.podcast_script?.trim();
                  const durationMin = ep.estimated_duration_sec
                    ? (ep.estimated_duration_sec / 60).toFixed(1)
                    : "0";

                  return (
                    <tr
                      key={ep.id || ep.episode_number}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        #{String(ep.episode_number).padStart(2, "0")}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ep.scheduled_date}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${catMeta.color}`}>
                            {catMeta.label}
                          </span>
                          {hasCustomScript && (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Script Ready
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {ep.topic_title}
                        </div>
                        {ep.thumbnail_text_overlay && (
                          <div className="text-xs text-rose-500 font-medium truncate mt-0.5">
                            Overlay: "{ep.thumbnail_text_overlay}"
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-400">
                        {durationMin > 0 ? (
                          <span>{durationMin} min <span className="text-slate-400">({ep.podcast_word_count || 0} w)</span></span>
                        ) : (
                          <span className="text-slate-400 italic">Not generated</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statMeta.badge}`}>
                            {statMeta.label}
                          </span>
                          {ep.youtube_url && (
                            <a
                              href={ep.youtube_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-rose-600 hover:text-rose-700"
                              title="View on YouTube"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            ep.shorts_youtube_status === "published"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {ep.shorts_youtube_status === "published" ? "Live" : "Draft"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(ep)}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          Edit Script
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Episode Editor Slide-Over Drawer */}
      {isEditing && activeEpisode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 rounded">
                    Episode #{String(activeEpisode.episode_number).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-slate-400">• Scheduled for {activeEpisode.scheduled_date}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {activeEpisode.topic_title || "New Podcast Episode"}
                </h2>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Form */}
            <div className="p-6 space-y-6 flex-1">
              {/* Row 1: Episode #, Date, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Day Number</label>
                  <input
                    type="number"
                    value={activeEpisode.episode_number}
                    onChange={(e) => setActiveEpisode({ ...activeEpisode, episode_number: parseInt(e.target.value) || 1 })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Scheduled Date</label>
                  <input
                    type="date"
                    value={activeEpisode.scheduled_date}
                    onChange={(e) => setActiveEpisode({ ...activeEpisode, scheduled_date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Category</label>
                  <select
                    value={activeEpisode.category}
                    onChange={(e) => setActiveEpisode({ ...activeEpisode, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  >
                    {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic Title */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Topic Title</label>
                  <span className="text-[10px] text-slate-400">Optimal: 60–75 chars</span>
                </div>
                <input
                  type="text"
                  value={activeEpisode.topic_title}
                  onChange={(e) => setActiveEpisode({ ...activeEpisode, topic_title: e.target.value })}
                  placeholder="e.g. 5 Simple Money Habits to Build Financial Freedom in Tamil Nadu"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>

              {/* Thumbnail Overlay Text */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Thumbnail Overlay Text (3–5 Words)</label>
                <input
                  type="text"
                  value={activeEpisode.thumbnail_text_overlay || ""}
                  onChange={(e) => setActiveEpisode({ ...activeEpisode, thumbnail_text_overlay: e.target.value })}
                  placeholder="e.g. 5 பெரிய பண தவறுகள்!"
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-rose-600 dark:text-rose-400 font-bold"
                />
              </div>

              {/* Section 2: 13-15 Min Podcast Script Box */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-rose-500" />
                      13–15 Minute Uncut Podcast Script (Spoken Tamil / Tanglish)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Word Count: <strong>{(activeEpisode.podcast_script || "").trim().split(/\s+/).filter(Boolean).length} words</strong> •
                      Est. Duration: <strong>~{(((activeEpisode.podcast_script || "").trim().split(/\s+/).filter(Boolean).length) / 135).toFixed(1)} mins</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiGenerateScript}
                    disabled={aiGenerating}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${aiGenerating ? "animate-spin" : ""}`} />
                    {aiGenerating ? "Writing with Gemini..." : "Generate Full Script (AI)"}
                  </button>
                </div>

                <textarea
                  rows="12"
                  value={activeEpisode.podcast_script || ""}
                  onChange={(e) => setActiveEpisode({ ...activeEpisode, podcast_script: e.target.value })}
                  placeholder="Paste Claude's complete word-for-word episode script here, or click 'Generate Full Script (AI)' above..."
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 font-mono leading-relaxed focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Section 3: 50s Companion Short */}
              <div className="border border-purple-200 dark:border-purple-900/40 rounded-xl p-4 bg-purple-50/30 dark:bg-purple-950/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      50-Second Companion Short (Text-First)
                    </h3>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      Rapid kinetic typography + 9:16 vertical render
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExtractShort}
                    disabled={shortExtracting || !activeEpisode.podcast_script}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${shortExtracting ? "animate-spin" : ""}`} />
                    {shortExtracting ? "Extracting..." : "Auto-Extract 50s Short"}
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Opening Hook (0–5s)</label>
                  <input
                    type="text"
                    value={activeEpisode.short_hook || ""}
                    onChange={(e) => setActiveEpisode({ ...activeEpisode, short_hook: e.target.value })}
                    placeholder="e.g. உங்க பேங்க் அக்கவுண்ட்ல இந்த மெசேஜ் வந்திருக்கா? உஷார்!"
                    className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">Short Spoken Voiceover (~120 words)</label>
                  <textarea
                    rows="4"
                    value={activeEpisode.short_script || ""}
                    onChange={(e) => setActiveEpisode({ ...activeEpisode, short_script: e.target.value })}
                    placeholder="Short 50-second punchy voiceover script..."
                    className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Section 4: SEO Metadata */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">SEO Description</label>
                  <textarea
                    rows="4"
                    value={activeEpisode.seo_description || ""}
                    onChange={(e) => setActiveEpisode({ ...activeEpisode, seo_description: e.target.value })}
                    placeholder="YouTube description with key links and hashtags..."
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={activeEpisode.tags_input || ""}
                      onChange={(e) => setActiveEpisode({ ...activeEpisode, tags_input: e.target.value })}
                      placeholder="vizhitn, personal finance, tamil podcast"
                      className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Hashtags</label>
                    <input
                      type="text"
                      value={activeEpisode.hashtags_input || ""}
                      onChange={(e) => setActiveEpisode({ ...activeEpisode, hashtags_input: e.target.value })}
                      placeholder="#VizhiTN #Finance #TamilPodcast"
                      className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Multi-Platform Publishing Status */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-3">
                  Multi-Platform Publishing Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-red-600 uppercase flex items-center gap-1">
                      <Play className="w-3 h-3" /> YouTube (Long)
                    </span>
                    <select
                      value={activeEpisode.youtube_status}
                      onChange={(e) => setActiveEpisode({ ...activeEpisode, youtube_status: e.target.value })}
                      className="w-full mt-2 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded"
                    >
                      {STATUS_OPTIONS.filter((s) => s.id !== "all").map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-pink-600 uppercase flex items-center gap-1">
                      <Share2 className="w-3 h-3" /> Instagram
                    </span>
                    <select
                      value={activeEpisode.instagram_status}
                      onChange={(e) => setActiveEpisode({ ...activeEpisode, instagram_status: e.target.value })}
                      className="w-full mt-2 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded"
                    >
                      <option value="draft">Draft (Staged)</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] font-bold text-blue-600 uppercase flex items-center gap-1">
                      <Share2 className="w-3 h-3" /> Facebook
                    </span>
                    <select
                      value={activeEpisode.facebook_status}
                      onChange={(e) => setActiveEpisode({ ...activeEpisode, facebook_status: e.target.value })}
                      className="w-full mt-2 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded"
                    >
                      <option value="draft">Draft (Staged)</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 flex justify-end gap-3 z-10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEpisode}
                disabled={saving}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Episode"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Preview Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Confirm 90-Day Calendar Import
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parsed <strong>{importPreview.length} episodes</strong> from your spreadsheet.
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto my-4 flex-1 space-y-2 border border-slate-100 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-800/20 text-xs">
              {importPreview.slice(0, 10).map((row, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-200/50 dark:border-slate-700/50 last:border-0">
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    Day #{row.episode_number || (row.Episode ? String(row.Episode).replace(/\D/g, '') : null) || row.Day || i + 1}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                    {row["Podcast Title"] || row.topic_title || row.Title || row["Short Title"] || "Untitled"}
                  </span>
                  <span className="text-slate-500">{row.scheduled_date || row.Date || "—"}</span>
                </div>
              ))}
              {importPreview.length > 10 && (
                <div className="text-center py-2 text-slate-400 italic">
                  ...and {importPreview.length - 10} more episodes
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2"
              >
                {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {importing ? "Importing to Database..." : `Import All ${importPreview.length} Episodes`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Scripts Import Preview Modal */}
      {showScriptsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Confirm Bulk Podcast Scripts Upload
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parsed <strong>{scriptsPreview.length} rows</strong> from your script spreadsheet. Matching by Episode Number.
                </p>
              </div>
              <button
                onClick={() => setShowScriptsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto my-4 flex-1 space-y-2 border border-slate-100 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-800/20 text-xs">
              {scriptsPreview.map((row, i) => {
                const epNum = row["Episode Number"] || row.episode_number || row.Episode || row.Day || (i + 1);
                const script = row["Podcast Script (Host: ... Expert: ...)"] || row.podcast_script || row.script || row.full_script || "";
                const wordCount = String(script).trim().split(/\s+/).filter(Boolean).length;
                const estMin = Math.round(wordCount / 135);

                return (
                  <div key={i} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        Episode #{String(epNum).replace(/\D/g, '') || epNum}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {wordCount > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {wordCount.toLocaleString()} words (~{estMin} mins)
                          </span>
                        ) : (
                          <span className="text-amber-500">No script text</span>
                        )}
                      </span>
                    </div>
                    {script ? (
                      <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px] line-clamp-2 bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded">
                        {String(script).slice(0, 150)}...
                      </p>
                    ) : (
                      <p className="text-slate-400 italic text-[11px]">Empty script in row</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowScriptsModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmScriptsImport}
                disabled={importingScripts}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-2"
              >
                {importingScripts ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {importingScripts ? "Saving Scripts to Database..." : `Apply Scripts to Database`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
