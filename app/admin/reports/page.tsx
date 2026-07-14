"use client";

import { useState } from "react";
import { 
  Download, BarChart3, TrendingUp, TrendingDown, DollarSign, 
  Package, Layers, Tag, Percent, Calendar, Database, UploadCloud
} from "lucide-react";

/* ── Types & Data ──────────────────────────────────── */

interface ReportCard {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  Icon: any;
}

const reportCards: ReportCard[] = [
  { title: "Total Revenue", value: "PKR 1,245,000", change: "+12.5% vs last month", positive: true, Icon: DollarSign },
  { title: "Average Order Value", value: "PKR 45,200", change: "+5.2% vs last month", positive: true, Icon: BarChart3 },
  { title: "Conversion Rate", value: "3.24%", change: "-0.4% vs last month", positive: false, Icon: Percent },
];

const mockMonthlyRevenue = [
  { month: "Jan", value: 345000 },
  { month: "Feb", value: 412000 },
  { month: "Mar", value: 298000 },
  { month: "Apr", value: 520000 },
  { month: "May", value: 485000 },
  { month: "Jun", value: 612000 },
  { month: "Jul", value: 534000 },
];

const topSelling = [
  { rank: 1, name: "CHINT NXB-63 MCB 1P 16A", brand: "CHINT", category: "MCBs", units: 342, revenue: 143640 },
  { rank: 2, name: "Himel HDM3 MCCB 3P 125A", brand: "Himel", category: "MCCBs", units: 128, revenue: 1088000 },
  { rank: 3, name: "ABB AX-Series Contactor 9A", brand: "ABB", category: "Contactors", units: 96, revenue: 307200 },
  { rank: 4, name: "PCE Industrial Socket IP44", brand: "PCE", category: "Industrial Plugs", units: 84, revenue: 151200 },
  { rank: 5, name: "Kondas ZNPP Capacitor 25 KVAR", brand: "Kondas", category: "Capacitors", units: 67, revenue: 301500 },
];

const brandPerformance = [
  { brand: "CHINT", revenue: 845000, percentage: 40 },
  { brand: "ABB", revenue: 620000, percentage: 29 },
  { brand: "Himel", revenue: 450000, percentage: 21 },
  { brand: "Tense", revenue: 125000, percentage: 6 },
  { brand: "PCE", revenue: 85000, percentage: 4 },
];

const lowPerformingSKUs = [
  { name: "Opas Cam Switch 32A", catNo: "CS-32", stock: 60, age: "120 days since last sale" },
  { name: "Tense Protection Relay PR-100", catNo: "PR-100", stock: 45, age: "95 days since last sale" },
  { name: "FICO HRC Fuse 100A", catNo: "HF-100", stock: 70, age: "80 days since last sale" },
];

/* ── Component ─────────────────────────────────────── */

