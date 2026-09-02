"use client";

/**
 * Admin → Products → Images.
 *
 * Adding product photos one at a time through the edit form meant, per product:
 * find the row, open the form, click the box, pick the file, save, wait for the
 * whole catalog to reload. Across a few hundred products that is hours of work,
 * and it is the workflow the client called out as slow and hard to get through.
 *
 * This screen replaces that loop with two much shorter ones:
 *
 *   1. Drop a photo straight onto a product tile — it uploads on the spot.
 *      No form, no save button, no page reload.
 *   2. Or select a whole folder at once. Filenames are matched to catalogue
 *      numbers and product names, the matches are shown for confirmation, and
 *      the batch uploads a few at a time with live progress.
 *
 * Every file is downscaled in the browser first (see lib/image-upload.ts),
 * which is where most of the "it takes forever" actually went — a phone photo
 * is typically 20-40x larger than the catalog ever needs.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ImagePlus, Upload, Check, X, Loader2, Search, AlertCircle,
  CheckCircle2, FolderUp, Trash2, Sparkles,
} from "lucide-react";
import {
  uploadProductImage, deleteProductImage, mediaUrl, type Product,
} from "@/lib/api";
import {
  prepareImage, formatBytes, runPooled, matchKey, fileStem,
} from "@/lib/image-upload";

/** How many uploads are allowed in flight at once. */
const UPLOAD_CONCURRENCY = 4;

type Filter = "missing" | "has" | "all";

type MatchRow = {
  file: File;
  previewUrl: string;
  product: Product | null;
  /** How the filename was matched, shown so the admin can trust the mapping. */
  reason: string;
  status: "pending" | "uploading" | "done" | "error" | "skipped";
  error?: string;
};

export type AdminImageStudioProps = {
  products: Product[];
  /** Called with the product's new image path so the parent can patch its row. */
  onImageChanged: (slug: string, image: string | null) => void;
};

