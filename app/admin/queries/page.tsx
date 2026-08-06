"use client";

import { useState, useEffect } from "react";
import { 
  Search, Mail, Phone, Calendar, Reply, Trash2, CheckCircle2, 
  Clock, Inbox, Check, Eye 
} from "lucide-react";
import { getInquiries, updateInquiryStatus, type InquiryResponse } from "@/lib/api";

const STATUS_CONFIG: Record<string, { badge: string; dot: string }> = {

  new: { badge: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" },
  read: { badge: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", dot: "bg-indigo-500" },
  replied: { badge: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]", dot: "bg-[var(--color-warning)]" },
  closed: { badge: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]", dot: "bg-[var(--color-success)]" },
};

export default function QueriesPage() {
  const [queries, setQueries] = useState<InquiryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState<"All" | "new" | "replied" | "closed">("All");
  const [replyText, setReplyText] = useState("");

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const statusParam = tabFilter === "All" ? undefined : tabFilter;
      const res = await getInquiries({ search, status: statusParam });
      setQueries(res.results || []);
      if (res.results && res.results.length > 0 && selectedId === null) {
        setSelectedId(res.results[0].id);
      }
    } catch (err) {
      console.error("Failed to load inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [tabFilter, search]);

  const activeQuery = queries.find((q) => q.id === selectedId) || queries[0];

  const handleStatusChange = async (id: number, newStatus: 'new' | 'read' | 'replied' | 'closed') => {
    try {
      const updated = await updateInquiryStatus(id, { status: newStatus });
      setQueries((prev) => prev.map((q) => (q.id === id ? updated : q)));
    } catch (err: any) {
      alert(err.message || "Failed to update inquiry status");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeQuery) return;
    await handleStatusChange(activeQuery.id, "replied");
    setReplyText("");
    alert("Reply successfully sent to " + activeQuery.email);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this query?")) {
      const nextList = queries.filter((q) => q.id !== id);
      setQueries(nextList);
      if (nextList.length > 0) {
        setSelectedId(nextList[0].id);
      }
    }
  };

  const filteredQueries = queries.filter((q) => {
    if (tabFilter !== "All" && q.status.toLowerCase() !== tabFilter.toLowerCase()) return false;
    if (search) {
      const query = search.toLowerCase();
      return (
        q.name.toLowerCase().includes(query) ||
        q.email.toLowerCase().includes(query) ||
        (q.product_interest && q.product_interest.toLowerCase().includes(query)) ||
        (q.message && q.message.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const getCount = (st: string) => {
    return queries.filter((q) => q.status.toLowerCase() === st.toLowerCase()).length;
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
              onClick={() => setTabFilter("new")}
              className={`px-2 py-1.5 text-[10px] font-bold rounded-md flex-1 text-center transition-all ${
                tabFilter === "new" ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              New ({getCount("new")})
            </button>
            <button
              onClick={() => setTabFilter("replied")}
              className={`px-2 py-1.5 text-[10px] font-bold rounded-md flex-1 text-center transition-all ${
                tabFilter === "replied" ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Replied
            </button>
            <button
              onClick={() => setTabFilter("closed")}
              className={`px-2 py-1.5 text-[10px] font-bold rounded-md flex-1 text-center transition-all ${
                tabFilter === "closed" ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Closed
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredQueries.length > 0 ? (
              filteredQueries.map((q) => {
                const isActive = q.id === selectedId;
                const cfg = STATUS_CONFIG[q.status.toLowerCase()] || STATUS_CONFIG.new;
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
                      <h3 className={`text-xs ${q.status === 'new' ? "font-bold text-foreground" : "font-semibold text-muted-foreground"} truncate max-w-[140px]`}>
                        {q.name}
                      </h3>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(q.created_at).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className={`text-[11px] truncate mb-2 ${q.status === 'new' ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                      {q.product_interest || "General Inquiry"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground font-mono">#INQ-{q.id}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border capitalize ${cfg.badge}`}>
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
                <h2 className="text-base font-bold text-foreground mb-2">
                  {activeQuery.product_interest ? `Inquiry regarding: ${activeQuery.product_interest}` : "General Website Inquiry"}
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>From: <strong className="text-foreground font-semibold">{activeQuery.name}</strong></span>
                  {activeQuery.company && <span>Company: {activeQuery.company}</span>}
                  <span>Email: {activeQuery.email}</span>
                  {activeQuery.phone && <span>Phone: {activeQuery.phone}</span>}
                  <span>Date: {new Date(activeQuery.created_at).toLocaleString("en-PK")}</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button 
                  onClick={() => handleStatusChange(activeQuery.id, "closed")}
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
                    onClick={() => handleStatusChange(activeQuery.id, "replied")}
                    className="btn-secondary text-[10px] py-1 px-3"
                  >
                    Mark Replied
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleStatusChange(activeQuery.id, "closed")}
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