export default function ReportsPage() {
  const [timeframe, setTimeframe] = useState("6 Months");
  const maxVal = Math.max(...mockMonthlyRevenue.map((m) => m.value));

  const handleExport = (format: "CSV" | "PDF") => {
    alert(`Generating and downloading detailed store report as ${format}...`);
  };

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Analyze sales trend, brand shares, category performance, and slow-moving stocks.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => handleExport("CSV")} className="btn-secondary text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={() => handleExport("PDF")} className="btn-secondary text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportCards.map((c) => {
          const isPositive = c.positive;
          return (
            <div key={c.title} className="store-card p-5 relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground">{c.title}</span>
                <c.Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-2xl font-bold text-foreground mt-2">{c.value}</div>
              <span className={`text-[10px] font-semibold mt-1 inline-block ${isPositive ? 'text-[var(--color-success)]' : 'text-destructive'}`}>
                {c.change}
              </span>
            </div>
          );
        })}
      </div>

      {/* Trend Graph */}
      <div className="store-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" /> Monthly Revenue Trend
          </h2>
          <select 
            value={timeframe} 
            onChange={e => setTimeframe(e.target.value)}
            className="bg-background border border-border text-foreground text-xs rounded-md focus:ring-primary p-1.5 outline-none cursor-pointer"
          >
            <option>Last 6 Months</option>
            <option>This Year</option>
          </select>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="h-[220px] flex items-end gap-1 sm:gap-2 justify-between border-b border-border pb-2 relative">
          <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none text-[9px] text-muted-foreground font-medium -ml-1 hidden sm:flex">
            <span>PKR {(maxVal / 1000).toFixed(0)}k</span>
            <span>PKR {(maxVal / 2000).toFixed(0)}k</span>
            <span>0</span>
          </div>
          {mockMonthlyRevenue.map((d, i) => {
            const pct = (d.value / maxVal) * 100;
            return (
              <div
                key={i}
                className="flex flex-col items-center flex-1 gap-2 group cursor-pointer h-full justify-end"
              >
                <div className="w-full max-w-[48px] relative flex items-end justify-center h-full bg-secondary/30 rounded-t">
                  <div
                    className="w-full bg-primary/70 rounded-t transition-all duration-500 ease-out group-hover:bg-primary relative"
                    style={{ height: `${pct}%`, minHeight: "4px" }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      PKR {(d.value / 1000).toFixed(0)}k
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium truncate max-w-full">
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Top products + Brand Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-2 store-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Package className="w-4 h-4 text-primary" /> Top Performing Products (By Sales Volume)
            </h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[10px] text-muted-foreground uppercase bg-secondary/30 border-b border-border">
                  <th className="px-4 py-2.5 font-semibold text-center w-8">Rank</th>
                  <th className="px-4 py-2.5 font-semibold text-left">Product</th>
                  <th className="px-4 py-2.5 font-semibold text-left">Brand</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Units Sold</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topSelling.map((p) => (
                  <tr key={p.name} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-2.5 text-center font-bold text-muted-foreground text-xs">#{p.rank}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground text-xs">{p.name}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.brand}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">{p.units} units</td>
                    <td className="px-4 py-2.5 text-right font-bold text-primary">PKR {p.revenue.toLocaleString("en-PK")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Brand Performance share */}
        <div className="store-card p-4 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-primary" /> Brand Revenue Share
          </h3>
          <div className="space-y-3.5">
            {brandPerformance.map((b) => (
              <div key={b.brand} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">{b.brand}</span>
                  <span className="text-muted-foreground">PKR {b.revenue.toLocaleString()} ({b.percentage}%)</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${b.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slow Moving Stocks / Low Performing SKUs */}
      <div className="store-card">
        <div className="p-4 border-b border-border bg-card">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-destructive" /> Low-Performing SKUs (Overstock Alerts)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Products with zero sale counts in the last 60+ days.</p>
        </div>
        <div className="divide-y divide-border">
          {lowPerformingSKUs.map((sku) => (
            <div key={sku.catNo} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-secondary/15 transition-colors">
              <div>
                <span className="font-mono text-xs font-semibold text-muted-foreground mr-2">{sku.catNo}</span>
                <span className="text-xs font-semibold text-foreground">{sku.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-muted-foreground">{sku.stock} units currently in stock</span>
                <span className="font-semibold text-destructive">{sku.age}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Database Management Options */}
      <div className="store-card">
        <div className="p-4 border-b border-border bg-card">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Database className="w-4 h-4 text-primary" /> Database Management
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Backup or import your store data. Operations might take a few moments.</p>
        </div>
        <div className="p-5 flex flex-col sm:flex-row gap-4">
          <button className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-4 rounded-md font-bold text-sm hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" />
            Backup Database
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 border border-border bg-background text-foreground py-3 px-4 rounded-md font-bold text-sm hover:bg-secondary/20 transition-colors">
            <UploadCloud className="w-4 h-4" />
            Import Database
          </button>
        </div>
      </div>
    </div>
  );
}
