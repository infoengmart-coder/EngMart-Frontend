"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search, Download, Package, Truck, CheckCircle2, Clock,
  XCircle, RotateCcw, ShieldCheck, Inbox, ChevronDown, Eye,
  X, Phone, MapPin, CreditCard, AlertTriangle, Bell, ExternalLink,
  Sparkles, Banknote, CheckCheck
} from "lucide-react";
import { getAdminOrders, updateOrderStatus, mediaUrl, type OrderResponse } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { subscribeEngmartEvents, emitEngmartEvent } from "@/lib/events";

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
  image?: string;
}

interface Order {
  id: string;
  customer: string;
  company: string;
  date: string;
  items: number;
  /** Server-stored figures — never re-derived in the UI. */
  subtotal: number;
  discount: number;
  discountCode: string;
  gstPercent: number;
  tax: number;
  codFee: number;
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
  { color: string; bg: string; dot: string; Icon: any; next?: OrderStatus[] }
> = {
  //               pill text color                             pill background + border                                                          dot color        icon   allowed next
  Pending:          { color: "text-amber-900 dark:text-amber-200 font-bold",   bg: "bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700",   dot: "bg-amber-500",   Icon: Clock,       next: ["Confirmed", "Cancelled"] },
  Confirmed:        { color: "text-blue-900 dark:text-blue-200 font-bold",     bg: "bg-blue-100 dark:bg-blue-950/80 border-blue-300 dark:border-blue-700",       dot: "bg-blue-600",     Icon: CheckCircle2, next: ["Packaging", "Cancelled"] },
  Packaging:        { color: "text-indigo-900 dark:text-indigo-200 font-bold", bg: "bg-indigo-100 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700", dot: "bg-indigo-600",   Icon: Package,     next: ["Shipped", "Cancelled"] },
  Shipped:          { color: "text-purple-900 dark:text-purple-200 font-bold", bg: "bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-700", dot: "bg-purple-600",   Icon: Truck,       next: ["Delivered"] },
  Delivered:        { color: "text-emerald-900 dark:text-emerald-200 font-bold", bg: "bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700", dot: "bg-emerald-600", Icon: CheckCheck, next: ["Return Requested"] },
  Cancelled:        { color: "text-rose-900 dark:text-rose-200 font-bold",     bg: "bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700",       dot: "bg-rose-600",     Icon: XCircle,     next: [] },
  "Return Requested": { color: "text-fuchsia-900 dark:text-fuchsia-200 font-bold", bg: "bg-fuchsia-100 dark:bg-fuchsia-950/80 border-fuchsia-300 dark:border-fuchsia-700", dot: "bg-fuchsia-600", Icon: RotateCcw, next: ["Cancelled"] },
};

/* ── Rich Status-Matched Row Themes ── */
const STATUS_ROW_THEMES: Record<OrderStatus, {
  rowBg: string;
  borderLeft: string;
  avatarBg: string;
  iconColor: string;
}> = {
  // Balanced, clean tints that are distinct without being overly dark
  Pending: {
    // 🟡 Warm Amber / Gold
    rowBg: "bg-amber-100/50 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/60",
    borderLeft: "border-l-[6px] border-l-amber-500",
    avatarBg: "bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100 border-amber-300 dark:border-amber-600",
    iconColor: "text-amber-700 dark:text-amber-400",
  },
  Confirmed: {
    // 🔵 Royal Blue
    rowBg: "bg-blue-100/50 dark:bg-blue-950/40 hover:bg-blue-100/80 dark:hover:bg-blue-900/60",
    borderLeft: "border-l-[6px] border-l-blue-600",
    avatarBg: "bg-blue-200 dark:bg-blue-800 text-blue-950 dark:text-blue-100 border-blue-300 dark:border-blue-600",
    iconColor: "text-blue-700 dark:text-blue-400",
  },
  Packaging: {
    // 📦 Deep Indigo
    rowBg: "bg-indigo-100/50 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60",
    borderLeft: "border-l-[6px] border-l-indigo-600",
    avatarBg: "bg-indigo-200 dark:bg-indigo-800 text-indigo-950 dark:text-indigo-100 border-indigo-300 dark:border-indigo-600",
    iconColor: "text-indigo-700 dark:text-indigo-400",
  },
  Shipped: {
    // 🚚 Purple / Violet
    rowBg: "bg-purple-100/50 dark:bg-purple-950/40 hover:bg-purple-100/80 dark:hover:bg-purple-900/60",
    borderLeft: "border-l-[6px] border-l-purple-600",
    avatarBg: "bg-purple-200 dark:bg-purple-800 text-purple-950 dark:text-purple-100 border-purple-300 dark:border-purple-600",
    iconColor: "text-purple-700 dark:text-purple-400",
  },
  Delivered: {
    // 🟢 Emerald Green
    rowBg: "bg-emerald-100/50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60",
    borderLeft: "border-l-[6px] border-l-emerald-600",
    avatarBg: "bg-emerald-200 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100 border-emerald-300 dark:border-emerald-600",
    iconColor: "text-emerald-700 dark:text-emerald-400",
  },
  Cancelled: {
    // 🔴 Rose / Red
    rowBg: "bg-rose-100/50 dark:bg-rose-950/40 hover:bg-rose-100/80 dark:hover:bg-rose-900/60",
    borderLeft: "border-l-[6px] border-l-rose-600",
    avatarBg: "bg-rose-200 dark:bg-rose-800 text-rose-950 dark:text-rose-100 border-rose-300 dark:border-rose-600",
    iconColor: "text-rose-700 dark:text-rose-400",
  },
  "Return Requested": {
    // 🌸 Fuchsia / Magenta Pink
    rowBg: "bg-fuchsia-100/50 dark:bg-fuchsia-950/40 hover:bg-fuchsia-100/80 dark:hover:bg-fuchsia-900/60",
    borderLeft: "border-l-[6px] border-l-fuchsia-600",
    avatarBg: "bg-fuchsia-200 dark:bg-fuchsia-800 text-fuchsia-950 dark:text-fuchsia-100 border-fuchsia-300 dark:border-fuchsia-600",
    iconColor: "text-fuchsia-700 dark:text-fuchsia-400",
  },
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
  Paid: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Unpaid: "text-red-600 bg-red-50 border-red-200",
  COD: "text-amber-600 bg-amber-50 border-amber-200",
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
  // Track seen/viewed orders in localStorage so new orders have a pulsing "NEW" badge
  const [seenOrders, setSeenOrders] = useState<Set<string>>(new Set());
  // Monotonic request id: a slow earlier response must never overwrite a newer one.
  const reqIdRef = useRef(0);

  const SEEN_STORAGE_KEY = "engmart_admin_seen_orders";

  // Load seen orders from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SEEN_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSeenOrders(new Set(parsed));
        }
      }
    } catch {}
  }, []);

  const markAsSeen = (orderNumber: string) => {
    setSeenOrders((prev) => {
      if (prev.has(orderNumber)) return prev;
      const next = new Set(prev);
      next.add(orderNumber);
      try {
        localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const markAllAsSeen = () => {
    const allNums = allOrders.map((o) => o.order_number);
    const next = new Set([...Array.from(seenOrders), ...allNums]);
    setSeenOrders(next);
    try {
      localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch {}
  };

  const handleOpenOrderModal = (order: OrderResponse) => {
    markAsSeen(order.order_number);
    setSelectedOrder(order);
  };

  // Debounce typing — one API call per pause, not per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadOrders = async (showSkeleton = true) => {
    const reqId = ++reqIdRef.current;
    if (showSkeleton) setLoading(true);
    try {
      const st = statusFilter === "All" ? undefined : STATUS_TO_API[statusFilter as OrderStatus];
      const res = await getAdminOrders({ search, status: st });
      if (reqId !== reqIdRef.current) return;
      setOrders(res.results || []);
    } catch (err) {
      console.error("Failed to load admin orders:", err);
    } finally {
      if (reqId === reqIdRef.current && showSkeleton) setLoading(false);
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
    loadOrders(true);
    loadCounts();

    return subscribeEngmartEvents((type: string) => {
      // Smooth background sync without flashing skeletons or reloading table
      if (type === "ORDER_UPDATED") {
        loadCounts();
      } else if (type === "ORDER_CREATED") {
        loadOrders(false);
        loadCounts();
      }
    });
  }, [statusFilter, search]);

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
      // Instant in-place update — NO event emitted to avoid triggering reload
      setOrders((prev) =>
        prev.map((o) => (o.order_number === orderNumber ? { ...o, ...updated, status: apiStatus } : o))
      );
      setAllOrders((prev) =>
        prev.map((o) => (o.order_number === orderNumber ? { ...o, ...updated, status: apiStatus } : o))
      );
      if (selectedOrder && selectedOrder.order_number === orderNumber) {
        setSelectedOrder((prev) => (prev ? { ...prev, ...updated, status: apiStatus } : null));
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
      ...orders.map((o) => {
        const isCod = o.payment_method === "cod";
        const totalNum = Number(o.total) || 0;
        return [
          o.order_number, o.customer_name, o.company_name || "", o.customer_email || "",
          o.customer_phone || "", new Date(o.created_at).toISOString().slice(0, 10),
          o.items ? o.items.length : 0, totalNum,
          o.payment_status, o.payment_method, statusLabel(o.status),
        ];
      }),
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
      slug: i.product_slug || "",
      name: i.product_name,
      catNo: i.cat_no || "",
      qty: i.quantity,
      price: Number(i.unit_price) || 0,
      image: i.product_image || undefined,
    }));

    return {
      id: o.order_number,
      customer: o.customer_name || "—",
      company: o.company_name || o.customer_email || "",
      date: o.created_at,
      items: products.reduce((sum, p) => sum + p.qty, 0),
      subtotal: Number(o.subtotal) || 0,
      discount: Number(o.discount_amount) || 0,
      discountCode: o.promo_code_text || "",
      gstPercent: Number(o.gst_percent) || 0,
      tax: Number(o.tax_amount) || 0,
      codFee: Number(o.cod_fee) || 0,
      // The stored total already includes GST and any COD charge — the server
      // computes both. This used to add a phantom 100 the backend never charged.
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

  /* ── Table & Modal Status Dropdown ──────────────────── */
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
    const cfg = STATUS_CONFIG[current] || STATUS_CONFIG["Pending"];

    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      };
      if (open) {
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
      }
    }, [open]);

    return (
      <div ref={ref} className="relative inline-block">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all hover:opacity-80 cursor-pointer ${cfg.bg} ${cfg.color}`}
        >
          <cfg.Icon className="w-3 h-3" />
          {current}
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1.5 w-52 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden py-1">
            <div className="px-3 py-1.5 border-b border-border/50 bg-secondary/30">
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
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onUpdate(order.id, status);
                      setOpen(false);
                    }}
                    disabled={isCurrent}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors text-left ${isCurrent
                        ? `${sCfg.bg} ${sCfg.color} font-bold cursor-default`
                        : "hover:bg-secondary text-foreground cursor-pointer"
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sCfg.dot}`} />
                      {status}
                    </span>
                    {isCurrent && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Table Status Dropdown ──────────────────────────── */
  function TableStatusDropdown({
    orderNumber,
    currentStatus,
    onUpdate,
  }: {
    orderNumber: string;
    currentStatus: OrderStatus;
    onUpdate: (orderNumber: string, status: string) => Promise<boolean>;
  }) {
    const [open, setOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG["Pending"];
    const Icon = cfg.Icon;

    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      if (open) {
        document.addEventListener("mousedown", handleClick);
        // Detect if dropdown would overflow viewport bottom — open upward if so
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const spaceBelow = window.innerHeight - rect.bottom;
          setDropUp(spaceBelow < 260);
        }
        return () => document.removeEventListener("mousedown", handleClick);
      }
    }, [open]);

    const handleSelect = async (newStatus: string) => {
      if (newStatus === currentStatus) {
        setOpen(false);
        return;
      }
      setUpdating(true);
      setOpen(false);
      await onUpdate(orderNumber, newStatus);
      setUpdating(false);
    };

    return (
      <div ref={ref} className="relative inline-block text-left">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!open);
          }}
          disabled={updating}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border transition-all duration-150 shadow-xs hover:shadow-sm cursor-pointer select-none ${cfg.bg} ${cfg.color} ${open ? "ring-2 ring-primary/40 scale-[0.98]" : "hover:brightness-95"
            }`}
        >
          <Icon className={`w-3.5 h-3.5 shrink-0 ${updating ? "animate-spin" : ""}`} />
          <span>{currentStatus}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 opacity-70 ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div
            className={`absolute left-0 w-52 rounded-2xl bg-card border border-border shadow-2xl z-[200] py-1.5 animate-in fade-in zoom-in-95 duration-150 ${
              dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1.5 border-b border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Change Status
            </div>
            <div className="py-1">
              {ALL_STATUS_OPTIONS.map((st) => {
                const sCfg = STATUS_CONFIG[st];
                const isSelected = st === currentStatus;
                return (
                  <button
                    key={st}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(st);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all text-left cursor-pointer ${
                      isSelected
                        ? `${sCfg.bg} ${sCfg.color} font-black`
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${sCfg.dot}`} />
                      <span>{st}</span>
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
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
    // Straight from the order row, so admin sees exactly what was charged.
    const subtotal = order.subtotal || order.products.reduce((s, p) => s + p.price * p.qty, 0);
    const { discount, discountCode, gstPercent, tax, codFee } = order;
    const grandTotal = order.total;
    const statusCfg = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG["Pending"];

    return (
      <div
        className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="relative bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

          {/* ── Gradient Header ── */}
          <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border px-6 py-5 flex-shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-[11px] font-black px-3 py-1 rounded-full font-mono tracking-wide">
                    <Package className="w-3 h-3" />
                    {order.id}
                  </span>
                  {order.cancelledByUser && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 border border-red-200/80 px-2.5 py-1 rounded-full animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> Customer Cancelled
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {new Date(order.date).toLocaleDateString("en-PK", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status + Payment quick row */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <StatusDropdown order={order} onUpdate={onUpdate} />
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${PAYMENT_COLORS[order.payment]}`}>
                <CreditCard className="w-3 h-3" />
                {order.payment} · {order.paymentMethod}
              </span>
            </div>
          </div>

          {/* ── Scrollable Body ── */}
          <div
            className="flex-1 min-h-0 overflow-y-scroll p-5 space-y-4"
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Customer Card */}
            <div className="rounded-2xl border border-border bg-gradient-to-br from-secondary/30 to-secondary/10 p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">👤 Customer</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md">
                  {order.customer.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-foreground leading-tight">{order.customer}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{order.company}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                    {order.phone && (
                      <span className="text-[11px] text-primary font-semibold flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {order.phone}
                      </span>
                    )}
                    {order.address && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {order.address}{order.city ? `, ${order.city}` : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {order.notes && (
                <div className="mt-3 pt-3 border-t border-border/60">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">📝 Order Note</p>
                  <p className="text-xs text-foreground font-medium italic bg-amber-50/60 border border-amber-100 rounded-lg px-3 py-2">"{order.notes}"</p>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "📦", label: "Items", value: `${order.items} pcs`, color: "from-blue-50 to-blue-50/30 border-blue-100" },
                { icon: "💰", label: "Grand Total", value: `PKR ${grandTotal.toLocaleString()}`, color: "from-emerald-50 to-emerald-50/30 border-emerald-100" },
                { icon: "📅", label: "Date", value: new Date(order.date).toLocaleDateString("en-PK", { month: "short", day: "numeric" }), color: "from-violet-50 to-violet-50/30 border-violet-100" },
              ].map((stat, i) => (
                <div key={i} className={`rounded-2xl border bg-gradient-to-br ${stat.color} p-3 text-center`}>
                  <span className="text-lg leading-none">{stat.icon}</span>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mt-1">{stat.label}</p>
                  <p className="text-sm font-black text-foreground mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Products */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                🛒 Ordered Products <span className="ml-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black">{order.products.length}</span>
              </p>
              <div className="space-y-2.5">
                {order.products.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-3.5 p-3 rounded-2xl border border-border bg-gradient-to-r from-secondary/30 via-secondary/15 to-transparent hover:border-primary/30 transition-all">
                    {/* Product Image Thumbnail */}
                    <div className="relative w-12 h-12 rounded-xl border border-border bg-card overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                      {p.image ? (
                        <img
                          src={mediaUrl(p.image)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex flex-col items-center justify-center text-primary">
                          <Package className="w-5 h-5 opacity-70" />
                        </div>
                      )}
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-black bg-black/70 text-white px-1 rounded-sm leading-tight">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      {p.slug ? (
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="text-xs font-bold text-foreground hover:text-primary transition-colors truncate flex items-center gap-1 group"
                          title="Open product page in new tab"
                        >
                          <span className="truncate">{p.name}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity text-primary" />
                        </Link>
                      ) : (
                        <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {p.catNo && (
                          <span className="text-[10px] text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded border border-border/50">
                            Cat: {p.catNo}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          Qty: <strong className="text-foreground">{p.qty}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-foreground">PKR {(p.price * p.qty).toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">@ PKR {p.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="mt-3 rounded-2xl border border-border overflow-hidden">
                <div className="px-4 py-2.5 bg-secondary/20 flex justify-between text-xs text-muted-foreground font-semibold">
                  <span>Subtotal</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="px-4 py-2.5 bg-emerald-50/60 border-t border-emerald-100/80 flex justify-between text-xs text-emerald-700 font-bold">
                    <span className="flex items-center gap-1.5">
                      🏷 Discount{discountCode ? ` (${discountCode})` : ""}
                    </span>
                    <span>− PKR {discount.toLocaleString()}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="px-4 py-2.5 bg-secondary/20 border-t border-border flex justify-between text-xs text-muted-foreground font-bold">
                    <span className="flex items-center gap-1.5">
                      🧾 GST{gstPercent ? ` (${gstPercent}%)` : ""}
                    </span>
                    <span>+ PKR {tax.toLocaleString()}</span>
                  </div>
                )}
                {codFee > 0 && (
                  <div className="px-4 py-2.5 bg-amber-50/60 border-t border-amber-100/80 flex justify-between text-xs text-amber-700 font-bold">
                    <span className="flex items-center gap-1.5">💵 Cash on Delivery Fee</span>
                    <span>+ PKR {codFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="px-4 py-3 bg-primary/5 border-t border-primary/10 flex justify-between items-center">
                  <span className="text-sm font-extrabold text-foreground">Grand Total</span>
                  <span className="text-base font-black text-primary">PKR {grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Cancellation action */}
            {order.status === "Pending" && !order.cancelledByUser && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-50/40 border border-red-200/60 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-red-700">Customer asked to cancel?</p>
                  <p className="text-[10px] text-red-500 mt-0.5">Record a cancellation requested by the customer (phone/WhatsApp).</p>
                </div>
                <button
                  onClick={() => onMarkCancelledByUser(order.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
                >
                  Mark Cancelled
                </button>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-4 border-t border-border bg-secondary/20 flex justify-between items-center gap-2 flex-shrink-0">
            <div className="text-[10px] text-muted-foreground font-mono">
              <span className="font-semibold text-foreground">{order.id}</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-card border border-border hover:bg-secondary text-foreground text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
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
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Orders</h1>
            {(() => {
              const unreadCount = allOrders.filter((o) => !seenOrders.has(o.order_number)).length;
              if (unreadCount === 0) return null;
              return (
                <button
                  onClick={markAllAsSeen}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full text-xs font-black shadow-xs transition-all animate-pulse cursor-pointer"
                  title="Click to mark all orders as seen"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{unreadCount} New {unreadCount === 1 ? "Order" : "Orders"}</span>
                  <span className="opacity-80 text-[10px] font-medium hidden sm:inline">· Mark all read</span>
                </button>
              );
            })()}
            {cancelledCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 rounded-full">
                <Bell className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span className="text-[11px] font-black text-red-700 dark:text-red-300">
                  {cancelledCount} Cancelled
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and fulfill customer orders. Real-time synced with live storefront.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => { loadOrders(); loadCounts(); }} className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer">
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={handleExportCsv} disabled={orders.length === 0} className="btn-secondary shrink-0 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
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
              className={`store-card p-3 text-center relative ${statusFilter === s ? "border-primary/40 bg-primary/5 shadow-xs" : ""
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
      <div className="store-card overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="p-3 border-b border-border flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-secondary/15">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order #, customer, or company..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-card text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 min-h-9 text-[11px] font-semibold rounded-md transition-colors ${statusFilter === s
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
          <div className="overflow-x-auto min-h-[360px] pb-10">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase bg-secondary/40 border-b border-border">
                  <th className="px-4 py-3 text-left font-bold">Order #</th>
                  <th className="px-4 py-3 text-left font-bold">Customer</th>
                  <th className="px-4 py-3 text-left font-bold">Date</th>
                  <th className="px-4 py-3 text-left font-bold">Items</th>
                  <th className="px-4 py-3 text-left font-bold">Total</th>
                  <th className="px-4 py-3 text-left font-bold">Payment</th>
                  <th className="px-4 py-3 text-left font-bold">Status</th>
                  <th className="px-4 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => {
                  const currentSt = statusLabel(o.status);
                  const theme = STATUS_ROW_THEMES[currentSt] || STATUS_ROW_THEMES.Pending;
                  const isNew = !seenOrders.has(o.order_number);
                  const isCod = o.payment_method === "cod";
                  const displayTotal = Number(o.total) || 0;
                  const rowTax = Number(o.tax_amount) || 0;
                  const rowCodFee = Number(o.cod_fee) || 0;
                  const rowGst = Number(o.gst_percent) || 0;
                  const initials = (o.customer_name || "C").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

                  return (
                    <tr
                      key={o.id}
                      onClick={() => handleOpenOrderModal(o)}
                      className={`group transition-all duration-150 cursor-pointer ${theme.rowBg} ${theme.borderLeft} ${isNew ? 'ring-1 ring-emerald-500/30' : ''}`}
                    >
                      {/* Order Number + New Badge */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                            {o.order_number}
                          </span>
                          {isNew && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black tracking-wide uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs animate-pulse shrink-0">
                              <Sparkles className="w-2.5 h-2.5" /> NEW
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-black text-[10px] shrink-0 transition-transform group-hover:scale-105 ${theme.avatarBg}`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-foreground text-xs leading-tight truncate">{o.customer_name}</div>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">{o.company_name || o.customer_email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-muted-foreground text-xs font-medium">
                        {new Date(o.created_at).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3.5 text-muted-foreground text-xs font-semibold">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/80 font-mono text-[11px]">
                          <Package className="w-3 h-3 text-muted-foreground" />
                          {o.items ? o.items.length : 0} {o.items?.length === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3.5">
                        <div>
                          <span className="font-extrabold text-foreground text-xs">PKR {displayTotal.toLocaleString()}</span>
                          {/* The total already includes these; the note just
                              says what is inside it. The old "+100 COD" was a
                              hardcoded guess at a fee the server never charged. */}
                          {(rowTax > 0 || rowCodFee > 0) && (
                            <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-bold leading-tight">
                              {[
                                rowTax > 0 ? `incl. GST${rowGst ? ` ${rowGst}%` : ""}` : null,
                                rowCodFee > 0 ? `+${rowCodFee.toLocaleString()} COD` : null,
                              ].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3.5">
                        {isCod ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60">
                            <Banknote className="w-3 h-3 text-amber-500 shrink-0" />
                            COD ({o.payment_status})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60">
                            <CreditCard className="w-3 h-3 text-blue-500 shrink-0" />
                            {o.payment_method} ({o.payment_status})
                          </span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <TableStatusDropdown
                          orderNumber={o.order_number}
                          currentStatus={currentSt}
                          onUpdate={handleStatusUpdate}
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenOrderModal(o);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
          <div className="p-3 border-t border-border flex flex-col sm:flex-row gap-3 items-center justify-between text-sm text-muted-foreground bg-secondary/10">
            <div className="text-xs font-medium">Showing {orders.length} {orders.length === 1 ? 'order' : 'orders'}</div>
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
