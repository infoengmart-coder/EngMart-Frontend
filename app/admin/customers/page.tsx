"use client";

import { useState } from "react";
import { Search, Filter, ChevronDown, ChevronUp, Inbox } from "lucide-react";

/* ── Types & Data ──────────────────────────────────── */

type AccountType = "Retail" | "Wholesale";

interface Customer {
  name: string;
  company: string;
  email: string;
  phone: string;
  type: AccountType;
  totalOrders: number;
  lifetimeValue: number;
  joined: string;
}

const CUSTOMERS: Customer[] = [
  { name: "Engr. Kamran Ahmed", company: "KA Electrical Works", email: "kamran@kaelectrical.pk", phone: "+92-321-234-5678", type: "Wholesale", totalOrders: 34, lifetimeValue: 1245000, joined: "2024-03-15" },
  { name: "M. Rashid Siddiqui", company: "National Industrial Corp", email: "rashid@nic.pk", phone: "+92-300-111-2233", type: "Wholesale", totalOrders: 28, lifetimeValue: 2340000, joined: "2023-11-02" },
  { name: "Asim Malik", company: "Malik Electrical Solutions", email: "asim@malikelectrical.pk", phone: "+92-333-456-7890", type: "Retail", totalOrders: 12, lifetimeValue: 186000, joined: "2025-01-20" },
  { name: "Tariq Mehmood", company: "TM Engineering", email: "tariq@tmeng.pk", phone: "+92-312-987-6543", type: "Wholesale", totalOrders: 45, lifetimeValue: 3120000, joined: "2023-06-10" },
  { name: "Bilal Hassan", company: "Hassan Switchgear", email: "bilal@hassansg.pk", phone: "+92-345-222-3344", type: "Retail", totalOrders: 8, lifetimeValue: 67500, joined: "2025-09-05" },
  { name: "Usman Ghani", company: "UG Panel Builders", email: "usman@ugpanel.pk", phone: "+92-300-333-4455", type: "Wholesale", totalOrders: 22, lifetimeValue: 890000, joined: "2024-07-18" },
  { name: "Fahad Ali Khan", company: "Khan Electrical Store", email: "fahad@khanstore.pk", phone: "+92-311-555-6677", type: "Retail", totalOrders: 5, lifetimeValue: 32400, joined: "2026-02-11" },
  { name: "Noman Ansari", company: "Ansari Industrial", email: "noman@ansariind.pk", phone: "+92-322-777-8899", type: "Wholesale", totalOrders: 19, lifetimeValue: 715000, joined: "2024-12-01" },
];

/* ── Component ─────────────────────────────────────── */

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType | "All">("All");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = CUSTOMERS.filter((c) => {
    if (typeFilter !== "All" && c.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-5 md:p-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Customer directory — view contact info, order history, and account details.</p>
      </div>

      <div className="store-card">
        {/* Filter bar */}
        <div className="p-3 border-b border-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company, or email..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-1">
            {(["All", "Retail", "Wholesale"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                  typeFilter === t ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
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
                  <th className="px-4 py-3 text-left font-semibold w-8"></th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Orders</th>
                  <th className="px-4 py-3 text-left font-semibold">Lifetime Value</th>
                  <th className="px-4 py-3 text-left font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => {
                  const isExpanded = expandedRow === c.email;
                  return (
                    <>
                      <tr
                        key={c.email}
                        onClick={() => setExpandedRow(isExpanded ? null : c.email)}
                        className="hover:bg-secondary/20 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground text-xs">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground">{c.company}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-foreground">{c.email}</div>
                          <div className="text-[11px] text-muted-foreground">{c.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            c.type === "Wholesale"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-secondary text-foreground border-border"
                          }`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">{c.totalOrders}</td>
                        <td className="px-4 py-3 font-semibold">PKR {c.lifetimeValue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(c.joined).toLocaleDateString("en-PK", { year: "numeric", month: "short" })}</td>
                      </tr>
                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr key={`${c.email}-detail`}>
                          <td colSpan={7} className="bg-secondary/20 px-8 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground font-semibold block mb-1">Full Name</span>
                                <span className="text-foreground">{c.name}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground font-semibold block mb-1">Company</span>
                                <span className="text-foreground">{c.company}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground font-semibold block mb-1">Account Type</span>
                                <span className="text-foreground">{c.type}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground font-semibold block mb-1">Total Orders</span>
                                <span className="text-foreground">{c.totalOrders} orders</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground font-semibold block mb-1">Lifetime Value</span>
                                <span className="text-foreground font-semibold">PKR {c.lifetimeValue.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground font-semibold block mb-1">Member Since</span>
                                <span className="text-foreground">{new Date(c.joined).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
            <h3 className="text-sm font-semibold text-foreground mb-1">No customers found</h3>
            <p className="text-xs text-muted-foreground max-w-xs">Try adjusting your search or filter.</p>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="p-3 border-t border-border flex flex-col sm:flex-row gap-3 items-center justify-between text-sm text-muted-foreground">
            <div className="text-xs">Showing {filtered.length} of {CUSTOMERS.length} customers</div>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-border rounded-md hover:bg-secondary text-xs transition-colors">Prev</button>
              <button className="px-3 py-1 border border-border bg-primary text-primary-foreground rounded-md text-xs">1</button>
              <button className="px-3 py-1 border border-border rounded-md hover:bg-secondary text-xs transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
