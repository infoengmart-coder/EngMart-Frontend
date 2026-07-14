"use client";

import { useState } from "react";
import { Search, Download, Filter, ChevronDown, Package, Truck, CheckCircle2, Clock, XCircle, RotateCcw, ShieldCheck, Inbox } from "lucide-react";

/* ── Types & Data ──────────────────────────────────── */

type OrderStatus = "Pending" | "Confirmed" | "Packaging" | "Shipped" | "Delivered" | "Cancelled" | "Return Requested";
type PaymentStatus = "Paid" | "Unpaid" | "COD";

interface Order {
  id: string;
  customer: string;
  company: string;
  date: string;
  items: number;
  total: number;
  payment: PaymentStatus;
  status: OrderStatus;
}

const STATUS_CONFIG: Record<OrderStatus, { color: string; Icon: any }> = {
  Pending: { color: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]", Icon: Clock },
  Confirmed: { color: "bg-primary/10 text-primary border-primary/20", Icon: CheckCircle2 },
  Packaging: { color: "bg-[color-mix(in_srgb,var(--color-orange)_12%,transparent)] text-[var(--color-orange)] border-[color-mix(in_srgb,var(--color-orange)_25%,transparent)]", Icon: Package },
  Shipped: { color: "bg-[color-mix(in_srgb,#6366f1_12%,transparent)] text-[#6366f1] border-[color-mix(in_srgb,#6366f1_25%,transparent)]", Icon: Truck },
  Delivered: { color: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]", Icon: CheckCircle2 },
  Cancelled: { color: "bg-destructive/10 text-destructive border-destructive/20", Icon: XCircle },
  "Return Requested": { color: "bg-[color-mix(in_srgb,#a855f7_12%,transparent)] text-[#a855f7] border-[color-mix(in_srgb,#a855f7_25%,transparent)]", Icon: RotateCcw },
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  Paid: "text-[var(--color-success)]",
  Unpaid: "text-destructive",
  COD: "text-[var(--color-warning)]",
};

const ALL_ORDERS: Order[] = [
  { id: "ORD-1047", customer: "Engr. Kamran Ahmed", company: "KA Electrical Works", date: "2026-07-12", items: 24, total: 48600, payment: "Unpaid", status: "Pending" },
  { id: "ORD-1046", customer: "M. Rashid Siddiqui", company: "National Industrial Corp", date: "2026-07-11", items: 8, total: 124500, payment: "Paid", status: "Confirmed" },
  { id: "ORD-1045", customer: "Asim Malik", company: "Malik Electrical Solutions", date: "2026-07-11", items: 15, total: 32400, payment: "COD", status: "Packaging" },
  { id: "ORD-1044", customer: "Tariq Mehmood", company: "TM Engineering", date: "2026-07-10", items: 42, total: 186000, payment: "Paid", status: "Shipped" },
  { id: "ORD-1043", customer: "Bilal Hassan", company: "Hassan Switchgear", date: "2026-07-09", items: 6, total: 15800, payment: "Paid", status: "Delivered" },
  { id: "ORD-1042", customer: "Usman Ghani", company: "UG Panel Builders", date: "2026-07-08", items: 18, total: 67200, payment: "Unpaid", status: "Pending" },
  { id: "ORD-1041", customer: "Fahad Ali Khan", company: "Khan Electrical Store", date: "2026-07-07", items: 3, total: 8900, payment: "Paid", status: "Cancelled" },
  { id: "ORD-1040", customer: "Noman Ansari", company: "Ansari Industrial", date: "2026-07-06", items: 10, total: 45000, payment: "Paid", status: "Return Requested" },
  { id: "ORD-1039", customer: "Zubair Ahmed", company: "ZA Electro Traders", date: "2026-07-05", items: 30, total: 92300, payment: "COD", status: "Pending" },
  { id: "ORD-1038", customer: "Imran Shah", company: "Shah Power Systems", date: "2026-07-04", items: 12, total: 55600, payment: "Paid", status: "Delivered" },
];

const STATUSES: (OrderStatus | "All")[] = ["All", "Pending", "Confirmed", "Packaging", "Shipped", "Delivered", "Cancelled", "Return Requested"];

/* ── Component ─────────────────────────────────────── */

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [search, setSearch] = useState("");

  const filtered = ALL_ORDERS.filter((o) => {
    if (statusFilter !== "All" && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.company.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-5 md:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and fulfill customer orders.</p>
        </div>
        <button className="btn-secondary shrink-0">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="store-card">
        <div className="p-3 border-b border-border flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer, or company..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          {/* Status pills */}
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold">Order #</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Items</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Payment</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((o) => {
                  const cfg = STATUS_CONFIG[o.status];
                  return (
                    <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-semibold text-primary">{o.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground text-xs">{o.customer}</div>
                        <div className="text-[11px] text-muted-foreground">{o.company}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(o.date).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.items}</td>
                      <td className="px-4 py-3 font-semibold">PKR {o.total.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${PAYMENT_COLORS[o.payment]}`}>{o.payment}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                          <cfg.Icon className="w-3 h-3" />
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-xs font-semibold text-primary hover:underline">View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">No orders found</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              No orders match your current filters. Try adjusting your search or status filter.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="p-3 border-t border-border flex flex-col sm:flex-row gap-3 items-center justify-between text-sm text-muted-foreground">
            <div className="text-xs">Showing {filtered.length} of {ALL_ORDERS.length} orders</div>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-border rounded-md hover:bg-secondary text-xs disabled:opacity-50 transition-colors">Prev</button>
              <button className="px-3 py-1 border border-border bg-primary text-primary-foreground rounded-md text-xs">1</button>
              <button className="px-3 py-1 border border-border rounded-md hover:bg-secondary text-xs transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
