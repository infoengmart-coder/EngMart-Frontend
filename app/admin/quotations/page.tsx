"use client";

import { useState } from "react";
import { 
  Search, Mail, Phone, Calendar, Clock, CheckCircle2, 
  XCircle, Send, Inbox, ArrowRight, DollarSign, Building 
} from "lucide-react";

interface RFQItem {
  name: string;
  catNo: string;
  qty: number;
  quotedPrice?: number;
}

interface QuotationRequest {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  date: string;
  fullDate: string;
  items: RFQItem[];
  notes: string;
  status: "Pending" | "Quoted" | "Converted" | "Expired";
}

const INITIAL_RFQS: QuotationRequest[] = [
  {
    id: "RFQ-2084",
    name: "Engr. Kamran Ahmed",
    company: "KA Electrical Works",
    email: "kamran@kaelectrical.pk",
    phone: "+92-321-234-5678",
    date: "10:45 AM",
    fullDate: "July 12, 2026 at 10:45 AM",
    items: [
      { name: "CHINT NXB-63 MCB 1P 16A", catNo: "NXB-63-1P-16C", qty: 150 },
      { name: "ABB SH201 MCB 1P 20A", catNo: "SH201-C20", qty: 50 },
      { name: "ABB AX-Series Contactor 9A", catNo: "AX09-30-10", qty: 20 },
    ],
    notes: "Requesting special distributor price list pricing for ongoing panel board installations at SITE Karachi. Need delivery within 3 days.",
    status: "Pending",
  },
  {
    id: "RFQ-2083",
    name: "M. Rashid Siddiqui",
    company: "National Industrial Corp",
    email: "rashid@nic.pk",
    phone: "+92-300-111-2233",
    date: "Yesterday",
    fullDate: "July 11, 2026 at 4:15 PM",
    items: [
      { name: "Himel HDM3 MCCB 3P 125A", catNo: "HDM3-125", qty: 12, quotedPrice: 8200 },
      { name: "FICO ELC Current Transformer 100/5A", catNo: "ELC-60", qty: 36, quotedPrice: 610 },
    ],
    notes: "Please quote with our wholesale discount accounts profile terms (Net 30). Invoice will be paid by bank transfer.",
    status: "Quoted",
  },
  {
    id: "RFQ-2082",
    name: "Tariq Mehmood",
    company: "TM Engineering",
    email: "tariq@tmeng.pk",
    phone: "+92-312-987-6543",
    date: "Jul 10",
    fullDate: "July 10, 2026 at 11:30 AM",
    items: [
      { name: "PCE Industrial Socket IP44 16A 3P", catNo: "IP44-16A-3P", qty: 80, quotedPrice: 1700 },
      { name: "Kondas ZNPP Capacitor 25 KVAR", catNo: "ZNPP-25", qty: 10, quotedPrice: 4200 },
    ],
    notes: "Requires formal PDF quotation for government audit submission.",
    status: "Converted",
  },
  {
    id: "RFQ-2081",
    name: "Usman Ghani",
    company: "UG Panel Builders",
    email: "usman@ugpanel.pk",
    phone: "+92-300-333-4455",
    date: "Jul 8",
    fullDate: "July 8, 2026 at 2:00 PM",
    items: [
      { name: "Tense DJA-96 Ammeter LED", catNo: "DJA-96", qty: 15 },
    ],
    notes: "Check stock availability for immediate pickup in Karachi.",
    status: "Expired",
  },
];

const STATUS_CONFIG: Record<string, string> = {
  Pending: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]",
  Quoted: "bg-primary/10 text-primary border-primary/20",
  Converted: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]",
  Expired: "bg-secondary text-muted-foreground border-border",
};