export function AdminImageStudio({ products, onImageChanged }: AdminImageStudioProps) {
  const [filter, setFilter] = useState<Filter>("missing");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 24;

  /** Slugs currently uploading, so only those tiles show a spinner. */
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Bulk matching state
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkDragging, setBulkDragging] = useState(false);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const tileInputRef = useRef<HTMLInputElement>(null);
  const tileTargetRef = useRef<string>("");

  // Object URLs for the match previews leak until revoked, and a folder drop
  // can create hundreds of them. The cleanup runs on unmount, so it has to read
  // the CURRENT batch through a ref — an effect with an empty dep array closes
  // over the first render's empty array and would free nothing.
  const matchesRef = useRef<MatchRow[]>([]);
  matchesRef.current = matches;
  useEffect(() => () => {
    matchesRef.current.forEach(m => URL.revokeObjectURL(m.previewUrl));
  }, []);

  const flash = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 4000);
  };

  const missingCount = useMemo(
    () => products.filter(p => !p.image).length,
    [products]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      if (filter === "missing" && p.image) return false;
      if (filter === "has" && !p.image) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.brand_name || "").toLowerCase().includes(q) ||
        (p.first_variant?.cat_no || "").toLowerCase().includes(q) ||
        (p.series || "").toLowerCase().includes(q)
      );
    });
  }, [products, filter, search]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const paged = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [filter, search]);

  const markBusy = (slug: string, on: boolean) =>
    setBusy(prev => {
      const next = new Set(prev);
      if (on) next.add(slug); else next.delete(slug);
      return next;
    });

  /** Compress, upload, and patch the row — no catalog reload. */
  const uploadOne = useCallback(async (product: Product, file: File) => {
    markBusy(product.slug, true);
    setError("");
    try {
      const prepared = await prepareImage(file);
      const saved = await uploadProductImage(product.slug, prepared.file);
      onImageChanged(product.slug, saved?.image ?? null);
      return { ok: true as const, prepared };
    } catch (err: any) {
      setError(`${product.name}: ${err.message || "upload failed"}`);
      return { ok: false as const, message: err.message || "upload failed" };
    } finally {
      markBusy(product.slug, false);
    }
  }, [onImageChanged]);

  const handleTilePick = (slug: string) => {
    tileTargetRef.current = slug;
    tileInputRef.current?.click();
  };

  const onTileFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const product = products.find(p => p.slug === tileTargetRef.current);
    // Reset first: picking the SAME file twice fires no change event otherwise,
    // so a failed upload could not be retried without choosing another file.
    e.target.value = "";
    if (!file || !product) return;
    const result = await uploadOne(product, file);
    if (result.ok) {
      flash(
        result.prepared.passthrough
          ? `Image added to ${product.name}.`
          : `Image added to ${product.name} — compressed ${formatBytes(result.prepared.originalSize)} → ${formatBytes(result.prepared.file.size)}.`
      );
    }
  };

  const onTileDrop = async (e: React.DragEvent, product: Product) => {
    e.preventDefault();
    setDragOver("");
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith("image/"));
    if (!file) return;
    const result = await uploadOne(product, file);
    if (result.ok) flash(`Image added to ${product.name}.`);
  };

  const clearImage = async (product: Product) => {
    markBusy(product.slug, true);
    try {
      await deleteProductImage(product.slug);
      onImageChanged(product.slug, null);
      flash(`Image removed from ${product.name}.`);
    } catch (err: any) {
      setError(`${product.name}: ${err.message || "could not remove image"}`);
    } finally {
      markBusy(product.slug, false);
    }
  };

  // ── Bulk matching ────────────────────────────────────────────────
  //
  // A filename is matched against the catalogue number first (that is what
  // suppliers name their photos after), then the slug, then the product name.
  // Matching on normalised keys — letters and digits only — is what makes this
  // work in practice: "NXB-63 1P 16A.jpg" and cat_no "NXB63_1P16A" are the same
  // product, and a raw string compare finds neither.
  const buildMatches = useCallback((files: File[]): MatchRow[] => {
    const byCatNo = new Map<string, Product>();
    const bySlug = new Map<string, Product>();
    const byName = new Map<string, Product>();
    for (const p of products) {
      const cat = matchKey(p.first_variant?.cat_no || "");
      if (cat && !byCatNo.has(cat)) byCatNo.set(cat, p);
      const slug = matchKey(p.slug);
      if (slug && !bySlug.has(slug)) bySlug.set(slug, p);
      const name = matchKey(p.name);
      if (name && !byName.has(name)) byName.set(name, p);
    }

    return files.map(file => {
      const key = matchKey(fileStem(file.name));
      let product: Product | null = null;
      let reason = "";

      if (key) {
        if (byCatNo.has(key)) { product = byCatNo.get(key)!; reason = "catalogue no."; }
        else if (bySlug.has(key)) { product = bySlug.get(key)!; reason = "slug"; }
        else if (byName.has(key)) { product = byName.get(key)!; reason = "product name"; }
        else {
          // Fall back to containment, e.g. "abb-tmax-t1-front.jpg" against cat
          // no "TMAXT1". Longest catalogue number wins so a short code cannot
          // hijack a filename that names a more specific one.
          let best: { p: Product; len: number } | null = null;
          for (const [cat, p] of byCatNo) {
            if (cat.length >= 4 && key.includes(cat) && (!best || cat.length > best.len)) {
              best = { p, len: cat.length };
            }
          }
          if (best) { product = best.p; reason = "catalogue no. in filename"; }
        }
      }

      return {
        file,
        previewUrl: URL.createObjectURL(file),
        product,
        reason: product ? reason : "no match",
        status: "pending" as const,
      };
    });
  }, [products]);

  const acceptBulkFiles = (fileList: FileList | null) => {
    const files = Array.from(fileList || []).filter(f => f.type.startsWith("image/"));
    if (!files.length) return;
    // Release the previous batch's previews before replacing it.
    matches.forEach(m => URL.revokeObjectURL(m.previewUrl));
    setMatches(buildMatches(files));
    setError("");
  };

  const runBulkUpload = async () => {
    const queue = matches
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m.product && m.status !== "done");
    if (!queue.length) return;

    setBulkRunning(true);
    setError("");

    await runPooled(queue, UPLOAD_CONCURRENCY, async ({ m, i }) => {
      setMatches(prev => prev.map((r, j) => j === i ? { ...r, status: "uploading" } : r));
      try {
        const prepared = await prepareImage(m.file);
        const saved = await uploadProductImage(m.product!.slug, prepared.file);
        onImageChanged(m.product!.slug, saved?.image ?? null);
        setMatches(prev => prev.map((r, j) => j === i ? { ...r, status: "done" } : r));
      } catch (err: any) {
        setMatches(prev => prev.map((r, j) =>
          j === i ? { ...r, status: "error", error: err.message || "failed" } : r));
      }
    });

    setBulkRunning(false);
  };

  const matched = matches.filter(m => m.product);
  const unmatched = matches.filter(m => !m.product);
  const uploaded = matches.filter(m => m.status === "done").length;
  const failed = matches.filter(m => m.status === "error").length;

  return (
    <div className="space-y-5">
      {/* Hidden input reused by every tile. */}
      <input
        ref={tileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onTileFile}
      />

      {/* ── Bulk drop zone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setBulkDragging(true); }}
        onDragLeave={() => setBulkDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setBulkDragging(false);
          acceptBulkFiles(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          bulkDragging ? "border-primary bg-primary/5" : "border-border bg-secondary/20"
        }`}
      >
        <FolderUp className={`w-8 h-8 mx-auto mb-2 ${bulkDragging ? "text-primary" : "text-muted-foreground/50"}`} />
        <p className="text-sm font-bold text-foreground">
          Drop a whole folder of photos here
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-lg mx-auto leading-relaxed">
          Name each file after the product's catalogue number — <span className="font-mono">NXB-63-1P-16A.jpg</span> —
          and they'll be matched automatically. You can review every match before anything uploads.
        </p>
        <button
          type="button"
          onClick={() => bulkInputRef.current?.click()}
          className="btn-primary text-xs mt-3 inline-flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" /> Choose images
        </button>
        <input
          ref={bulkInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { acceptBulkFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm px-3 py-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="flex-1">{toast}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="p-1 rounded hover:bg-destructive/10 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Match review ── */}
      {matches.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {matches.length} file{matches.length !== 1 ? "s" : ""} ready
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {matched.length} matched
                {unmatched.length > 0 && ` · ${unmatched.length} unmatched (will be skipped)`}
                {uploaded > 0 && ` · ${uploaded} uploaded`}
                {failed > 0 && ` · ${failed} failed`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={bulkRunning}
                onClick={() => {
                  matches.forEach(m => URL.revokeObjectURL(m.previewUrl));
                  setMatches([]);
                }}
                className="btn-secondary text-xs disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={runBulkUpload}
                disabled={bulkRunning || matched.length === 0 || uploaded === matched.length}
                className="btn-primary text-xs inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkRunning
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading {uploaded}/{matched.length}…</>
                  : <><Upload className="w-3.5 h-3.5" /> Upload {matched.length} image{matched.length !== 1 ? "s" : ""}</>}
              </button>
            </div>
          </div>

          {bulkRunning && (
            <div className="h-1 bg-secondary">
              <div
                className="h-full bg-primary transition-[width] duration-300"
                style={{ width: `${matched.length ? (uploaded / matched.length) * 100 : 0}%` }}
              />
            </div>
          )}

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {matches.map((m, i) => (
              <div key={`${m.file.name}-${i}`} className="p-3 flex items-center gap-3">
                <img
                  src={m.previewUrl}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{m.file.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {m.product ? (
                      <>→ <span className="text-foreground font-semibold">{m.product.name}</span>
                        <span className="text-muted-foreground"> (matched on {m.reason})</span></>
                    ) : (
                      <span className="text-amber-600 font-semibold">
                        No product matches this filename — rename it to the catalogue number, or drop it on a tile below.
                      </span>
                    )}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-bold">
                  {m.status === "uploading" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {m.status === "done" && <Check className="w-4 h-4 text-emerald-600" />}
                  {m.status === "error" && (
                    <span className="text-destructive" title={m.error}>Failed</span>
                  )}
                  {m.status === "pending" && !m.product && (
                    <span className="text-muted-foreground">Skip</span>
                  )}
                  {m.status === "pending" && m.product && (
                    <span className="text-muted-foreground">{formatBytes(m.file.size)}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Product grid ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
            {([
              ["missing", `Needs image (${missingCount})`],
              ["has", `Has image (${products.length - missingCount})`],
              ["all", `All (${products.length})`],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  filter === key ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a product…"
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-card text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="p-14 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">
              {filter === "missing" && missingCount === 0
                ? "Every product has an image"
                : "Nothing matches those filters"}
            </p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {paged.map(p => {
              const uploading = busy.has(p.slug);
              const isOver = dragOver === p.slug;
              return (
                <div
                  key={p.id}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(p.slug); }}
                  onDragLeave={() => setDragOver(cur => (cur === p.slug ? "" : cur))}
                  onDrop={(e) => onTileDrop(e, p)}
                  className={`group relative rounded-xl border-2 overflow-hidden transition-colors ${
                    isOver ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleTilePick(p.slug)}
                    disabled={uploading}
                    className="w-full aspect-square bg-secondary/30 flex items-center justify-center relative cursor-pointer disabled:cursor-wait"
                    title={p.image ? "Replace image" : "Add image"}
                  >
                    {p.image ? (
                      <img
                        src={mediaUrl(p.image)}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60">
                        <ImagePlus className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Drop or click</span>
                      </div>
                    )}

                    {uploading && (
                      <div className="absolute inset-0 bg-card/80 flex flex-col items-center justify-center gap-1.5">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-[10px] font-bold text-primary">Uploading…</span>
                      </div>
                    )}

                    {!uploading && p.image && (
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[11px] font-bold">Replace</span>
                      </div>
                    )}
                  </button>

                  {p.image && !uploading && (
                    <button
                      type="button"
                      onClick={() => clearImage(p)}
                      title="Remove image"
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-card/90 border border-border text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}

                  <div className="p-2 border-t border-border">
                    <p className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">
                      {p.name}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">
                      {p.first_variant?.cat_no || p.series || p.brand_name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, visible.length)} of {visible.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ← Previous
              </button>
              <span className="text-xs font-semibold text-foreground">{page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
