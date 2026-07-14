"use client";

import { useState } from "react";
import { 
  Save, ImagePlus, Plus, Trash2, ArrowUp, ArrowDown, 
  Calendar, Layers, Link as LinkIcon, Edit, Eye, AlertCircle 
} from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  position: "Banner";
  startDate: string;
  endDate: string;
  order: number;
}

const INITIAL_BANNERS: Banner[] = [
  {
    id: "BAN-001",
    title: "Pakistan's Most Trusted Industrial Supplier",
    subtitle: "Source genuine, certified switchgear, automation components, and industrial electronics directly from world-leading brands.",
    ctaText: "Browse Catalog",
    ctaLink: "/products",
    position: "Banner",
    startDate: "2026-07-01",
    endDate: "2026-12-31",
    order: 1,
  },
  {
    id: "BAN-002",
    title: "ABB AX Contactor Special Promotion",
    subtitle: "Get up to 25% bulk discounts on certified ABB contactors this month.",
    ctaText: "Get Quote",
    ctaLink: "/products/abb-ax-contactor",
    position: "Banner",
    startDate: "2026-07-10",
    endDate: "2026-07-25",
    order: 2,
  },
  {
    id: "BAN-003",
    title: "CHINT MCBs Clearance Sale",
    subtitle: "Overstock clearance on NXB-63 Miniature Circuit Breakers. Limited quantities.",
    ctaText: "Shop Sale",
    ctaLink: "/categories/mcb",
    position: "Banner",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    order: 3,
  },
];

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formCtaText, setFormCtaText] = useState("");
  const [formCtaLink, setFormCtaLink] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormTitle("");
    setFormSubtitle("");
    setFormCtaText("");
    setFormCtaLink("");
    setFormStartDate("");
    setFormEndDate("");
    setShowAddForm(true);
  };

  const handleOpenEdit = (b: Banner) => {
    setEditingBanner(b);
    setFormTitle(b.title);
    setFormSubtitle(b.subtitle);
    setFormCtaText(b.ctaText);
    setFormCtaLink(b.ctaLink);
    setFormStartDate(b.startDate);
    setFormEndDate(b.endDate);
    setShowAddForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBanner: Banner = {
      id: editingBanner ? editingBanner.id : `BAN-00${banners.length + 1}`,
      title: formTitle,
      subtitle: formSubtitle,
      ctaText: formCtaText,
      ctaLink: formCtaLink,
      position: "Banner",
      startDate: formStartDate,
      endDate: formEndDate,
      order: editingBanner ? editingBanner.order : banners.length + 1,
    };

    if (editingBanner) {
      setBanners(banners.map(b => b.id === editingBanner.id ? targetBanner : b));
    } else {
      setBanners([...banners, targetBanner]);
    }
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this banner?")) {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  const moveOrder = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= banners.length) return;
    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[nextIndex];
    newBanners[nextIndex] = temp;
    
    // Reset order field
    newBanners.forEach((b, idx) => {
      b.order = idx + 1;
    });
    setBanners(newBanners);
  };

  const getStatus = (start: string, end: string) => {
    const today = new Date().toISOString().split("T")[0];
    if (today < start) return "Scheduled";
    if (today > end) return "Expired";
    return "Active";
  };

  const statusColors: Record<string, string> = {
    Active: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]",
    Scheduled: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]",
    Expired: "bg-secondary text-muted-foreground border-border",
  };

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Banners</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage promotional banners displayed under the main video on the storefront.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary text-xs flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add New Banner
        </button>
      </div>

      {/* Main Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleSave} className="store-card p-6 bg-secondary/10 border-primary/20 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h2 className="text-base font-bold">{editingBanner ? `Edit Banner (${editingBanner.id})` : "Configure New Banner"}</h2>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Banner Headline</label>
                <input 
                  type="text" 
                  required 
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="input-base text-xs" 
                  placeholder="e.g. Summer Sale Switchgears" 
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Description / Subtitle</label>
                <textarea 
                  required 
                  value={formSubtitle}
                  onChange={e => setFormSubtitle(e.target.value)}
                  className="input-base text-xs min-h-[80px]" 
                  placeholder="e.g. Genuine circuit breakers up to 50% discount..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">CTA Action Text</label>
                  <input 
                    type="text" 
                    required 
                    value={formCtaText}
                    onChange={e => setFormCtaText(e.target.value)}
                    className="input-base text-xs" 
                    placeholder="e.g. Shop Now" 
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">CTA Action Link</label>
                  <input 
                    type="text" 
                    required 
                    value={formCtaLink}
                    onChange={e => setFormCtaLink(e.target.value)}
                    className="input-base text-xs" 
                    placeholder="/categories/mcb" 
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Schedule Start Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="input-base text-xs" 
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Schedule End Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="input-base text-xs" 
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Banner Image Upload Placeholder</label>
                <div className="border border-dashed border-border rounded-lg p-5 flex flex-col items-center justify-center bg-background cursor-pointer hover:bg-secondary/30 transition-colors">
                  <ImagePlus className="w-6 h-6 text-primary mb-2" />
                  <span className="text-[10px] text-muted-foreground">Recommend size: 1200x400 for standard banners</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <button type="submit" className="btn-primary text-xs py-1.5 px-5 flex items-center gap-1">
              <Save className="w-3.5 h-3.5" /> Save Banner
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary text-xs py-1.5 px-5">Cancel</button>
          </div>
        </form>
      )}

      {/* Reorder and Settings catalog list */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground">Added Banners</h3>
        <div className="space-y-3">
          {banners.map((b, idx) => {
            const status = getStatus(b.startDate, b.endDate);
            return (
              <div key={b.id} className="store-card p-4 flex flex-col sm:flex-row gap-4 items-center hover:border-primary/40 transition-colors">
                {/* Drag / Order controls */}
                <div className="flex flex-row sm:flex-col gap-1 items-center">
                  <button 
                    disabled={idx === 0}
                    onClick={() => moveOrder(idx, "up")}
                    className="p-1 hover:bg-secondary rounded text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-muted-foreground">#{b.order}</span>
                  <button 
                    disabled={idx === banners.length - 1}
                    onClick={() => moveOrder(idx, "down")}
                    className="p-1 hover:bg-secondary rounded text-muted-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Banner Thumbnail Representation */}
                <div className="w-32 h-20 bg-secondary/80 rounded-lg flex flex-col justify-center items-center p-2 text-center border border-border text-[9px] font-mono shrink-0">
                  <Layers className="w-4 h-4 text-muted-foreground mb-1" />
                  <span className="text-muted-foreground truncate w-full">{b.position}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-wrap items-center gap-2 mb-1 justify-center sm:justify-start">
                    <h4 className="font-bold text-sm text-foreground truncate">{b.title}</h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusColors[status]}`}>
                      {status === "Active" ? "Active Banner Added" : status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{b.subtitle}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-muted-foreground font-medium justify-center sm:justify-start">
                    <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3 text-primary" /> {b.ctaText} ({b.ctaLink})</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Schedule: {b.startDate} to {b.endDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleOpenEdit(b)} className="btn-secondary text-[11px] p-2" title="Edit">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="btn-secondary text-[11px] p-2 text-destructive hover:bg-destructive/10" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
