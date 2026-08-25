"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, BarChart2, Download, DollarSign, ShoppingCart, Package } from "lucide-react";
import { getReports, type ReportData } from "@/lib/api";

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReports()
      .then(setData)
      .catch((err) => console.error("Failed to load reports", err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    let csv = "Metric,Value\n";
    csv += `Total Revenue,${data.total_revenue}\n`;
    csv += `Monthly Revenue,${data.monthly_revenue}\n`;
    csv += `Avg Order Value,${data.avg_order_value}\n`;
    csv += `Total Orders,${data.total_orders}\n\n`;
    csv += "Top Selling Products\nRank,Product,Brand,Units,Revenue\n";
    data.top_selling.forEach(p => {
      csv += `${p.rank},${p.product_name},${p.brand_name},${p.units},${p.revenue}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "engmart_reports.csv";
    a.click();
  };

  if (loading) {
    return (
      <div className="p-5 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-5 md:p-8">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">No report data available.</p>
      </div>
    );
  }

  const maxChart = Math.max(...(data.monthly_chart.map(m => m.value)), 1);

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Revenue performance, top products, and brand analytics.</p>
        </div>
        <button onClick={handleExportCSV} className="btn-secondary text-xs flex items-center gap-1.5 shrink-0">
          <Download className="w-3.5 h-3.5" /> Export Report
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `PKR ${data.total_revenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600" },
          { label: "This Month", value: `PKR ${data.monthly_revenue.toLocaleString()}`, icon: TrendingUp, color: "text-primary", change: data.revenue_change },
          { label: "Avg. Order Value", value: `PKR ${data.avg_order_value.toLocaleString()}`, icon: ShoppingCart, color: "text-amber-600" },
          { label: "Total Orders", value: data.total_orders.toLocaleString(), icon: Package, color: "text-indigo-600" },
        ].map((m, i) => (
          <div key={i} className="bg-card rounded-xl border border-border shadow-sm p-5">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-muted-foreground">{m.label}</span>
              <m.icon className={`w-5 h-5 ${m.color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground mt-3">{m.value}</div>
            {m.change !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                {m.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-[var(--color-success)]" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-destructive" />
                )}
                <span className={`text-[11px] font-semibold ${m.change >= 0 ? "text-[var(--color-success)]" : "text-destructive"}`}>
                  {m.change >= 0 ? "+" : ""}{m.change}% vs last month
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Chart + Top Selling Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Bar Chart */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 lg:col-span-2">
          <h2 className="text-base font-bold text-foreground mb-5">Monthly Revenue</h2>
          <div className="h-[200px] flex items-end gap-2 justify-between border-b border-border pb-2">
            {data.monthly_chart.map((m, i) => {
              const pct = (m.value / maxChart) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1 gap-2 group cursor-pointer h-full justify-end">
                  <div className="w-full max-w-[48px] relative flex items-end justify-center h-full">
                    <div
                      className="w-full bg-primary/80 rounded-t transition-all duration-500 group-hover:bg-primary relative"
                      style={{ height: `${pct}%`, minHeight: "4px" }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        PKR {(m.value / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling */}
        <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" /> Top Selling Products
            </h2>
          </div>
          <div className="divide-y divide-border flex-1">
            {data.top_selling.length > 0 ? data.top_selling.map((p) => (
              <div key={p.rank} className="px-4 py-3 flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-5 text-center shrink-0">#{p.rank}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{p.product_name}</div>
                  <div className="text-[10px] text-muted-foreground">{p.brand_name}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-foreground">{p.units} sold</div>
                  <div className="text-[10px] text-muted-foreground">PKR {p.revenue.toLocaleString()}</div>
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-xs text-muted-foreground">No sales data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Brand Performance */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <h2 className="text-base font-bold text-foreground mb-4">Brand Performance</h2>
        <div className="space-y-3">
          {data.brand_performance.length > 0 ? data.brand_performance.map((b) => (
            <div key={b.brand_name} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{b.brand_name}</span>
                <span className="font-bold">PKR {b.revenue.toLocaleString()} ({b.percentage}%)</span>
              </div>
              <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${b.percentage}%` }} />
              </div>
            </div>
          )) : (
            <p className="text-xs text-muted-foreground text-center py-4">No brand performance data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
