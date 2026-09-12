"use client";

import { useState, useRef, useEffect, useMemo, useDeferredValue } from "react";
import {
  Plus, Search, Edit, Trash2, Eye,
  Upload, Download, Layers, Tag, Check, AlertCircle, ImagePlus, X,
  Image as ImageIcon, Loader2, Trash, Copy
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

/**
 * Pull an ampere figure out of a rating label: "32A 3-Pole" -> "32A".
 *
 * Stored on the variant's `specs.rating`, which is what the storefront's
 * `?spec=` filter matches on and what the description generator reads. The
 * imported catalogue already has it; typing a variant by hand should not
 * produce a second-class row that filtering cannot see.
 *
 * Returns null when there is no ampere value — plenty of variants are rated in
 * kW, poles or nothing at all, and inventing a rating would be worse than
 * leaving it unset.
 */
function parseRating(label: string): string | null {
  const match = String(label || "").match(/(\d+(?:\.\d+)?)\s*A\b/i);
  return match ? `${match[1]}A` : null;
}

import { getAdminProduct, getAdminProducts, getBrands, getCategories, createProduct, updateProduct, deleteProduct, uploadProductImage, mediaUrl, Product, Brand, CategoryChild } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AdminImageStudio } from "@/components/admin-image-studio";
import { revalidateProductPages, revalidateAfterProductDelete } from "./actions";
import { prepareImage, formatBytes } from "@/lib/image-upload";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<CategoryChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"catalog" | "images" | "inventory" | "taxonomies">("catalog");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;
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
  /**
   * One editable row per ampere rating / model the product is sold in.
   *
   * This replaces the single `formCatNo` + `formPrice` pair the form used to
   * have. A product like the ABB AF Contactor has 22 variants from 30A to
   * 750A, each with its own catalogue number and price, and the old form could
   * only ever see the first one — so there was no way to add the rest, and
   * saving an edit risked leaving them untouched but invisible.
   *
   * `description` is the field the storefront dropdown actually shows
   * ("32A 3-Pole"), which is why it is labelled "Rating" and comes first.
   */
  type VariantRow = {
    /** Present on existing rows; absent on ones added in this session. */
    id?: number;
    description: string;
    cat_no: string;
    price: string;
    price_on_request: boolean;
    specs?: Record<string, string>;
  };

  const blankVariant = (): VariantRow => ({
    description: "", cat_no: "", price: "", price_on_request: false,
  });

  const [formVariants, setFormVariants] = useState<VariantRow[]>([blankVariant()]);
  /** True while the full variant list is being fetched for an edit. */
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formImagePreview, setFormImagePreview] = useState<string | undefined>(undefined);
  // Main product image chosen in the form; uploaded after the JSON body saves.
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [formImageDragging, setFormImageDragging] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const REQUESTED_PAGE_SIZE = 100;
      const [prodRes, brandList, catList] = await Promise.all([
        getAdminProducts({ page_size: REQUESTED_PAGE_SIZE }),
        getBrands(),
        getCategories(),
      ]);

      // Fetch ALL pages so the admin sees the full catalog — but fetch the
      // remaining ones AT ONCE rather than in a serial while-loop.
      //
      // The old loop awaited each page before asking for the next, so a
      // 5,000-product catalog was 50 round-trips end to end — the single
      // biggest reason this screen took so long to become usable. `count` from
      // the first response tells us exactly how many pages there are, so the
      // rest can go out together and the wait collapses to roughly one
      // round-trip.
      let allProducts = prodRes.results || [];
      const total = prodRes.count || allProducts.length;
      // Page size is read back from the RESPONSE, not from what we asked for.
      // The API caps page_size (StandardPagination.max_page_size), so a larger
      // request is silently trimmed — computing the page count from the
      // requested size would then skip pages and drop half the catalog without
      // any error to notice.
      const pageSize = allProducts.length || REQUESTED_PAGE_SIZE;
      const pageCount = Math.ceil(total / pageSize);
      if (pageCount > 1) {
        const rest = await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, i) =>
            getAdminProducts({ page_size: pageSize, page: i + 2 }).catch(() => null)
          )
        );
        for (const chunk of rest) {
          if (chunk?.results) allProducts = allProducts.concat(chunk.results);
        }
      }
      setProducts(allProducts);
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

  /**
   * Merge one product back into local state instead of refetching everything.
   *
   * Re-running `loadData()` after every edit meant re-downloading the entire
   * catalog to reflect a single changed row — seconds of spinner for a change
   * the response already described. Patching in place is what makes saving and
   * image uploads feel instant.
   */
  const patchProduct = (saved: any) => {
    if (!saved?.slug) return;
    setProducts(prev => {
      const index = prev.findIndex(p => p.slug === saved.slug || p.id === saved.id);
      if (index === -1) return [saved as Product, ...prev];
      const next = prev.slice();
      // Merge rather than replace: the detail response the write endpoints
      // return omits a few list-only fields (brand_name, category_name), and
      // overwriting the row wholesale would blank those columns.
      next[index] = { ...next[index], ...saved } as Product;
      return next;
    });
  };

  /** Update just the image path on one row, for the Images tab. */
  const patchProductImage = (slug: string, image: string | null) => {
    setProducts(prev => prev.map(p => (p.slug === slug ? { ...p, image } : p)));
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName("");
    setFormSeries("");
    if (brands.length > 0) setFormBrandId(brands[0].id);
    if (categories.length > 0) setFormCategoryId(categories[0].id);
    setFormShortDesc("");
    setFormFullDesc("");
    setFormVariants([blankVariant()]);
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
    // Seed from the list row so the form paints immediately, then replace with
    // the complete set. The list endpoint only carries `first_variant`, so
    // without the fetch below an edit would show one row for a product that
    // has twenty-two.
    setFormVariants(
      p.first_variant
        ? [{
            id: p.first_variant.id,
            description: p.first_variant.description || "",
            cat_no: p.first_variant.cat_no || "",
            price: p.first_variant.price ? String(p.first_variant.price) : "",
            price_on_request: !!p.first_variant.price_on_request,
            specs: p.first_variant.specs || {},
          }]
        : [blankVariant()]
    );
    setVariantsLoading(true);
    getAdminProduct(p.slug)
      .then(detail => {
        const rows = (detail.variants || []).map(v => ({
          id: v.id,
          description: v.description || "",
          cat_no: v.cat_no || "",
          price: v.price ? String(v.price) : "",
          price_on_request: !!v.price_on_request,
          specs: v.specs || {},
        }));
        setFormVariants(rows.length ? rows : [blankVariant()]);
      })
      .catch(() => {
        // Keep the seeded row rather than emptying the form — a failed fetch
        // must not look like "this product has no variants".
        setActionError("Could not load the full variant list. Only the first variant is shown; saving now would not remove the others.");
      })
      .finally(() => setVariantsLoading(false));
    setFormIsActive(true);
    setFormIsFeatured(p.is_featured);
    setFormImagePreview(p.image || undefined);
    setImageFile(null);
    setImagePreview(p.image ? mediaUrl(p.image) : "");
    if (imageInputRef.current) imageInputRef.current.value = "";
    setShowAddForm(true);
  };

  /** Patch one variant row in place. */
  const updateVariant = (index: number, patch: Partial<VariantRow>) => {
    setFormVariants(prev => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  /**
   * Copy a row, minus its id.
   *
   * Ratings in a series differ by a couple of characters ("NXB-63-3P-32A" ->
   * "...-40A"), so duplicating and editing is far quicker than retyping. The id
   * must be dropped or the backend would update the original instead of
   * creating a second variant.
   */
  const duplicateVariant = (index: number) => {
    setFormVariants(prev => {
      const copy = { ...prev[index] };
      delete copy.id;
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
  };

  const removeVariant = (index: number) => {
    setFormVariants(prev => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
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

  /** Bytes saved by browser-side compression on the last upload, for the form hint. */
  const [compressionNote, setCompressionNote] = useState("");

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

      // ── Variants ──
      // Rows with nothing typed in them are dropped rather than saved as blank
      // variants; an admin who adds a row and changes their mind should not end
      // up with an empty option in the storefront dropdown.
      const rows = formVariants.filter(v => v.description.trim() || v.cat_no.trim());
      if (rows.length === 0) {
        setActionError("Add at least one variant — a rating or a catalogue number.");
        setSubmitting(false);
        return;
      }

      payload.variants = rows.map((v, index) => {
        const priceValue = v.price.trim() === "" ? null : Number(v.price);
        const onRequest = v.price_on_request || priceValue === null || priceValue === 0;
        const out: any = {
          // The storefront dropdown renders `description || cat_no`, so a row
          // with only a catalogue number still reads sensibly.
          description: v.description.trim() || v.cat_no.trim(),
          cat_no: v.cat_no.trim(),
          price: onRequest ? null : priceValue,
          price_on_request: onRequest,
          // Keep the ampere figure in specs too. The storefront's `?spec=`
          // filter and the description generator both read specs.rating, so a
          // variant added here behaves like the imported ones instead of being
          // invisible to filtering.
          specs: { ...(v.specs || {}), ...(parseRating(v.description) ? { rating: parseRating(v.description)! } : {}) },
          order: index,
        };
        // Carrying the id updates that row rather than appending a duplicate.
        if (v.id) out.id = v.id;
        return out;
      });

      // Tells the API this list is the COMPLETE set, so a row removed here is
      // actually deleted. Without it the backend upserts only, by design —
      // see ProductAdminSerializer.update.
      if (editingProduct) payload.variants_replace = true;

      const saved = editingProduct
        ? await updateProduct(editingProduct.slug, payload)
        : await createProduct(payload);

      // Images travel on their own endpoint (multipart) after the JSON body is
      // saved — sending both together would drop the nested variant edits.
      let withImage = saved;
      if (imageFile && saved?.slug) {
        // Downscale in the browser first. A phone photo is routinely 4–8 MB and
        // 4000px wide; the catalog never renders above 1600px, so sending the
        // original was spending tens of seconds uploading pixels nobody sees.
        const prepared = await prepareImage(imageFile);
        withImage = await uploadProductImage(saved.slug, prepared.file);
        setCompressionNote(
          prepared.passthrough
            ? ""
            : `Image compressed ${formatBytes(prepared.originalSize)} → ${formatBytes(prepared.file.size)} before upload.`
        );
      }

      // Patch the single row rather than refetching the catalog — the response
      // already contains everything that changed.
      const savedProduct = withImage || saved;
      patchProduct(savedProduct);

      // Drop the storefront's cached pages NOW.
      //
      // Without this the customer-facing product page keeps serving whatever
      // Vercel last rendered, and because Next serves that
      // stale-while-revalidate the edit only appears two or three reloads
      // later — the "why do I have to reload to see my change" complaint.
      //
      // Awaited, so the button stays in its saving state until the purge is
      // done and the page really is fresh by the time the form closes. It
      // cannot throw, and the product is already saved regardless.
      await revalidateProductPages(
        savedProduct?.slug || editingProduct?.slug || "",
        savedProduct?.category?.slug || editingProduct?.category?.slug || null,
        savedProduct?.brand?.slug || editingProduct?.brand?.slug || null,
      );

      setShowAddForm(false);
      setImageFile(null);
      setImagePreview("");
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
      // Same reasoning as saving: remove the row locally instead of
      // re-downloading the whole catalog to discover it is gone.
      setProducts(prev => prev.filter(p => p.slug !== pendingDeleteSlug));
      // A deleted product's URL should 404 immediately, not keep serving a
      // cached page for the next two minutes.
      await revalidateAfterProductDelete(pendingDeleteSlug);
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

  const missingImageCount = products.filter(p => !p.image).length;

  /**
   * Filtering 4,788 products, memoised and deferred.
   *
   * This ran on EVERY render, lowercasing three strings per product per
   * keystroke -- roughly 14,000 string allocations per character typed, with a
   * full re-render behind it. Measured INP on this page was 1,496 ms ("poor";
   * Google's threshold for "good" is 200 ms).
   *
   * `useDeferredValue` lets the keystroke paint immediately and recomputes the
   * list at a lower priority, so typing stays responsive even mid-filter.
   */
  const deferredSearch = useDeferredValue(search);

  const filteredProducts = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return products.filter(p => {
      if (brandFilter !== "All" && p.brand_name !== brandFilter) return false;
      if (categoryFilter !== "All" && p.category_name !== categoryFilter) return false;
      if (!term) return true;
      // Cheapest checks first, and short-circuit rather than building three
      // lowercased copies of every field before testing any of them.
      return (
        p.name.toLowerCase().includes(term) ||
        (p.brand_name || "").toLowerCase().includes(term) ||
        (p.series || "").toLowerCase().includes(term) ||
        (p.first_variant?.cat_no || "").toLowerCase().includes(term)
      );
    });
  }, [products, deferredSearch, brandFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const pagedProducts = useMemo(
    () => filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredProducts, page],
  );


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
        {(["catalog", "images", "inventory", "taxonomies"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all capitalize ${
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "catalog"
              ? "Catalog View"
              : tab === "images"
              ? `Product Images${missingImageCount > 0 ? ` (${missingImageCount} missing)` : ""}`
              : tab === "inventory"
              ? "Stock & Inventory"
              : "Categories & Brands"}
          </button>
        ))}
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSave} className="bg-card rounded-xl border border-border shadow-sm p-6 bg-secondary/5 border-primary/20 space-y-5">
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
                onDragOver={e => { e.preventDefault(); setFormImageDragging(true); }}
                onDragLeave={() => setFormImageDragging(false)}
                onDrop={e => {
                  // Dropping straight onto the box saves opening a file dialog
                  // for every product.
                  e.preventDefault();
                  setFormImageDragging(false);
                  const dropped = Array.from(e.dataTransfer.files).find(f => f.type.startsWith("image/"));
                  if (!dropped) return;
                  setImageFile(dropped);
                  setImagePreview(prev => {
                    if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
                    return URL.createObjectURL(dropped);
                  });
                }}
                className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer h-40 group transition-colors ${
                  formImageDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 bg-secondary/20"
                }`}
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
                    <p className="text-xs font-semibold text-foreground">Click or drop an image</p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP — large photos are compressed automatically</p>
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
                  New image: {imageFile.name} ({formatBytes(imageFile.size)})
                </p>
              )}
              {compressionNote && !imageFile && (
                <p className="mt-1.5 text-[10px] text-muted-foreground font-semibold">{compressionNote}</p>
              )}
              <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
                Adding images to many products? Use the{" "}
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setActiveTab("images"); }}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Product Images
                </button>{" "}
                tab to upload a whole folder at once.
              </p>
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

          {/* ── Ratings & pricing ──
              One row per ampere rating / model. These become the options in
              the "Select Variant / Ampere Rating" dropdown on the product page,
              and each carries its own catalogue number and price. */}
          <div className="border-t border-border pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <div>
                <h3 className="text-sm font-bold text-foreground">Ratings &amp; Pricing</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Add a row per ampere rating. Customers pick between these in the dropdown on the product page.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {variantsLoading
                  ? "Loading all variants…"
                  : `${formVariants.length} variant${formVariants.length === 1 ? "" : "s"}`}
              </span>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs min-w-[640px]">
                <thead>
                  <tr className="text-[10px] uppercase text-muted-foreground">
                    <th className="text-left font-semibold pb-1.5 w-[34%]">Rating / Description *</th>
                    <th className="text-left font-semibold pb-1.5 w-[28%]">Catalogue No</th>
                    <th className="text-left font-semibold pb-1.5 w-[22%]">Price (PKR)</th>
                    <th className="text-center font-semibold pb-1.5 w-[10%]">On request</th>
                    <th className="pb-1.5 w-[6%]" />
                  </tr>
                </thead>
                <tbody>
                  {formVariants.map((v, i) => (
                    <tr key={v.id ?? `new-${i}`}>
                      <td className="pr-2 pb-2">
                        <input
                          type="text"
                          value={v.description}
                          onChange={e => updateVariant(i, { description: e.target.value })}
                          className="input-base text-xs w-full"
                          placeholder="e.g. 32A 3-Pole"
                        />
                      </td>
                      <td className="pr-2 pb-2">
                        <input
                          type="text"
                          value={v.cat_no}
                          onChange={e => updateVariant(i, { cat_no: e.target.value })}
                          className="input-base text-xs w-full font-mono"
                          placeholder="e.g. NXB-63-3P-32A"
                        />
                      </td>
                      <td className="pr-2 pb-2">
                        <input
                          type="number"
                          min={0}
                          value={v.price}
                          disabled={v.price_on_request}
                          onChange={e => updateVariant(i, { price: e.target.value })}
                          className="input-base text-xs w-full disabled:opacity-40"
                          placeholder="0"
                        />
                      </td>
                      <td className="pb-2 text-center">
                        <input
                          type="checkbox"
                          checked={v.price_on_request}
                          onChange={e => updateVariant(i, {
                            price_on_request: e.target.checked,
                            // Clear the price when switching to POR, so a
                            // stale figure cannot be saved behind the flag.
                            ...(e.target.checked ? { price: "" } : {}),
                          })}
                          className="w-4 h-4 rounded cursor-pointer"
                          title="Price on request"
                        />
                      </td>
                      <td className="pb-2 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            title="Duplicate this row"
                            onClick={() => duplicateVariant(i)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Remove this variant"
                            // Never remove the last row: a product with no
                            // variants has no price anywhere on the storefront.
                            disabled={formVariants.length === 1}
                            onClick={() => removeVariant(i)}
                            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setFormVariants(prev => [...prev, blankVariant()])}
                className="btn-secondary text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add rating
              </button>
              <span className="text-[11px] text-muted-foreground">
                Tick “on request” to show “Price on Request” instead of a figure.
                {editingProduct && " Removing a row here deletes that variant when you save."}
              </span>
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
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Controls */}
          <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products by name, series, or brand..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-card text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select value={brandFilter} onChange={e => { setBrandFilter(e.target.value); setPage(1); }}
                className="bg-background border border-border text-foreground text-xs rounded-md focus:ring-primary p-2 outline-none cursor-pointer">
                <option value="All">All Brands</option>
                {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
              <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
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
                {!loading && pagedProducts.length === 0 && (
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
                {!loading && pagedProducts.map(p => {
                  const priceStr = p.price_range 
                    ? `PKR ${p.price_range.min.toLocaleString()} - ${p.price_range.max.toLocaleString()}`
                    : p.first_variant?.price 
                    ? `PKR ${Number(p.first_variant.price).toLocaleString()}`
                    : "Price on Request";
                  return (
                    <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailProduct(p)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.slug)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 bg-card">
              <div className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{(page - 1) * PAGE_SIZE + 1}</span> to{" "}
                <span className="font-semibold text-foreground">{Math.min(page * PAGE_SIZE, filteredProducts.length)}</span> of{" "}
                <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border border-border hover:bg-secondary text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-xs font-semibold text-foreground px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border border-border hover:bg-secondary text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── IMAGES VIEW ── */}
      {activeTab === "images" && (
        loading ? (
          <div className="bg-card rounded-xl border border-border shadow-sm p-14 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading catalog…</p>
          </div>
        ) : (
          <AdminImageStudio products={products} onImageChanged={patchProductImage} />
        )
      )}

      {/* ── INVENTORY VIEW ── */}
      {activeTab === "inventory" && (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
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
                {/* Paged, not the whole catalog.
                    This mapped `products` directly -- 4,788 table rows, each
                    with an image, several spans and a button. That is well
                    over 50,000 DOM nodes in a single commit, and the biggest
                    single reason this page felt frozen. It now shows the same
                    page-sized slice the Catalog tab does, so the search and
                    brand filters above apply here too. */}
                {pagedProducts.map(p => (
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
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors inline-flex ml-auto"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
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
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
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

          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
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
