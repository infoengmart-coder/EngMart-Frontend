"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  MessageSquare,
  FileText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Package,
  ExternalLink,
  Users,
  DollarSign,
  CalendarDays,
  BarChart2
} from "lucide-react";

/* ── Top Level Stats ───────────────────────────────── */
const topStats = [
  {
    label: "Total Revenue",
    value: "PKR 4.2M",
    change: "+12.5%",
    trend: "up",
    Icon: DollarSign,
  },
  {
    label: "This Month's Revenue",
    value: "PKR 850K",
    change: "+5.2%",
    trend: "up",
    Icon: CalendarDays,
  },
  {
    label: "Total Customers",
    value: "1,245",
    change: "+18",
    trend: "up",
    Icon: Users,
  },
  {
    label: "Total Products",
    value: "450",
    change: "12 Low Stock",
    trend: "down",
    Icon: Package,
  }
];

/* ── Needs Attention Cards ─────────────────────────── */

const attentionItems = [
  {
    label: "Low Stock Items",
    count: 3,
    href: "/admin/products?filter=low-stock",
    color: "border-l-destructive",
    iconBg: "bg-destructive/10 text-destructive",
    Icon: AlertTriangle,
  },
  {
    label: "Pending Orders",
    count: 7,
    href: "/admin/orders?status=pending",
    color: "border-l-[var(--color-warning)]",
    iconBg: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)]",
    Icon: Clock,
  },
  {
    label: "Unread Queries",
    count: 4,
    href: "/admin/queries?status=new",
    color: "border-l-primary",
    iconBg: "bg-primary/10 text-primary",
    Icon: MessageSquare,
  },
  {
    label: "Quote Requests",
    count: 2,
    href: "/admin/quotations?status=pending",
    color: "border-l-[var(--color-success)]",
    iconBg: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]",
    Icon: FileText,
  },
];

/* ── Chart Data ────────────────────────────────────── */

type RangeKey = "7d" | "30d" | "3mo" | "12mo";

const chartDatasets: Record<RangeKey, { label: string; value: number }[]> = {
  "7d": [
    { label: "Mon", value: 18500 },
    { label: "Tue", value: 24200 },
    { label: "Wed", value: 15800 },
    { label: "Thu", value: 32100 },
    { label: "Fri", value: 28700 },
    { label: "Sat", value: 41200 },
    { label: "Sun", value: 8900 },
  ],
  "30d": [
    { label: "Week 1", value: 145000 },
    { label: "Week 2", value: 198000 },
    { label: "Week 3", value: 167000 },
    { label: "Week 4", value: 224000 },
  ],
  "3mo": [
    { label: "May", value: 485000 },
    { label: "Jun", value: 612000 },
    { label: "Jul", value: 534000 },
  ],
  "12mo": [
    { label: "Aug", value: 320000 },
    { label: "Sep", value: 410000 },
    { label: "Oct", value: 385000 },
    { label: "Nov", value: 520000 },
    { label: "Dec", value: 680000 },
    { label: "Jan", value: 445000 },
    { label: "Feb", value: 390000 },
    { label: "Mar", value: 510000 },
    { label: "Apr", value: 470000 },
    { label: "May", value: 485000 },
    { label: "Jun", value: 612000 },
    { label: "Jul", value: 534000 },
  ],
};

/* ── Recent Orders ─────────────────────────────────── */

const recentOrders = [
  { id: "ORD-1047", customer: "Engr. Kamran Ahmed", company: "KA Electrical Works", items: 24, total: 48600, status: "Pending", date: "Jul 12" },
  { id: "ORD-1046", customer: "M. Rashid Siddiqui", company: "National Industrial Corp", items: 8, total: 124500, status: "Confirmed", date: "Jul 11" },
  { id: "ORD-1045", customer: "Asim Malik", company: "Malik Electrical Solutions", items: 15, total: 32400, status: "Packaging", date: "Jul 11" },
  { id: "ORD-1044", customer: "Tariq Mehmood", company: "TM Engineering", items: 42, total: 186000, status: "Shipped", date: "Jul 10" },
  { id: "ORD-1043", customer: "Bilal Hassan", company: "Hassan Switchgear", items: 6, total: 15800, status: "Delivered", date: "Jul 9" },
];

const statusColors: Record<string, string> = {
  Pending: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]",
  Confirmed: "bg-primary/10 text-primary border-primary/20",
  Packaging: "bg-[color-mix(in_srgb,var(--color-orange)_12%,transparent)] text-[var(--color-orange)] border-[color-mix(in_srgb,var(--color-orange)_25%,transparent)]",
  Shipped: "bg-[color-mix(in_srgb,#6366f1_12%,transparent)] text-[#6366f1] border-[color-mix(in_srgb,#6366f1_25%,transparent)]",
  Delivered: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]",
};

/* ── Low Stock Alerts ──────────────────────────────── */

