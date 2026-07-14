"use client";

import { useState } from "react";
import { 
  Search, Mail, Phone, Calendar, Reply, Trash2, CheckCircle2, 
  Clock, Inbox, Check, EyeOpenIcon 
} from "lucide-react";

interface CustomerQuery {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  date: string;
  fullDate: string;
  unread: boolean;
  status: "New" | "Replied" | "Closed";
  message: string;
}

const INITIAL_QUERIES: CustomerQuery[] = [
  {
    id: "QRY-981",
    name: "Engr. Kamran Ahmed",
    email: "kamran@kaelectrical.pk",
    phone: "+92-321-234-5678",
    subject: "ABB AX Contactor coil voltage availability",
    date: "11:20 AM",
    fullDate: "July 12, 2026 at 11:20 AM",
    unread: true,
    status: "New",
    message: "Assalam-o-Alaikum,\n\nWe need 15 units of ABB AX contactors but with 110VAC coils instead of the standard 220V coil. Do you have this in stock at your Karachi showroom, or can you import/arrange it from your official suppliers? Kindly let me know the lead time and price.\n\nBest regards,\nKamran Ahmed\nKA Electrical Works",
  },
  {
    id: "QRY-980",
    name: "M. Rashid Siddiqui",
    company: "National Industrial Corp",
    email: "rashid@nic.pk",
    phone: "+92-300-111-2233",
    subject: "Custom pricing list for panel builders",
    date: "Yesterday",
    fullDate: "July 11, 2026 at 3:45 PM",
    unread: true,
    status: "New",
    message: "Dear EngMart Support,\n\nWe are looking to partner as an OEM panel builder with you. We regularly buy Himel MCCBs (HDM3) and CHINT MCBs in large quantities (50+ units monthly). Can you share your switchgear discount tiers or set up a custom wholesale price list for us?\n\nSincerely,\nRashid Siddiqui\nProcurement Lead",
  } as any,
  {
    id: "QRY-979",
    name: "Tariq Mehmood",
    email: "tariq@tmeng.pk",
    subject: "CAPACITOR ZNPP KONDAS datasheet request",
    date: "Jul 10",
    fullDate: "July 10, 2026 at 12:15 PM",
    unread: false,
    status: "Replied",
    message: "Hi,\n\nI need the exact physical dimension sheet and technical datasheet for the Kondas ZNPP 25 KVAR power capacitor to verify if it will fit inside our custom PF panel. Please email the PDF.\n\nThanks,\nTariq"
  },
  {
    id: "QRY-978",
    name: "Bilal Hassan",
    email: "bilal@hassansg.pk",
    phone: "+92-345-222-3344",
    subject: "Return / Exchange policy for wrong current ratings",
    date: "Jul 9",
    fullDate: "July 9, 2026 at 9:30 AM",
    unread: false,
    status: "Closed",
    message: "A.o.A,\n\nWe ordered 10 units of CHINT NXB-63 MCB 1P 10A from your site yesterday, but our panel engineer changed specifications to 16A. The box is unopened. Can we walk into your Sarafa Bazar Karachi outlet tomorrow to exchange these for 16A MCBs?\n\nRegards,\nBilal Hassan"
  },
];

