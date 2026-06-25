import React, { useState, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { 
  Search, Eye, RefreshCw, CheckCircle, XCircle, AlertTriangle, 
  MapPin, Building2, Calendar, DollarSign, Download, Trash2, 
  Volume2, Play, Pause, Loader2, ChevronRight, Info, FileText, Check, X, ShieldAlert 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { DISTRICTS } from "@/lib/districts";

// Prefilled Departments list for filtering
const DEPARTMENTS = [
  { value: "Revenue Department", en: "Revenue Department", ta: "வருவாய்த்துறை" },
  { value: "Police Department", en: "Police Department", ta: "காவல்துறை" },
  { value: "RTO / Transport", en: "RTO / Transport", ta: "வட்டாரப் போக்குவரத்து (RTO)" },
  { value: "Sub-Registrar Office", en: "Sub-Registrar Office", ta: "சார்பதிவாளர் அலுவலகம்" },
  { value: "Electricity (TNEB)", en: "Electricity (TNEB)", ta: "மின்சார வாரியம் (TNEB)" },
  { value: "Municipal Corporation", en: "Municipal Corporation", ta: "மாநகராட்சி / நகராட்சி" },
  { value: "Other", en: "Other (Manual Entry)", ta: "இதர (கைமுறையாக)" }
];

// Audio Player Component
function AudioPlayer({ src }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggle = (e) => {
    e.preventDefault();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 w-fit border border-slate-200 dark:border-slate-700">
      <audio 
        ref={audioRef} 
        src={src} 
        onPlay={() => setPlaying(true)} 
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        preload="none"
      />
      <button 
        type="button" 
        onClick={toggle}
        className="w-8 h-8 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center transition-colors"
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
          Voice Proof / குரல் ஆதாரம்
        </span>
      </div>
    </div>
  );
}

export default function AdminBribes() {
  const qc = useQueryClient();
  const { toast } = useToast();
  
  // State for filters
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [bribeStatusFilter, setBribeStatusFilter] = useState("all");
  const [modFilter, setModFilter] = useState("all");
  
  // Modals & Details State
  const [selectedPost, setSelectedPost] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Bribe reports (load all statuses for moderation)
  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-bribe-posts-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("post")
        .select("*")
        .eq("post_type", "bribe")
        .order("created_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
  });

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchSearch = !search || 
        (p.title_en || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.title_ta || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.content_en || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.content_ta || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.bribe_specific_location || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.bribe_officer_designation || "").toLowerCase().includes(search.toLowerCase());

      const matchDept = deptFilter === "all" || p.bribe_department === deptFilter;
      
      const matchDistrict = districtFilter === "all" || p.district_name === districtFilter;
      
      const matchBribeStatus = bribeStatusFilter === "all" || p.bribe_status === bribeStatusFilter;
      
      const matchMod = modFilter === "all" || (p.moderation_status || "approved") === modFilter;

      return matchSearch && matchDept && matchDistrict && matchBribeStatus && matchMod;
    });
  }, [posts, search, deptFilter, districtFilter, bribeStatusFilter, modFilter]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = posts.length;
    const pending = posts.filter(p => (p.moderation_status || "approved") === "pending").length;
    const approved = posts.filter(p => (p.moderation_status || "approved") === "approved").length;
    const hidden = posts.filter(p => (p.moderation_status || "approved") === "hidden").length;
    const totalPaid = posts
      .filter(p => p.bribe_status === "paid")
      .reduce((sum, p) => sum + (Number(p.bribe_amount) || 0), 0);
      
    return { total, pending, approved, hidden, totalPaid };
  }, [posts]);

  // Inline Moderation Status Update handler
  const handleModerationChange = async (postId, newStatus) => {
    try {
      const { error } = await supabase
        .from("post")
        .update({ moderation_status: newStatus })
        .eq("id", postId);

      if (error) throw error;

      // Update local query state
      qc.setQueryData(["admin-bribe-posts-all"], (old) => {
        if (!old) return [];
        return old.map(p => p.id === postId ? { ...p, moderation_status: newStatus } : p);
      });

      toast({
        description: `Moderation status updated to ${newStatus}.`,
      });

      // If the currently inspected post is updated, update its modal state
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prev => ({ ...prev, moderation_status: newStatus }));
      }
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Failed to update status: ${err.message}`,
      });
    }
  };

  // Save Admin Note handler
  const handleSaveNote = async () => {
    if (!selectedPost) return;
    setSavingNote(true);
    try {
      const { error } = await supabase
        .from("post")
        .update({ admin_note: noteText })
        .eq("id", selectedPost.id);

      if (error) throw error;

      qc.setQueryData(["admin-bribe-posts-all"], (old) => {
        if (!old) return [];
        return old.map(p => p.id === selectedPost.id ? { ...p, admin_note: noteText } : p);
      });

      setSelectedPost(prev => ({ ...prev, admin_note: noteText }));
      toast({
        description: "Admin note saved successfully.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Failed to save note: ${err.message}`,
      });
    } finally {
      setSavingNote(false);
    }
  };

  // Delete Incident handler
  const handleDeletePost = async (postId) => {
    setIsDeleting(true);
    try {
      // Actually perform soft or hard delete? The rule asks for quick trigger to purge posts from the database.
      const { error } = await supabase
        .from("post")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      qc.setQueryData(["admin-bribe-posts-all"], (old) => {
        if (!old) return [];
        return old.filter(p => p.id !== postId);
      });

      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(null);
      }
      setConfirmDeleteId(null);
      toast({
        description: "Bribe incident report purged permanently from database.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: `Failed to delete: ${err.message}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV utility
  const exportToCSV = () => {
    if (filteredPosts.length === 0) {
      toast({ description: "No records to export." });
      return;
    }

    const headers = [
      "ID",
      "Title (EN)",
      "Title (TA)",
      "Created Date",
      "District",
      "Department",
      "Officer Designation",
      "Specific Location",
      "Bribe Status",
      "Bribe Amount (₹)",
      "Moderation Status",
      "Admin Note"
    ];

    const rows = filteredPosts.map(p => [
      p.id,
      `"${(p.title_en || "").replace(/"/g, '""')}"`,
      `"${(p.title_ta || "").replace(/"/g, '""')}"`,
      p.created_date,
      p.district_name || "",
      p.bribe_department || "",
      `"${(p.bribe_officer_designation || "").replace(/"/g, '""')}"`,
      `"${(p.bribe_specific_location || "").replace(/"/g, '""')}"`,
      p.bribe_status || "",
      p.bribe_amount || 0,
      p.moderation_status || "approved",
      `"${(p.admin_note || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bribe_logs_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Currency formatting helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-72 bg-slate-100 dark:bg-slate-900 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-pink-600" />
            Bribe Tracker Admin Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, moderate, filter, and inspect citizen-logged bribe records.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => refetch()} 
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-xl text-white shadow transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur">
          <div className="text-xs font-semibold text-slate-400 uppercase">Total Reports</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total}</div>
        </div>
        <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-950/40 bg-amber-50/50 dark:bg-amber-950/10">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Pending Review</div>
          <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-500 mt-1">{stats.pending}</div>
        </div>
        <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-950/40 bg-emerald-50/50 dark:bg-emerald-950/10">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Approved Posts</div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-500 mt-1">{stats.approved}</div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20">
          <div className="text-xs font-semibold text-slate-500 uppercase">Hidden Posts</div>
          <div className="text-2xl font-extrabold text-slate-700 dark:text-slate-400 mt-1">{stats.hidden}</div>
        </div>
        <div className="p-4 rounded-2xl border border-pink-200 dark:border-pink-950/40 bg-pink-50/50 dark:bg-pink-950/10 sm:col-span-2 lg:col-span-1">
          <div className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase">Total Bribes Paid</div>
          <div className="text-2xl font-extrabold text-pink-700 dark:text-pink-500 mt-1">{formatCurrency(stats.totalPaid)}</div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Filter Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search details..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Department Select */}
          <select 
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d.value} value={d.value}>{d.en}</option>
            ))}
          </select>

          {/* District Select */}
          <select 
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Districts</option>
            {DISTRICTS.map(d => (
              <option key={d.name_en} value={d.name_en}>{d.name_en}</option>
            ))}
          </select>

          {/* Bribe Status */}
          <select 
            value={bribeStatusFilter}
            onChange={(e) => setBribeStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Incident Statuses</option>
            <option value="paid">Paid Bribe</option>
            <option value="refused">Refused Bribe</option>
          </select>

          {/* Moderation Status */}
          <select 
            value={modFilter}
            onChange={(e) => setModFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="all">All Moderation States</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Main Console View */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Desktop View (Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Report</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Department</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">District</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Bribe Incident</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider w-40">Moderation</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                    No bribe records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPosts.map(post => {
                  const dateFormatted = new Date(post.created_date).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  });
                  const isPaid = post.bribe_status === "paid";
                  const modStatus = post.moderation_status || "approved";

                  return (
                    <tr 
                      key={post.id} 
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{post.title_en}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          {dateFormatted}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {post.bribe_department}
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                        {post.district_name}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isPaid 
                            ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                        }`}>
                          {isPaid ? `Paid: ${formatCurrency(post.bribe_amount)}` : "Refused"}
                        </span>
                      </td>
                      <td className="p-4">
                        <select 
                          value={modStatus}
                          onChange={(e) => handleModerationChange(post.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg border px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-pink-500 ${
                            modStatus === "pending" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900" :
                            modStatus === "hidden" ? "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" :
                            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
                          }`}
                        >
                          <option value="approved">Approved</option>
                          <option value="pending">Pending</option>
                          <option value="hidden">Hidden</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => {
                              setSelectedPost(post);
                              setNoteText(post.admin_note || "");
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                            title="View Incident Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {confirmDeleteId === post.id ? (
                            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-0.5">
                              <button 
                                onClick={() => handleDeletePost(post.id)}
                                disabled={isDeleting}
                                className="p-1 hover:bg-red-200 dark:hover:bg-red-900/50 rounded text-red-600 dark:text-red-400"
                                title="Confirm Delete"
                              >
                                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button 
                                onClick={() => setConfirmDeleteId(null)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setConfirmDeleteId(post.id)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                              title="Delete Incident"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Responsive Cards) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No bribe records match the selected filters.
            </div>
          ) : (
            filteredPosts.map(post => {
              const isPaid = post.bribe_status === "paid";
              const modStatus = post.moderation_status || "approved";

              return (
                <div key={post.id} className="p-4 space-y-3 bg-white dark:bg-slate-900/50">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">{post.title_en}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{post.bribe_department} • {post.district_name}</p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isPaid 
                        ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                    }`}>
                      {isPaid ? formatCurrency(post.bribe_amount) : "Refused"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="w-32">
                      <select 
                        value={modStatus}
                        onChange={(e) => handleModerationChange(post.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg border px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-pink-500 ${
                          modStatus === "pending" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900" :
                          modStatus === "hidden" ? "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" :
                          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900"
                        }`}
                      >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedPost(post);
                          setNoteText(post.admin_note || "");
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                      
                      {confirmDeleteId === post.id ? (
                        <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-0.5">
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            disabled={isDeleting}
                            className="p-1 hover:bg-red-200 dark:hover:bg-red-900/50 rounded text-red-600 dark:text-red-400"
                          >
                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteId(null)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmDeleteId(post.id)}
                          className="p-1.5 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Details Inspection Modal */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        {selectedPost && (
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-2xl">
            <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <DialogTitle className="text-lg font-bold flex items-center justify-between gap-4">
                <span>Inspect Bribe Incident Report</span>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${
                  selectedPost.bribe_status === "paid" 
                    ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                }`}>
                  {selectedPost.bribe_status === "paid" 
                    ? `Paid Bribe: ${formatCurrency(selectedPost.bribe_amount)}` 
                    : "Refused Bribe"}
                </span>
              </DialogTitle>
            </DialogHeader>

            {/* Core Metadata Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-slate-400 font-semibold">Department</div>
                  <div className="font-bold text-slate-700 dark:text-slate-300">{selectedPost.bribe_department}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-slate-400 font-semibold">District / Region</div>
                  <div className="font-bold text-slate-700 dark:text-slate-300">{selectedPost.district_name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-slate-400 font-semibold">Logged On</div>
                  <div className="font-bold text-slate-700 dark:text-slate-300">
                    {new Date(selectedPost.created_date).toLocaleString("en-IN", {
                      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-slate-400 font-semibold">Specific Office / Location</div>
                  <div className="font-bold text-slate-700 dark:text-slate-300">{selectedPost.bribe_specific_location || "Not specified"}</div>
                </div>
              </div>
              {selectedPost.bribe_officer_designation && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-slate-400 font-semibold">Officer Designation Involved</div>
                    <div className="font-bold text-slate-700 dark:text-slate-300">{selectedPost.bribe_officer_designation}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Title & Content (English) */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">English Details</h4>
              <div className="border border-slate-100 dark:border-slate-800 p-3.5 rounded-2xl bg-white dark:bg-slate-900">
                <div className="font-bold text-sm text-slate-900 dark:text-white">{selectedPost.title_en || "No English Title"}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 whitespace-pre-wrap">{selectedPost.content_en || "No English Description"}</div>
              </div>
            </div>

            {/* Title & Content (Tamil) */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Tamil Details / தமிழ் விவரங்கள்</h4>
              <div className="border border-slate-100 dark:border-slate-800 p-3.5 rounded-2xl bg-white dark:bg-slate-900">
                <div className="font-bold text-sm text-slate-900 dark:text-white">{selectedPost.title_ta || "தமிழ் தலைப்பு இல்லை"}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 whitespace-pre-wrap">{selectedPost.content_ta || "தமிழ் விளக்கம் இல்லை"}</div>
              </div>
            </div>

            {/* Media & Audio Proof Attachments */}
            {((selectedPost.media_urls && selectedPost.media_urls.length > 0) || selectedPost.bribe_audio_url) && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Supporting Evidence / Proof</h4>
                <div className="flex flex-col gap-3 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  {/* Audio Player */}
                  {selectedPost.bribe_audio_url && (
                    <AudioPlayer src={selectedPost.bribe_audio_url} />
                  )}

                  {/* Images & Videos display */}
                  {selectedPost.media_urls && selectedPost.media_urls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                      {selectedPost.media_urls
                        .filter(url => !url.endsWith(".mp3") && !url.endsWith(".wav") && !url.endsWith(".ogg") && !url.includes("audio"))
                        .map((url, i) => {
                          const isVideo = url.endsWith(".mp4") || url.endsWith(".webm") || url.includes("video");
                          return (
                            <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              {isVideo ? (
                                <video src={url} controls className="w-full h-full object-cover" />
                              ) : (
                                <img src={url} alt={`attachment-${i}`} className="w-full h-full object-cover" />
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Inline Moderation Selector inside Details */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Moderation Action:</span>
              <div className="flex gap-2">
                {["approved", "pending", "hidden"].map(status => (
                  <button 
                    key={status}
                    onClick={() => handleModerationChange(selectedPost.id, status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border capitalize transition-all ${
                      (selectedPost.moderation_status || "approved") === status
                        ? status === "approved" ? "bg-emerald-600 border-emerald-600 text-white" :
                          status === "pending" ? "bg-amber-500 border-amber-500 text-white" :
                          "bg-slate-700 border-slate-700 text-white"
                        : "bg-white dark:bg-slate-800 hover:bg-slate-50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Review Note Editor */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                Administrative Notes
              </label>
              <textarea 
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write internal audit reviews, verified status notes, or investigation remarks..."
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <div className="flex justify-end pt-1">
                <button 
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  {savingNote && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Notes
                </button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