const lowStockItems = [
  { name: "ABB SH201 MCB", catNo: "SH201-C16", stock: 4, threshold: 10 },
  { name: "FICO ELC Current Transformer", catNo: "ELC-60", stock: 2, threshold: 8 },
  { name: "Tense DJA-96 Ammeter", catNo: "DJA-96", stock: 1, threshold: 5 },
];

/* ── Top Selling ───────────────────────────────────── */

const topSelling = [
  { name: "CHINT NXB-63 MCB", units: 342 },
  { name: "Himel HDM3 MCCB", units: 128 },
  { name: "ABB AX-Series Contactor", units: 96 },
  { name: "PCE Industrial Socket", units: 84 },
  { name: "Kondas ZNPP Capacitor", units: 67 },
];

/* ── Component ─────────────────────────────────────── */

export default function AdminDashboard() {
  const [range, setRange] = useState<RangeKey>("30d");
  const data = chartDatasets[range];
  const maxVal = Math.max(...data.map((d) => d.value));

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {greeting}, Admin
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
      </div>

      {/* Top Level Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((stat, idx) => (
          <div key={idx} className="store-card p-5 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
              <stat.Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-2xl font-bold text-foreground mt-3">{stat.value}</div>
            <div className="mt-2 flex items-center gap-1">
              {stat.trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-[var(--color-success)]" />
              ) : (
                <TrendingDown className="w-3 h-3 text-destructive" />
              )}
              <span
                className={`text-[11px] font-semibold ${
                  stat.trend === "up" ? "text-[var(--color-success)]" : "text-destructive"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Needs Attention Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {attentionItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`store-card border-l-4 ${item.color} p-4 flex items-center gap-3 group`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}>
              <item.Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-bold text-foreground leading-none">{item.count}</div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">{item.label}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
        ))}
      </div>

      {/* Flowcharts & Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Revenue Chart (2/3 width) */}
        <div className="store-card p-5 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-base font-bold text-foreground">Revenue Overview</h2>
            <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
              {(["7d", "30d", "3mo", "12mo"] as RangeKey[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    range === r
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-[220px] flex items-end gap-1 sm:gap-2 justify-between border-b border-border pb-2 relative">
            {/* Y-axis hints */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none text-[10px] text-muted-foreground font-medium -ml-1 hidden sm:flex">
              <span>PKR {(maxVal / 1000).toFixed(0)}k</span>
              <span>PKR {(maxVal / 2000).toFixed(0)}k</span>
              <span>0</span>
            </div>
            {data.map((d, i) => {
              const pct = (d.value / maxVal) * 100;
              return (
                <div
                  key={`${range}-${i}`}
                  className="flex flex-col items-center flex-1 gap-2 group cursor-pointer h-full justify-end"
                >
                  <div className="w-full max-w-[48px] relative flex items-end justify-center h-full">
                    <div
                      className="w-full bg-primary/80 rounded-t transition-all duration-500 ease-out group-hover:bg-primary relative"
                      style={{ height: `${pct}%`, minHeight: "4px" }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        PKR {(d.value / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium truncate max-w-full">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Status Distribution Flowchart (1/3 width) */}
        <div className="store-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
             <h2 className="text-base font-bold text-foreground">Product Status Flow</h2>
             <BarChart2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Active (In Stock)</span>
                <span className="font-bold">75%</span>
              </div>
              <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-success)] rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Low Stock</span>
                <span className="font-bold">15%</span>
              </div>
              <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-warning)] rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Out of Stock / Draft</span>
                <span className="font-bold">10%</span>
              </div>
              <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-destructive rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Recent Orders + Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Orders — 2/3 */}
        <div className="lg:col-span-2 store-card flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-base font-bold text-foreground">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
            >
              View All <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Items</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-primary">{o.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground text-xs">{o.customer}</div>
                      <div className="text-muted-foreground text-[11px]">{o.company}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{o.items}</td>
                    <td className="px-4 py-3 font-semibold">PKR {o.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          statusColors[o.status] || ""
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Widgets — 1/3 */}
        <div className="space-y-5">
          {/* Low Stock Alerts */}
          <div className="store-card">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Low Stock
              </h3>
              <Link
                href="/admin/products?filter=low-stock"
                className="text-[10px] font-semibold text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-border">
              {lowStockItems.map((p) => (
                <div key={p.catNo} className="px-4 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{p.catNo}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-destructive">{p.stock}</span>
                    <span className="text-[10px] text-muted-foreground"> / {p.threshold}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling */}
          <div className="store-card">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                Top Selling (This Month)
              </h3>
            </div>
            <div className="divide-y divide-border">
              {topSelling.map((p, i) => (
                <div key={p.name} className="px-4 py-2.5 flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5 text-center shrink-0">
                    #{i + 1}
                  </span>
                  <span className="text-xs font-medium text-foreground truncate flex-1">{p.name}</span>
                  <span className="text-xs text-muted-foreground font-semibold shrink-0">
                    {p.units} sold
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
