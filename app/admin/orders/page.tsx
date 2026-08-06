"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search, Download, Package, Truck, CheckCircle2, Clock,
  XCircle, RotateCcw, ShieldCheck, Inbox, ChevronDown, Eye,
  X, Phone, MapPin, CreditCard, AlertTriangle, Bell
} from "lucide-react";
import { getAdminOrders, updateOrderStatus, type OrderResponse } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";

/* ── Types ──────────────────────────────────────────── */
type OrderStatus =
  | "Pending" | "Confirmed" | "Packaging"
  | "Shipped" | "Delivered" | "Cancelled" | "Return Requested";
type PaymentStatus = "Paid" | "Unpaid" | "COD";

interface OrderProduct {
  slug: string;
  name: string;
  catNo: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  company: string;
  date: string;
  items: number;
  total: number;
  payment: PaymentStatus;
  paymentMethod: string;
  status: OrderStatus;
  phone?: string;
  address?: string;
  city?: string;
  notes?: string;
  cancelledByUser?: boolean;
  products: OrderProduct[];
}

/* ── Config ─────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  OrderStatus,
  { color: string; bg: string; Icon: any; next?: OrderStatus[] }
> = {
  Pending:          { color: "text-amber-600",   bg: "bg-amber-50 border-amber-200",    Icon: Clock,        next: ["Confirmed", "Cancelled"] },
  Confirmed:        { color: "text-blue-600",    bg: "bg-blue-50 border-blue-200",      Icon: CheckCircle2, next: ["Packaging", "Cancelled"] },
  Packaging:        { color: "text-orange-600",  bg: "bg-orange-50 border-orange-200",  Icon: Package,      next: ["Shipped", "Cancelled"] },
  Shipped:          { color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-200",  Icon: Truck,        next: ["Delivered"] },
  Delivered:        { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200",Icon: CheckCircle2, next: ["Return Requested"] },
  Cancelled:        { color: "text-red-600",     bg: "bg-red-50 border-red-200",        Icon: XCircle,      next: [] },
  "Return Requested": { color: "text-purple-600",bg: "bg-purple-50 border-purple-200", Icon: RotateCcw,    next: ["Cancelled"] },
};


/* ── Status vocabulary bridge ──────────────────────────
   The API stores snake_case values ('pending', 'return_requested'); this UI
   labels them in Title Case. Sending a label straight back with .toLowerCase()
   produced invalid values like "return requested", which the backend rejected,
   so status changes silently failed. Always convert through these. */
const STATUS_TO_API: Record<OrderStatus, string> = {
  Pending: "pending",
  Confirmed: "confirmed",
  Packaging: "packaging",
  Shipped: "shipped",
  Delivered: "delivered",
  Cancelled: "cancelled",
  "Return Requested": "return_requested",
};

const API_TO_STATUS: Record<string, OrderStatus> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packaging: "Packaging",
  processing: "Packaging",   // legacy rows
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return Requested",
};

/** API status → the label this page renders. Falls back to Pending. */
function statusLabel(apiStatus: string): OrderStatus {
  return API_TO_STATUS[(apiStatus || "").toLowerCase()] || "Pending";
}

const ALL_STATUS_OPTIONS: OrderStatus[] = [
  "Pending", "Confirmed", "Packaging", "Shipped", "Delivered", "Cancelled", "Return Requested",
];

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  Paid:   "text-emerald-600 bg-emerald-50 border-emerald-200",
  Unpaid: "text-red-600 bg-red-50 border-red-200",
  COD:    "text-amber-600 bg-amber-50 border-amber-200",
};

