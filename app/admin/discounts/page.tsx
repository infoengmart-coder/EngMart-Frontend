"use client";

/**
 * Admin → Discounts — one percentage per brand.
 *
 * Pick a brand from the dropdown, type a percentage, submit. Every product of
 * that brand then sells at that percentage off across the whole storefront:
 * product cards, the product page, quick view, the cart, checkout and the
 * printed invoice.
 *
 * The number set here is not decoration. `apps/orders/serializers.py` re-reads
 * it when the order is created and discounts each line by ITS OWN brand's rate,
 * so a basket mixing brands on different percentages totals exactly right — and
 * so a customer can never be shown one price and charged another.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgePercent, Check, Loader2, AlertCircle, Tag, X, Search,
  TrendingDown, Power, PowerOff, Package,
} from "lucide-react";
import { BrandSelect } from "@/components/brand-select";
import { brandLogo } from "@/lib/brand-logos";
import { getAdminBrands, setBrandDiscount, mediaUrl, type AdminBrand } from "@/lib/api";

/** The discount actually in force for a brand: 0 whenever it is paused. */
function livePercent(b: AdminBrand): number {
  if (b.discount_active === false) return 0;
  const n = Number(b.discount_percent);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100) : 0;
}

/** The configured number, shown even while the campaign is paused. */
function configuredPercent(b: AdminBrand): number {
  const n = Number(b.discount_percent);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100) : 0;
}

const QUICK_PICKS = [5, 10, 15, 20, 25, 30];

