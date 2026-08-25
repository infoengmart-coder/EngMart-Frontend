"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Tag, ExternalLink, Inbox, Trash2, AlertCircle, X, Power, Percent, Banknote } from "lucide-react";
import { AdminChargeSettings } from "@/components/admin-charge-settings";
import {
  getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode,
  type PromoCodeData,
} from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";

/* ── Helpers ───────────────────────────────────────── */

const money = (v: string | number) =>
  `PKR ${Number(v || 0).toLocaleString("en-PK")}`;

const shortDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" }) : "—";

/** A code can be inactive for several reasons — say which, don't just show "Expired". */
function codeStatus(c: PromoCodeData): { label: string; good: boolean } {
  if (!c.is_active) return { label: "Disabled", good: false };
  if (c.valid_until && new Date(c.valid_until) < new Date()) return { label: "Expired", good: false };
  if (new Date(c.valid_from) > new Date()) return { label: "Scheduled", good: false };
  if (c.max_uses > 0 && c.times_used >= c.max_uses) return { label: "Limit reached", good: false };
  return { label: "Active", good: true };
}

const EMPTY_FORM = {
  code: "",
  discount_type: "percentage" as "percentage" | "fixed",
  discount_value: "",
  min_order_amount: "",
  max_discount_amount: "",
  max_uses: "",
  valid_until: "",
  description: "",
};

/* ── Component ─────────────────────────────────────── */

