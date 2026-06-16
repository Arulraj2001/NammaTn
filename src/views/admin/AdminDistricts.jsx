import React, { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DISTRICTS } from "@/lib/districts";
import { useToast } from "@/components/ui/use-toast";

const STORAGE_KEY = "tn_custom_districts";

function loadDistricts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...DISTRICTS];
  } catch {
    return [...DISTRICTS];
  }
}

function saveDistricts(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const REGIONS = ["north", "south", "east", "west", "central"];
const EMPTY = { slug: "", name_en: "", name_ta: "", region: "central" };

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminDistricts() {
  const [districts, setDistricts] = useState(loadDistricts);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(null);
  const { toast } = useToast();

  const save = (list) => {
    setDistricts(list);
    saveDistricts(list);
  };

  const handleSave = () => {
    const d = dialog.data;
    if (!d.name_en || !d.slug) return toast({ description: "Name and slug are required.", variant: "destructive" });
    if (dialog.mode === "create") {
      save([...districts, d]);
      toast({ description: "District added." });
    } else {
      save(districts.map((x) => (x.slug === dialog.original ? d : x)));
      toast({ description: "District updated." });
    }
    setDialog(null);
  };

  const handleDelete = (slug) => {
    save(districts.filter((d) => d.slug !== slug));
    toast({ description: "District removed." });
  };

  const setField = (key, val) => {
    setDialog((d) => {
      const updated = { ...d.data, [key]: val };
      if (key === "name_en" && d.mode === "create") updated.slug = slugify(val);
      return { ...d, data: updated };
    });
  };

  const filtered = districts.filter((d) =>
    d.name_en.toLowerCase().includes(search.toLowerCase()) ||
    d.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Districts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage Tamil Nadu districts ({districts.length} total)</p>
        </div>
        <Button onClick={() => setDialog({ mode: "create", data: { ...EMPTY }, original: null })} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add District
        </Button>
      </div>

      <Input
        placeholder="Search districts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filtered.map((d) => (
          <div key={d.slug} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <div>
              <p className="font-medium text-slate-800 text-sm">{d.name_en}</p>
              <p className="text-xs text-slate-400">{d.name_ta} · <span className="capitalize">{d.region}</span> · <code className="bg-slate-100 px-1 rounded">{d.slug}</code></p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDialog({ mode: "edit", data: { ...d }, original: d.slug })} className="p-1.5 rounded hover:bg-slate-100 text-slate-600">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(d.slug)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-10">No districts found</p>
        )}
      </div>

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "create" ? "Add District" : "Edit District"}</DialogTitle>
          </DialogHeader>
          {dialog && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Name (English) *</label>
                <Input value={dialog.data.name_en} onChange={(e) => setField("name_en", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Name (Tamil)</label>
                <Input value={dialog.data.name_ta} onChange={(e) => setField("name_ta", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Slug *</label>
                <Input value={dialog.data.slug} onChange={(e) => setField("slug", slugify(e.target.value))} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Region</label>
                <select value={dialog.data.region} onChange={(e) => setField("region", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  {REGIONS.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}