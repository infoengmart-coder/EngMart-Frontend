"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit, X, FolderTree, Search, ImagePlus, Eye, EyeOff } from "lucide-react";
import {
  getAdminCategories, createCategory, updateCategory, deleteCategory,
  mediaUrl, type AdminCategory,
} from "@/lib/api";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [parent, setParent] = useState<string>("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [order, setOrder] = useState("0");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const load = () => {
    setLoading(true);
    getAdminCategories()
      .then(setItems)
      .catch((e) => setError(e.message || "Failed to load categories"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setName(""); setShortName(""); setParent(""); setIcon(""); setColor("#3B82F6");
    setOrder("0"); setDescription(""); setActive(true); setImageFile(null); setImagePreview("");
    setEditing(null); setShowForm(false); setError("");
  };

  const openCreate = () => { resetForm(); setShowForm(true); };
  const openEdit = (c: AdminCategory) => {
    setEditing(c);
    setName(c.name); setShortName(c.short_name || ""); setParent(c.parent ? String(c.parent) : "");
    setIcon(c.icon || ""); setColor(c.color || "#3B82F6"); setOrder(String(c.order ?? 0));
    setDescription(c.description || ""); setActive(c.is_active);
    setImageFile(null); setImagePreview(c.image ? mediaUrl(c.image) : "");
    setError(""); setShowForm(true);
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
  };

  const buildPayload = (): FormData | Record<string, unknown> => {
    if (imageFile) {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("short_name", shortName);
      fd.append("icon", icon);
      fd.append("color", color);
      fd.append("order", order || "0");
      fd.append("description", description);
      fd.append("is_active", String(active));
      if (parent) fd.append("parent", parent);
      fd.append("image", imageFile);
      return fd;
    }
    return {
      name, short_name: shortName, icon, color,
      order: Number(order) || 0, description,
      is_active: active, parent: parent ? Number(parent) : null,
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (editing) await updateCategory(editing.slug, buildPayload());
      else await createCategory(buildPayload());
      resetForm(); load();
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally { setSaving(false); }
  };

  const handleDelete = async (c: AdminCategory) => {
    if (!confirm(`Delete category "${c.name}"? This cannot be undone.`)) return;
    try { await deleteCategory(c.slug); load(); }
    catch (err: any) { alert(err.message || "Failed to delete category"); }
  };

  const toggleActive = async (c: AdminCategory) => {
    try { await updateCategory(c.slug, { is_active: !c.is_active }); load(); }
    catch (err: any) { alert(err.message || "Failed to update category"); }
  };

  const filtered = items.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.short_name || "").toLowerCase().includes(search.toLowerCase())
  );
  const parentOptions = items.filter((c) => !c.parent); // only top-level as parents

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-primary" /> Categories
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} categories · manage the product catalog structure</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition cursor-pointer">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Category</th>
                <th className="text-left font-semibold px-4 py-3">Parent</th>
                <th className="text-left font-semibold px-4 py-3">Products</th>
                <th className="text-left font-semibold px-4 py-3">Order</th>
                <th className="text-left font-semibold px-4 py-3">Status</th>
                <th className="text-right font-semibold px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No categories found.</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 overflow-hidden"
                        style={{ backgroundColor: (c.color || "#3B82F6") + "22" }}>
                        {c.image ? <img src={mediaUrl(c.image)} alt="" className="w-full h-full object-cover" /> : (c.icon || "📦")}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{c.name}</div>
                        {c.short_name && <div className="text-xs text-slate-400">{c.short_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{c.parent_name || <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-slate-600">{c.product_count}</td>
                  <td className="px-4 py-3 text-slate-600">{c.order}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${c.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                      {c.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {c.is_active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="font-bold text-slate-900">{editing ? "Edit Category" : "New Category"}</h2>
              <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {error && <div className="bg-rose-50 text-rose-600 text-sm px-3 py-2 rounded-lg">{error}</div>}

              {/* Image */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
                  {imagePreview ? <img src={imagePreview} alt="" className="w-full h-full object-cover" /> : <ImagePlus className="w-5 h-5 text-slate-300" />}
                </div>
                <div>
                  <button type="button" onClick={() => fileRef.current?.click()} className="text-sm font-semibold text-primary hover:underline cursor-pointer">Upload image</button>
                  <p className="text-xs text-slate-400 mt-0.5">Optional. Shown on category cards.</p>
                  <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} className="hidden" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Name *</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Short name</label>
                  <input value={shortName} onChange={(e) => setShortName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Parent category</label>
                  <select value={parent} onChange={(e) => setParent(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">— None (top level) —</option>
                    {parentOptions.filter((p) => p.id !== editing?.id).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Icon (emoji)</label>
                  <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="⚡" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-9 rounded border border-slate-200 cursor-pointer" />
                    <input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Display order</label>
                  <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 rounded" />
                Active (visible on storefront)
              </label>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer">{saving ? "Saving…" : editing ? "Save Changes" : "Create Category"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
