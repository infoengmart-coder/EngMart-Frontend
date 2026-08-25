"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ChevronDown, ChevronUp, Inbox, Download, RotateCcw } from "lucide-react";
import { getCustomers, type CustomerData } from "@/lib/api";
import { subscribeEngmartEvents } from "@/lib/events";

/* ── Component ─────────────────────────────────────── */

type AccountType = "Retail" | "Wholesale";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType | "All">("All");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers();
      setCustomers(res.results || []);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    return subscribeEngmartEvents(() => {
      loadCustomers();
    });
  }, []);

  const filtered = customers.filter((c) => {
    if (typeFilter !== "All" && c.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["Name", "Company", "Email", "Phone", "Type", "Orders", "Lifetime Value", "Joined"];
    const rows = filtered.map(c => [c.name, c.company, c.email, c.phone, c.type, c.total_orders, c.lifetime_value, c.joined]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "engmart_customers.csv";
    a.click();
  };

  return (
    <div className="p-5 md:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Customer directory — view contact info, order history, and account details.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={loadCustomers} className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer">
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={handleExportCSV} className="btn-secondary text-xs flex items-center gap-1.5 shrink-0">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-3 border-b border-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, or email..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-card text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {(["All", "Wholesale", "Retail"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  typeFilter === t ? "bg-primary text-white shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Loading customers...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No customers found</p>
            <p className="text-xs text-muted-foreground mt-0.5">Customers will appear here when orders are placed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[11px] text-muted-foreground uppercase bg-secondary/30">
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Orders</th>
                  <th className="px-4 py-3 text-left font-semibold">Lifetime Value</th>
                  <th className="px-4 py-3 text-left font-semibold">Joined</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <>
                    <tr key={c.email} className="hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setExpandedRow(expandedRow === c.email ? null : c.email)}>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-semibold text-foreground text-xs">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground">{c.company || "—"}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-foreground">{c.email}</div>
                        <div className="text-[10px] text-muted-foreground">{c.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.type === "Wholesale"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-secondary text-foreground border-border"
                        }`}>{c.type}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-xs">{c.total_orders}</td>
                      <td className="px-4 py-3 font-bold text-xs">PKR {c.lifetime_value.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {c.joined ? new Date(c.joined).toLocaleDateString("en-PK", { year: "numeric", month: "short" }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {expandedRow === c.email ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </td>
                    </tr>
                    {expandedRow === c.email && (
                      <tr key={`${c.email}-detail`}>
                        <td colSpan={7} className="px-6 py-4 bg-secondary/10">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div><span className="text-muted-foreground">Full Name:</span><br /><span className="font-semibold">{c.name}</span></div>
                            <div><span className="text-muted-foreground">Company:</span><br /><span className="font-semibold">{c.company || "N/A"}</span></div>
                            <div><span className="text-muted-foreground">Email:</span><br /><span className="font-semibold">{c.email}</span></div>
                            <div><span className="text-muted-foreground">Phone:</span><br /><span className="font-semibold">{c.phone}</span></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