const STATUS_CONFIG: Record<string, { badge: string; dot: string }> = {
  New: { badge: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" },
  Replied: { badge: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]", dot: "bg-[var(--color-warning)]" },
  Closed: { badge: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]", dot: "bg-[var(--color-success)]" },
};

export default function QueriesPage() {
  const [queries, setQueries] = useState<CustomerQuery[]>(INITIAL_QUERIES);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_QUERIES[0].id);
  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState<"All" | "New" | "Replied" | "Closed">("All");
  const [replyText, setReplyText] = useState("");

  const activeQuery = queries.find((q) => q.id === selectedId) || queries[0];

  const handleStatusChange = (id: string, newStatus: "New" | "Replied" | "Closed") => {
    setQueries(
      queries.map((q) =>
        q.id === id ? { ...q, status: newStatus, unread: newStatus === "New" } : q
      )
    );
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    handleStatusChange(activeQuery.id, "Replied");
    setReplyText("");
    alert("Reply successfully sent to " + activeQuery.email);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this query?")) {
      const nextList = queries.filter((q) => q.id !== id);
      setQueries(nextList);
      if (nextList.length > 0) {
        setSelectedId(nextList[0].id);
      }
    }
  };

  const filteredQueries = queries.filter((q) => {
    if (tabFilter !== "All" && q.status !== tabFilter) return false;
    if (search) {
      const query = search.toLowerCase();
      return (
        q.name.toLowerCase().includes(query) ||
        q.email.toLowerCase().includes(query) ||
        q.subject.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getCount = (status: "New" | "Replied" | "Closed") => {
    return queries.filter((q) => q.status === status).length;
  };

  return (
    <div className="p-5 md:p-8 flex flex-col h-[calc(100vh-64px)] md:h-screen min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Inquiries</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and respond to contact-form messages from buyers.</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Split Inbox View */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 pb-5 overflow-hidden">
        {/* Inbox List */}
        <div className="lg:w-1/3 store-card flex flex-col overflow-hidden shrink-0">
          <div className="p-3 border-b border-border bg-card flex gap-1.5 shrink-0">
            <button
              onClick={() => setTabFilter("All")}
              className={`px-2 py-1.5 text-[10px] font-bold rounded-md flex-1 text-center transition-all ${
                tabFilter === "All" ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTabFilter("New")}
              className={`px-2 py-1.5 text-[10px] font-bold rounded-md flex-1 text-center transition-all ${
                tabFilter === "New" ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              New ({getCount("New")})
            </button>
            <button
              onClick={() => setTabFilter("Replied")}
              className={`px-2 py-1.5 text-[10px] font-bold rounded-md flex-1 text-center transition-all ${
                tabFilter === "Replied" ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Replied
            </button>
            <button
              onClick={() => setTabFilter("Closed")}
              className={`px-2 py-1.5 text-[10px] font-bold rounded-md flex-1 text-center transition-all ${
                tabFilter === "Closed" ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Closed
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredQueries.length > 0 ? (
              filteredQueries.map((q) => {
                const isActive = q.id === selectedId;
                const cfg = STATUS_CONFIG[q.status];
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedId(q.id)}
                    className={`p-4 cursor-pointer transition-colors border-l-4 ${
                      isActive 
                        ? "bg-primary/5 border-l-primary" 
                        : "hover:bg-secondary/40 border-l-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-xs ${q.unread ? "font-bold text-foreground" : "font-semibold text-muted-foreground"} truncate max-w-[140px]`}>
                        {q.name}
                      </h3>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{q.date}</span>
                    </div>
                    <p className={`text-[11px] truncate mb-2 ${q.unread ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                      {q.subject}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground font-mono">{q.id}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {q.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">No queries match filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Details Viewer */}
        {activeQuery ? (
          <div className="lg:w-2/3 store-card flex flex-col overflow-hidden min-w-0">
            <div className="p-5 border-b border-border bg-card flex justify-between items-start gap-4 shrink-0">
              <div>
                <h2 className="text-base font-bold text-foreground mb-2">{activeQuery.subject}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>From: <strong className="text-foreground font-semibold">{activeQuery.name}</strong></span>
                  <span>Email: {activeQuery.email}</span>
                  {activeQuery.phone && <span>Phone: {activeQuery.phone}</span>}
                  <span>Date: {activeQuery.fullDate}</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button 
                  onClick={() => handleStatusChange(activeQuery.id, "Closed")}
                  className="btn-secondary text-[11px] p-2 hover:text-[var(--color-success)] hover:border-[var(--color-success)]" 
                  title="Close Query"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(activeQuery.id)}
                  className="btn-secondary text-[11px] p-2 text-destructive hover:bg-destructive/10" 
                  title="Delete Inquiry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Body */}
            <div className="flex-1 overflow-y-auto p-5 bg-background/30 space-y-4">
              <div className="bg-card p-5 rounded-lg text-xs text-foreground leading-relaxed whitespace-pre-wrap border border-border shadow-sm">
                {activeQuery.message}
              </div>
            </div>

            {/* Reply Editor */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-border bg-card shrink-0 space-y-3">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                className="input-base text-xs min-h-[90px] resize-none"
                placeholder={`Draft email reply to ${activeQuery.email}...`}
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => handleStatusChange(activeQuery.id, "Replied")}
                    className="btn-secondary text-[10px] py-1 px-3"
                  >
                    Mark Replied
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleStatusChange(activeQuery.id, "Closed")}
                    className="btn-secondary text-[10px] py-1 px-3"
                  >
                    Mark Closed
                  </button>
                </div>
                <button type="submit" className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5">
                  <Reply className="w-3.5 h-3.5" /> Send Reply
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="lg:w-2/3 store-card flex items-center justify-center p-10 text-center">
            <p className="text-xs text-muted-foreground">Select a customer inquiry from the left panel to review details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
