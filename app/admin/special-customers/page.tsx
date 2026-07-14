"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Tag, Search, ExternalLink, CheckCircle2, XCircle, Clock, Inbox } from "lucide-react";

/* ── Discount Codes ────────────────────────────────── */

const discountCodes = [
  { code: "BULK20-JUL26", discount: "20%", minOrder: "PKR 50,000", validFrom: "Jul 1, 2026", validTo: "Jul 31, 2026", usageCount: 8, status: "Active" as const },
  { code: "WHOLESALE-VIP15", discount: "15%", minOrder: "PKR 100,000", validFrom: "Jun 1, 2026", validTo: "Dec 31, 2026", usageCount: 23, status: "Active" as const },
  { code: "SUMMER10-MCB", discount: "10%", minOrder: "PKR 20,000", validFrom: "Jun 1, 2026", validTo: "Jun 30, 2026", usageCount: 45, status: "Expired" as const },
];

/* ── Price Lists ───────────────────────────────────── */

const priceLists = [
  { company: "National Industrial Corp", contact: "M. Rashid Siddiqui", priceList: "Negotiated-A", creditTerms: "Net 30", creditLimit: 500000 },
  { company: "TM Engineering", contact: "Tariq Mehmood", priceList: "Negotiated-B", creditTerms: "Net 60", creditLimit: 1000000 },
  { company: "KA Electrical Works", contact: "Engr. Kamran Ahmed", priceList: "Standard", creditTerms: "COD", creditLimit: 0 },
  { company: "UG Panel Builders", contact: "Usman Ghani", priceList: "Negotiated-A", creditTerms: "Net 30", creditLimit: 300000 },
];

/* ── Account Requests ──────────────────────────────── */

const accountRequests = [
  { company: "Karachi Power Solutions", contact: "Ahmed Raza", email: "ahmed@kps.pk", phone: "+92-300-999-1122", date: "Jul 10, 2026", notes: "Panel building workshop in SITE area. Needs MCCBs and contactors in bulk." },
  { company: "Sindh Switchgear Co.", contact: "Farhan Qureshi", email: "farhan@ssgear.pk", phone: "+92-321-888-3344", date: "Jul 8, 2026", notes: "Existing retail customer requesting wholesale pricing for government projects." },
];

/* ── Component ─────────────────────────────────────── */

export default function WholesalePage() {
  const [showCodeForm, setShowCodeForm] = useState(false);

  return (
    <div className="p-5 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Wholesale Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage bulk discount codes, custom pricing, and wholesale account requests.</p>
        </div>
        <Link href="/admin/orders?type=wholesale" className="btn-secondary shrink-0 text-xs">
          <ExternalLink className="w-3.5 h-3.5" /> View Wholesale Orders
        </Link>
      </div>

      {/* ── Discount Codes Section ──────────────────── */}
      <div className="store-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" /> Discount Codes
          </h2>
          <button onClick={() => setShowCodeForm(!showCodeForm)} className="btn-primary text-xs py-1.5 px-3">
            <Plus className="w-3.5 h-3.5" /> New Code
          </button>
        </div>

        {/* Inline create form */}
        {showCodeForm && (
          <div className="p-4 border-b border-border bg-secondary/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Code</label>
                <input type="text" className="input-base text-xs" placeholder="e.g. BULK30-AUG" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Discount %</label>
                <input type="number" className="input-base text-xs" placeholder="e.g. 30" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Min Order (PKR)</label>
                <input type="number" className="input-base text-xs" placeholder="e.g. 50000" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Valid Until</label>
                <input type="date" className="input-base text-xs" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="btn-primary text-xs py-1.5 px-4">Create Code</button>
              <button onClick={() => setShowCodeForm(false)} className="btn-secondary text-xs py-1.5 px-4">Cancel</button>
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
                <th className="px-4 py-3 text-left font-semibold">Valid Period</th>
                <th className="px-4 py-3 text-left font-semibold">Used</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {discountCodes.map((c) => (
                <tr key={c.code} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-bold text-primary font-mono text-xs">{c.code}</td>
                  <td className="px-4 py-3 font-semibold">{c.discount}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.minOrder}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.validFrom} – {c.validTo}</td>
                  <td className="px-4 py-3 text-xs">{c.usageCount}×</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      c.status === "Active"
                        ? "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]"
                        : "bg-secondary text-muted-foreground border-border"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Custom Price Lists ──────────────────────── */}
      <div className="store-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Custom Price Lists & Credit Terms</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage negotiated pricing and credit limits for wholesale accounts.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="text-[11px] text-muted-foreground uppercase bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold">Company</th>
                <th className="px-4 py-3 text-left font-semibold">Contact</th>
                <th className="px-4 py-3 text-left font-semibold">Price List</th>
                <th className="px-4 py-3 text-left font-semibold">Credit Terms</th>
                <th className="px-4 py-3 text-left font-semibold">Credit Limit</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {priceLists.map((p) => (
                <tr key={p.company} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground text-xs">{p.company}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{p.contact}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      p.priceList === "Standard" ? "bg-secondary text-foreground border-border" : "bg-primary/10 text-primary border-primary/20"
                    }`}>
                      {p.priceList}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">{p.creditTerms}</td>
                  <td className="px-4 py-3 text-xs font-semibold">{p.creditLimit > 0 ? `PKR ${p.creditLimit.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs font-semibold text-primary hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Account Requests ───────────────────────── */}
      <div className="store-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-warning)]" />
            Pending Wholesale Account Requests
            <span className="bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{accountRequests.length}</span>
          </h2>
        </div>
        {accountRequests.length > 0 ? (
          <div className="divide-y divide-border">
            {accountRequests.map((req) => (
              <div key={req.email} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-foreground">{req.company}</span>
                    <span className="text-[10px] text-muted-foreground">· {req.date}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{req.contact} · {req.email} · {req.phone}</div>
                  <p className="text-xs text-foreground/80 bg-secondary/30 rounded px-2 py-1.5 border border-border">{req.notes}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="btn-primary text-xs py-1.5 px-4 gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button className="btn-secondary text-xs py-1.5 px-4 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">No pending requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
