"use client";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/api/supabaseClient";
import { TN_MLAS_DATA } from "@/lib/mlaData";
import { Save, RefreshCw, CheckCircle2, AlertCircle, Search, Shield, ArrowDownToLine, Image as ImageIcon } from "lucide-react";

export default function AdminMLATracker() {
  const [mlas, setMlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMLAs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("mla_tracker")
        .select("*")
        .order("district_name", { ascending: true });

      if (error) throw error;
      setMlas(data || []);
    } catch (e) {
      showToast("Error loading MLAs: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMLAs();
  }, [fetchMLAs]);

  const handleFieldChange = (id, field, value) => {
    setMlas(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveRow = async (row) => {
    setSavingId(row.id);
    try {
      const updates = {
        mla_name: row.mla_name,
        mla_name_ta: row.mla_name_ta,
        party_slug: row.party_slug,
        party_name: row.party_name,
        constituency: row.constituency,
        photo_url: row.photo_url,
        key_actions_en: row.key_actions_en,
        key_actions_ta: row.key_actions_ta,
        performance_score: Number(row.performance_score || 0),
        is_active: Boolean(row.is_active),
        last_updated: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("mla_tracker")
        .update(updates)
        .eq("id", row.id);

      if (error) throw error;
      showToast(`Updated ${row.district_name} MLA details successfully!`);
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleSyncRealMLAs = async () => {
    if (!window.confirm("Sync all 38 verified Tamil Nadu District MLAs (incumbent real names, official photos, parties, and constituencies) to database?")) {
      return;
    }
    setSyncing(true);
    try {
      const rows = TN_MLAS_DATA.map(m => ({
        district_slug: m.district_slug,
        district_name: m.district_name,
        district_name_ta: m.district_name_ta,
        mla_name: m.mla_name,
        mla_name_ta: m.mla_name_ta,
        party_slug: m.party_slug,
        party_name: m.party_name,
        constituency: m.constituency,
        constituency_ta: m.constituency_ta,
        photo_url: m.photo_url || null,
        elected_date: m.elected_date,
        vote_share: m.vote_share,
        winning_margin: m.winning_margin,
        performance_score: m.performance_score,
        key_actions_en: m.key_actions_en,
        key_actions_ta: m.key_actions_ta,
        is_active: true,
        last_updated: new Date().toISOString()
      }));

      const { error } = await supabase
        .from("mla_tracker")
        .upsert(rows, { onConflict: "district_slug" });

      if (error) throw error;
      showToast("Successfully synced all 38 verified MLAs to Supabase database!");
      fetchMLAs();
    } catch (err) {
      showToast("Sync failed: " + err.message, "error");
    } finally {
      setSyncing(false);
    }
  };

  const filtered = mlas.filter(m =>
    m.district_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    m.mla_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    m.party_name?.toLowerCase().includes(filterText.toLowerCase()) ||
    m.constituency?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border ${
          toast.type === "success"
            ? "bg-emerald-950 border-emerald-700 text-emerald-300"
            : "bg-red-950 border-red-700 text-red-300"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            MLA Performance Tracker Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage all 38 district incumbent MLAs, verified official portraits, scores, and monthly civic actions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search district, MLA, or party..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
            />
          </div>
          <button
            onClick={handleSyncRealMLAs}
            disabled={syncing}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            title="Sync all 38 verified MLAs to database"
          >
            <ArrowDownToLine className={`w-3.5 h-3.5 ${syncing ? "animate-bounce" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync 38 Real MLAs"}</span>
          </button>
          <button
            onClick={fetchMLAs}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3.5">Portrait</th>
              <th className="p-3.5">District & Constituency</th>
              <th className="p-3.5">MLA Name (EN / TA)</th>
              <th className="p-3.5">Party</th>
              <th className="p-3.5">Score (0-100)</th>
              <th className="p-3.5">Key Actions (EN)</th>
              <th className="p-3.5">Key Actions (TA)</th>
              <th className="p-3.5 text-center">Active</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading MLA tracker records...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  No MLA records found in database. Click &quot;Sync 38 Real MLAs&quot; to seed live official data.
                </td>
              </tr>
            ) : (
              filtered.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  {/* Portrait Thumbnail & URL */}
                  <td className="p-3.5">
                    <div className="space-y-1.5 w-24">
                      {row.photo_url ? (
                        <img
                          src={row.photo_url}
                          alt={row.mla_name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover object-top border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <input
                        type="text"
                        value={row.photo_url || ""}
                        onChange={e => handleFieldChange(row.id, "photo_url", e.target.value)}
                        placeholder="Image URL..."
                        className="w-full px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300"
                        title={row.photo_url || ""}
                      />
                    </div>
                  </td>

                  {/* District & Constituency */}
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    <div>{row.district_name}</div>
                    <div className="text-[11px] font-normal text-slate-400">{row.constituency}</div>
                  </td>

                  {/* MLA Name EN / TA */}
                  <td className="p-3.5 min-w-[170px] space-y-1">
                    <input
                      type="text"
                      value={row.mla_name || ""}
                      onChange={e => handleFieldChange(row.id, "mla_name", e.target.value)}
                      placeholder="MLA Name (EN)"
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                    <input
                      type="text"
                      value={row.mla_name_ta || ""}
                      onChange={e => handleFieldChange(row.id, "mla_name_ta", e.target.value)}
                      placeholder="MLA Name (TA)"
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px]"
                    />
                  </td>

                  {/* Party */}
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                      {row.party_name || row.party_slug}
                    </span>
                  </td>

                  {/* Performance Score */}
                  <td className="p-3.5 w-24">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.performance_score ?? 50}
                      onChange={e => handleFieldChange(row.id, "performance_score", e.target.value)}
                      className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center"
                    />
                  </td>

                  {/* Key Actions EN */}
                  <td className="p-3.5 min-w-[200px]">
                    <textarea
                      rows={2}
                      value={row.key_actions_en || ""}
                      onChange={e => handleFieldChange(row.id, "key_actions_en", e.target.value)}
                      placeholder="Monthly actions (EN)..."
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs resize-none"
                    />
                  </td>

                  {/* Key Actions TA */}
                  <td className="p-3.5 min-w-[200px]">
                    <textarea
                      rows={2}
                      value={row.key_actions_ta || ""}
                      onChange={e => handleFieldChange(row.id, "key_actions_ta", e.target.value)}
                      placeholder="நடவடிக்கைகள் (TA)..."
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs resize-none"
                    />
                  </td>

                  {/* Active Toggle */}
                  <td className="p-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(row.is_active)}
                      onChange={e => handleFieldChange(row.id, "is_active", e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </td>

                  {/* Save */}
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleSaveRow(row)}
                      disabled={savingId === row.id}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {savingId === row.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Save</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