export default function WholesalePage() {
  const [codes, setCodes] = useState<PromoCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PromoCodeData | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  /** Which manager is showing. Discount codes stay the landing tab. */
  const [tab, setTab] = useState<"codes" | "gst" | "cod">("codes");

  const load = async () => {
    setLoading(true);
    try {
      setCodes(await getPromoCodes());
    } catch (err: any) {
      setError(err.message || "Failed to load discount codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    const code = form.code.trim().toUpperCase();
    if (!code) return setError("Enter a code, e.g. BULK20-AUG.");
    if (!form.discount_value || Number(form.discount_value) <= 0)
      return setError("Enter a discount greater than 0.");
    if (form.discount_type === "percentage" && Number(form.discount_value) > 100)
      return setError("A percentage discount cannot be more than 100%.");

    setSaving(true);
    setError("");
    try {
      // Only send what the admin filled in. Blank optional fields must be
      // omitted, not sent as "" — the API rejects empty numeric strings.
      const payload: Record<string, unknown> = {
        code,
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        min_order_amount: form.min_order_amount || "0",
        description: form.description.trim(),
        is_active: true,
      };
      if (form.max_discount_amount) payload.max_discount_amount = form.max_discount_amount;
      if (form.max_uses) payload.max_uses = Number(form.max_uses);
      // A date input gives YYYY-MM-DD; make it end-of-day so the code stays
      // usable for the whole of its last day.
      if (form.valid_until) payload.valid_until = `${form.valid_until}T23:59:59`;

      const created = await createPromoCode(payload);
      setCodes(prev => [created, ...prev]);
      setForm(EMPTY_FORM);
      setShowCodeForm(false);
      setNotice(`Code ${created.code} created — customers can use it at checkout now.`);
    } catch (err: any) {
      setError(err.message || "Failed to create the code.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: PromoCodeData) => {
    setError("");
    try {
      const updated = await updatePromoCode(c.id, { is_active: !c.is_active });
      setCodes(prev => prev.map(x => (x.id === c.id ? updated : x)));
    } catch (err: any) {
      setError(err.message || "Failed to update the code.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    try {
      await deletePromoCode(pendingDelete.id);
      setCodes(prev => prev.filter(x => x.id !== pendingDelete.id));
      setNotice(`Code ${pendingDelete.code} deleted.`);
    } catch (err: any) {
      setError(err.message || "Failed to delete the code.");
    } finally {
      setDeleteBusy(false);
      setPendingDelete(null);
    }
  };

  return (
    <div className="p-5 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {tab === "codes" ? "Wholesale & Discount Codes" : tab === "gst" ? "GST" : "Cash on Delivery"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tab === "codes"
              ? "Create discount codes customers enter at checkout."
              : tab === "gst"
                ? "Set the tax rate charged on orders and shown on quotations and invoices."
                : "Set the flat charge added when a customer pays cash on delivery."}
          </p>
        </div>
        {tab === "codes" && (
          <Link href="/admin/orders" className="btn-secondary shrink-0 text-xs">
            <ExternalLink className="w-3.5 h-3.5" /> View Orders
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border -mt-2 overflow-x-auto">
        {([
          { id: "codes", label: "Discount Codes", icon: Tag },
          { id: "gst", label: "GST", icon: Percent },
          { id: "cod", label: "COD", icon: Banknote },
        ] as const).map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={active ? "page" : undefined}
              className={`px-4 py-2.5 -mb-px text-xs font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "gst" && <AdminChargeSettings mode="gst" onNotify={setNotice} />}
      {tab === "cod" && <AdminChargeSettings mode="cod" onNotify={setNotice} />}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="p-1 rounded hover:bg-destructive/10" aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm p-3 flex items-center gap-2">
          <span className="flex-1">{notice}</span>
          <button onClick={() => setNotice("")} className="p-1 rounded hover:bg-emerald-100" aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Discount Codes ──────────────────────────── */}
      {tab === "codes" && (
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" /> Discount Codes
            {!loading && <span className="text-muted-foreground font-medium">({codes.length})</span>}
          </h2>
          <button
            onClick={() => { setShowCodeForm(v => !v); setError(""); }}
            className="btn-primary text-xs py-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5" /> New Code
          </button>
        </div>

        {showCodeForm && (
          <div className="p-4 border-b border-border bg-secondary/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Code *</label>
                <input
                  type="text" className="input-base text-xs font-mono uppercase"
                  placeholder="BULK20-AUG"
                  value={form.code}
                  onChange={e => set("code", e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Type *</label>
                <select
                  className="input-base text-xs"
                  value={form.discount_type}
                  onChange={e => set("discount_type", e.target.value)}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed amount (PKR)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  {form.discount_type === "percentage" ? "Discount % *" : "Discount PKR *"}
                </label>
                <input
                  type="number" min="0" className="input-base text-xs"
                  placeholder={form.discount_type === "percentage" ? "20" : "5000"}
                  value={form.discount_value}
                  onChange={e => set("discount_value", e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Min Order (PKR)</label>
                <input
                  type="number" min="0" className="input-base text-xs" placeholder="50000"
                  value={form.min_order_amount}
                  onChange={e => set("min_order_amount", e.target.value)}
                />
              </div>
              {form.discount_type === "percentage" && (
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Max Discount (PKR)</label>
                  <input
                    type="number" min="0" className="input-base text-xs" placeholder="Optional cap"
                    value={form.max_discount_amount}
                    onChange={e => set("max_discount_amount", e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Max Uses</label>
                <input
                  type="number" min="0" className="input-base text-xs" placeholder="Blank = unlimited"
                  value={form.max_uses}
                  onChange={e => set("max_uses", e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Valid Until</label>
                <input
                  type="date" className="input-base text-xs"
                  value={form.valid_until}
                  onChange={e => set("valid_until", e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Description</label>
                <input
                  type="text" className="input-base text-xs" placeholder="Internal note"
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleCreate} disabled={saving} className="btn-primary text-xs py-1.5 px-4 disabled:opacity-60">
                {saving ? "Creating…" : "Create Code"}
              </button>
              <button
                onClick={() => { setShowCodeForm(false); setForm(EMPTY_FORM); setError(""); }}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="text-[11px] text-muted-foreground uppercase bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold">Code</th>
                <th className="px-4 py-3 text-left font-semibold">Discount</th>
                <th className="px-4 py-3 text-left font-semibold">Min Order</th>
                <th className="px-4 py-3 text-left font-semibold">Valid Until</th>
                <th className="px-4 py-3 text-left font-semibold">Used</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && Array.from({ length: 3 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  <td colSpan={7} className="px-4 py-3"><div className="skeleton h-5 w-full" /></td>
                </tr>
              ))}

              {!loading && codes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-foreground">No discount codes yet</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Create one and customers can enter it at checkout to get a discount.
                    </p>
                    <button onClick={() => setShowCodeForm(true)} className="btn-primary text-xs">
                      <Plus className="w-3.5 h-3.5" /> Create First Code
                    </button>
                  </td>
                </tr>
              )}

              {!loading && codes.map(c => {
                const st = codeStatus(c);
                return (
                  <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-primary font-mono text-xs">
                      {c.code}
                      {c.description && (
                        <span className="block font-sans font-normal text-[10px] text-muted-foreground">
                          {c.description}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-xs">
                      {c.discount_type === "percentage"
                        ? `${Number(c.discount_value)}%`
                        : money(c.discount_value)}
                      {c.discount_type === "percentage" && c.max_discount_amount && (
                        <span className="block text-[10px] text-muted-foreground font-normal">
                          max {money(c.max_discount_amount)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {Number(c.min_order_amount) > 0 ? money(c.min_order_amount) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{shortDate(c.valid_until)}</td>
                    <td className="px-4 py-3 text-xs">
                      {c.times_used}× {c.max_uses > 0 && <span className="text-muted-foreground">/ {c.max_uses}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        st.good
                          ? "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]"
                          : "bg-secondary text-muted-foreground border-border"
                      }`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleActive(c)}
                          title={c.is_active ? "Disable this code" : "Enable this code"}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Power className="w-3 h-3" /> {c.is_active ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => setPendingDelete(c)}
                          title="Delete this code"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 px-2.5 py-1.5 rounded-lg transition-colors"
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

      {/*
        The "Custom Price Lists & Credit Terms" and "Wholesale Account Requests"
        tables that used to sit here listed invented companies and contacts
        (National Industrial Corp, TM Engineering…) as though they were real
        customers. There is no backend for negotiated price lists or credit
        limits, so the tables could never show anything true. Removed rather
        than shown as fake data — see HANDOVER.md if they are built later.
      */}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.code ?? ""}?`}
        message="Customers will no longer be able to use this code at checkout. Orders already placed with it are unaffected."
        confirmLabel="Delete"
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