const STATUSES: (OrderStatus | "All")[] = [
  "All", "Pending", "Confirmed", "Packaging", "Shipped", "Delivered", "Cancelled", "Return Requested",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  // Unfiltered dataset for the status summary cards — computing counts from
  // the filtered list made every card show 0 as soon as any filter was active.
  const [allOrders, setAllOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [actionError, setActionError] = useState("");
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  // Monotonic request id: a slow earlier response must never overwrite a newer one.
  const reqIdRef = useRef(0);

  // Debounce typing — one API call per pause, not per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadOrders = async () => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    try {
      const st = statusFilter === "All" ? undefined : STATUS_TO_API[statusFilter as OrderStatus];
      const res = await getAdminOrders({ search, status: st });
      if (reqId !== reqIdRef.current) return; // stale response — a newer request is in flight
      setOrders(res.results || []);
    } catch (err) {
      console.error("Failed to load admin orders:", err);
    } finally {
      if (reqId === reqIdRef.current) setLoading(false);
    }
  };

  const loadCounts = async () => {
    try {
      const res = await getAdminOrders({});
      setAllOrders(res.results || []);
    } catch {
      /* counts are cosmetic — the table handles its own errors */
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, search]);

  useEffect(() => {
    loadCounts();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedOrder]);

  const handleStatusUpdate = async (orderNumber: string, newStatus: string) => {
    setActionError("");
    try {
      const apiStatus = STATUS_TO_API[newStatus as OrderStatus] || newStatus.toLowerCase();
      const updated = await updateOrderStatus(orderNumber, { status: apiStatus } as any);
      setOrders((prev) => prev.map((o) => (o.order_number === orderNumber ? updated : o)));
      setAllOrders((prev) => prev.map((o) => (o.order_number === orderNumber ? updated : o)));
      if (selectedOrder && selectedOrder.order_number === orderNumber) {
        setSelectedOrder(updated);
      }
      return true;
    } catch (err: any) {
      setActionError(err.message || "Failed to update status");
      return false;
    }
  };

  /**
   * Mark an order as cancelled at the customer's request.
   * This handler was referenced by the detail modal but never defined, so
   * opening any order threw "handleMarkCancelledByUser is not defined" and took
   * the whole page down. Confirmation runs through ConfirmDialog below.
   */
  const handleMarkCancelledByUser = (orderNumber: string) => {
    setPendingCancelId(orderNumber);
  };

  const confirmCancelByUser = async () => {
    if (!pendingCancelId) return;
    setCancelBusy(true);
    const ok = await handleStatusUpdate(pendingCancelId, "Cancelled");
    setCancelBusy(false);
    // On failure keep the dialog closed too — the error banner explains what happened.
    setPendingCancelId(null);
    if (ok) setSelectedOrder(null);
  };

  /** Client-side CSV of the currently visible (filtered) order list. */
  const handleExportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Order #", "Customer", "Company", "Email", "Phone", "Date", "Items", "Total (PKR)", "Payment", "Method", "Status"],
      ...orders.map((o) => [
        o.order_number, o.customer_name, o.company_name || "", o.customer_email || "",
        o.customer_phone || "", new Date(o.created_at).toISOString().slice(0, 10),
        o.items ? o.items.length : 0, Number(o.total) || 0,
        o.payment_status, o.payment_method, statusLabel(o.status),
      ]),
    ];
    const csv = rows.map((r) => r.map(esc).join(",")).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `engmart-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };




/**
 * Adapt an API order into the shape OrderModal renders.
 *
 * The modal was written against a mock `Order` type (customer, company, date,
 * payment, products…) but is handed an `OrderResponse` (customer_name,
 * company_name, created_at, payment_status, items…). Every one of those fields
 * came through undefined, so the detail view rendered blanks and crashed on
 * `order.products.reduce`.
 */
function toModalOrder(o: OrderResponse): Order {
  const paymentStatus: PaymentStatus =
    o.payment_status === "paid"
      ? "Paid"
      : o.payment_method === "cod"
      ? "COD"
      : "Unpaid";

  const methodLabel =
    o.payment_method === "cod"
      ? "Cash on Delivery"
      : o.payment_method === "bank"
      ? "Bank Transfer"
      : o.payment_method === "whatsapp"
      ? "WhatsApp Order"
      : o.payment_method;

  const products: OrderProduct[] = (o.items || []).map((i) => ({
    slug: "",
    name: i.product_name,
    catNo: i.cat_no || "",
    qty: i.quantity,
    price: Number(i.unit_price) || 0,
  }));

  return {
    id: o.order_number,
    customer: o.customer_name || "—",
    company: o.company_name || o.customer_email || "",
    date: o.created_at,
    items: products.reduce((sum, p) => sum + p.qty, 0),
    total: Number(o.total) || 0,
    payment: paymentStatus,
    paymentMethod: methodLabel,
    status: statusLabel(o.status),
    phone: o.customer_phone,
    address: (o as any).shipping_address || "",
    city: (o as any).city || "",
    notes: (o as any).notes || "",
    cancelledByUser: o.status === "cancelled",
    products,
  };
}

/* ── Status Dropdown ────────────────────────────────── */
function StatusDropdown({
  order,
  onUpdate,
}: {
  order: Order;
  onUpdate: (id: string, status: OrderStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = statusLabel((order as any).status);
  const cfg = STATUS_CONFIG[current];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all hover:opacity-80 ${cfg.bg} ${cfg.color}`}
      >
        <cfg.Icon className="w-3 h-3" />
        {current}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-52 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-secondary/30">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Change Status
            </p>
          </div>
          <div className="py-1">
            {ALL_STATUS_OPTIONS.map((status) => {
              const sCfg = STATUS_CONFIG[status];
              const isCurrent = status === current;
              return (
                <button
                  key={status}
                  onClick={() => { onUpdate(order.id, status); setOpen(false); }}
                  disabled={isCurrent}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors text-left ${
                    isCurrent
                      ? "bg-secondary/60 text-muted-foreground cursor-default"
                      : "hover:bg-secondary text-foreground cursor-pointer"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      status === "Pending" ? "bg-amber-500" :
                      status === "Confirmed" ? "bg-blue-500" :
                      status === "Packaging" ? "bg-orange-500" :
                      status === "Shipped" ? "bg-indigo-500" :
                      status === "Delivered" ? "bg-emerald-500" :
                      status === "Cancelled" ? "bg-red-500" : "bg-purple-500"
                    }`}
                  />
                  {status}
                  {isCurrent && (
                    <span className="ml-auto text-[9px] text-muted-foreground">Current</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Order Detail Modal ─────────────────────────────── */
function OrderModal({
  order,
  onClose,
  onUpdate,
  onMarkCancelledByUser,
}: {
  order: Order;
  onClose: () => void;
  onUpdate: (id: string, status: OrderStatus) => void;
  onMarkCancelledByUser: (id: string) => void;
}) {
  const subtotal = order.products.reduce((s, p) => s + p.price * p.qty, 0);
  const codFee = order.paymentMethod === "Cash on Delivery" ? 100 : 0;
  const grandTotal = subtotal + codFee;

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border rounded-t-2xl flex-shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Order {order.id}</h2>
                {order.cancelledByUser && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> Customer Cancelled
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(order.date).toLocaleDateString("en-PK", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto flex-1 overscroll-contain">

            {/* Status + Payment row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Order Status</p>
                <StatusDropdown order={order} onUpdate={onUpdate} />
              </div>
              <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Payment</p>
                <div className="flex flex-col gap-1.5">
                  <span className={`self-start inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${PAYMENT_COLORS[order.payment]}`}>
                    {order.payment}
                  </span>
                  <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> {order.paymentMethod}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer info */}
            <div className="p-4 rounded-xl bg-secondary/20 border border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Customer Information</p>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {order.customer.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{order.customer}</p>
                  <p className="text-xs text-muted-foreground">{order.company}</p>
                  {order.phone && (
                    <p className="text-xs text-primary mt-1.5 flex items-center gap-1 font-semibold">
                      <Phone className="w-3 h-3" /> {order.phone}
                    </p>
                  )}
                  {order.address && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      {order.address}{order.city ? `, ${order.city}` : ""}
                    </p>
                  )}
                </div>
              </div>
              {order.notes && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Order Note</p>
                  <p className="text-xs text-foreground font-medium italic">"{order.notes}"</p>
                </div>
              )}
            </div>

            {/* Order Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Total Items", value: `${order.items} pcs` },
                { label: "Order Total", value: `PKR ${grandTotal.toLocaleString()}` },
                { label: "Order Date", value: new Date(order.date).toLocaleDateString("en-PK", { month: "short", day: "numeric" }) },
              ].map((item, i) => (
                <div key={i} className="bg-secondary/30 rounded-xl p-3 text-center border border-border">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Products list */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Ordered Products ({order.products.length} line items)
              </p>
              <div className="space-y-2 pr-1">
                {order.products.map((p, idx) => {
                  // The order payload carries no product image — show the
                  // neutral placeholder, never a stock photo posing as the item.
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/10">
                      <div className="w-10 h-10 rounded-lg bg-card overflow-hidden flex items-center justify-center border border-border p-1 shrink-0">
                        <img src="/product-placeholder.svg" alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">Cat: {p.catNo}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-black text-foreground">
                          PKR {(p.price * p.qty).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          ×{p.qty} @ {p.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price breakdown */}
              <div className="mt-3 p-3 rounded-xl bg-secondary/20 border border-border space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                  <span>Subtotal</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-xs text-amber-600 font-semibold">
                    <span>Cash on Delivery Fee</span>
                    <span>+ PKR {codFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-foreground pt-1.5 border-t border-border">
                  <span>Grand Total</span>
                  <span className="text-primary">PKR {grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Customer-requested cancellation */}
            {order.status === "Pending" && !order.cancelledByUser && (
              <div className="p-3 rounded-xl bg-red-50/50 border border-red-200/50 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-red-700">Customer asked to cancel?</p>
                  <p className="text-[10px] text-red-500 mt-0.5">Record a cancellation requested by the customer (phone/WhatsApp).</p>
                </div>
                <button
                  onClick={() => onMarkCancelledByUser(order.id)}
                  className="px-3 min-h-10 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Mark Cancelled
                </button>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-border flex justify-between items-center gap-2 flex-shrink-0">
            <div className="text-[10px] text-muted-foreground">
              ID: <span className="font-mono font-bold text-foreground">{order.id}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-secondary text-xs py-2 px-4">Close</button>
            </div>
          </div>
        </div>
      </div>
  );
}

  // Counts always come from the UNFILTERED dataset — otherwise activating any
  // filter zeroed every other card and the numbers looked broken.
  const cancelledCount = allOrders.filter((o) => o.status.toLowerCase() === "cancelled").length;

  const statusCounts = STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = allOrders.filter((o) => statusLabel(o.status) === s).length;
    return acc;
  }, {} as Record<string, number>);



  return (
    <div className="p-5 md:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
            {cancelledCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 border border-red-200 rounded-full">
                <Bell className="w-3.5 h-3.5 text-red-600" />
                <span className="text-[11px] font-black text-red-700">
                  {cancelledCount} Cancelled
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and fulfill customer orders. Click status badge to change.
          </p>
        </div>
        <button onClick={handleExportCsv} disabled={orders.length === 0} className="btn-secondary shrink-0 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Action errors surface here instead of a native alert() */}
      {actionError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{actionError}</span>
          <button onClick={() => setActionError("")} className="p-1 rounded hover:bg-destructive/10" aria-label="Dismiss">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Status summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {(["Pending", "Confirmed", "Packaging", "Shipped", "Delivered", "Cancelled", "Return Requested"] as OrderStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
              className={`store-card p-3 text-center relative ${
                statusFilter === s ? "border-primary/40 bg-primary/5" : ""
              }`}
            >
              <cfg.Icon className={`w-4 h-4 mx-auto mb-1 ${cfg.color}`} />
              <div className={`text-lg font-extrabold ${cfg.color}`}>{statusCounts[s] || 0}</div>
              <div className="text-[9px] text-muted-foreground font-semibold leading-tight mt-0.5">{s}</div>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="store-card">
        {/* Filters */}
        <div className="p-3 border-b border-border flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order #, customer, or company..."
              className="input-base pl-9"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 min-h-9 text-[11px] font-semibold rounded-md transition-colors ${
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
        {loading ? (
          /* Skeleton rows shaped like the real table — no blank flash, no spinner */
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-40 max-w-full" />
                  <div className="skeleton h-2.5 w-28 max-w-full" />
                </div>
                <div className="skeleton h-4 w-16 hidden sm:block" />
                <div className="skeleton h-6 w-24 rounded-md hidden md:block" />
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
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
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary text-xs">{o.order_number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[10px] text-primary flex-shrink-0">
                          {(o.customer_name || "C").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-xs leading-tight">{o.customer_name}</div>
                          <div className="text-[10px] text-muted-foreground">{o.company_name || o.customer_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(o.created_at).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs font-medium">{o.items ? o.items.length : 0} items</td>
                    <td className="px-4 py-3 font-bold text-foreground text-xs">PKR {Number(o.total).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase bg-secondary/80 text-foreground">
                        {o.payment_method} ({o.payment_status})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {/* Editable inline — the admin can advance an order without
                          opening the detail modal, which is what the client asked
                          for (e.g. Pending → Shipped). */}
                      <select
                        value={statusLabel(o.status)}
                        onChange={(e) => handleStatusUpdate(o.order_number, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                          STATUS_CONFIG[statusLabel(o.status)]?.bg || "bg-primary/10 border-primary/20"
                        } ${STATUS_CONFIG[statusLabel(o.status)]?.color || "text-primary"}`}
                        title="Change order status"
                      >
                        {ALL_STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/70 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
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
        {orders.length > 0 && (
          <div className="p-3 border-t border-border flex flex-col sm:flex-row gap-3 items-center justify-between text-sm text-muted-foreground">
            <div className="text-xs">Showing {orders.length} orders</div>
          </div>
        )}

      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderModal
          order={toModalOrder(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleStatusUpdate}
          onMarkCancelledByUser={handleMarkCancelledByUser}
        />
      )}

      {/* Confirm customer-requested cancellation */}
      <ConfirmDialog
        open={pendingCancelId !== null}
        title="Cancel this order?"
        message={`Order ${pendingCancelId ?? ""} will be marked as cancelled at the customer's request. The customer will see the updated status in their account.`}
        confirmLabel="Mark Cancelled"
        busy={cancelBusy}
        onConfirm={confirmCancelByUser}
        onClose={() => setPendingCancelId(null)}
      />
    </div>
  );
}
