import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, BarChart2, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { getAllAds, createAd, updateAd, deleteAd, toggleAd } from "@/services/admin/ads";
import { AdminTable, AdminTh, AdminTd, AdminTr } from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";

const PLACEMENTS = ["homepage", "feed", "district", "category", "footer"];
const AD_TYPES = ["banner", "native"];
const TARGETING = ["all", "mobile", "desktop"];

const EMPTY_AD = { title: "", image_url: "", redirect_url: "", placement: "feed", ad_type: "banner", targeting: "all", active: true, start_date: "", end_date: "" };

export default function AdminAds() {
  const [dialog, setDialog] = useState(null); // {mode: 'create'|'edit', data}
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: getAllAds,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-ads"] });

  const handleSave = async () => {
    const d = dialog.data;
    if (!d.title || !d.redirect_url) return toast({ description: "Title and URL are required.", variant: "destructive" });
    if (dialog.mode === "create") await createAd(d);
    else await updateAd(d.id, d);
    refresh();
    setDialog(null);
    toast({ description: dialog.mode === "create" ? "Ad created." : "Ad updated." });
  };

  const handleDelete = async (id) => {
    await deleteAd(id);
    refresh();
    toast({ description: "Ad deleted." });
  };

  const handleToggle = async (ad) => {
    await toggleAd(ad.id, !ad.active);
    refresh();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setDialog((d) => ({ ...d, data: { ...d.data, image_url: file_url } }));
    setUploading(false);
  };

  const setField = (key, val) => setDialog((d) => ({ ...d, data: { ...d.data, [key]: val } }));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ads</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage ad campaigns</p>
        </div>
        <Button onClick={() => setDialog({ mode: "create", data: { ...EMPTY_AD } })} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Ad
        </Button>
      </div>

      {/* Analytics summary */}
      {!isLoading && ads.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: BarChart2, label: "Total Ads", value: ads.length, color: "text-blue-600" },
            { icon: TrendingUp, label: "Active", value: ads.filter(a => a.active).length, color: "text-green-600" },
            { icon: Eye, label: "Impressions", value: ads.reduce((s, a) => s + (a.impression_count || 0), 0).toLocaleString(), color: "text-purple-600" },
            { icon: MousePointerClick, label: "Total Clicks", value: ads.reduce((s, a) => s + (a.click_count || 0), 0).toLocaleString(), color: "text-orange-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-lg font-bold text-slate-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Title</AdminTh>
              <AdminTh>Placement</AdminTh>
              <AdminTh>Type</AdminTh>
              <AdminTh>Targeting</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Impressions</AdminTh>
              <AdminTh>Clicks</AdminTh>
              <AdminTh>CTR</AdminTh>
              <AdminTh>Actions</AdminTh>
            </tr>
          </thead>
          <tbody>
            {ads.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-slate-400 text-sm">No ads yet. Create one!</td></tr>
            )}
            {ads.map((ad) => (
              <AdminTr key={ad.id}>
                <AdminTd>
                  <div className="flex items-center gap-2">
                    {ad.image_url && <img src={ad.image_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />}
                    <span className="font-medium text-slate-800 line-clamp-1">{ad.title}</span>
                  </div>
                </AdminTd>
                <AdminTd><span className="capitalize text-xs">{ad.placement}</span></AdminTd>
                <AdminTd><StatusBadge status={ad.ad_type} /></AdminTd>
                <AdminTd><span className="capitalize text-xs">{ad.targeting}</span></AdminTd>
                <AdminTd>
                  <button onClick={() => handleToggle(ad)} className="flex items-center gap-1 text-xs">
                    {ad.active
                      ? <><ToggleRight className="w-4 h-4 text-green-600" /><span className="text-green-700">Active</span></>
                      : <><ToggleLeft className="w-4 h-4 text-slate-400" /><span className="text-slate-500">Paused</span></>
                    }
                  </button>
                </AdminTd>
                <AdminTd className="text-sm">{(ad.impression_count || 0).toLocaleString()}</AdminTd>
                <AdminTd className="text-sm">{(ad.click_count || 0).toLocaleString()}</AdminTd>
                <AdminTd className="text-sm text-slate-500">
                  {ad.impression_count > 0 ? `${((ad.click_count || 0) / ad.impression_count * 100).toFixed(1)}%` : "—"}
                </AdminTd>
                <AdminTd>
                  <div className="flex gap-2">
                    <button onClick={() => setDialog({ mode: "edit", data: { ...ad } })} className="p-1.5 rounded hover:bg-slate-100 text-slate-600">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(ad.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "create" ? "Create Ad" : "Edit Ad"}</DialogTitle>
          </DialogHeader>
          {dialog && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Title *</label>
                <Input value={dialog.data.title} onChange={(e) => setField("title", e.target.value)} placeholder="Ad title" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Redirect URL *</label>
                <Input value={dialog.data.redirect_url} onChange={(e) => setField("redirect_url", e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Banner Image</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
                {uploading && <p className="text-xs text-slate-400 mt-1">Uploading...</p>}
                {dialog.data.image_url && (
                  <img src={dialog.data.image_url} alt="" className="mt-2 rounded-lg h-24 object-cover" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Placement</label>
                  <select value={dialog.data.placement} onChange={(e) => setField("placement", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    {PLACEMENTS.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Type</label>
                  <select value={dialog.data.ad_type} onChange={(e) => setField("ad_type", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    {AD_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Targeting</label>
                  <select value={dialog.data.targeting} onChange={(e) => setField("targeting", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    {TARGETING.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Active</label>
                  <select value={dialog.data.active ? "true" : "false"} onChange={(e) => setField("active", e.target.value === "true")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="true">Active</option>
                    <option value="false">Paused</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Start Date</label>
                  <Input type="date" value={dialog.data.start_date || ""} onChange={(e) => setField("start_date", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">End Date</label>
                  <Input type="date" value={dialog.data.end_date || ""} onChange={(e) => setField("end_date", e.target.value)} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save Ad</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}