export default function AdminDiscountsPage() {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Form state
  const [slug, setSlug] = useState("");
  const [percent, setPercent] = useState("");
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  const [search, setSearch] = useState("");
  /** Slug being toggled from the table, so only that row shows a spinner. */
  const [busySlug, setBusySlug] = useState("");

  const load = () => {
    setLoading(true);
    getAdminBrands()
      .then((rows) => setBrands(rows || []))
      .catch((e) => setLoadError(e.message || "Failed to load brands"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const selected = useMemo(
    () => brands.find((b) => b.slug === slug) || null,
    [brands, slug]
  );

  // Loading a brand into the form shows what it is CURRENTLY set to, so the
  // admin edits an existing campaign instead of unknowingly replacing it.
  const chooseBrand = (b: AdminBrand) => {
    setSlug(b.slug);
    setPercent(configuredPercent(b) > 0 ? String(configuredPercent(b)) : "");
    setLabel(b.discount_label || "");
    setActive(b.discount_active !== false);
    setFormError("");
  };

  const clearForm = () => {
    setSlug(""); setPercent(""); setLabel(""); setActive(true); setFormError("");
  };

  const flash = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 3500);
  };

  /** Write a brand's discount and patch it into local state — no full reload. */
  const persist = async (
    target: AdminBrand,
    data: { discount_percent: number; discount_active: boolean; discount_label?: string },
  ) => {
    const saved = await setBrandDiscount(target.slug, data);
    setBrands((prev) =>
      prev.map((b) =>
        b.slug === target.slug
          ? {
              ...b,
              // Trust the response, but fall back to what we just sent so the
              // row is never left showing the pre-edit value.
              discount_percent: saved?.discount_percent ?? data.discount_percent,
              discount_active: saved?.discount_active ?? data.discount_active,
              discount_label: saved?.discount_label ?? (data.discount_label || ""),
            }
          : b
      )
    );
    return saved;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return setFormError("Choose a brand first.");
    const value = Number(percent);
    if (percent.trim() === "" || !Number.isFinite(value)) {
      return setFormError("Enter a discount percentage, e.g. 15.");
    }
    if (value < 0 || value > 100) {
      return setFormError("Discount must be between 0 and 100.");
    }

    setFormError("");
    setSaving(true);
    try {
      await persist(selected, {
        discount_percent: value,
        discount_active: active && value > 0,
        discount_label: label.trim(),
      });
      flash(
        value > 0
          ? `${selected.name} is now ${value}% off across the storefront.`
          : `Discount removed from ${selected.name}.`
      );
      clearForm();
    } catch (err: any) {
      setFormError(err.message || "Failed to save the discount.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b: AdminBrand) => {
    setBusySlug(b.slug);
    try {
      const next = b.discount_active === false;
      await persist(b, {
        discount_percent: configuredPercent(b),
        discount_active: next,
        discount_label: b.discount_label || "",
      });
      flash(next ? `${b.name} discount resumed.` : `${b.name} discount paused.`);
    } catch (err: any) {
      setLoadError(err.message || "Failed to update the discount.");
    } finally {
      setBusySlug("");
    }
  };

  const removeDiscount = async (b: AdminBrand) => {
    setBusySlug(b.slug);
    try {
      await persist(b, { discount_percent: 0, discount_active: false, discount_label: "" });
      flash(`Discount removed from ${b.name}.`);
      if (slug === b.slug) clearForm();
    } catch (err: any) {
      setLoadError(err.message || "Failed to remove the discount.");
    } finally {
      setBusySlug("");
    }
  };

  // Brands that have a percentage configured, live or paused.
  const withDiscount = useMemo(
    () => brands.filter((b) => configuredPercent(b) > 0),
    [brands]
  );
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return withDiscount;
    return withDiscount.filter((b) => b.name.toLowerCase().includes(q));
  }, [withDiscount, search]);

  const liveCount = withDiscount.filter((b) => livePercent(b) > 0).length;
  const productsOnOffer = withDiscount
    .filter((b) => livePercent(b) > 0)
    .reduce((n, b) => n + (b.product_count || 0), 0);

  const previewPercent = Number(percent);
  const previewValid = Number.isFinite(previewPercent) && previewPercent > 0 && previewPercent <= 100;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-primary" /> Brand Discounts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Set one percentage per brand. It applies to every product of that brand automatically.
          </p>
        </div>
        <Link
          href="/admin/brands"
          className="text-xs font-semibold text-primary hover:underline shrink-0"
        >
          Manage brands →
        </Link>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Brands on offer", value: liveCount, icon: Tag },
          { label: "Products discounted", value: productsOnOffer.toLocaleString(), icon: Package },
          { label: "Paused campaigns", value: withDiscount.length - liveCount, icon: PowerOff },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-wide">{s.label}</span>
            </div>
            <p className="text-2xl font-black text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {toast && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm px-3 py-2">
          <Check className="w-4 h-4 shrink-0" />
          <span className="flex-1">{toast}</span>
        </div>
      )}
      {loadError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{loadError}</span>
          <button onClick={() => setLoadError("")} className="p-1 rounded hover:bg-destructive/10 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Set a discount ── */}
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm mb-8"
      >
        <h2 className="text-sm font-bold text-foreground mb-1">Set a discount</h2>
        <p className="text-xs text-muted-foreground mb-5">
          Choose the brand, enter the percentage, then submit. It goes live on the storefront immediately.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Step 1 — brand */}
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              1. Brand
            </label>
            <BrandSelect
              brands={brands}
              value={slug}
              onChange={chooseBrand}
              disabled={loading}
              placeholder={loading ? "Loading brands…" : "Select a brand…"}
              badgeFor={(b) => (configuredPercent(b) > 0 ? `${configuredPercent(b)}%` : null)}
            />
            {selected && (
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Applies to <strong className="text-foreground">{selected.product_count ?? 0}</strong> products
                {configuredPercent(selected) > 0 && (
                  <> · currently set to <strong className="text-foreground">{configuredPercent(selected)}%</strong>
                    {selected.discount_active === false && " (paused)"}
                  </>
                )}
              </p>
            )}
          </div>

          {/* Step 2 — percentage */}
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              2. Discount percentage
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                step="0.5"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                disabled={!selected}
                placeholder="e.g. 15"
                className="w-full pl-3 pr-9 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-card text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground pointer-events-none">
                %
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_PICKS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={!selected}
                  onClick={() => setPercent(String(q))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    Number(percent) === q
                      ? "bg-primary text-white border-primary"
                      : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {q}%
                </button>
              ))}
            </div>
          </div>

          {/* Optional campaign name */}
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Campaign name <span className="font-medium">(optional)</span>
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={!selected}
              placeholder='e.g. "Ramadan Sale"'
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-card text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 transition-all"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Shown next to the saving on the product page.
            </p>
          </div>

          {/* Live preview — what the customer will actually see */}
          <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
              Customer sees
            </p>
            {selected && previewValid ? (
              <>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl font-black text-foreground">
                    PKR {Math.round(10000 * (1 - previewPercent / 100)).toLocaleString("en-PK")}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground line-through">
                    PKR 10,000
                  </span>
                  <span className="text-[10px] font-black uppercase text-white bg-gradient-to-r from-rose-600 to-red-500 px-2 py-0.5 rounded">
                    {previewPercent}% OFF
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Example on a PKR 10,000 item from {selected.name}.
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Pick a brand and a percentage to preview the price customers will see.
              </p>
            )}
          </div>
        </div>

        {formError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-border">
          <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              disabled={!selected}
              className="w-4 h-4 rounded cursor-pointer"
            />
            Start this discount immediately
          </label>
          <div className="flex gap-2">
            {slug && (
              <button
                type="button"
                onClick={clearForm}
                className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!selected || saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? "Saving…" : "Submit discount"}
            </button>
          </div>
        </div>
      </form>

      {/* ── Running campaigns ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            Active discounts ({withDiscount.length})
          </h2>
          {withDiscount.length > 0 && (
            <div className="relative sm:max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a brand…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-card text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center">
            <BadgePercent className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">
              {withDiscount.length === 0 ? "No brand discounts yet" : "No brand matches that search"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {withDiscount.length === 0
                ? "Use the form above to put a brand on offer."
                : "Try a different name."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visible.map((b) => {
              const live = livePercent(b);
              const configured = configuredPercent(b);
              const logo = (b.logo ? mediaUrl(b.logo) : null) || brandLogo(b.name, b.slug);
              const busy = busySlug === b.slug;
              return (
                <div key={b.id} className="p-4 flex flex-wrap items-center gap-3 hover:bg-secondary/20 transition-colors">
                  <div
                    className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center overflow-hidden shrink-0"
                    style={{ borderColor: (b.color || "#e2e8f0") + "55" }}
                  >
                    {logo ? (
                      <img src={logo} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-xs font-bold" style={{ color: b.color || "#64748b" }}>
                        {b.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-[140px]">
                    <p className="text-sm font-bold text-foreground">{b.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {b.product_count ?? 0} products
                      {b.discount_label ? ` · ${b.discount_label}` : ""}
                    </p>
                  </div>

                  <span
                    className={`text-sm font-black px-2.5 py-1 rounded-lg shrink-0 ${
                      live > 0
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {configured}% off
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                      live > 0
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {live > 0 ? "Live" : "Paused"}
                  </span>

                  <div className="flex items-center gap-1 shrink-0 ml-auto">
                    <button
                      onClick={() => chooseBrand(b)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(b)}
                      disabled={busy}
                      title={live > 0 ? "Pause this discount" : "Resume this discount"}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {busy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : live > 0 ? (
                        <PowerOff className="w-4 h-4" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => removeDiscount(b)}
                      disabled={busy}
                      title="Remove this discount"
                      className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
        Discounts are applied per product line at checkout, so an order mixing brands on different
        percentages is totalled exactly — each item is reduced by its own brand's rate before GST.
      </p>
    </div>
  );
}
