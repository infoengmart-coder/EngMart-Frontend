"use client";

import { useState, useEffect } from "react";
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
import { getAdminStats, AdminStatsResponse } from "@/lib/api";

type RangeKey = "7d" | "30d" | "3mo" | "12mo";

const statusColors: Record<string, string> = {
  pending: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  processing: "bg-[color-mix(in_srgb,var(--color-orange)_12%,transparent)] text-[var(--color-orange)] border-[color-mix(in_srgb,var(--color-orange)_25%,transparent)]",
  shipped: "bg-[color-mix(in_srgb,#6366f1_12%,transparent)] text-[#6366f1] border-[color-mix(in_srgb,#6366f1_25%,transparent)]",
  delivered: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AdminDashboard() {

  const [range, setRange] = useState<RangeKey>("30d");
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res))
      .catch((err) => console.error("Failed to load admin stats", err))
      .finally(() => setLoading(false));
  }, []);

  // Real revenue chart data only — an empty array renders an honest empty
  // state, never a fake "No data" bar pretending to be a chart.
  const data = stats?.revenue_chart || [];
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // No invented "+12.5%" trends: the stats API has no period-over-period data,
  // so the chips carry honest descriptors instead of fabricated growth numbers.
  const topStats = [
    {
      label: "Total Revenue",
      value: stats ? `PKR ${stats.total_revenue.toLocaleString()}` : "PKR 0",
      change: "All-time",
      Icon: DollarSign,
    },
    {
      label: "This Month's Revenue",
      value: stats ? `PKR ${stats.monthly_revenue.toLocaleString()}` : "PKR 0",
      change: "Current month",
      Icon: CalendarDays,
    },
    {
      label: "Total Customers",
      value: stats ? stats.total_customers.toLocaleString() : "0",
      change: "Registered buyers",
      Icon: Users,
    },
    {
      label: "Total Products",
      value: stats ? stats.total_products.toLocaleString() : "0",
      change: "Active catalog",
      Icon: Package,
    }
  ];

  const attentionItems = [
    {
      label: "Pending Orders",
      count: stats ? stats.pending_orders : 0,
      href: "/admin/orders?status=pending",
      color: "border-l-[var(--color-warning)]",
      iconBg: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)]",
      Icon: Clock,
    },
    {
      label: "New Inquiries",
      count: stats ? stats.new_inquiries : 0,
      href: "/admin/queries?status=new",
      color: "border-l-primary",
      iconBg: "bg-primary/10 text-primary",
      Icon: MessageSquare,
    },
    {
      label: "Total Orders",
      count: stats ? stats.total_orders : 0,
      href: "/admin/orders",
      color: "border-l-[var(--color-success)]",
      iconBg: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]",
      Icon: FileText,
    },
    {
      label: "Total Inquiries",
      count: stats ? stats.total_inquiries : 0,
      href: "/admin/queries",
      color: "border-l-indigo-500",
      iconBg: "bg-indigo-500/10 text-indigo-500",
      Icon: AlertTriangle,
    },
  ];


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
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border shadow-sm p-5">
                <div className="skeleton h-3.5 w-24 mb-4" />
                <div className="skeleton h-7 w-32 mb-3" />
                <div className="skeleton h-3 w-20" />
              </div>
            ))
          : topStats.map((stat, idx) => (
              <div key={idx} className="bg-card rounded-xl border border-border shadow-sm p-5 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
                  <stat.Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-2xl font-bold text-foreground mt-3">{stat.value}</div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
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
            className={`bg-card rounded-xl border border-border shadow-sm border-l-4 ${item.color} p-4 flex items-center gap-3 group`}
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
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-base font-bold text-foreground">Revenue Overview</h2>
            {/* Range selector removed: the stats API has no per-period series to
                drive it, so the buttons changed nothing — reinstate when the
                backend exposes revenue_chart with ranges. */}
          </div>

          {/* Bar Chart */}
          <div className="h-[220px] flex items-end gap-1 sm:gap-2 justify-between border-b border-border pb-2 relative">
            {data.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2">
                <BarChart2 className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground max-w-[220px]">
                  Revenue trends will appear here once the reporting endpoint provides period data.
                </p>
              </div>
            )}
            {/* Y-axis hints */}
            {data.length > 0 && (
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none text-[10px] text-muted-foreground font-medium -ml-1 hidden sm:flex">
              <span>PKR {(maxVal / 1000).toFixed(0)}k</span>
              <span>PKR {(maxVal / 2000).toFixed(0)}k</span>
              <span>0</span>
            </div>
            )}
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
        {/* Real counts from the stats API — the previous 75/15/10 "stock" bars
            were invented (no stock tracking exists in this store). */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
             <h2 className="text-base font-bold text-foreground">Store Snapshot</h2>
             <BarChart2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 flex flex-col justify-center gap-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Pending Orders</span>
                <span className="font-bold text-[var(--color-warning)]">{stats?.pending_orders ?? 0}</span>
              </div>
              <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-warning)] rounded-full"
                  style={{ width: `${stats?.total_orders ? Math.min(100, (stats.pending_orders / stats.total_orders) * 100) : 0}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-muted-foreground">of {stats?.total_orders ?? 0} total orders</p>
            </div>
            <div className="flex justify-between text-sm py-2 border-t border-border">
              <span className="font-medium">New Inquiries</span>
              <span className="font-bold text-primary">{stats?.new_inquiries ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-t border-border">
              <span className="font-medium">Total Inquiries</span>
              <span className="font-bold text-foreground">{stats?.total_inquiries ?? 0}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid: Recent Orders + Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Orders — 2/3 */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm flex flex-col">
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
                {stats?.recent_orders && stats.recent_orders.length > 0 ? (
                  stats.recent_orders.map((o) => (
                    <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-primary">{o.order_number}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground text-xs">{o.customer_name}</div>
                        <div className="text-muted-foreground text-[11px]">{o.company_name || o.customer_email}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{o.items ? o.items.length : 0}</td>
                      <td className="px-4 py-3 font-semibold">PKR {Number(o.total).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                            statusColors[o.status.toLowerCase()] || "bg-secondary text-foreground"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(o.created_at).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-xs text-muted-foreground">
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>

        {/* Right Widgets — 1/3 */}
        <div className="space-y-5">
          {/* Low Stock Alerts */}
          <div className="bg-card rounded-xl border border-border shadow-sm">
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
              {stats?.low_stock_items && stats.low_stock_items.length > 0 ? (
                stats.low_stock_items.map((p: any, i: number) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{p.name || p.product_name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{p.catNo || p.cat_no || ''}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-destructive">{p.stock ?? 0}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                  No low stock alerts
                </div>
              )}
            </div>
          </div>

          {/* Top Selling */}
          <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                Top Selling (This Month)
              </h3>
            </div>
            <div className="divide-y divide-border">
              {stats?.top_selling && stats.top_selling.length > 0 ? (
                stats.top_selling.map((p: any, i: number) => (
                  <div key={p.product_name || i} className="px-4 py-2.5 flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center shrink-0">
                      #{i + 1}
                    </span>
                    <span className="text-xs font-medium text-foreground truncate flex-1">{p.product_name}</span>
                    <span className="text-xs text-muted-foreground font-semibold shrink-0">
                      {p.units} sold
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                  No sales data yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