export default function QuotationsPage() {
  const [rfqs, setRfqs] = useState<QuotationRequest[]>(INITIAL_RFQS);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_RFQS[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Quoted" | "Converted">("All");

  // Price inputs state for the active quote response
  const [quotePrices, setQuotePrices] = useState<Record<string, string>>({});

  const activeRfq = rfqs.find((r) => r.id === selectedId) || rfqs[0];

  const handlePriceChange = (itemName: string, val: string) => {
    setQuotePrices({
      ...quotePrices,
      [itemName]: val,
    });
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRfq) return;

    const updatedItems = activeRfq.items.map((item) => ({
      ...item,
      quotedPrice: Number(quotePrices[item.name]) || item.quotedPrice || 0,
    }));

    setRfqs(
      rfqs.map((r) =>
        r.id === activeRfq.id
          ? { ...r, items: updatedItems, status: "Quoted" as const }
          : r
      )
    );
    alert("Quote sent successfully to " + activeRfq.email);
  };

  const handleConvertToOrder = () => {
    if (!activeRfq) return;
    setRfqs(
      rfqs.map((r) =>
        r.id === activeRfq.id ? { ...r, status: "Converted" as const } : r
      )
    );
    alert("Quotation converted to standard order successfully!");
  };

  const handleDecline = () => {
    if (!activeRfq) return;
    if (confirm("Are you sure you want to decline this quote request?")) {
      setRfqs(
        rfqs.map((r) =>
          r.id === activeRfq.id ? { ...r, status: "Expired" as const } : r
        )
      );
    }
  };

  const filteredRfqs = rfqs.filter((r) => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-5 md:p-8 flex flex-col h-[calc(100vh-64px)] md:h-screen min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Quotation Requests (RFQ)</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review industrial RFQ inquiries, draft switchgear quotes, and convert to sales orders.</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotations..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Split view */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 pb-5 overflow-hidden">
        {/* RFQ List Panel */}
        <div className="lg:w-1/3 store-card flex flex-col overflow-hidden shrink-0">
          <div className="p-3 border-b border-border bg-card flex gap-1.5 shrink-0">
            {(["All", "Pending", "Quoted", "Converted"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 text-[10px] font-bold rounded-md flex-1 text-center transition-all ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredRfqs.length > 0 ? (
              filteredRfqs.map((r) => {
                const isActive = r.id === selectedId;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`p-4 cursor-pointer transition-colors border-l-4 ${
                      isActive 
                        ? "bg-primary/5 border-l-primary" 
                        : "hover:bg-secondary/40 border-l-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xs font-bold text-foreground truncate max-w-[140px]">{r.company}</h3>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{r.date}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{r.name} · {r.id}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground font-semibold">{r.items.length} switchgear items</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${STATUS_CONFIG[r.status]}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">No quote requests found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Request Details View Panel */}
        {activeRfq ? (
          <div className="lg:w-2/3 store-card flex flex-col overflow-hidden min-w-0">
            {/* Viewer Header */}
            <div className="p-5 border-b border-border bg-card shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="text-base font-bold text-foreground">{activeRfq.id}</h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${STATUS_CONFIG[activeRfq.status]}`}>
                    {activeRfq.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> {activeRfq.company} ({activeRfq.name})
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {activeRfq.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {activeRfq.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {activeRfq.fullDate}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 self-start sm:self-center">
                {activeRfq.status === "Quoted" && (
                  <button 
                    onClick={handleConvertToOrder}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Convert to Order
                  </button>
                )}
                {activeRfq.status !== "Expired" && activeRfq.status !== "Converted" && (
                  <button 
                    onClick={handleDecline}
                    className="btn-secondary text-xs py-1.5 px-3 text-destructive border-destructive/20 hover:bg-destructive/10"
                  >
                    Decline Request
                  </button>
                )}
              </div>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-background/30">
              {/* Buyer Notes */}
              <div className="store-card p-4 bg-card shadow-sm border-l-4 border-l-primary">
                <h4 className="text-xs font-bold text-foreground mb-1">Requester Notes</h4>
                <p className="text-xs text-foreground leading-relaxed">{activeRfq.notes}</p>
              </div>

              {/* Items List */}
              <div className="store-card overflow-hidden">
                <div className="p-3 border-b border-border bg-card">
                  <h4 className="text-xs font-bold text-foreground">Requested Switchgear & Automation Items</h4>
                </div>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-secondary/40 text-muted-foreground border-b border-border font-semibold uppercase text-[10px]">
                      <th className="px-4 py-2">Catalog No</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2 text-right">Quantity</th>
                      <th className="px-4 py-2 text-right">Quoted Unit Price (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeRfq.items.map((item) => (
                      <tr key={item.name} className="hover:bg-secondary/25 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-muted-foreground">{item.catNo}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                        <td className="px-4 py-3 text-right font-bold">{item.qty} units</td>
                        <td className="px-4 py-3 text-right font-semibold text-primary">
                          {item.quotedPrice ? `PKR ${item.quotedPrice.toLocaleString()}` : "Not Quoted Yet"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Draft Quotation Form */}
              {activeRfq.status === "Pending" && (
                <form onSubmit={handleSendQuote} className="store-card p-5 bg-card space-y-4">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-primary" /> Draft Quotation Response
                  </h4>
                  <div className="space-y-3">
                    {activeRfq.items.map((item) => (
                      <div key={`${item.name}-input`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-border pb-2 last:border-b-0">
                        <span className="font-medium text-foreground max-w-sm truncate">{item.name} ({item.qty}x)</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-[11px]">PKR</span>
                          <input
                            type="number"
                            required
                            value={quotePrices[item.name] || ""}
                            onChange={(e) => handlePriceChange(item.name, e.target.value)}
                            className="input-base text-xs py-1.5 px-2.5 w-[140px]"
                            placeholder="Unit Price"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2 border-t border-border">
                    <button type="submit" className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" /> Submit Quotation to Customer
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:w-2/3 store-card flex items-center justify-center p-10 text-center">
            <p className="text-xs text-muted-foreground">Select an RFQ request from the list to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
