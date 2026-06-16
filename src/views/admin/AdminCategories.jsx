import React, { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CATEGORIES } from "@/lib/categories";
import { useToast } from "@/components/ui/use-toast";

// Categories are static in lib/categories.js — this page manages a local editable copy
// persisted via localStorage for the demo (can be upgraded to a DB entity)
const STORAGE_KEY = "tn_custom_categories";

function loadCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...CATEGORIES];
  } catch {
    return [...CATEGORIES];
  }
}

function saveCategories(cats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

const EMPTY = { slug: "", name_en: "", name_ta: "", icon: "📌", color: "gray" };

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminCategories() {
  const [categories, setCategories] = useState(loadCategories);
  const [dialog, setDialog] = useState(null);
  const { toast } = useToast();

  const save = (cats) => {
    setCategories(cats);
    saveCategories(cats);
  };

  const handleSave = () => {
    const d = dialog.data;
    if (!d.name_en || !d.slug) return toast({ description: "Name and slug are required.", variant: "destructive" });
    if (dialog.mode === "create") {
      save([...categories, d]);
      toast({ description: "Category created." });
    } else {
      save(categories.map((c) => (c.slug === dialog.original ? d : c)));
      toast({ description: "Category updated." });
    }
    setDialog(null);
  };

  const handleDelete = (slug) => {
    save(categories.filter((c) => c.slug !== slug));
    toast({ description: "Category removed." });
  };

  const setField = (key, val) => {
    setDialog((d) => {
      const updated = { ...d.data, [key]: val };
      if (key === "name_en" && d.mode === "create") updated.slug = slugify(val);
      return { ...d, data: updated };
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">Manage post categories</p>
        </div>
        <Button onClick={() => setDialog({ mode: "create", data: { ...EMPTY }, original: null })} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {categories.map((cat) => (
          <div key={cat.slug} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="text-xl">{cat.icon}</span>
              <div>
                <p className="font-medium text-slate-800 text-sm">{cat.name_en}</p>
                <p className="text-xs text-slate-400">{cat.name_ta} · <code className="bg-slate-100 px-1 rounded text-xs">{cat.slug}</code></p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDialog({ mode: "edit", data: { ...cat }, original: cat.slug })}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(cat.slug)}
                className="p-1.5 rounded hover:bg-red-50 text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-10">No categories. Add one!</p>
        )}
      </div>

      <Dialog open={!!dialog} onOpenChange={() => setDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog?.mode === "create" ? "Add Category" : "Edit Category"}</DialogTitle>
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
                <Input value={dialog.data.slug} onChange={(e) => setField("slug", slugify(e.target.value))} placeholder="auto-generated" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Icon (emoji)</label>
                  <Input value={dialog.data.icon} onChange={(e) => setField("icon", e.target.value)} maxLength={2} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Color</label>
                  <Input value={dialog.data.color} onChange={(e) => setField("color", e.target.value)} placeholder="blue" />
                </div>
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