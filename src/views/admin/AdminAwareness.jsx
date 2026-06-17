import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
  Phone,
  Shield,
  Globe,
  FileText,
  HelpCircle,
  AlertTriangle,
  BarChart3,
  Tag,
  Award,
  Newspaper,
  Layers,
  ExternalLink,
  Star,
} from "lucide-react";
import { format } from "date-fns";

/* ──────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────── */

const STATUS_BADGE = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
  draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  published: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

function StatusBadge({ active, status }) {
  if (status) {
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[status] || STATUS_BADGE.active}`}>
        {status}
      </span>
    );
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${active ? STATUS_BADGE.active : STATUS_BADGE.inactive}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function BilingualInput({ label, valueEn, valueTa, onChangeEn, onChangeTa, type = "input", rows = 3 }) {
  const Comp = type === "textarea" ? Textarea : Input;
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
          {label} — English
        </label>
        <Comp
          value={valueEn || ""}
          onChange={(e) => onChangeEn(e.target.value)}
          placeholder={`${label} (English)`}
          {...(type === "textarea" ? { rows } : {})}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
          {label} — தமிழ்
        </label>
        <Comp
          value={valueTa || ""}
          onChange={(e) => onChangeTa(e.target.value)}
          placeholder={`${label} (தமிழ்)`}
          {...(type === "textarea" ? { rows } : {})}
        />
      </div>
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">{label}</label>
      {children}
    </div>
  );
}

function SwitchField({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      <Switch checked={!!checked} onCheckedChange={onChange} />
    </div>
  );
}

/** Convert newline-separated text to JSON array and back */
function linesToArray(text) {
  if (!text) return [];
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}
function arrayToLines(arr) {
  if (!arr || !Array.isArray(arr)) return "";
  return arr.join("\n");
}

function EmptyState({ icon: Icon, label }) {
  return (
    <div className="text-center py-16 text-slate-400">
      <Icon className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p>No {label} found</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        ))}
    </div>
  );
}

function DeleteConfirmDialog({ open, onClose, onConfirm, label }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-4 h-4" /> Delete {label}?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This action cannot be undone. Are you sure you want to delete this item?
        </p>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1">
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}

function TabHeader({ icon: Icon, title, count, onAdd }) {
  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        {count !== undefined && (
          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {onAdd && (
        <Button onClick={onAdd} size="sm" className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add New
        </Button>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   TAB 1: Categories
   ────────────────────────────────────────────────────────── */

function CategoriesTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-awareness-categories"],
    queryFn: () => base44.entities.AwarenessCategory.list("-created_date", 500),
  });

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const q = search.toLowerCase();
        return !q || (i.name_en || "").toLowerCase().includes(q) || (i.name_ta || "").toLowerCase().includes(q);
      }),
    [items, search]
  );

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ is_active: true, sort_order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem?.id) {
        await base44.entities.AwarenessCategory.update(editingItem.id, formData);
      } else {
        await base44.entities.AwarenessCategory.create(formData);
      }
      qc.invalidateQueries({ queryKey: ["admin-awareness-categories"] });
      setDialogOpen(false);
      toast({ title: editingItem ? "Category updated" : "Category created" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.AwarenessCategory.delete(deleteTarget.id);
      qc.invalidateQueries({ queryKey: ["admin-awareness-categories"] });
      setDeleteTarget(null);
      toast({ title: "Category deleted" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (item) => {
    await base44.entities.AwarenessCategory.update(item.id, { is_active: !item.is_active });
    qc.invalidateQueries({ queryKey: ["admin-awareness-categories"] });
  };

  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <TabHeader icon={Tag} title="Categories" count={items.length} onAdd={openCreate} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search categories..." />

      <div className="mt-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Tag} label="categories" />
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.icon && <span className="text-xl">{item.icon}</span>}
                    {item.color && (
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.name_en}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.name_ta}</p>
                      {item.slug && <p className="text-xs text-slate-400 font-mono">/{item.slug}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">#{item.sort_order || 0}</span>
                    <StatusBadge active={item.is_active} />
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleActive(item)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Toggle active">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <BilingualInput label="Name" valueEn={formData.name_en} valueTa={formData.name_ta} onChangeEn={(v) => set("name_en", v)} onChangeTa={(v) => set("name_ta", v)} />
            <div className="grid grid-cols-3 gap-3">
              <FieldRow label="Icon (emoji)">
                <Input value={formData.icon || ""} onChange={(e) => set("icon", e.target.value)} placeholder="🏛️" />
              </FieldRow>
              <FieldRow label="Color">
                <Input type="color" value={formData.color || "#3b82f6"} onChange={(e) => set("color", e.target.value)} />
              </FieldRow>
              <FieldRow label="Sort Order">
                <Input type="number" value={formData.sort_order || 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} />
              </FieldRow>
            </div>
            <FieldRow label="Slug">
              <Input value={formData.slug || ""} onChange={(e) => set("slug", e.target.value)} placeholder="category-slug" />
            </FieldRow>
            <SwitchField label="Active" checked={formData.is_active} onChange={(v) => set("is_active", v)} />
            <Button onClick={handleSave} className="w-full">
              {editingItem ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} label="Category" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   TAB 2: Resources
   ────────────────────────────────────────────────────────── */

function ResourcesTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-awareness-resources"],
    queryFn: () => base44.entities.AwarenessResource.list("-created_date", 500),
  });

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const q = search.toLowerCase();
        return !q || (i.title_en || "").toLowerCase().includes(q) || (i.title_ta || "").toLowerCase().includes(q);
      }),
    [items, search]
  );

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ is_active: true, sort_order: 0, items_en: [], items_ta: [] });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };
      if (editingItem?.id) {
        await base44.entities.AwarenessResource.update(editingItem.id, payload);
      } else {
        await base44.entities.AwarenessResource.create(payload);
      }
      qc.invalidateQueries({ queryKey: ["admin-awareness-resources"] });
      setDialogOpen(false);
      toast({ title: editingItem ? "Resource updated" : "Resource created" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.AwarenessResource.delete(deleteTarget.id);
      qc.invalidateQueries({ queryKey: ["admin-awareness-resources"] });
      setDeleteTarget(null);
      toast({ title: "Resource deleted" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (item) => {
    await base44.entities.AwarenessResource.update(item.id, { is_active: !item.is_active });
    qc.invalidateQueries({ queryKey: ["admin-awareness-resources"] });
  };

  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <TabHeader icon={Layers} title="Resources" count={items.length} onAdd={openCreate} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search resources..." />

      <div className="mt-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Layers} label="resources" />
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.icon && <span className="text-xl">{item.icon}</span>}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.title_en}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.title_ta}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description_en}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">#{item.sort_order || 0}</span>
                    <StatusBadge active={item.is_active} />
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleActive(item)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Toggle active">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Resource" : "New Resource"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <BilingualInput label="Title" valueEn={formData.title_en} valueTa={formData.title_ta} onChangeEn={(v) => set("title_en", v)} onChangeTa={(v) => set("title_ta", v)} />
            <BilingualInput label="Description" type="textarea" valueEn={formData.description_en} valueTa={formData.description_ta} onChangeEn={(v) => set("description_en", v)} onChangeTa={(v) => set("description_ta", v)} />
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Items (English) — one per line">
                <Textarea
                  rows={5}
                  value={arrayToLines(formData.items_en)}
                  onChange={(e) => set("items_en", linesToArray(e.target.value))}
                  placeholder={"Item 1\nItem 2\nItem 3"}
                />
              </FieldRow>
              <FieldRow label="Items (தமிழ்) — one per line">
                <Textarea
                  rows={5}
                  value={arrayToLines(formData.items_ta)}
                  onChange={(e) => set("items_ta", linesToArray(e.target.value))}
                  placeholder={"உருப்படி 1\nஉருப்படி 2"}
                />
              </FieldRow>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FieldRow label="Icon (emoji)">
                <Input value={formData.icon || ""} onChange={(e) => set("icon", e.target.value)} placeholder="📋" />
              </FieldRow>
              <FieldRow label="Icon Color">
                <Input type="color" value={formData.icon_color || "#3b82f6"} onChange={(e) => set("icon_color", e.target.value)} />
              </FieldRow>
              <FieldRow label="Sort Order">
                <Input type="number" value={formData.sort_order || 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} />
              </FieldRow>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Action Button Text">
                <Input value={formData.action_button_text || ""} onChange={(e) => set("action_button_text", e.target.value)} placeholder="Learn More" />
              </FieldRow>
              <FieldRow label="Action Button URL">
                <Input value={formData.action_button_url || ""} onChange={(e) => set("action_button_url", e.target.value)} placeholder="https://..." />
              </FieldRow>
            </div>
            <SwitchField label="Active" checked={formData.is_active} onChange={(v) => set("is_active", v)} />
            <Button onClick={handleSave} className="w-full">
              {editingItem ? "Update Resource" : "Create Resource"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} label="Resource" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   TAB 3: Schemes
   ────────────────────────────────────────────────────────── */

function SchemesTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-awareness-schemes"],
    queryFn: () => base44.entities.AwarenessScheme.list("-created_date", 500),
  });

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const q = search.toLowerCase();
        return (
          !q ||
          (i.name_en || "").toLowerCase().includes(q) ||
          (i.name_ta || "").toLowerCase().includes(q) ||
          (i.department_en || "").toLowerCase().includes(q)
        );
      }),
    [items, search]
  );

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ is_active: true, is_featured: false, sort_order: 0, priority: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem?.id) {
        await base44.entities.AwarenessScheme.update(editingItem.id, formData);
      } else {
        await base44.entities.AwarenessScheme.create(formData);
      }
      qc.invalidateQueries({ queryKey: ["admin-awareness-schemes"] });
      setDialogOpen(false);
      toast({ title: editingItem ? "Scheme updated" : "Scheme created" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.AwarenessScheme.delete(deleteTarget.id);
      qc.invalidateQueries({ queryKey: ["admin-awareness-schemes"] });
      setDeleteTarget(null);
      toast({ title: "Scheme deleted" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (item) => {
    await base44.entities.AwarenessScheme.update(item.id, { is_active: !item.is_active });
    qc.invalidateQueries({ queryKey: ["admin-awareness-schemes"] });
  };

  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <TabHeader icon={Award} title="Schemes" count={items.length} onAdd={openCreate} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search schemes..." />

      <div className="mt-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Award} label="schemes" />
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {item.icon && <span className="text-xl mt-0.5">{item.icon}</span>}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.name_en}</p>
                        {item.is_featured && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Star className="w-3 h-3" /> Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.name_ta}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {item.department_en && (
                          <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full">
                            {item.department_en}
                          </span>
                        )}
                        {item.category_en && (
                          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">
                            {item.category_en}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.description_en}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">P{item.priority || 0}</span>
                    <StatusBadge active={item.is_active} />
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleActive(item)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Toggle active">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Scheme" : "New Scheme"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <BilingualInput label="Name" valueEn={formData.name_en} valueTa={formData.name_ta} onChangeEn={(v) => set("name_en", v)} onChangeTa={(v) => set("name_ta", v)} />
            <BilingualInput label="Category" valueEn={formData.category_en} valueTa={formData.category_ta} onChangeEn={(v) => set("category_en", v)} onChangeTa={(v) => set("category_ta", v)} />
            <BilingualInput label="Department" valueEn={formData.department_en} valueTa={formData.department_ta} onChangeEn={(v) => set("department_en", v)} onChangeTa={(v) => set("department_ta", v)} />
            <BilingualInput label="Description" type="textarea" valueEn={formData.description_en} valueTa={formData.description_ta} onChangeEn={(v) => set("description_en", v)} onChangeTa={(v) => set("description_ta", v)} />
            <BilingualInput label="Eligibility" type="textarea" valueEn={formData.eligibility_en} valueTa={formData.eligibility_ta} onChangeEn={(v) => set("eligibility_en", v)} onChangeTa={(v) => set("eligibility_ta", v)} />
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Apply URL">
                <Input value={formData.apply_url || ""} onChange={(e) => set("apply_url", e.target.value)} placeholder="https://..." />
              </FieldRow>
              <FieldRow label="Website URL">
                <Input value={formData.website_url || ""} onChange={(e) => set("website_url", e.target.value)} placeholder="https://..." />
              </FieldRow>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FieldRow label="Icon (emoji)">
                <Input value={formData.icon || ""} onChange={(e) => set("icon", e.target.value)} placeholder="📋" />
              </FieldRow>
              <FieldRow label="Priority">
                <Input type="number" value={formData.priority || 0} onChange={(e) => set("priority", parseInt(e.target.value) || 0)} />
              </FieldRow>
              <FieldRow label="Sort Order">
                <Input type="number" value={formData.sort_order || 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} />
              </FieldRow>
            </div>
            <SwitchField label="Featured" checked={formData.is_featured} onChange={(v) => set("is_featured", v)} />
            <SwitchField label="Active" checked={formData.is_active} onChange={(v) => set("is_active", v)} />
            <Button onClick={handleSave} className="w-full">
              {editingItem ? "Update Scheme" : "Create Scheme"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} label="Scheme" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   TAB 4: Portals
   ────────────────────────────────────────────────────────── */

function PortalsTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-awareness-portals"],
    queryFn: () => base44.entities.AwarenessPortal.list("-created_date", 500),
  });

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const q = search.toLowerCase();
        return !q || (i.name_en || "").toLowerCase().includes(q) || (i.name_ta || "").toLowerCase().includes(q);
      }),
    [items, search]
  );

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ is_active: true, is_featured: false, sort_order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem?.id) {
        await base44.entities.AwarenessPortal.update(editingItem.id, formData);
      } else {
        await base44.entities.AwarenessPortal.create(formData);
      }
      qc.invalidateQueries({ queryKey: ["admin-awareness-portals"] });
      setDialogOpen(false);
      toast({ title: editingItem ? "Portal updated" : "Portal created" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.AwarenessPortal.delete(deleteTarget.id);
      qc.invalidateQueries({ queryKey: ["admin-awareness-portals"] });
      setDeleteTarget(null);
      toast({ title: "Portal deleted" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (item) => {
    await base44.entities.AwarenessPortal.update(item.id, { is_active: !item.is_active });
    qc.invalidateQueries({ queryKey: ["admin-awareness-portals"] });
  };

  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <TabHeader icon={Globe} title="Portals" count={items.length} onAdd={openCreate} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search portals..." />

      <div className="mt-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Globe} label="portals" />
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.icon && <span className="text-xl">{item.icon}</span>}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.name_en}</p>
                        {item.is_featured && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Star className="w-3 h-3" /> Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.name_ta}</p>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5">
                          <ExternalLink className="w-3 h-3" /> {item.url}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">#{item.sort_order || 0}</span>
                    <StatusBadge active={item.is_active} />
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleActive(item)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Toggle active">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Portal" : "New Portal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <BilingualInput label="Name" valueEn={formData.name_en} valueTa={formData.name_ta} onChangeEn={(v) => set("name_en", v)} onChangeTa={(v) => set("name_ta", v)} />
            <BilingualInput label="Description" type="textarea" valueEn={formData.description_en} valueTa={formData.description_ta} onChangeEn={(v) => set("description_en", v)} onChangeTa={(v) => set("description_ta", v)} />
            <FieldRow label="URL">
              <Input value={formData.url || ""} onChange={(e) => set("url", e.target.value)} placeholder="https://..." />
            </FieldRow>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Icon (emoji)">
                <Input value={formData.icon || ""} onChange={(e) => set("icon", e.target.value)} placeholder="🌐" />
              </FieldRow>
              <FieldRow label="Sort Order">
                <Input type="number" value={formData.sort_order || 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} />
              </FieldRow>
            </div>
            <SwitchField label="Featured" checked={formData.is_featured} onChange={(v) => set("is_featured", v)} />
            <SwitchField label="Active" checked={formData.is_active} onChange={(v) => set("is_active", v)} />
            <Button onClick={handleSave} className="w-full">
              {editingItem ? "Update Portal" : "Create Portal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} label="Portal" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   TAB 5: Rights
   ────────────────────────────────────────────────────────── */

function RightsTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-awareness-rights"],
    queryFn: () => base44.entities.AwarenessRight.list("-created_date", 500),
  });

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const q = search.toLowerCase();
        return !q || (i.name_en || "").toLowerCase().includes(q) || (i.name_ta || "").toLowerCase().includes(q);
      }),
    [items, search]
  );

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ is_active: true, sort_order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem?.id) {
        await base44.entities.AwarenessRight.update(editingItem.id, formData);
      } else {
        await base44.entities.AwarenessRight.create(formData);
      }
      qc.invalidateQueries({ queryKey: ["admin-awareness-rights"] });
      setDialogOpen(false);
      toast({ title: editingItem ? "Right updated" : "Right created" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.AwarenessRight.delete(deleteTarget.id);
      qc.invalidateQueries({ queryKey: ["admin-awareness-rights"] });
      setDeleteTarget(null);
      toast({ title: "Right deleted" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (item) => {
    await base44.entities.AwarenessRight.update(item.id, { is_active: !item.is_active });
    qc.invalidateQueries({ queryKey: ["admin-awareness-rights"] });
  };

  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <TabHeader icon={Shield} title="Citizen Rights" count={items.length} onAdd={openCreate} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search rights..." />

      <div className="mt-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Shield} label="rights" />
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.name_en}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.name_ta}</p>
                    {item.department_en && (
                      <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {item.department_en}
                      </span>
                    )}
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description_en}</p>
                    {item.pdf_url && (
                      <a href={item.pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                        <FileText className="w-3 h-3" /> PDF Document
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">#{item.sort_order || 0}</span>
                    <StatusBadge active={item.is_active} />
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleActive(item)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Toggle active">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Right" : "New Right"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <BilingualInput label="Name" valueEn={formData.name_en} valueTa={formData.name_ta} onChangeEn={(v) => set("name_en", v)} onChangeTa={(v) => set("name_ta", v)} />
            <BilingualInput label="Description" type="textarea" valueEn={formData.description_en} valueTa={formData.description_ta} onChangeEn={(v) => set("description_en", v)} onChangeTa={(v) => set("description_ta", v)} />
            <BilingualInput label="Content" type="textarea" rows={6} valueEn={formData.content_en} valueTa={formData.content_ta} onChangeEn={(v) => set("content_en", v)} onChangeTa={(v) => set("content_ta", v)} />
            <BilingualInput label="Department" valueEn={formData.department_en} valueTa={formData.department_ta} onChangeEn={(v) => set("department_en", v)} onChangeTa={(v) => set("department_ta", v)} />
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="PDF URL">
                <Input value={formData.pdf_url || ""} onChange={(e) => set("pdf_url", e.target.value)} placeholder="https://...file.pdf" />
              </FieldRow>
              <FieldRow label="Sort Order">
                <Input type="number" value={formData.sort_order || 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} />
              </FieldRow>
            </div>
            <SwitchField label="Active" checked={formData.is_active} onChange={(v) => set("is_active", v)} />
            <Button onClick={handleSave} className="w-full">
              {editingItem ? "Update Right" : "Create Right"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} label="Right" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   TAB 6: Guides
   ────────────────────────────────────────────────────────── */

function GuidesTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-awareness-guides"],
    queryFn: () => base44.entities.AwarenessGuide.list("-created_date", 500),
  });

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const q = search.toLowerCase();
        return (
          !q ||
          (i.title_en || "").toLowerCase().includes(q) ||
          (i.title_ta || "").toLowerCase().includes(q) ||
          (i.problem_type_en || "").toLowerCase().includes(q)
        );
      }),
    [items, search]
  );

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ is_active: true, is_featured: false, sort_order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem?.id) {
        await base44.entities.AwarenessGuide.update(editingItem.id, formData);
      } else {
        await base44.entities.AwarenessGuide.create(formData);
      }
      qc.invalidateQueries({ queryKey: ["admin-awareness-guides"] });
      setDialogOpen(false);
      toast({ title: editingItem ? "Guide updated" : "Guide created" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.AwarenessGuide.delete(deleteTarget.id);
      qc.invalidateQueries({ queryKey: ["admin-awareness-guides"] });
      setDeleteTarget(null);
      toast({ title: "Guide deleted" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (item) => {
    await base44.entities.AwarenessGuide.update(item.id, { is_active: !item.is_active });
    qc.invalidateQueries({ queryKey: ["admin-awareness-guides"] });
  };

  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <TabHeader icon={BookOpen} title="Guides" count={items.length} onAdd={openCreate} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search guides..." />

      <div className="mt-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={BookOpen} label="guides" />
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {item.icon && <span className="text-xl mt-0.5">{item.icon}</span>}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.title_en}</p>
                        {item.is_featured && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Star className="w-3 h-3" /> Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.title_ta}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {item.problem_type_en && (
                          <span className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 px-2 py-0.5 rounded-full">
                            {item.problem_type_en}
                          </span>
                        )}
                        {item.department_en && (
                          <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full">
                            {item.department_en}
                          </span>
                        )}
                      </div>
                      {item.portal_url && (
                        <a href={item.portal_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                          <ExternalLink className="w-3 h-3" /> Portal
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">#{item.sort_order || 0}</span>
                    <StatusBadge active={item.is_active} />
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleActive(item)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Toggle active">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Guide" : "New Guide"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <BilingualInput label="Title" valueEn={formData.title_en} valueTa={formData.title_ta} onChangeEn={(v) => set("title_en", v)} onChangeTa={(v) => set("title_ta", v)} />
            <BilingualInput label="Problem Type" valueEn={formData.problem_type_en} valueTa={formData.problem_type_ta} onChangeEn={(v) => set("problem_type_en", v)} onChangeTa={(v) => set("problem_type_ta", v)} />
            <BilingualInput label="Department" valueEn={formData.department_en} valueTa={formData.department_ta} onChangeEn={(v) => set("department_en", v)} onChangeTa={(v) => set("department_ta", v)} />
            <FieldRow label="Portal URL">
              <Input value={formData.portal_url || ""} onChange={(e) => set("portal_url", e.target.value)} placeholder="https://..." />
            </FieldRow>
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="Icon (emoji)">
                <Input value={formData.icon || ""} onChange={(e) => set("icon", e.target.value)} placeholder="📘" />
              </FieldRow>
              <FieldRow label="Sort Order">
                <Input type="number" value={formData.sort_order || 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} />
              </FieldRow>
            </div>
            <SwitchField label="Featured" checked={formData.is_featured} onChange={(v) => set("is_featured", v)} />
            <SwitchField label="Active" checked={formData.is_active} onChange={(v) => set("is_active", v)} />
            <Button onClick={handleSave} className="w-full">
              {editingItem ? "Update Guide" : "Create Guide"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} label="Guide" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   TAB 7: FAQs
   ────────────────────────────────────────────────────────── */

function FaqsTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-awareness-faqs"],
    queryFn: () => base44.entities.AwarenessFaq.list("-created_date", 500),
  });

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const q = search.toLowerCase();
        return (
          !q ||
          (i.question_en || "").toLowerCase().includes(q) ||
          (i.question_ta || "").toLowerCase().includes(q) ||
          (i.category_en || "").toLowerCase().includes(q)
        );
      }),
    [items, search]
  );

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ is_active: true, sort_order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem?.id) {
        await base44.entities.AwarenessFaq.update(editingItem.id, formData);
      } else {
        await base44.entities.AwarenessFaq.create(formData);
      }
      qc.invalidateQueries({ queryKey: ["admin-awareness-faqs"] });
      setDialogOpen(false);
      toast({ title: editingItem ? "FAQ updated" : "FAQ created" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.AwarenessFaq.delete(deleteTarget.id);
      qc.invalidateQueries({ queryKey: ["admin-awareness-faqs"] });
      setDeleteTarget(null);
      toast({ title: "FAQ deleted" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (item) => {
    await base44.entities.AwarenessFaq.update(item.id, { is_active: !item.is_active });
    qc.invalidateQueries({ queryKey: ["admin-awareness-faqs"] });
  };

  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <TabHeader icon={HelpCircle} title="FAQs" count={items.length} onAdd={openCreate} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search FAQs..." />

      <div className="mt-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={HelpCircle} label="FAQs" />
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.question_en}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.question_ta}</p>
                    {item.category_en && (
                      <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {item.category_en}
                      </span>
                    )}
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.answer_en}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">#{item.sort_order || 0}</span>
                    <StatusBadge active={item.is_active} />
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleActive(item)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Toggle active">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit FAQ" : "New FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <BilingualInput label="Question" type="textarea" rows={2} valueEn={formData.question_en} valueTa={formData.question_ta} onChangeEn={(v) => set("question_en", v)} onChangeTa={(v) => set("question_ta", v)} />
            <BilingualInput label="Answer" type="textarea" rows={5} valueEn={formData.answer_en} valueTa={formData.answer_ta} onChangeEn={(v) => set("answer_en", v)} onChangeTa={(v) => set("answer_ta", v)} />
            <BilingualInput label="Category" valueEn={formData.category_en} valueTa={formData.category_ta} onChangeEn={(v) => set("category_en", v)} onChangeTa={(v) => set("category_ta", v)} />
            <FieldRow label="Sort Order">
              <Input type="number" value={formData.sort_order || 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} className="w-32" />
            </FieldRow>
            <SwitchField label="Active" checked={formData.is_active} onChange={(v) => set("is_active", v)} />
            <Button onClick={handleSave} className="w-full">
              {editingItem ? "Update FAQ" : "Create FAQ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} label="FAQ" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   TAB 8: Emergency Contacts
   ────────────────────────────────────────────────────────── */

function EmergencyTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-awareness-emergency"],
    queryFn: () => base44.entities.AwarenessEmergencyContact.list("-created_date", 500),
  });

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const q = search.toLowerCase();
        return (
          !q ||
          (i.department_en || "").toLowerCase().includes(q) ||
          (i.department_ta || "").toLowerCase().includes(q) ||
          (i.number || "").includes(q)
        );
      }),
    [items, search]
  );

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ is_active: true, is_district_specific: false, sort_order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem?.id) {
        await base44.entities.AwarenessEmergencyContact.update(editingItem.id, formData);
      } else {
        await base44.entities.AwarenessEmergencyContact.create(formData);
      }
      qc.invalidateQueries({ queryKey: ["admin-awareness-emergency"] });
      setDialogOpen(false);
      toast({ title: editingItem ? "Contact updated" : "Contact created" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.AwarenessEmergencyContact.delete(deleteTarget.id);
      qc.invalidateQueries({ queryKey: ["admin-awareness-emergency"] });
      setDeleteTarget(null);
      toast({ title: "Contact deleted" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (item) => {
    await base44.entities.AwarenessEmergencyContact.update(item.id, { is_active: !item.is_active });
    qc.invalidateQueries({ queryKey: ["admin-awareness-emergency"] });
  };

  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <TabHeader icon={Phone} title="Emergency Contacts" count={items.length} onAdd={openCreate} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search contacts or numbers..." />

      <div className="mt-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Phone} label="emergency contacts" />
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.department_en}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.department_ta}</p>
                      <p className="text-sm font-mono font-bold text-red-600 mt-0.5">{item.number}</p>
                      {item.is_district_specific && item.district && (
                        <span className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                          📍 {item.district}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400">#{item.sort_order || 0}</span>
                    <StatusBadge active={item.is_active} />
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleActive(item)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Toggle active">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Emergency Contact" : "New Emergency Contact"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <BilingualInput label="Department" valueEn={formData.department_en} valueTa={formData.department_ta} onChangeEn={(v) => set("department_en", v)} onChangeTa={(v) => set("department_ta", v)} />
            <FieldRow label="Phone Number">
              <Input value={formData.number || ""} onChange={(e) => set("number", e.target.value)} placeholder="100" className="font-mono text-lg" />
            </FieldRow>
            <BilingualInput label="Description" type="textarea" valueEn={formData.description_en} valueTa={formData.description_ta} onChangeEn={(v) => set("description_en", v)} onChangeTa={(v) => set("description_ta", v)} />
            <SwitchField label="District Specific" checked={formData.is_district_specific} onChange={(v) => set("is_district_specific", v)} />
            {formData.is_district_specific && (
              <FieldRow label="District">
                <Input value={formData.district || ""} onChange={(e) => set("district", e.target.value)} placeholder="Chennai" />
              </FieldRow>
            )}
            <FieldRow label="Sort Order">
              <Input type="number" value={formData.sort_order || 0} onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)} className="w-32" />
            </FieldRow>
            <SwitchField label="Active" checked={formData.is_active} onChange={(v) => set("is_active", v)} />
            <Button onClick={handleSave} className="w-full">
              {editingItem ? "Update Contact" : "Create Contact"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} label="Emergency Contact" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   TAB 9: Articles
   ────────────────────────────────────────────────────────── */

function ArticlesTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-awareness-articles"],
    queryFn: () => base44.entities.AwarenessArticle.list("-created_date", 500),
  });

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const q = search.toLowerCase();
        return (
          !q ||
          (i.title_en || "").toLowerCase().includes(q) ||
          (i.title_ta || "").toLowerCase().includes(q) ||
          (i.category_en || "").toLowerCase().includes(q)
        );
      }),
    [items, search]
  );

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ is_active: true, status: "draft" });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem?.id) {
        await base44.entities.AwarenessArticle.update(editingItem.id, formData);
      } else {
        await base44.entities.AwarenessArticle.create(formData);
      }
      qc.invalidateQueries({ queryKey: ["admin-awareness-articles"] });
      setDialogOpen(false);
      toast({ title: editingItem ? "Article updated" : "Article created" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.AwarenessArticle.delete(deleteTarget.id);
      qc.invalidateQueries({ queryKey: ["admin-awareness-articles"] });
      setDeleteTarget(null);
      toast({ title: "Article deleted" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (item) => {
    await base44.entities.AwarenessArticle.update(item.id, { is_active: !item.is_active });
    qc.invalidateQueries({ queryKey: ["admin-awareness-articles"] });
  };

  const set = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <TabHeader icon={Newspaper} title="Articles" count={items.length} onAdd={openCreate} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search articles..." />

      <div className="mt-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Newspaper} label="articles" />
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <StatusBadge status={item.status || "draft"} />
                      <StatusBadge active={item.is_active} />
                      {item.category_en && (
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">
                          {item.category_en}
                        </span>
                      )}
                      {item.created_date && (
                        <span className="text-xs text-slate-400">{format(new Date(item.created_date), "dd MMM yyyy")}</span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.title_en}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.title_ta}</p>
                    {item.slug && <p className="text-xs text-slate-400 font-mono mt-0.5">/{item.slug}</p>}
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.summary_en}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleActive(item)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Toggle active">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(item)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Article" : "New Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <BilingualInput label="Title" valueEn={formData.title_en} valueTa={formData.title_ta} onChangeEn={(v) => set("title_en", v)} onChangeTa={(v) => set("title_ta", v)} />
            <FieldRow label="Slug">
              <Input value={formData.slug || ""} onChange={(e) => set("slug", e.target.value)} placeholder="article-slug" />
            </FieldRow>
            <BilingualInput label="Category" valueEn={formData.category_en} valueTa={formData.category_ta} onChangeEn={(v) => set("category_en", v)} onChangeTa={(v) => set("category_ta", v)} />
            <BilingualInput label="Summary" type="textarea" rows={2} valueEn={formData.summary_en} valueTa={formData.summary_ta} onChangeEn={(v) => set("summary_en", v)} onChangeTa={(v) => set("summary_ta", v)} />
            <BilingualInput label="Content" type="textarea" rows={8} valueEn={formData.content_en} valueTa={formData.content_ta} onChangeEn={(v) => set("content_en", v)} onChangeTa={(v) => set("content_ta", v)} />
            <div className="grid grid-cols-2 gap-3">
              <FieldRow label="SEO Title">
                <Input value={formData.seo_title || ""} onChange={(e) => set("seo_title", e.target.value)} placeholder="SEO title" />
              </FieldRow>
              <FieldRow label="Status">
                <select
                  value={formData.status || "draft"}
                  onChange={(e) => set("status", e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </FieldRow>
            </div>
            <FieldRow label="SEO Description">
              <Textarea value={formData.seo_description || ""} onChange={(e) => set("seo_description", e.target.value)} rows={2} placeholder="Meta description for search engines" />
            </FieldRow>
            <SwitchField label="Active" checked={formData.is_active} onChange={(v) => set("is_active", v)} />
            <Button onClick={handleSave} className="w-full">
              {editingItem ? "Update Article" : "Create Article"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} label="Article" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   TAB 10: Analytics (Read-only)
   ────────────────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600",
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ["admin-awareness-analytics"],
    queryFn: () => base44.entities.AwarenessAnalytics.list("-created_date", 500),
  });

  // Aggregate analytics by type
  const byType = useMemo(() => {
    const map = {};
    analytics.forEach((a) => {
      const type = a.event_type || a.type || "unknown";
      if (!map[type]) map[type] = [];
      map[type].push(a);
    });
    return map;
  }, [analytics]);

  const topItems = (type, nameField = "item_name", countField = "view_count", limit = 10) => {
    const items = byType[type] || [];
    // Aggregate by name
    const agg = {};
    items.forEach((i) => {
      const name = i[nameField] || i.title || i.name || "Unknown";
      const count = i[countField] || i.count || 1;
      agg[name] = (agg[name] || 0) + count;
    });
    return Object.entries(agg)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  };

  // If analytics data has flat structure, show basic stats
  const totalEvents = analytics.length;
  const uniqueTypes = Object.keys(byType).length;

  // Top lists — try common field patterns
  const schemeViews = topItems("scheme_view", "item_name", "view_count");
  const searchTopics = topItems("search", "search_query", "count");
  const guideVisits = topItems("guide_visit", "item_name", "view_count");
  const portalClicks = topItems("portal_click", "item_name", "click_count");
  const faqViews = topItems("faq_view", "item_name", "view_count");

  function TopList({ title, icon: Icon, items, emptyLabel }) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-blue-600" /> {title}
        </h3>
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">{emptyLabel || "No data yet"}</p>
        ) : (
          <div className="space-y-2">
            {items.map(([name, count], idx) => (
              <div key={idx} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{name}</span>
                </div>
                <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <TabHeader icon={BarChart3} title="Analytics" count={totalEvents} />

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard icon={BarChart3} label="Total Events" value={totalEvents} color="blue" />
            <StatCard icon={Tag} label="Event Types" value={uniqueTypes} color="green" />
            <StatCard icon={Award} label="Scheme Views" value={schemeViews.reduce((s, [, c]) => s + c, 0)} color="amber" />
            <StatCard icon={Globe} label="Portal Clicks" value={portalClicks.reduce((s, [, c]) => s + c, 0)} color="purple" />
          </div>

          {/* Top lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TopList title="Most Viewed Schemes" icon={Award} items={schemeViews} emptyLabel="No scheme view data" />
            <TopList title="Most Searched Topics" icon={Search} items={searchTopics} emptyLabel="No search data" />
            <TopList title="Most Visited Guides" icon={BookOpen} items={guideVisits} emptyLabel="No guide visit data" />
            <TopList title="Most Clicked Portals" icon={Globe} items={portalClicks} emptyLabel="No portal click data" />
            <TopList title="Top FAQ Views" icon={HelpCircle} items={faqViews} emptyLabel="No FAQ view data" />
          </div>
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────────────────── */

const TAB_ITEMS = [
  { value: "categories", label: "Categories", icon: Tag },
  { value: "resources", label: "Resources", icon: Layers },
  { value: "schemes", label: "Schemes", icon: Award },
  { value: "portals", label: "Portals", icon: Globe },
  { value: "rights", label: "Rights", icon: Shield },
  { value: "guides", label: "Guides", icon: BookOpen },
  { value: "faqs", label: "FAQs", icon: HelpCircle },
  { value: "emergency", label: "Emergency", icon: Phone },
  { value: "articles", label: "Articles", icon: Newspaper },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminAwareness() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" /> Citizen Awareness CMS
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage awareness content — schemes, portals, guides, FAQs, emergency contacts, and more.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl mb-6">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700"
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="categories"><CategoriesTab /></TabsContent>
        <TabsContent value="resources"><ResourcesTab /></TabsContent>
        <TabsContent value="schemes"><SchemesTab /></TabsContent>
        <TabsContent value="portals"><PortalsTab /></TabsContent>
        <TabsContent value="rights"><RightsTab /></TabsContent>
        <TabsContent value="guides"><GuidesTab /></TabsContent>
        <TabsContent value="faqs"><FaqsTab /></TabsContent>
        <TabsContent value="emergency"><EmergencyTab /></TabsContent>
        <TabsContent value="articles"><ArticlesTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
