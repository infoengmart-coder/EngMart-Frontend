"use client";

/**
 * Searchable brand dropdown for the admin panel.
 *
 * A native <select> was not enough here: the catalog carries ~70 brands, and
 * scrolling an unfiltered OS list to find "FICO Hi-Tech" is slower than typing
 * it. This keeps the same one-click feel but filters as you type, shows each
 * brand's logo and product count, and can render a per-brand trailing badge
 * (the Discounts page uses it to show which brands already have a campaign).
 *
 * It closes on outside click and on Escape, and the list is keyboard
 * navigable — arrows to move, Enter to pick.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check, Tag } from "lucide-react";
import { brandLogo } from "@/lib/brand-logos";
import { mediaUrl, type AdminBrand } from "@/lib/api";

export type BrandSelectProps = {
  brands: AdminBrand[];
  /** Slug of the selected brand, or "" for none. */
  value: string;
  onChange: (brand: AdminBrand) => void;
  placeholder?: string;
  /** Optional trailing badge per row, e.g. "15% off". */
  badgeFor?: (brand: AdminBrand) => string | null;
  disabled?: boolean;
  className?: string;
};

export function BrandSelect({
  brands,
  value,
  onChange,
  placeholder = "Select a brand…",
  badgeFor,
  disabled = false,
  className = "",
}: BrandSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = useMemo(
    () => brands.find((b) => b.slug === value) || null,
    [brands, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.origin_country || "").toLowerCase().includes(q) ||
        (b.supplier_name || "").toLowerCase().includes(q)
    );
  }, [brands, query]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Focus the filter box as soon as the list opens — the whole point is typing.
  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const row = listRef.current.children[cursor] as HTMLElement | undefined;
    row?.scrollIntoView({ block: "nearest" });
  }, [cursor, open]);

  const pick = (brand: AdminBrand) => {
    onChange(brand);
    setOpen(false);
  };

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = filtered[cursor];
      if (hit) pick(hit);
    }
  };

  const logoOf = (b: AdminBrand) => (b.logo ? mediaUrl(b.logo) : null) || brandLogo(b.name, b.slug);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-card text-left text-sm transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {selected ? (
          <>
            <span
              className="w-7 h-7 rounded-md border bg-white flex items-center justify-center overflow-hidden shrink-0"
              style={{ borderColor: (selected.color || "#e2e8f0") + "55" }}
            >
              {logoOf(selected) ? (
                <img src={logoOf(selected)!} alt="" className="w-full h-full object-contain p-0.5" />
              ) : (
                <span className="text-[10px] font-bold" style={{ color: selected.color || "#64748b" }}>
                  {selected.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-semibold text-foreground truncate">{selected.name}</span>
              <span className="block text-[11px] text-muted-foreground">
                {selected.product_count ?? 0} products
                {selected.origin_country ? ` · ${selected.origin_country}` : ""}
              </span>
            </span>
          </>
        ) : (
          <span className="flex-1 text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="relative border-b border-border">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
              onKeyDown={onSearchKey}
              placeholder="Type to filter brands…"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          <ul role="listbox" ref={listRef} className="max-h-72 overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-muted-foreground">
                No brand matches “{query}”.
              </li>
            )}
            {filtered.map((b, i) => {
              const active = b.slug === value;
              const badge = badgeFor?.(b) || null;
              const logo = logoOf(b);
              return (
                <li key={b.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => pick(b)}
                    className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors cursor-pointer ${
                      i === cursor ? "bg-secondary" : ""
                    } ${active ? "text-primary" : "text-foreground"}`}
                  >
                    <span
                      className="w-7 h-7 rounded-md border bg-white flex items-center justify-center overflow-hidden shrink-0"
                      style={{ borderColor: (b.color || "#e2e8f0") + "55" }}
                    >
                      {logo ? (
                        <img src={logo} alt="" className="w-full h-full object-contain p-0.5" />
                      ) : (
                        <span className="text-[10px] font-bold" style={{ color: b.color || "#64748b" }}>
                          {b.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold truncate">{b.name}</span>
                      <span className="block text-[11px] text-muted-foreground truncate">
                        {b.product_count ?? 0} products
                        {b.origin_country ? ` · ${b.origin_country}` : ""}
                        {b.is_active === false ? " · hidden" : ""}
                      </span>
                    </span>
                    {badge && (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                        <Tag className="w-2.5 h-2.5" /> {badge}
                      </span>
                    )}
                    {active && <Check className="w-4 h-4 shrink-0 text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="px-3 py-2 border-t border-border bg-secondary/30 text-[11px] text-muted-foreground">
            {filtered.length} of {brands.length} brands
          </div>
        </div>
      )}
    </div>
  );
}
