"use client";

import { useEffect, useState } from "react";
import { Save, RotateCcw, Percent, Banknote } from "lucide-react";
import { getSiteSettings, updateSiteSettings, formatPrice } from "@/lib/api";
import { useSiteSettings } from "@/lib/site-settings";

/**
 * GST and Cash-on-Delivery configuration.
 *
 * Both values are stored on the SiteSettings singleton and applied by
 * `apps/orders/charges.py` when an order is created — the storefront only ever
 * previews them. Whatever is saved here is therefore exactly what a customer
 * is charged, what the order stores, and what prints on the invoice.
 *
 * `mode` selects which of the two this panel is editing, so the Wholesale page
 * can render it once per tab without duplicating the save plumbing.
 */

interface AdminChargeSettingsProps {
  mode: "gst" | "cod";
  onNotify?: (message: string) => void;
}

/** Sample basket used by the worked example, so the maths is concrete. */
const PREVIEW_SUBTOTAL = 10000;

export function AdminChargeSettings({ mode, onNotify }: AdminChargeSettingsProps) {
  const { refresh } = useSiteSettings();

  const [gstPercent, setGstPercent] = useState("18");
  const [codFee, setCodFee] = useState("100");

  const [saved, setSaved] = useState({ gstPercent: "18", codFee: "100" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSiteSettings();
      const next = {
        gstPercent: String(data.gst_percent ?? 18),
        codFee: String(data.cod_fee ?? 100),
      };
      setGstPercent(next.gstPercent);
      setCodFee(next.codFee);
      setSaved(next);
    } catch (err: any) {
      setError(err?.message || "Could not load the current charge settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const dirty = gstPercent !== saved.gstPercent || codFee !== saved.codFee;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Clamp before sending: a negative rate or a >100% GST would produce a
      // nonsensical order total on the server.
      const percent = Math.min(100, Math.max(0, Number(gstPercent) || 0));
      const fee = Math.max(0, Number(codFee) || 0);
      await updateSiteSettings({
        // Kept in step with the rate so the stored flag can never contradict
        // it, even though nothing reads the flag to decide whether to charge.
        gst_enabled: percent > 0,
        gst_percent: String(percent),
        cod_fee: String(fee),
      });
      setSaved({ gstPercent: String(percent), codFee: String(fee) });
      setGstPercent(String(percent));
      setCodFee(String(fee));
      await refresh();
      onNotify?.(
        mode === "gst"
          ? "GST settings saved — live on quotations and invoices now"
          : "COD charge saved — live at checkout now",
      );
    } catch (err: any) {
      setError(err?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const percentNum = Math.min(100, Math.max(0, Number(gstPercent) || 0));
  const feeNum = Math.max(0, Number(codFee) || 0);
  const previewTax = Math.round(PREVIEW_SUBTOTAL * (percentNum / 100) * 100) / 100;

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            {mode === "gst"
              ? <><Percent className="w-4 h-4 text-primary" /> GST</>
              : <><Banknote className="w-4 h-4 text-emerald-500" /> Cash on Delivery</>}
          </h2>
          <p className="text-muted-foreground text-xs mt-1">
            {mode === "gst"
              ? "Charged on the discounted order value and printed on quotations and invoices."
              : "A flat charge added at checkout only when the customer picks Cash on Delivery."}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={load}
            disabled={loading || saving}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reload
          </button>
          <button
            type="submit"
            disabled={saving || loading || !dirty}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : dirty ? "Save Changes" : "Saved"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs font-bold text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {loading ? (
        <div className="skeleton h-40 rounded-xl" />
      ) : mode === "gst" ? (
        <div className="store-card p-5">
          <label htmlFor="gst-percent" className="block text-[11px] font-extrabold text-foreground uppercase tracking-wide mb-2">
            GST Percentage
          </label>
          <div className="flex items-center gap-2 max-w-xs">
            <input
              id="gst-percent"
              type="number" min={0} max={100} step="0.01"
              value={gstPercent}
              onChange={(e) => setGstPercent(e.target.value)}
              className="input-base border-2 border-border/80"
            />
            <span className="text-sm font-bold text-muted-foreground">%</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            The rate is the only switch — set <strong>0</strong> to stop
            charging GST entirely. Orders already placed keep the rate they were
            charged at, so past invoices never change.
          </p>

          <div className="mt-4 rounded-xl bg-secondary/50 border border-border p-4 text-xs">
            <p className="font-bold text-foreground mb-2">Worked example</p>
            <div className="space-y-1 text-muted-foreground font-medium">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(PREVIEW_SUBTOTAL)}</span></div>
              <div className="flex justify-between">
                <span>GST ({percentNum > 0 ? `${percentNum}%` : "not charged"})</span>
                <span>{percentNum > 0 ? `+${formatPrice(previewTax)}` : "—"}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-border font-bold text-foreground">
                <span>Total</span><span>{formatPrice(PREVIEW_SUBTOTAL + previewTax)}</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              GST is calculated after any discount, so a customer is taxed on
              what they actually pay. It appears on the checkout summary, order
              tracking, quotations and the printed invoice.
            </p>
          </div>
        </div>
      ) : (
        <div className="store-card p-5">
          <label htmlFor="cod-fee" className="block text-[11px] font-extrabold text-foreground uppercase tracking-wide mb-2">
            Cash on Delivery Charge (PKR)
          </label>
          <div className="flex items-center gap-2 max-w-xs">
            <span className="text-sm font-bold text-muted-foreground">Rs.</span>
            <input
              id="cod-fee"
              type="number" min={0} step="1"
              value={codFee}
              onChange={(e) => setCodFee(e.target.value)}
              className="input-base border-2 border-border/80"
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Set to 0 to remove the charge entirely. It is added only for Cash on
            Delivery — Bank Transfer and WhatsApp orders never see it.
          </p>

          <div className="mt-4 rounded-xl bg-secondary/50 border border-border p-4 text-xs">
            <p className="font-bold text-foreground mb-2">Worked example</p>
            <div className="space-y-1 text-muted-foreground font-medium">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(PREVIEW_SUBTOTAL)}</span></div>
              <div className="flex justify-between"><span>COD charges</span><span>+{formatPrice(feeNum)}</span></div>
              <div className="flex justify-between pt-1.5 border-t border-border font-bold text-foreground">
                <span>Total (COD)</span><span>{formatPrice(PREVIEW_SUBTOTAL + feeNum)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
