"use client";

import { useState, useRef, useEffect } from "react";
import {
  getAdminBanners, createBanner, updateBanner, deleteBanner, type BannerData,
} from "@/lib/api";
import {
  Save, ImagePlus, Trash2, Edit, Eye, EyeOff,
  X, Plus, LayoutTemplate, Layers, Link as LinkIcon, Upload
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────── */
interface BannerItem {
  id: string;
  type: "hero" | "carousel" | "sidebar";
  title: string;
  subtitle: string;
  badge?: string;
  ctaText: string;
  ctaLink: string;
  ctaText2?: string;
  ctaLink2?: string;
  imagePreview?: string;
  accentColor?: string;
  textColor?: string;
  bgColor?: string;
  active: boolean;
}

/* ─── Default Data ───────────────────────────────────── */
const IMG = {
  c1: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=800",
  c2: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800",
  c3: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&q=80&w=800",
  c4: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800",
  c5: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800",
  c6: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
  s1: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=500",
  s2: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&q=80&w=500",
  s3: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=500",
};

const INITIAL_BANNERS: BannerItem[] = [
  { id: "C-001", type: "carousel", title: "High-Performance Protection", subtitle: "WAPDA Approved Switchgear for Every Application", badge: "PREMIUM SELECTION", ctaText: "Browse Catalog", ctaLink: "/products", ctaText2: "Get Quote", ctaLink2: "/contact", imagePreview: IMG.c1, accentColor: "#3B82F6", textColor: "#FFFFFF", bgColor: "#0F172A", active: true },
  { id: "C-002", type: "carousel", title: "Power Your Ideas with Precision", subtitle: "Build Smarter Circuits. Start with Engineering Mart", badge: "PREMIUM SELECTION", ctaText: "Shop Now", ctaLink: "/products", ctaText2: "View Catalog", ctaLink2: "/categories", imagePreview: IMG.c2, accentColor: "#3B82F6", textColor: "#FFFFFF", bgColor: "#0F172A", active: true },
  { id: "C-003", type: "carousel", title: "Industrial Scale Solutions", subtitle: "Authorized Distributor for 8+ Global Brands", badge: "PREMIUM SELECTION", ctaText: "Browse Brands", ctaLink: "/brands", ctaText2: "Get Quote", ctaLink2: "/contact", imagePreview: IMG.c3, accentColor: "#3B82F6", textColor: "#FFFFFF", bgColor: "#0F172A", active: true },
  { id: "C-004", type: "carousel", title: "Smart Automation Systems", subtitle: "Transform Your Industrial Operations with IoT", badge: "TECHNOLOGY LEADER", ctaText: "Explore Now", ctaLink: "/categories", ctaText2: "Learn More", ctaLink2: "/about", imagePreview: IMG.c4, accentColor: "#8B5CF6", textColor: "#FFFFFF", bgColor: "#1E1B4B", active: true },
  { id: "C-005", type: "carousel", title: "Energy Efficient Solutions", subtitle: "Save More, Perform Better with Latest Tech", badge: "ECO FRIENDLY", ctaText: "View Products", ctaLink: "/products", ctaText2: "Get Quote", ctaLink2: "/contact", imagePreview: IMG.c5, accentColor: "#10B981", textColor: "#FFFFFF", bgColor: "#022C22", active: true },
  { id: "C-006", type: "carousel", title: "24/7 Technical Support", subtitle: "Expert Engineers Ready to Help Your Projects", badge: "ALWAYS AVAILABLE", ctaText: "Contact Us", ctaLink: "/contact", ctaText2: "WhatsApp", ctaLink2: "https://wa.me/923112763951", imagePreview: IMG.c6, accentColor: "#F59E0B", textColor: "#FFFFFF", bgColor: "#1C1400", active: true },
  { id: "S-001", type: "sidebar", title: "For Your Electrical Needs", subtitle: "Fixing Your Circuit Problems — Fast, Accurate, Reliable.", badge: "COMPLETE SOLUTIONS", ctaText: "Shop Now", ctaLink: "/products", imagePreview: IMG.s1, accentColor: "#3B82F6", textColor: "#FFFFFF", bgColor: "#0F172A", active: true },
  { id: "S-002", type: "sidebar", title: "On Project Orders", subtitle: "Save more on large-scale procurement and industrial supply.", badge: "BULK DISCOUNTS", ctaText: "Get Quote", ctaLink: "/contact", imagePreview: IMG.s2, accentColor: "#F59E0B", textColor: "#FFFFFF", bgColor: "#1C1400", active: true },
  { id: "S-003", type: "sidebar", title: "Expert Consultation", subtitle: "Our engineers help you select the right product.", badge: "TECHNICAL SUPPORT", ctaText: "Contact", ctaLink: "/contact", imagePreview: IMG.s3, accentColor: "#10B981", textColor: "#FFFFFF", bgColor: "#022C22", active: true },
];

const isWAUrl = (url: string) =>
  !!(url?.toLowerCase().includes("wa.me") || url?.toLowerCase().includes("whatsapp"));

/* Map an API banner row onto the shape this page renders */
function fromApi(b: BannerData): BannerItem {
  return {
    id: String(b.id),
    type: b.type,
    title: b.title,
    subtitle: b.subtitle,
    badge: b.badge || undefined,
    ctaText: b.cta_text,
    ctaLink: b.cta_link,
    ctaText2: b.cta_text_2 || undefined,
    ctaLink2: b.cta_link_2 || undefined,
    imagePreview: b.image_src || undefined,
    accentColor: b.accent_color || undefined,
    textColor: b.text_color || undefined,
    bgColor: b.bg_color || undefined,
    active: b.is_active,
  };
}

/* ─── Banner Card ────────────────────────────────────── */
function BannerCard({
  banner,
  onEdit,
  onDelete,
  onToggle,
}: {
  banner: BannerItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const accent = banner.accentColor || "#3B82F6";
  const bgCol = banner.bgColor || "#0F172A";
  const textCol = banner.textColor || "#FFFFFF";
  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow group aspect-video transition-all duration-300 ${
        !banner.active ? "opacity-50 grayscale" : ""
      }`}
      style={{ backgroundColor: bgCol }}
    >
      {banner.imagePreview ? (
        <img
          src={banner.imagePreview}
          alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${bgCol}, #1e293b)` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Status dot */}
      <div
        className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white/30 transition-colors ${
          banner.active ? "bg-emerald-400" : "bg-slate-500"
        }`}
      />

      {/* HIDDEN badge overlay */}
      {!banner.active && (
        <div className="absolute top-2 left-2 text-[8px] font-black bg-slate-700/90 text-white px-1.5 py-0.5 rounded-md tracking-wider uppercase">
          Hidden
        </div>
      )}

      <div className="absolute inset-0 p-3 flex flex-col justify-between">
        {banner.badge && (
          <span
            className="self-start text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded"
            style={{ color: accent, backgroundColor: `${accent}30` }}
          >
            {banner.badge}
          </span>
        )}
        <div>
          <p className="font-extrabold text-[11px] leading-snug line-clamp-2" style={{ color: textCol }}>
            {banner.title}
          </p>
          <p className="text-[9px] mt-0.5 line-clamp-1 opacity-75" style={{ color: textCol }}>{banner.subtitle}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded-full`}
              style={{
                backgroundColor: isWAUrl(banner.ctaLink) ? "#059669" : accent,
                color: "#FFFFFF",
              }}
            >
              {banner.ctaText}
            </span>
            {banner.ctaText2 && (
              <span 
                className="inline-flex items-center text-[8px] font-bold px-2 py-0.5 rounded-full border border-white/15"
                style={{ backgroundColor: "rgba(255,255,255,0.1)", color: textCol }}
              >
                {banner.ctaText2}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover actions */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
        <button
          onClick={onToggle}
          title={banner.active ? "Hide from homepage" : "Show on homepage"}
          className={`w-9 h-9 rounded-full border flex items-center justify-center text-white transition-all ${
            banner.active
              ? "bg-emerald-600/80 hover:bg-emerald-600 border-emerald-500/50"
              : "bg-slate-600/80 hover:bg-slate-500 border-slate-400/50"
          }`}
        >
          {banner.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button
          onClick={onEdit}
          title="Edit"
          className="w-9 h-9 rounded-full bg-primary/80 hover:bg-primary border border-primary/50 flex items-center justify-center text-white transition-all"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="w-9 h-9 rounded-full bg-red-600/80 hover:bg-red-600 border border-red-500/50 flex items-center justify-center text-white transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Color Preset ────────────────────────────────────── */
function ColorField({
  label,
  value,
  onChange,
  presets,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  presets: string[];
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-border cursor-pointer flex-shrink-0"
        />
        <div className="flex gap-1 flex-wrap">
          {presets.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className="w-5 h-5 rounded-full border-2 transition-all flex-shrink-0"
              style={{
                backgroundColor: c,
                borderColor: value === c ? "#3B82F6" : "transparent",
                boxShadow: value === c ? "0 0 0 1px #3B82F6" : "none",
              }}
            />
          ))}
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground font-mono mt-1 block">{value}</span>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function BannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BannerItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BannerItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  /* Form state */
  const [fType, setFType] = useState<"hero" | "carousel" | "sidebar">("carousel");
  const [fTitle, setFTitle] = useState("");
  const [fSubtitle, setFSubtitle] = useState("");
  const [fBadge, setFBadge] = useState("");
  const [fCtaText, setFCtaText] = useState("");
  const [fCtaLink, setFCtaLink] = useState("");
  const [fCtaText2, setFCtaText2] = useState("");
  const [fCtaLink2, setFCtaLink2] = useState("");
  const [fAccent, setFAccent] = useState("#3B82F6");
  const [fTextColor, setFTextColor] = useState("#FFFFFF");
  const [fBgColor, setFBgColor] = useState("#0F172A");
  const [fActive, setFActive] = useState(true);

  /* Image state */
  const [fImageMode, setFImageMode] = useState<"upload" | "url">("upload");
  const [fImageData, setFImageData] = useState<string | undefined>(); // base64 from upload
  const [fImageUrl, setFImageUrl] = useState(""); // typed URL
  const [imgError, setImgError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  /* Load banners from the API on mount */
  const loadBanners = async () => {
    try {
      const rows = await getAdminBanners();
      setBanners(rows.map(fromApi));
    } catch (err: any) {
      notify(err?.message || "Failed to load banners");
    }
  };

  useEffect(() => { loadBanners(); }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal || deleteTarget) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal, deleteTarget]);

  const toggleActive = async (id: string) => {
    const item = banners.find((b) => b.id === id);
    if (!item) return;
    const nextActive = !item.active;
    // Optimistic update, rolled back if the request fails.
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, active: nextActive } : b)));
    try {
      await updateBanner(Number(id), { is_active: nextActive });
      notify(nextActive ? `Banner "${item.title}" is now visible on Homepage` : `Banner "${item.title}" hidden from Homepage`);
    } catch (err: any) {
      setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, active: item.active } : b)));
      notify(err?.message || "Failed to update banner");
    }
  };

  /* ─── Modal helpers ─────────────────────────────────── */
  const resetForm = () => {
    setFTitle(""); setFSubtitle(""); setFBadge("");
    setFCtaText(""); setFCtaLink(""); setFCtaText2(""); setFCtaLink2("");
    setFAccent("#3B82F6"); setFTextColor("#FFFFFF"); setFBgColor("#0F172A");
    setFActive(true); setFImageMode("upload");
    setFImageData(undefined); setFImageUrl(""); setImgError("");
  };

  const openAdd = (type: "hero" | "carousel" | "sidebar") => {
    setEditing(null);
    setFType(type);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (b: BannerItem) => {
    setEditing(b);
    setFType(b.type); setFTitle(b.title); setFSubtitle(b.subtitle); setFBadge(b.badge || "");
    setFCtaText(b.ctaText); setFCtaLink(b.ctaLink);
    setFCtaText2(b.ctaText2 || ""); setFCtaLink2(b.ctaLink2 || "");
    setFAccent(b.accentColor || "#3B82F6");
    setFTextColor(b.textColor || "#FFFFFF");
    setFBgColor(b.bgColor || "#0F172A");
    setFActive(b.active);
    setImgError("");
    // Uploaded files come back as /media/ URLs — show those in upload mode so
    // the current image previews; external links stay in URL mode.
    const src = b.imagePreview || "";
    const isUploaded = src.startsWith("data:") || src.includes("/media/");
    if (isUploaded) {
      setFImageMode("upload"); setFImageData(src); setFImageUrl("");
    } else if (src) {
      setFImageMode("url"); setFImageUrl(src); setFImageData(undefined);
    } else {
      setFImageMode("upload"); setFImageData(undefined); setFImageUrl("");
    }
    if (fileRef.current) fileRef.current.value = "";
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setFImageData(ev.target.result as string);
        setImgError("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const uploadFile = fImageMode === "upload" ? fileRef.current?.files?.[0] : undefined;
    const urlValue = fImageMode === "url" ? fImageUrl.trim() : "";
    // An existing banner may already have an image; only require one when creating.
    if (!uploadFile && !urlValue && !editing) {
      setImgError("Please upload an image or enter a valid image URL.");
      return;
    }
    setImgError("");
    setSaving(true);

    // Shared scalar fields, sent either as JSON or as multipart when a file is attached.
    const fields: Record<string, string> = {
      type: fType,
      title: fTitle,
      subtitle: fSubtitle,
      badge: fBadge,
      cta_text: fCtaText,
      cta_link: fCtaLink,
      cta_text_2: fCtaText2,
      cta_link_2: fCtaLink2,
      accent_color: fAccent,
      text_color: fTextColor,
      bg_color: fBgColor,
      is_active: String(fActive),
    };

    let payload: FormData | Record<string, unknown>;
    if (uploadFile) {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", uploadFile);
      fd.append("image_url", ""); // uploaded file takes precedence
      payload = fd;
    } else {
      payload = { ...fields, is_active: fActive, ...(urlValue ? { image_url: urlValue } : {}) };
    }

    try {
      if (editing) await updateBanner(Number(editing.id), payload);
      else await createBanner(payload);
      setShowModal(false);
      notify(editing ? `Saved changes to "${fTitle}"` : `Created new banner "${fTitle}"`);
      await loadBanners();
    } catch (err: any) {
      setImgError(err?.message || "Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await deleteBanner(Number(target.id));
      notify(`Deleted banner "${target.title}"`);
      await loadBanners();
    } catch (err: any) {
      notify(err?.message || "Failed to delete banner");
    }
  };

  const heroBanners = banners.filter((b) => b.type === "hero");
  const carouselBanners = banners.filter((b) => b.type === "carousel");
  const sidebarBanners = banners.filter((b) => b.type === "sidebar");

  return (
    <div className="p-6 sm:p-8 max-w-7xl space-y-8 relative">

      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Banners & Slide Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage hero carousel slides and sidebar banners. Live synced to storefront homepage.
          </p>
        </div>
        <button
          onClick={loadBanners}
          className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto flex items-center gap-1.5"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Banners", value: banners.length, color: "text-foreground" },
          { label: "Active Carousel", value: carouselBanners.filter((b) => b.active).length, color: "text-primary" },
          { label: "Active Sidebar", value: sidebarBanners.filter((b) => b.active).length, color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="store-card text-center py-5">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-muted-foreground text-xs mt-1 font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Homepage hero — the big video/image banner at the very top */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Homepage Hero{" "}
              <span className="text-muted-foreground font-normal text-xs">(Full-width banner at the top of the homepage)</span>
            </h2>
          </div>
          {heroBanners.length === 0 && (
            <button
              onClick={() => openAdd("hero")}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Hero
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {heroBanners.map((b) => (
            <BannerCard
              key={b.id}
              banner={b}
              onEdit={() => openEdit(b)}
              onDelete={() => setDeleteTarget(b)}
              onToggle={() => toggleActive(b.id)}
            />
          ))}
          {heroBanners.length === 0 && (
            <p className="text-xs text-muted-foreground col-span-full py-6 text-center border border-dashed border-border rounded-xl">
              No hero configured — the homepage is using its built-in default.
            </p>
          )}
        </div>
      </div>

      {/* Carousel section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Main Slider Slides{" "}
              <span className="text-muted-foreground font-normal text-xs">(Left side, big carousel)</span>
            </h2>
          </div>
          <button
            onClick={() => openAdd("carousel")}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Slide
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {carouselBanners.map((b) => (
            <BannerCard
              key={b.id}
              banner={b}
              onEdit={() => openEdit(b)}
              onDelete={() => setDeleteTarget(b)}
              onToggle={() => toggleActive(b.id)}
            />
          ))}
          {carouselBanners.length === 0 && (
            <div className="col-span-3 py-12 text-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
              No carousel slides yet. Click "Add Slide" to create your first one.
            </div>
          )}
        </div>
      </div>

      {/* Sidebar section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-bold text-foreground">
              Side Stack Banners{" "}
              <span className="text-muted-foreground font-normal text-xs">(Right side, 3 cards)</span>
            </h2>
          </div>
          <button
            onClick={() => openAdd("sidebar")}
            className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 border-emerald-500/30 hover:border-emerald-500/60 text-emerald-600"
          >
            <Plus className="w-3.5 h-3.5" /> Add Card
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sidebarBanners.map((b) => (
            <BannerCard
              key={b.id}
              banner={b}
              onEdit={() => openEdit(b)}
              onDelete={() => setDeleteTarget(b)}
              onToggle={() => toggleActive(b.id)}
            />
          ))}
          {sidebarBanners.length === 0 && (
            <div className="col-span-3 py-12 text-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
              No sidebar banners yet. Click "Add Card" to create your first one.
            </div>
          )}
        </div>
      </div>

      {/* ══ ADD / EDIT MODAL ════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border rounded-t-2xl flex-shrink-0">
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    {editing ? "Edit Banner" : "Add New Banner"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {editing ? `Editing: "${editing.title}"` : "Fill in details to create a new banner"}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                id="banner-form"
                onSubmit={handleSave}
                className="p-6 space-y-6 overflow-y-auto flex-1 overscroll-contain"
                onWheel={(e) => { e.currentTarget.scrollTop += e.deltaY; }}
              >

                {/* Type selector */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Banner Type
                  </label>
                  <div className="flex gap-3">
                    {(["carousel", "sidebar"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFType(t)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                          fType === t
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {t === "carousel" ? "🖼 Carousel Slide (Left)" : "📋 Sidebar Card (Right)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image — dual mode */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Banner Image{" "}
                    <span className="text-muted-foreground font-normal normal-case text-[10px]">
                      — one source required
                    </span>
                  </label>

                  {/* Mode tabs */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => { setFImageMode("upload"); setImgError(""); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        fImageMode === "upload"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload from PC
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFImageMode("url"); setImgError(""); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        fImageMode === "url"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" /> Enter Image URL
                    </button>
                  </div>

                  {fImageMode === "upload" ? (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer h-40 group hover:border-primary/60 transition-colors"
                    >
                      {fImageData ? (
                        <>
                          <img src={fImageData} alt="preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <ImagePlus className="w-5 h-5 text-white" />
                            <span className="text-white text-xs font-semibold">Change Image</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setFImageData(undefined); if (fileRef.current) fileRef.current.value = ""; }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-4">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <ImagePlus className="w-7 h-7 text-primary" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">Click to upload image</p>
                          <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP · Max 5MB · Recommended 1200×400px</p>
                        </div>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={fImageUrl}
                        onChange={(e) => { setFImageUrl(e.target.value); setImgError(""); }}
                        className="input-field text-sm w-full"
                        placeholder="https://images.unsplash.com/photo-xxxx..."
                      />
                      {fImageUrl && (
                        <div className="relative h-36 rounded-xl overflow-hidden border border-border bg-slate-900">
                          <img
                            src={fImageUrl}
                            alt="URL preview"
                            className="w-full h-full object-cover"
                            onError={() => setImgError("Could not load image from this URL. Check the link.")}
                            onLoad={() => setImgError("")}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {imgError && (
                    <p className="text-xs text-red-500 mt-2 font-semibold">{imgError}</p>
                  )}
                </div>

                {/* Title + Badge */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Title *
                    </label>
                    <input
                      value={fTitle}
                      onChange={(e) => setFTitle(e.target.value)}
                      required
                      className="input-field text-sm w-full"
                      placeholder="e.g. High-Performance Protection"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Badge Label
                    </label>
                    <input
                      value={fBadge}
                      onChange={(e) => setFBadge(e.target.value)}
                      className="input-field text-sm w-full"
                      placeholder="e.g. PREMIUM SELECTION"
                    />
                  </div>
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Subtitle / Description
                  </label>
                  <textarea
                    value={fSubtitle}
                    onChange={(e) => setFSubtitle(e.target.value)}
                    className="input-field text-sm resize-none w-full"
                    rows={2}
                    placeholder="e.g. WAPDA Approved Switchgear for Every Application"
                  />
                </div>

                {/* CTAs */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Call-to-Action Buttons
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Primary Text *</label>
                      <input value={fCtaText} onChange={(e) => setFCtaText(e.target.value)} required className="input-field text-sm w-full" placeholder="Browse Catalog" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Primary Link *</label>
                      <input value={fCtaLink} onChange={(e) => setFCtaLink(e.target.value)} required className="input-field text-sm w-full" placeholder="/products" />
                    </div>
                    {fType === "carousel" && (
                      <>
                        <div>
                          <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Secondary Text</label>
                          <input value={fCtaText2} onChange={(e) => setFCtaText2(e.target.value)} className="input-field text-sm w-full" placeholder="Get Quote" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Secondary Link</label>
                          <input value={fCtaLink2} onChange={(e) => setFCtaLink2(e.target.value)} className="input-field text-sm w-full" placeholder="/contact" />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Colors
                  </label>
                  <div className="grid grid-cols-3 gap-5 p-4 rounded-xl bg-secondary/20 border border-border">
                    <ColorField
                      label="Accent / Badge"
                      value={fAccent}
                      onChange={setFAccent}
                      presets={["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#25D366"]}
                    />
                    <ColorField
                      label="Text Color"
                      value={fTextColor}
                      onChange={setFTextColor}
                      presets={["#FFFFFF", "#F8FAFC", "#1E293B", "#0F172A", "#FEF9C3", "#ECFDF5"]}
                    />
                    <ColorField
                      label="Background"
                      value={fBgColor}
                      onChange={setFBgColor}
                      presets={["#0F172A", "#1E1B4B", "#022C22", "#1C1400", "#1A0000", "#082F49"]}
                    />
                  </div>

                  {/* Live preview bar */}
                  <div
                    className="mt-3 rounded-xl p-4 flex items-center justify-between"
                    style={{ backgroundColor: fBgColor, color: fTextColor }}
                  >
                    <div>
                      {fBadge && (
                        <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded mb-1 inline-block" style={{ color: fAccent, backgroundColor: `${fAccent}25` }}>
                          {fBadge}
                        </span>
                      )}
                      <p className="text-xs font-extrabold leading-snug" style={{ color: fTextColor }}>
                        {fTitle || "Banner Title"}
                      </p>
                      <p className="text-[10px] mt-0.5 opacity-60" style={{ color: fTextColor }}>
                        {fSubtitle || "Subtitle text..."}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-lg" style={{ backgroundColor: fAccent, color: "#fff" }}>
                      {fCtaText || "CTA"}
                    </span>
                  </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Show on Homepage</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      When active, this banner appears on the storefront homepage.
                    </p>
                  </div>
                  <div
                    className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                      fActive ? "bg-primary" : "bg-secondary border border-border"
                    }`}
                    onClick={() => setFActive(!fActive)}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200 ${
                        fActive ? "left-7" : "left-1"
                      }`}
                    />
                  </div>
                </div>

              </form>

              {/* Pinned footer buttons */}
              <div className="flex gap-3 p-5 border-t border-border flex-shrink-0">
                <button
                  type="submit"
                  form="banner-form"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 flex-1 justify-center text-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saving ? "Saving…" : editing ? "Save Changes" : "Add Banner"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary px-6 text-sm"
                >
                  Cancel
                </button>
              </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ══════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-bold text-foreground mb-1">Delete Banner</h3>
            <p className="text-muted-foreground text-sm mb-5">
              Are you sure you want to delete{" "}
              <strong>"{deleteTarget.title}"</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
