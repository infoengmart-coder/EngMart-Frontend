"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Check, X, Tag, Percent, DollarSign, Download } from "lucide-react";
import { getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode, type PromoCodeData } from "@/lib/api";

export default function WholesalePage() {
  const [promos, setPromos] = useState<PromoCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState<"percentage" | "fixed">("percentage");
  const [formValue, setFormValue] = useState("");
  const [formMinOrder, setFormMinOrder] = useState("");
  const [formMaxDiscount, setFormMaxDiscount] = useState("");
  const [formMaxUses, setFormMaxUses] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formValidUntil, setFormValidUntil] = useState("");

  const loadPromos = () => {
    setLoading(true);
    getPromoCodes()
      .then(setPromos)
      .catch((err) => console.error("Failed to load promo codes", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPromos(); }, []);

  const resetForm = () => {
    setFormCode(""); setFormDesc(""); setFormType("percentage"); setFormValue("");
    setFormMinOrder(""); setFormMaxDiscount(""); setFormMaxUses(""); setFormActive(true); setFormValidUntil("");
    setEditingId(null); setShowForm(false);
  };

  const handleOpenEdit = (p: PromoCodeData) => {
    setEditingId(p.id);
    setFormCode(p.code);
    setFormDesc(p.description);
    setFormType(p.discount_type);
    setFormValue(p.discount_value);
    setFormMinOrder(p.min_order_amount);
    setFormMaxDiscount(p.max_discount_amount || "");
    setFormMaxUses(String(p.max_uses));
    setFormActive(p.is_active);
    setFormValidUntil(p.valid_until?.split("T")[0] || "");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        code: formCode,
        description: formDesc,
        discount_type: formType,
        discount_value: formValue,
        min_order_amount: formMinOrder || "0",
        max_discount_amount: formMaxDiscount || null,
        max_uses: Number(formMaxUses) || 9999,
        is_active: formActive,
        valid_until: formValidUntil || null,
      };
      if (editingId) {
        await updatePromoCode(editingId, payload);
      } else {
        await createPromoCode(payload);
      }
      resetForm();
      loadPromos();
    } catch (err: any) {
      alert(err.message || "Failed to save promo code");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this promo code?")) {
      try {
        await deletePromoCode(id);
        loadPromos();
      } catch (err: any) {
        alert(err.message || "Failed to delete");
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ["Code", "Description", "Type", "Value", "Min Order", "Max Uses", "Times Used", "Active", "Expires"];
    const rows = promos.map(p => [p.code, p.description, p.discount_type, p.discount_value, p.min_order_amount, p.max_uses, p.times_used, p.is_active, p.valid_until || "No expiry"]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "engmart_promo_codes.csv";
    a.click();
  };

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Wholesale & Promo Codes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage discount codes for wholesale and retail customers.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={handleExportCSV} className="btn-secondary text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Promo Code
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-card rounded-xl border border-border shadow-sm p-5 bg-secondary/5 border-primary/20 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h2 className="text-base font-bold">{editingId ? "Edit Promo Code" : "New Promo Code"}</h2>
            <button type="button" onClick={resetForm} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Code</label>
              <input required value={formCode} onChange={e => setFormCode(e.target.value.toUpperCase())} className="input-base text-xs" placeholder="e.g. WHOLESALE20" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Description</label>
              <input value={formDesc} onChange={e => setFormDesc(e.target.value)} className="input-base text-xs" placeholder="20% off for wholesale" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Discount Type</label>
              <select value={formType} onChange={e => setFormType(e.target.value as any)} className="input-base text-xs">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (PKR)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Discount Value</label>
              <input required type="number" value={formValue} onChange={e => setFormValue(e.target.value)} className="input-base text-xs" placeholder={formType === "percentage" ? "e.g. 20" : "e.g. 5000"} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Min Order (PKR)</label>
              <input type="number" value={formMinOrder} onChange={e => setFormMinOrder(e.target.value)} className="input-base text-xs" placeholder="0" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Max Uses</label>
              <input type="number" value={formMaxUses} onChange={e => setFormMaxUses(e.target.value)} className="input-base text-xs" placeholder="9999" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Expires On</label>
              <input type="date" value={formValidUntil} onChange={e => setFormValidUntil(e.target.value)} className="input-base text-xs" />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formActive} onChange={e => setFormActive(e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-xs font-semibold text-foreground">Active</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <button type="button" onClick={resetForm} className="btn-secondary text-xs">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-xs flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      )}

      {/* Promo Codes Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" /> Active Promo Codes ({promos.length})
          </h2>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
        ) : promos.length === 0 ? (
          <div className="p-12 text-center">
            <Percent className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No promo codes yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">Create one to offer discounts to your wholesale customers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold">Code</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-left font-semibold">Discount</th>
                  <th className="px-4 py-3 text-left font-semibold">Min Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Usage</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {promos.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-primary text-xs bg-primary/10 px-2 py-1 rounded-md">{p.code}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{p.description || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-xs">
                      {p.discount_type === "percentage" ? `${p.discount_value}%` : `PKR ${Number(p.discount_value).toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">PKR {Number(p.min_order_amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs">{p.times_used} / {p.max_uses}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>{p.is_active ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(p)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg transition-colors">
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 px-2.5 py-1.5 rounded-lg transition-colors">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
