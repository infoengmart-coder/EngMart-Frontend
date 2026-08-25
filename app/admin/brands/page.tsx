"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit, X, Award, Search, ImagePlus, Eye, EyeOff, Globe } from "lucide-react";
import { brandLogo } from "@/lib/brand-logos";
import {
  getAdminBrands, createBrand, updateBrand, deleteBrand,
  mediaUrl, type AdminBrand,
} from "@/lib/api";

export default function AdminBrandsPage() {
  const [items, setItems] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminBrand | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [website, setWebsite] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [order, setOrder] = useState("0");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  /** Built-in wordmark for the brand being edited, if one exists. */
  const [bundledLogo, setBundledLogo] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAdminBrands()
      .then(setItems)
      .catch((e) => setError(e.message || "Failed to load brands"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setName(""); setOrigin(""); setSupplier(""); setSupplierContact(""); setWebsite("");
    setColor("#3B82F6"); setOrder("0"); setDescription(""); setActive(true);
    setLogoFile(null); setLogoPreview(""); setBundledLogo(null);
    setEditing(null); setShowForm(false); setError("");
  };

  const openCreate = () => { resetForm(); setShowForm(true); };
  const openEdit = (b: AdminBrand) => {
    setEditing(b);
    setName(b.name); setOrigin(b.origin_country || ""); setSupplier(b.supplier_name || "");
    setSupplierContact(b.supplier_contact || ""); setWebsite(b.website || "");
    setColor(b.color || "#3B82F6"); setOrder(String(b.order ?? 0));
    setDescription(b.description || ""); setActive(b.is_active);
    setLogoFile(null); setLogoPreview(b.logo ? mediaUrl(b.logo) : "");
    setBundledLogo(brandLogo(b.name, b.slug));
    setError(""); setShowForm(true);
  };

  const onPickLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); }
  };

  const buildPayload = (): FormData | Record<string, unknown> => {
    if (logoFile) {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("origin_country", origin);
      fd.append("supplier_name", supplier);
      fd.append("supplier_contact", supplierContact);
      fd.append("website", website);
      fd.append("color", color);
      fd.append("order", order || "0");
      fd.append("description", description);
      fd.append("is_active", String(active));
      fd.append("logo", logoFile);
      return fd;
    }
    return {
      name, origin_country: origin, supplier_name: supplier, supplier_contact: supplierContact,
      website, color, order: Number(order) || 0, description, is_active: active,
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (editing) await updateBrand(editing.slug, buildPayload());
      else await createBrand(buildPayload());
      resetForm(); load();
    } catch (err: any) {
      setError(err.message || "Failed to save brand");
    } finally { setSaving(false); }
  };

  const handleDelete = async (b: AdminBrand) => {
    if (!confirm(`Delete brand "${b.name}"? This cannot be undone.`)) return;
    try { await deleteBrand(b.slug); load(); }
    catch (err: any) { alert(err.message || "Failed to delete brand"); }
  };

  const toggleActive = async (b: AdminBrand) => {
    try { await updateBrand(b.slug, { is_active: !b.is_active }); load(); }
    catch (err: any) { alert(err.message || "Failed to update brand"); }
  };

  const filtered = items.filter((b) =>
    !search || b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.supplier_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Brands
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} brands · manufacturers & suppliers</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition cursor-pointer">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brands..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Brand</th>
                <th className="text-left font-semibold px-4 py-3">Origin</th>
                <th className="text-left font-semibold px-4 py-3">Supplier</th>
                <th className="text-left font-semibold px-4 py-3">Products</th>
                <th className="text-left font-semibold px-4 py-3">Status</th>
                <th className="text-right font-semibold px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No brands found.</td></tr>
              ) : filtered.map((b) => {
                // Same precedence the storefront uses: an admin-uploaded logo
                // wins, then the wordmark bundled in public/Logo, then a
                // monogram. Without the middle step every row here showed a
                // two-letter monogram, because no brand has an upload yet.
                const rowLogo = (b.logo ? mediaUrl(b.logo) : null) || brandLogo(b.name, b.slug);
                return (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 bg-white"
                        style={{ borderColor: (b.color || "#e2e8f0") + "55" }}>
                        {rowLogo ? <img src={rowLogo} alt="" className="w-full h-full object-contain p-1" />
                          : <span className="text-xs font-bold" style={{ color: b.color || "#64748b" }}>{b.name.slice(0, 2).toUpperCase()}</span>}
                      </div>
                      <div className="font-semibold text-slate-800">{b.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{b.origin_country || <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-slate-500">{b.supplier_name || <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-slate-600">{b.product_count}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(b)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${b.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                      {b.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {b.is_active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(b)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="font-bold text-slate-900">{editing ? "Edit Brand" : "New Brand"}</h2>
              <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {error && <div className="bg-rose-50 text-rose-600 text-sm px-3 py-2 rounded-lg">{error}</div>}

              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
                  {logoPreview
                    ? <img src={logoPreview} alt="" className="w-full h-full object-contain p-1" />
                    : bundledLogo
                      ? <img src={bundledLogo} alt="" className="w-full h-full object-contain p-1 opacity-80" />
                      : <ImagePlus className="w-5 h-5 text-slate-300" />}
                </div>
                <div>
                  <button type="button" onClick={() => fileRef.current?.click()} className="text-sm font-semibold text-primary hover:underline cursor-pointer">Upload logo</button>
                  <p className="text-xs text-slate-400 mt-0.5">PNG/SVG recommended, transparent background.</p>
                  {!logoPreview && bundledLogo && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Currently using the built-in wordmark. Uploading replaces it everywhere.
                    </p>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={onPickLogo} className="hidden" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Name *</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Origin country</label>
                  <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. Switzerland" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Supplier name</label>
                  <input value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Supplier contact</label>
                  <input value={supplierContact} onChange={(e) => setSupplierContact(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Website</label>
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Accent color</label>
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
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer">{saving ? "Saving…" : editing ? "Save Changes" : "Create Brand"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
