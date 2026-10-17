import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchStorageAudit, 
  deleteStorageFiles 
} from '@/services/admin/storageCleaner';
import { 
  Trash2, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Film, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Sparkles,
  Database,
  CheckSquare,
  Square
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function StorageAuditor() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unused' | 'used' | 'videos' | 'heavy'
  const [selectedPaths, setSelectedPaths] = useState(new Set());
  const [deleteDialog, setDeleteDialog] = useState({ open: false, files: [], deleteFromDb: false });
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query audit results
  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: ['storage-cleaner-audit'],
    queryFn: fetchStorageAudit,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  const summary = useMemo(() => data?.summary || {
    totalFiles: 0,
    totalBytes: 0,
    usedFiles: 0,
    usedBytes: 0,
    unusedFiles: 0,
    unusedBytes: 0,
    videoCount: 0,
    videoBytes: 0,
    unusedVideoCount: 0,
    unusedVideoBytes: 0
  }, [data?.summary]);

  const files = useMemo(() => data?.files || [], [data?.files]);

  // Filter & Search
  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      // Search
      const matchesSearch = !search || 
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.path.toLowerCase().includes(search.toLowerCase()) ||
        (f.references || []).some(r => (r.title || '').toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      // Filter
      if (filterType === 'unused') return !f.isUsed;
      if (filterType === 'used') return f.isUsed;
      if (filterType === 'videos') return f.isVideo;
      if (filterType === 'heavy') return f.size > 2 * 1024 * 1024; // > 2MB

      return true;
    });
  }, [files, search, filterType]);

  // Mutation: Delete files
  const deleteMutation = useMutation({
    mutationFn: ({ paths, deleteFromDb }) => deleteStorageFiles(paths, deleteFromDb),
    onSuccess: (res, variables) => {
      toast({
        title: 'Purge Complete',
        description: `Permanently removed ${variables.paths.length} file(s) from Supabase Storage.${res.dbUpdatedCount ? ` Cleaned references from ${res.dbUpdatedCount} DB record(s).` : ''}`,
      });
      setSelectedPaths(new Set());
      setDeleteDialog({ open: false, files: [], deleteFromDb: false });
      queryClient.invalidateQueries({ queryKey: ['storage-cleaner-audit'] });
      queryClient.invalidateQueries({ queryKey: ['admin-direct-uploads'] });
    },
    onError: (err) => {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: err.message || 'Failed to remove files from storage.',
      });
    }
  });

  // Toggle selection
  const toggleSelect = (path) => {
    setSelectedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const selectAllFiltered = () => {
    if (selectedPaths.size === filteredFiles.length) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(filteredFiles.map(f => f.path)));
    }
  };

  // Copy link
  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast({ description: 'Copied link to clipboard!' });
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Quick Action: Purge Videos
  const promptPurgeVideos = () => {
    const videoFiles = files.filter(f => f.isVideo && !f.isUsed);
    if (videoFiles.length === 0) {
      toast({ description: 'No unused MP4 videos found in storage.' });
      return;
    }
    setDeleteDialog({
      open: true,
      files: videoFiles,
      deleteFromDb: false
    });
  };

  // Quick Action: Purge All Unused
  const promptPurgeAllUnused = () => {
    const unusedFiles = files.filter(f => !f.isUsed);
    if (unusedFiles.length === 0) {
      toast({ description: 'Zero unused files! Storage is already 100% clean.' });
      return;
    }
    setDeleteDialog({
      open: true,
      files: unusedFiles,
      deleteFromDb: false
    });
  };

  // Trigger delete on selected
  const promptDeleteSelected = () => {
    const targetFiles = files.filter(f => selectedPaths.has(f.path));
    if (targetFiles.length === 0) return;
    const hasUsed = targetFiles.some(f => f.isUsed);
    setDeleteDialog({
      open: true,
      files: targetFiles,
      deleteFromDb: hasUsed
    });
  };

  // Trigger delete on single file
  const promptDeleteSingle = (file) => {
    setDeleteDialog({
      open: true,
      files: [file],
      deleteFromDb: file.isUsed
    });
  };

  // Execute confirmed deletion
  const executeDeletion = () => {
    const paths = deleteDialog.files.map(f => f.path);
    deleteMutation.mutate({
      paths,
      deleteFromDb: deleteDialog.deleteFromDb
    });
  };

  const selectedSize = useMemo(() => {
    return files
      .filter(f => selectedPaths.has(f.path))
      .reduce((acc, f) => acc + f.size, 0);
  }, [files, selectedPaths]);

  return (
    <div className="space-y-6">
      {/* 1. Storage Health & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Storage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Storage</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatBytes(summary.totalBytes)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{summary.totalFiles} total files in bucket</p>
          </div>
        </div>

        {/* Used / Active in DB */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Active In-Use</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {formatBytes(summary.usedBytes)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{summary.usedFiles} files linked to posts/articles</p>
          </div>
        </div>

        {/* Reclaimable Unused */}
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/60 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Reclaimable Waste</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatBytes(summary.unusedBytes)}
            </div>
            <p className="text-xs text-rose-500/80 mt-0.5">{summary.unusedFiles} orphaned / unlinked files</p>
          </div>
        </div>

        {/* Heavy Videos */}
        <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-950/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Heavy MP4 Videos</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-700 dark:text-purple-400">
              {formatBytes(summary.videoBytes)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{summary.unusedVideoCount} unused ({formatBytes(summary.unusedVideoBytes)})</p>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Relief Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">One-Click Storage & Egress Cleaner</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Clean heavy unlinked MP4 videos and orphaned social cards permanently to eliminate bandwidth egress and reclaim Supabase disk quota.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {summary.unusedVideoCount > 0 && (
            <Button
              onClick={promptPurgeVideos}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold h-9 px-3.5 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Purge Videos ({formatBytes(summary.unusedVideoBytes)})</span>
            </Button>
          )}

          {summary.unusedFiles > 0 && (
            <Button
              onClick={promptPurgeAllUnused}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-9 px-3.5 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge All Unused ({formatBytes(summary.unusedBytes)})</span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="border-slate-600 text-slate-200 hover:bg-slate-800 text-xs font-semibold h-9 px-3 rounded-xl flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Rescan</span>
          </Button>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Files ({files.length})
          </button>
          <button
            onClick={() => setFilterType('unused')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filterType === 'unused'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            🔴 Unused ({summary.unusedFiles})
          </button>
          <button
            onClick={() => setFilterType('used')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filterType === 'used'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            🟢 In-Use ({summary.usedFiles})
          </button>
          <button
            onClick={() => setFilterType('videos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filterType === 'videos'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
            }`}
          >
            🎬 Videos ({summary.videoCount})
          </button>
          <button
            onClick={() => setFilterType('heavy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filterType === 'heavy'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            📦 Heavy &gt; 2MB
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search filename or post title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* 4. Selection Action Bar (Appears when >= 1 selected) */}
      {selectedPaths.size > 0 && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl flex items-center justify-between gap-4 flex-wrap shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold">
              {selectedPaths.size} file{selectedPaths.size !== 1 ? 's' : ''} selected ({formatBytes(selectedSize)})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPaths(new Set())}
              className="text-slate-400 hover:text-white text-xs h-7 px-2"
            >
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={promptDeleteSelected}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-8 px-3 rounded-xl flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected Permanently</span>
            </Button>
          </div>
        </div>
      )}

      {/* 5. Audit Results Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Auditing Supabase Storage...</h3>
          <p className="text-xs text-slate-400 mt-1">Cross-referencing storage assets against all posts and news articles</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-6 text-center text-rose-700 dark:text-rose-300">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <p className="text-sm font-semibold">Failed to load storage audit</p>
          <p className="text-xs mt-1 text-rose-600/80">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-60 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching files found</p>
          <p className="text-xs text-slate-400 mt-1">Try switching filters or clearing your search term</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-3">
              <button
                onClick={selectAllFiltered}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title="Select all"
              >
                {selectedPaths.size > 0 && selectedPaths.size === filteredFiles.length ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <span>Asset ({filteredFiles.length})</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="hidden md:inline">Usage Status</span>
              <span className="w-20 text-right">Size</span>
              <span className="w-24 text-right">Actions</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[650px] overflow-y-auto">
            {filteredFiles.map((file) => {
              const isSelected = selectedPaths.has(file.path);
              const isCopied = copiedUrl === file.url;

              return (
                <div
                  key={file.path}
                  className={`px-4 py-3 flex items-center justify-between gap-4 transition-colors ${
                    isSelected
                      ? 'bg-blue-50/60 dark:bg-blue-950/20'
                      : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left: Checkbox + Media Thumbnail + Name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleSelect(file.path)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex-shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    {/* Preview Thumbnail */}
                    <div 
                      onClick={() => setPreviewMedia(file)}
                      className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {file.isVideo ? (
                        <Film className="w-5 h-5 text-purple-500" />
                      ) : (
                        <img 
                          src={file.url} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          loading="lazy" 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                    </div>

                    {/* File Path & Date */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p 
                          className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:text-blue-600"
                          onClick={() => setPreviewMedia(file)}
                          title={file.path}
                        >
                          {file.name}
                        </p>
                        {file.isVideo && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300">
                            MP4
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                        {file.path}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Usage Status Badge */}
                  <div className="hidden md:flex flex-col items-end min-w-[200px] text-right">
                    {file.isUsed ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active ({file.references.length} ref{file.references.length !== 1 ? 's' : ''})</span>
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[220px] mt-0.5" title={file.references[0]?.title}>
                          {file.references[0]?.title || 'Linked to post'}
                        </p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Unused / Orphan</span>
                      </span>
                    )}
                  </div>

                  {/* Right: Size */}
                  <div className="w-20 text-right flex-shrink-0">
                    <span className={`text-xs font-mono font-semibold ${file.size > 2 * 1024 * 1024 ? 'text-amber-600 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                      {formatBytes(file.size)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="w-24 flex items-center justify-end gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(file.url)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Copy Public URL"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Open file"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => promptDeleteSingle(file)}
                      className="h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !deleteMutation.isPending && setDeleteDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md">
          <DialogTitle className="flex items-center gap-2 text-rose-600 font-bold">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <span>Permanent Storage Purge</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            This will permanently delete the selected files from Supabase Storage. This action cannot be undone.
          </DialogDescription>

          <div className="my-4 space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Files to delete:</span>
                <span className="font-bold text-slate-900 dark:text-white">{deleteDialog.files.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1.5">
                <span className="text-slate-500">Storage to reclaim:</span>
                <span className="font-bold text-rose-600">
                  {formatBytes(deleteDialog.files.reduce((acc, f) => acc + f.size, 0))}
                </span>
              </div>
            </div>

            {/* Check if any file is linked to DB */}
            {deleteDialog.files.some(f => f.isUsed) && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold text-xs">
                  <Database className="w-4 h-4 flex-shrink-0" />
                  <span>Some files are active in database posts!</span>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteDialog.deleteFromDb}
                    onChange={(e) => setDeleteDialog(prev => ({ ...prev, deleteFromDb: e.target.checked }))}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Automatically scrub broken URL from post/article rows</span>
                </label>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteDialog({ open: false, files: [], deleteFromDb: false })}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={executeDeletion}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5"
            >
              {deleteMutation.isPending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Purging...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Permanent Purge</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Preview Modal */}
      <Dialog open={!!previewMedia} onOpenChange={() => setPreviewMedia(null)}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="sr-only">Media Preview</DialogTitle>
          <DialogDescription className="sr-only">Detailed preview of selected media</DialogDescription>
          {previewMedia && (
            <div className="space-y-3">
              <div className="max-h-[60vh] overflow-hidden rounded-xl bg-black flex items-center justify-center">
                {previewMedia.isVideo ? (
                  <video src={previewMedia.url} controls className="max-h-[60vh] w-full" autoPlay />
                ) : (
                  <img src={previewMedia.url} alt="" className="max-h-[60vh] object-contain w-full" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{previewMedia.name}</p>
                <p className="text-xs font-mono text-slate-400">{previewMedia.path} • {formatBytes(previewMedia.size)}</p>
                {previewMedia.references?.length > 0 && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    Linked to: {previewMedia.references.map(r => r.title).join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
