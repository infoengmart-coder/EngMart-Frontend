"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus, Search, Edit, Trash2, Eye,
  Upload, Download, Layers, Tag, Check, AlertCircle, ImagePlus, X,
  Image as ImageIcon
} from "lucide-react";

/* ── Image Upload Box ── */
function ImageUploadBox({
  preview,
  onImageChange,
  compact = false
}: {
  preview?: string;
  onImageChange: (dataUrl: string) => void;
  compact?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) onImageChange(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      className={`relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/3 group ${compact ? "h-24" : "h-44"}`}
    >
      {preview ? (
        <>
          <img src={preview} alt="Product" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
            <ImagePlus className="w-5 h-5 text-white" />
            <span className="text-white text-[11px] font-semibold">Change Image</span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ImagePlus className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Upload Image</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WEBP · Max 5MB</p>
          </div>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

import { getProducts, getBrands, getCategories, createProduct, updateProduct, deleteProduct, uploadProductImage, mediaUrl, Product, Brand, CategoryChild } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<CategoryChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"catalog" | "inventory" | "taxonomies">("catalog");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pendingDeleteSlug, setPendingDeleteSlug] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [formName, setFormName] = useState("");
  const [formSeries, setFormSeries] = useState("");
  const [formBrandId, setFormBrandId] = useState<number | "">("");
  const [formCategoryId, setFormCategoryId] = useState<number | "">("");
  const [formShortDesc, setFormShortDesc] = useState("");
  const [formFullDesc, setFormFullDesc] = useState("");
  const [formCatNo, setFormCatNo] = useState("");
  const [formPrice, setFormPrice] = useState<number | "">("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formImagePreview, setFormImagePreview] = useState<string | undefined>(undefined);
  // Main product image chosen in the form; uploaded after the JSON body saves.
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, brandList, catList] = await Promise.all([
        getProducts({ show_all: 'true' } as any),
        getBrands(),
        getCategories(),
      ]);
      setProducts(prodRes.results || []);
      setBrands(brandList || []);
      setCategories(catList || []);
      if (brandList && brandList.length > 0 && formBrandId === "") {
        setFormBrandId(brandList[0].id);
      }
      if (catList && catList.length > 0 && formCategoryId === "") {
        setFormCategoryId(catList[0].id);
      }
    } catch (err) {
      console.error("Failed to load products data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName("");
    setFormSeries("");
    if (brands.length > 0) setFormBrandId(brands[0].id);
    if (categories.length > 0) setFormCategoryId(categories[0].id);
    setFormShortDesc("");
    setFormFullDesc("");
    setFormCatNo("");
    setFormPrice("");
    setFormIsActive(true);
    setFormIsFeatured(false);
    setFormImagePreview(undefined);
    setShowAddForm(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSeries(p.series || "");
    setFormBrandId(p.brand?.id || (brands.length > 0 ? brands[0].id : ""));
    setFormCategoryId(p.category?.id || (categories.length > 0 ? categories[0].id : ""));
    setFormShortDesc(p.short_description || "");
    setFormCatNo(p.first_variant?.cat_no || "");
    setFormPrice(p.first_variant?.price ? Number(p.first_variant.price) : "");
    setFormIsActive(true);
    setFormIsFeatured(p.is_featured);
    setFormImagePreview(p.image || undefined);
    setImageFile(null);
    setImagePreview(p.image ? mediaUrl(p.image) : "");
    if (imageInputRef.current) imageInputRef.current.value = "";
    setShowAddForm(true);
  };

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Revoke the previous preview URL — each createObjectURL leaks until
      // revoked, and an admin uploading many images bleeds memory fast.
      setImagePreview(prev => {
        if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBrandId || !formCategoryId) {
      setActionError("Please select a brand and a category.");
      return;
    }
    setActionError("");
    setSubmitting(true);
    try {
      const payload: any = {
        name: formName,
        series: formSeries,
        brand_id: Number(formBrandId),
        category_id: Number(formCategoryId),
        short_description: formShortDesc,
        full_description: formFullDesc,
        is_active: formIsActive,
        is_featured: formIsFeatured,
      };

      if (formCatNo) {
        const variantPayload: any = {
          cat_no: formCatNo,
          description: formName,
          price: formPrice !== "" ? Number(formPrice) : null,
          price_on_request: formPrice === "" || Number(formPrice) === 0,
        };
        // Carry the existing variant id when editing so the backend updates
        // this row instead of appending a duplicate on every save.
        if (editingProduct?.first_variant?.id) {
          variantPayload.id = editingProduct.first_variant.id;
        }
        payload.variants = [variantPayload];
      }

      const saved = editingProduct
        ? await updateProduct(editingProduct.slug, payload)
        : await createProduct(payload);

      // Images travel on their own endpoint (multipart) after the JSON body is
      // saved — sending both together would drop the nested variant edits.
      if (imageFile && saved?.slug) {
        await uploadProductImage(saved.slug, imageFile);
      }

      setShowAddForm(false);
      setImageFile(null);
      setImagePreview("");
      await loadData();
    } catch (err: any) {
      setActionError(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (slug: string) => setPendingDeleteSlug(slug);

  const confirmDelete = async () => {
    if (!pendingDeleteSlug) return;
    setDeleteBusy(true);
    try {
      await deleteProduct(pendingDeleteSlug);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete product");
    } finally {
      setDeleteBusy(false);
      setPendingDeleteSlug(null);
    }
  };

  /** Client-side CSV of the currently filtered catalog. */
  const handleExportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Name", "Series", "Brand", "Category", "Cat No", "Price", "Price Range Min", "Price Range Max", "Active", "Slug"],
      ...filteredProducts.map(p => [
        p.name, p.series || "", p.brand_name, p.category_name,
        p.first_variant?.cat_no || "", p.first_variant?.price || "",
        p.price_range?.min ?? "", p.price_range?.max ?? "",
        (p as any).is_active === false ? "no" : "yes", p.slug,
      ]),
    ];
    const csv = rows.map(r => r.map(esc).join(",")).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `engmart-catalog-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.brand_name.toLowerCase().includes(search.toLowerCase()) ||
                          p.series.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = brandFilter === "All" || p.brand_name === brandFilter;
    const matchesCategory = categoryFilter === "All" || p.category_name === categoryFilter;
    return matchesSearch && matchesBrand && matchesCategory;
  });


  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Catalog & Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage products, images, specs, categories, and brands.</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {/* Import CSV removed — no backend endpoint exists; a dead button
              only teaches the admin that buttons here can't be trusted. */}
          <button onClick={handleExportCsv} disabled={filteredProducts.length === 0} className="btn-secondary text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
            <Download className="w-3.5 h-3.5" /> Export Catalog
          </button>
          <button onClick={handleOpenAdd} className="btn-primary text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>
      </div>

      {/* Action errors surface here instead of native alert() */}
      {actionError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{actionError}</span>
          <button onClick={() => setActionError("")} className="p-1 rounded hover:bg-destructive/10" aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["catalog", "inventory", "taxonomies"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all capitalize ${
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "catalog" ? "Catalog View" : tab === "inventory" ? "Stock & Inventory" : "Categories & Brands"}
          </button>
        ))}
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSave} className="store-card p-6 bg-secondary/5 border-primary/20 space-y-5">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h2 className="text-base font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
            <button type="button" onClick={() => setShowAddForm(false)} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Image upload — left column */}
            <div className="lg:col-span-1">
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Product Image</label>
              <div
                onClick={() => imageInputRef.current?.click()}
                className="relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer h-40 group hover:border-primary/60 transition-colors bg-secondary/20"
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-4">
                    <ImageIcon className="w-7 h-7 text-muted-foreground/50" />
                    <p className="text-xs font-semibold text-foreground">Click to upload</p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP</p>
                  </div>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePickImage}
                />
              </div>
              {imageFile && (
                <p className="mt-1.5 text-[10px] text-emerald-600 font-semibold truncate">
                  New image: {imageFile.name}
                </p>
              )}
              {imagePreview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                    setImagePreview("");
                    if (imageInputRef.current) imageInputRef.current.value = "";
                  }}
                  className="mt-2 text-[10px] text-destructive hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear selection
                </button>
              )}
            </div>

            {/* Fields — right 3 columns */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Product Name</label>
                <input type="text" required value={formName} onChange={e => setFormName(e.target.value)}
                  className="input-base text-xs" placeholder="e.g. CHINT NXB-63 MCB 1P 16A" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Catalog No (SKU)</label>
                <input type="text" required value={formCatNo} onChange={e => setFormCatNo(e.target.value)}
                  className="input-base text-xs" placeholder="e.g. NXB-63-1P-16A" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Brand</label>
                <select value={formBrandId} onChange={e => setFormBrandId(Number(e.target.value))} className="input-base text-xs">
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Category</label>
                <select value={formCategoryId} onChange={e => setFormCategoryId(Number(e.target.value))} className="input-base text-xs">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Price (PKR)</label>
                <input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value ? Number(e.target.value) : "")} className="input-base text-xs" placeholder="Leave empty for POR" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Short Description</label>
                <input type="text" value={formShortDesc} onChange={e => setFormShortDesc(e.target.value)} className="input-base text-xs" placeholder="One-line card description" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Model / Series</label>
                <input type="text" value={formSeries} onChange={e => setFormSeries(e.target.value)} className="input-base text-xs" placeholder="e.g. NXB-63" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Status</label>
                <select value={formIsActive ? "Active" : "Draft"} onChange={e => setFormIsActive(e.target.value === "Active")} className="input-base text-xs">
                  <option value="Active">Active (Visible)</option>
                  <option value="Draft">Draft (Hidden)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary text-xs">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary text-xs flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {submitting ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      )}

      {/* ── CATALOG VIEW ── */}
      {activeTab === "catalog" && (
        <div className="store-card">
          {/* Controls */}
          <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products by name, series, or brand..."
                className="input-base pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}
                className="bg-background border border-border text-foreground text-xs rounded-md focus:ring-primary p-2 outline-none cursor-pointer">
                <option value="All">All Brands</option>
                {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="bg-background border border-border text-foreground text-xs rounded-md focus:ring-primary p-2 outline-none cursor-pointer">
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Brand</th>
                  <th className="px-4 py-3 text-left font-semibold">Price Range / Variant</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`sk-${i}`}>
                      <td className="px-4 py-3" colSpan={6}>
                        <div className="flex items-center gap-3">
                          <div className="skeleton w-12 h-12 rounded-lg shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <div className="skeleton h-3 w-48 max-w-full" />
                            <div className="skeleton h-2.5 w-28 max-w-full" />
                          </div>
                          <div className="skeleton h-5 w-16 rounded-full hidden sm:block" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center">
                      <ImagePlus className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-foreground">
                        {products.length === 0 ? "No products in the catalog yet" : "No products match your filters"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        {products.length === 0 ? "Add your first product to get started." : "Try a different search or clear the brand/category filters."}
                      </p>
                      {products.length === 0 && (
                        <button onClick={handleOpenAdd} className="btn-primary text-xs">
                          <Plus className="w-3.5 h-3.5" /> Add Product
                        </button>
                      )}
                    </td>
                  </tr>
                )}
                {!loading && filteredProducts.map(p => {
                  const priceStr = p.price_range 
                    ? `PKR ${p.price_range.min.toLocaleString()} - ${p.price_range.max.toLocaleString()}`
                    : p.first_variant?.price 
                    ? `PKR ${Number(p.first_variant.price).toLocaleString()}`
                    : "Price on Request";
                  return (
                    <tr key={p.id} className="hover:bg-secondary/20 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary border border-border flex-shrink-0 relative">
                            {p.image ? (
                              <img src={mediaUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImagePlus className="w-4 h-4 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-xs leading-tight">{p.name}</div>
                            <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{p.first_variant?.cat_no || p.series || `#${p.id}`}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.category_name}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-foreground">{p.brand_name}</td>
                      <td className="px-4 py-3 font-bold text-foreground text-xs">{priceStr}</td>
                      <td className="px-4 py-3">
                        {(p as any).is_active === false ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-secondary text-muted-foreground border-border">
                            Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDetailProduct(p)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                            title="See Details"
                          >
                            <Eye className="w-3 h-3" /> Details
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.slug)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 px-2.5 py-1.5 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── INVENTORY VIEW ── */}
      {activeTab === "inventory" && (
        <div className="store-card">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground">Active Catalog & Variants</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Live product ratings and catalog numbers from database.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-left font-semibold">Primary Variant</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map(p => (
                  <tr key={`${p.id}-inv`} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary border border-border flex-shrink-0">
                          {p.image ? (
                            <img src={mediaUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImagePlus className="w-3.5 h-3.5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground">{p.name}</div>
                          <div className="text-[10px] text-muted-foreground">{p.brand_name} · {p.category_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {p.first_variant?.cat_no || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-foreground">
                      {p.first_variant?.price ? `PKR ${Number(p.first_variant.price).toLocaleString()}` : "On Request"}
                    </td>
                    <td className="px-4 py-3">
                      {(p as any).is_active === false ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-full">
                          Draft
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleOpenEdit(p)} className="text-xs font-semibold text-primary hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAXONOMIES VIEW ── */}
      {activeTab === "taxonomies" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="store-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Database Categories ({categories.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {categories.map(c => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs bg-primary/10 text-primary border border-primary/20">
                      {c.name.slice(0, 2)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground block">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground">{c.product_count || 0} active products</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="store-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" /> Database Brands ({brands.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {brands.map(b => (
                <div key={b.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-xs text-white shadow-sm" style={{ backgroundColor: b.color || '#2563EB' }}>
                      {b.name.slice(0, 2)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground block">{b.name}</span>
                      <span className="text-[10px] text-muted-foreground">{b.product_count || 0} products · {b.origin_country || 'Official'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCT DETAILS POPUP MODAL ── */}
      {detailProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailProduct(null)}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-lg font-bold text-foreground">Product Details</h2>
              <button onClick={() => setDetailProduct(null)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Image + Basic Info */}
              <div className="flex gap-5">
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-secondary border border-border flex-shrink-0">
                  {detailProduct.image ? (
                    <img src={mediaUrl(detailProduct.image)} alt={detailProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImagePlus className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-foreground leading-snug">{detailProduct.name}</h3>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{detailProduct.brand_name}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">{detailProduct.category_name}</span>
                  </div>
                  {detailProduct.series && (
                    <p className="text-xs text-muted-foreground mt-1.5">Series: <span className="font-semibold text-foreground">{detailProduct.series}</span></p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Slug: <span className="font-mono text-foreground">{detailProduct.slug}</span></p>
                </div>
              </div>

              {/* Description */}
              {detailProduct.short_description && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-sm text-foreground leading-relaxed">{detailProduct.short_description}</p>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-secondary/30 rounded-xl p-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Pricing & Variants</h4>
                {detailProduct.price_range ? (
                  <p className="text-lg font-bold text-foreground">
                    PKR {detailProduct.price_range.min.toLocaleString()} — {detailProduct.price_range.max.toLocaleString()}
                  </p>
                ) : detailProduct.first_variant?.price ? (
                  <p className="text-lg font-bold text-foreground">PKR {Number(detailProduct.first_variant.price).toLocaleString()}</p>
                ) : (
                  <p className="text-sm font-semibold text-amber-600">Price on Request</p>
                )}
                {detailProduct.first_variant && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Cat No:</span> <span className="font-semibold text-foreground">{detailProduct.first_variant.cat_no}</span></div>
                    <div><span className="text-muted-foreground">Variant Count:</span> <span className="font-semibold text-foreground">{detailProduct.variant_count || 1}</span></div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Status:</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                {detailProduct.is_featured && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">⭐ Featured</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => { setDetailProduct(null); handleOpenEdit(detailProduct); }}
                  className="btn-primary text-xs flex items-center gap-1.5 flex-1 justify-center"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Product
                </button>
                <button
                  onClick={() => setDetailProduct(null)}
                  className="btn-secondary text-xs flex-1 justify-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteSlug !== null}
        title="Delete this product?"
        message="The product and its variants will be removed from the catalog. This cannot be undone."
        confirmLabel="Delete"
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setPendingDeleteSlug(null)}
      />
    </div>
  );
}
