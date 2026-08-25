"use client";

import { useState, useRef, useEffect } from "react";
import {
  getAdminBanners, createBanner, updateBanner, deleteBanner, type BannerData,
} from "@/lib/api";
import {
  Save, ImagePlus, Trash2, Edit, Eye, EyeOff,
  X, Plus, LayoutTemplate, Layers, Link as LinkIcon, Upload, Video, Play, Film, CheckCircle2,
  Phone
} from "lucide-react";
import { AdminContactSettings } from "@/components/admin-contact-settings";

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
  videoSrc?: string;
  videoUrl?: string;
  accentColor?: string;
  textColor?: string;
  bgColor?: string;
  active: boolean;
}

interface VideoFileItem {
  file: File;
  previewUrl: string;
  name: string;
  sizeMb: string;
}

const isWAUrl = (url: string) =>
  !!(url?.toLowerCase().includes("wa.me") || url?.toLowerCase().includes("whatsapp"));

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
    videoSrc: b.video_src || undefined,
    videoUrl: b.video_url || undefined,
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
  const hasVideo = !!(banner.videoSrc || banner.videoUrl);

  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow group aspect-video transition-all duration-300 ${
        !banner.active ? "opacity-50 grayscale" : ""
      }`}
      style={{ backgroundColor: bgCol }}
    >
      {/* Background: video thumb or image */}
      {hasVideo ? (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
          {(banner.videoSrc || banner.videoUrl) ? (
            <video
              src={banner.videoSrc || banner.videoUrl}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 opacity-60">
              <Play className="w-8 h-8 text-white" />
              <span className="text-white text-[9px] font-semibold">VIDEO</span>
            </div>
          )}
        </div>
      ) : banner.imagePreview ? (
        <img
          src={banner.imagePreview}
          alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${bgCol}, #1e293b)` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Video badge */}
      {hasVideo && (
        <div className="absolute top-2 left-2 text-[8px] font-black bg-blue-600/90 text-white px-2 py-0.5 rounded-md tracking-wider uppercase flex items-center gap-1 shadow-lg">
          <Film className="w-2.5 h-2.5" /> Video
        </div>
      )}

      {/* Status dot */}
      <div
        className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white/30 transition-colors ${
          banner.active ? "bg-emerald-400" : "bg-slate-500"
        }`}
      />

      {/* HIDDEN badge */}
      {!banner.active && (
        <div className="absolute top-2 left-16 text-[8px] font-black bg-slate-700/90 text-white px-1.5 py-0.5 rounded-md tracking-wider uppercase">
          Hidden
        </div>
      )}

      <div className="absolute inset-0 p-3 flex flex-col justify-between">
        {banner.badge ? (
          <span
            className="self-start text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded mt-5"
            style={{ color: accent, backgroundColor: `${accent}30` }}
          >
            {banner.badge}
          </span>
        ) : <div />}
        <div>
          <p className="font-extrabold text-[11px] leading-snug line-clamp-2" style={{ color: textCol }}>
            {banner.title}
          </p>
          <p className="text-[9px] mt-0.5 line-clamp-1 opacity-75" style={{ color: textCol }}>{banner.subtitle}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span
              className="inline-flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 rounded-full"
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
  label, value, onChange, presets,
}: {
  label: string; value: string; onChange: (v: string) => void; presets: string[];
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
  /** Which manager this page is showing. Media is the historical default. */
  const [tab, setTab] = useState<"media" | "contact">("media");

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  /* Form state */
  const [fType, setFType] = useState<"hero" | "carousel" | "sidebar">("hero");
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

  /* Image state (for carousel & sidebar ONLY) */
  const [fImageMode, setFImageMode] = useState<"upload" | "url">("upload");
  const [fImageData, setFImageData] = useState<string | undefined>();
  const [fImageUrl, setFImageUrl] = useState("");
  const [imgError, setImgError] = useState("");

  /* Video state (for Hero ONLY) */
  const [fVideoMode, setFVideoMode] = useState<"upload" | "url">("upload");
  const [fVideoItems, setFVideoItems] = useState<VideoFileItem[]>([]);
  const [fVideoUrl, setFVideoUrl] = useState("");
  const [fExistingVideoSrc, setFExistingVideoSrc] = useState("");
  const [videoError, setVideoError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);

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

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showModal || !!deleteTarget ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal, deleteTarget]);

  const toggleActive = async (id: string) => {
    const item = banners.find((b) => b.id === id);
    if (!item) return;
    const nextActive = !item.active;
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, active: nextActive } : b)));
    try {
      await updateBanner(Number(id), { is_active: nextActive });
      notify(nextActive ? `"${item.title}" is now visible` : `"${item.title}" hidden from homepage`);
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
    setFActive(true);
    setFImageMode("upload"); setFImageData(undefined); setFImageUrl(""); setImgError("");
    setFVideoMode("upload");
    // Revoke old object URLs to prevent memory leak
    fVideoItems.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setFVideoItems([]);
    setFVideoUrl(""); setFExistingVideoSrc(""); setVideoError("");
  };

  const openAdd = (type: "hero" | "carousel" | "sidebar") => {
    setEditing(null);
    setFType(type);
    resetForm();
    if (type === "hero") {
      setFVideoMode("upload");
      setFTitle("Premium Switchgear, Certified & In Stock");
      setFSubtitle("Source genuine ABB, CHINT, Himel, FICO & PCE products directly. Built for industry — backed by trust. Karachi-based.");
      setFBadge("Pakistan's #1 Industrial Electrical Supplier");
      setFCtaText("Browse Catalog");
      setFCtaLink("/products");
      setFCtaText2("Get Quote");
      setFCtaLink2("/contact");
    }
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
    setImgError(""); setVideoError("");

    // Image (for carousel & sidebar)
    const src = b.imagePreview || "";
    const isUploaded = src.startsWith("data:") || src.includes("/media/");
    if (isUploaded) { setFImageMode("upload"); setFImageData(src); setFImageUrl(""); }
    else if (src) { setFImageMode("url"); setFImageUrl(src); setFImageData(undefined); }
    else { setFImageMode("upload"); setFImageData(undefined); setFImageUrl(""); }
    if (fileRef.current) fileRef.current.value = "";

    // Video (for hero)
    fVideoItems.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setFVideoItems([]);
    if (videoFileRef.current) videoFileRef.current.value = "";

    if (b.videoSrc && b.videoSrc.includes("/media/")) {
      setFVideoMode("upload"); setFExistingVideoSrc(b.videoSrc); setFVideoUrl("");
    } else if (b.videoUrl || b.videoSrc) {
      setFVideoMode("url"); setFVideoUrl(b.videoUrl || b.videoSrc || ""); setFExistingVideoSrc("");
    } else {
      setFVideoMode("upload"); setFExistingVideoSrc(""); setFVideoUrl("");
    }

    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) { setFImageData(ev.target.result as string); setImgError(""); }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Filter strictly for video files
    const validVideos = files.filter(f => f.type.startsWith("video/") || /\.(mp4|webm|mov|ogg|mkv)$/i.test(f.name));
    if (validVideos.length === 0) {
      setVideoError("Please select valid video files only (.mp4, .webm, .mov).");
      return;
    }
    if (validVideos.length !== files.length) {
      setVideoError("Some files were skipped because they are not videos.");
    } else {
      setVideoError("");
    }

    const newItems: VideoFileItem[] = validVideos.map(f => ({
      file: f,
      previewUrl: URL.createObjectURL(f),
      name: f.name,
      sizeMb: (f.size / (1024 * 1024)).toFixed(1),
    }));

    setFVideoItems(prev => [...prev, ...newItems]);
    setFExistingVideoSrc("");
  };

  const removeVideoFile = (idx: number) => {
    setFVideoItems(prev => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
    if (videoFileRef.current) videoFileRef.current.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation per type
    if (fType === "hero") {
      const hasHeroVideo = fVideoItems.length > 0 || (fVideoMode === "url" && fVideoUrl.trim()) || fExistingVideoSrc;
      if (!hasHeroVideo && !editing) {
        setVideoError("Please select at least one video file from your PC or enter a video URL.");
        return;
      }
    } else {
      const uploadImageFile = fImageMode === "upload" ? fileRef.current?.files?.[0] : undefined;
      const imageUrlValue = fImageMode === "url" ? fImageUrl.trim() : "";
      if (!uploadImageFile && !imageUrlValue && !editing) {
        setImgError("Please upload an image or enter an image URL.");
        return;
      }
    }

    setImgError(""); setVideoError("");
    setSaving(true);

    const sharedFields: Record<string, string> = {
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
      video_url: fType === "hero" && fVideoMode === "url" ? fVideoUrl.trim() : "",
    };

    try {
      if (fType === "hero" && fVideoItems.length > 0) {
        // Save hero banner(s) for each uploaded video file
        for (let i = 0; i < fVideoItems.length; i++) {
          const fd = new FormData();
          Object.entries(sharedFields).forEach(([k, v]) => fd.append(k, v));
          const originalFile = fVideoItems[i].file;
          const ext = originalFile.name.slice(originalFile.name.lastIndexOf('.')) || '.mp4';
          const safeName = `hero_video_${i + 1}_${Date.now().toString().slice(-6)}${ext}`;
          fd.append("video", originalFile, safeName);
          fd.append("video_url", "");

          if (i === 0 && editing) {
            await updateBanner(Number(editing.id), fd);
          } else {
            await createBanner(fd);
          }
        }
      } else if (fType === "hero") {
        // Hero with URL or existing video
        const payload = {
          ...sharedFields,
          is_active: fActive,
        };
        if (editing) await updateBanner(Number(editing.id), payload);
        else await createBanner(payload);
      } else {
        // Carousel or Sidebar with image
        const uploadImageFile = fImageMode === "upload" ? fileRef.current?.files?.[0] : undefined;
        const imageUrlValue = fImageMode === "url" ? fImageUrl.trim() : "";

        if (uploadImageFile) {
          const fd = new FormData();
          Object.entries(sharedFields).forEach(([k, v]) => fd.append(k, v));
          fd.append("image", uploadImageFile);
          fd.append("image_url", "");
          if (editing) await updateBanner(Number(editing.id), fd);
          else await createBanner(fd);
        } else {
          const payload = {
            ...sharedFields,
            is_active: fActive,
            ...(imageUrlValue ? { image_url: imageUrlValue } : {}),
          };
          if (editing) await updateBanner(Number(editing.id), payload);
          else await createBanner(payload);
        }
      }

      setShowModal(false);
      notify(editing ? `Saved changes to "${fTitle}"` : `Created banner "${fTitle}"`);
      await loadBanners();
    } catch (err: any) {
      if (fType === "hero") setVideoError(err?.message || "Failed to save hero video banner");
      else setImgError(err?.message || "Failed to save banner");
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
      notify(`Deleted "${target.title}"`);
      await loadBanners();
    } catch (err: any) {
      notify(err?.message || "Failed to delete banner");
    }
  };

  const heroBanners = banners.filter((b) => b.type === "hero");
  const carouselBanners = banners.filter((b) => b.type === "carousel");
  const sidebarBanners = banners.filter((b) => b.type === "sidebar");

  // `max-w-7xl` without `mx-auto` pinned this page to the left and left a dead
  // band down the right-hand side on wide screens. Every other admin page is
  // full width — match them.
  return (
    <div className="p-5 md:p-8 space-y-8 relative">

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {tab === "media" ? "Banners & Media Manager" : "Contact Details"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tab === "media"
              ? "Manage hero background videos, carousel slides and sidebar banners. Live synced to storefront."
              : "Set the phone, WhatsApp and email the storefront shows. Live synced to storefront."}
          </p>
        </div>
        {tab === "media" && (
          <button onClick={loadBanners} className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto flex items-center gap-1.5">
            Refresh
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border -mt-2">
        {([
          { id: "media", label: "Banners & Media", icon: ImagePlus },
          { id: "contact", label: "Contact", icon: Phone },
        ] as const).map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={active ? "page" : undefined}
              className={`px-4 py-2.5 -mb-px text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "contact" && <AdminContactSettings onNotify={notify} />}

      {tab === "media" && (
      <>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Banners", value: banners.length, color: "text-foreground" },
          { label: "Hero Videos", value: heroBanners.filter(b => b.active).length, color: "text-blue-500" },
          { label: "Active Carousel", value: carouselBanners.filter(b => b.active).length, color: "text-primary" },
          { label: "Active Sidebar", value: sidebarBanners.filter(b => b.active).length, color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="store-card text-center py-5">
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-muted-foreground text-xs mt-1 font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ═══ HERO VIDEO SECTION ══════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                Hero Background Video
                <span className="text-xs bg-blue-500/10 text-blue-400 font-semibold px-2 py-0.5 rounded-full border border-blue-500/20">
                  Video Only
                </span>
              </h2>
              <p className="text-muted-foreground text-xs">
                Upload MP4/WebM videos from your PC to play as the animated homepage background.
              </p>
            </div>
          </div>
          <button
            onClick={() => openAdd("hero")}
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 border-blue-500 shadow-md shadow-blue-500/20"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Video(s) from PC
          </button>
        </div>

        {heroBanners.length === 0 ? (
          <div className="py-14 text-center text-muted-foreground text-sm border-2 border-dashed border-blue-500/30 rounded-xl bg-blue-500/5">
            <Film className="w-12 h-12 mx-auto mb-3 text-blue-500/40" />
            <p className="font-bold text-foreground text-base">No Custom Hero Video Uploaded</p>
            <p className="text-xs mt-1 max-w-md mx-auto text-muted-foreground">
              Currently playing default video (<code className="font-mono text-blue-400">/herovideo.mp4</code>). Click below to select video(s) directly from your PC.
            </p>
            <button
              onClick={() => openAdd("hero")}
              className="mt-4 btn-primary text-xs py-2.5 px-6 bg-blue-600 hover:bg-blue-700 border-blue-500 inline-flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Upload className="w-4 h-4" /> Select Video from PC
            </button>
          </div>
        ) : (
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
          </div>
        )}
      </div>

      {/* ═══ CAROUSEL SECTION ═══════════════════════════════════════ */}
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
            <BannerCard key={b.id} banner={b} onEdit={() => openEdit(b)} onDelete={() => setDeleteTarget(b)} onToggle={() => toggleActive(b.id)} />
          ))}
          {carouselBanners.length === 0 && (
            <div className="col-span-3 py-12 text-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
              No carousel slides yet. Click "Add Slide" to create your first one.
            </div>
          )}
        </div>
      </div>

      {/* ═══ SIDEBAR SECTION ════════════════════════════════════════ */}
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
            <BannerCard key={b.id} banner={b} onEdit={() => openEdit(b)} onDelete={() => setDeleteTarget(b)} onToggle={() => toggleActive(b.id)} />
          ))}
          {sidebarBanners.length === 0 && (
            <div className="col-span-3 py-12 text-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
              No sidebar banners yet. Click "Add Card" to create your first one.
            </div>
          )}
        </div>
      </div>

      </>
      )}

      {/* ══ ADD / EDIT MODAL ══════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border rounded-t-2xl flex-shrink-0">
              <div>
                <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                  {fType === "hero" ? (
                    <>
                      <Film className="w-5 h-5 text-blue-500" />
                      <span>{editing ? "Edit Hero Video Banner" : "Upload Hero Video from PC"}</span>
                    </>
                  ) : (
                    <span>{editing ? "Edit Banner" : `Add New ${fType === "carousel" ? "Carousel" : "Sidebar"} Banner`}</span>
                  )}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {fType === "hero"
                    ? "Select video file(s) from your computer for the homepage hero background"
                    : "Fill in details to customize your banner slide"}
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
                  Banner Placement Type
                </label>
                <div className="flex gap-3">
                  {(["hero", "carousel", "sidebar"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFType(t)}
                      className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        fType === t
                          ? t === "hero" ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm"
                          : "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {t === "hero" ? "🎬 Hero Video (Video Only)" : t === "carousel" ? "🖼 Carousel Slide" : "📋 Sidebar Card"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════ */}
              {/* HERO ONLY: DEDICATED VIDEO SELECTOR (NO IMAGE SECTION)     */}
              {/* ═══════════════════════════════════════════════════════════ */}
              {fType === "hero" ? (
                <div className="space-y-4 p-5 rounded-2xl bg-blue-500/5 border-2 border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-500" />
                        Select Video(s) from PC
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Supports MP4, WebM, MOV. You can select one or multiple videos at once.
                      </p>
                    </div>
                    {/* Switch between Upload from PC and Video URL */}
                    <div className="flex gap-1.5 bg-slate-900/50 p-1 rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => setFVideoMode("upload")}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          fVideoMode === "upload"
                            ? "bg-blue-600 text-white shadow"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        From PC
                      </button>
                      <button
                        type="button"
                        onClick={() => setFVideoMode("url")}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          fVideoMode === "url"
                            ? "bg-blue-600 text-white shadow"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Video URL
                      </button>
                    </div>
                  </div>

                  {fVideoMode === "upload" ? (
                    <div className="space-y-3">
                      {/* Existing video preview (when editing) */}
                      {fExistingVideoSrc && fVideoItems.length === 0 && (
                        <div className="relative rounded-xl overflow-hidden border border-blue-500/30 bg-slate-900 h-44 shadow-inner">
                          <video
                            src={fExistingVideoSrc}
                            className="w-full h-full object-cover opacity-80"
                            controls
                            muted
                            playsInline
                          />
                          <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            Current Active Video
                          </div>
                        </div>
                      )}

                      {/* Dropzone for selecting videos from PC */}
                      <div
                        onClick={() => videoFileRef.current?.click()}
                        className="border-2 border-dashed border-blue-500/50 hover:border-blue-400 bg-blue-500/10 hover:bg-blue-500/15 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-blue-400" />
                        </div>
                        <p className="text-base font-bold text-foreground">
                          Click to select video(s) from your computer
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Only video files accepted: <span className="font-semibold text-blue-400">.mp4, .webm, .mov, .mkv</span>
                        </p>
                        <span className="inline-block mt-3 text-[11px] font-semibold text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                          Hold Ctrl / Shift to select multiple videos
                        </span>
                        <input
                          ref={videoFileRef}
                          type="file"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                          multiple
                          className="hidden"
                          onChange={handleVideoFilesChange}
                        />
                      </div>

                      {/* Selected videos preview list */}
                      {fVideoItems.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            {fVideoItems.length} Video{fVideoItems.length > 1 ? "s" : ""} Selected:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {fVideoItems.map((item, i) => (
                              <div
                                key={i}
                                className="relative bg-slate-900 border border-blue-500/30 rounded-xl overflow-hidden shadow p-2 flex flex-col gap-2"
                              >
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                                  <video
                                    src={item.previewUrl}
                                    className="w-full h-full object-cover"
                                    controls
                                    muted
                                    playsInline
                                  />
                                </div>
                                <div className="flex items-center justify-between px-1">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{item.sizeMb} MB</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeVideoFile(i)}
                                    className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors ml-2"
                                    title="Remove this video"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          {fVideoItems.length > 1 && (
                            <p className="text-[11px] text-blue-400 bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20 font-medium">
                              💡 All {fVideoItems.length} videos will be uploaded and saved to your Hero Banners list.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={fVideoUrl}
                        onChange={(e) => { setFVideoUrl(e.target.value); setVideoError(""); }}
                        className="input-field text-sm w-full"
                        placeholder="https://example.com/video.mp4 or /herovideo.mp4"
                      />
                      {fVideoUrl && (
                        <div className="relative rounded-xl overflow-hidden border border-border bg-slate-900 h-40">
                          <video
                            src={fVideoUrl}
                            className="w-full h-full object-cover opacity-80"
                            controls
                            muted
                            playsInline
                            onError={() => setVideoError("Could not load video from this URL. Please check the link.")}
                            onLoadedData={() => setVideoError("")}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {videoError && <p className="text-xs text-red-500 font-bold">{videoError}</p>}
                </div>
              ) : (
                /* ═══════════════════════════════════════════════════════════ */
                /* CAROUSEL & SIDEBAR ONLY: IMAGE SELECTOR (NO VIDEO)          */
                /* ═══════════════════════════════════════════════════════════ */
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Banner Image <span className="text-muted-foreground font-normal normal-case text-[10px]">— required</span>
                  </label>

                  {/* Mode tabs */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => { setFImageMode("upload"); setImgError(""); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        fImageMode === "upload" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload from PC
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFImageMode("url"); setImgError(""); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        fImageMode === "url" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
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
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
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
                            onError={() => setImgError("Could not load image from this URL.")}
                            onLoad={() => setImgError("")}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {imgError && <p className="text-xs text-red-500 mt-2 font-semibold">{imgError}</p>}
                </div>
              )}

              {/* Title + Badge */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    {fType === "hero" ? "Hero Headline Title *" : "Title *"}
                  </label>
                  <input
                    value={fTitle}
                    onChange={(e) => setFTitle(e.target.value)}
                    required
                    className="input-field text-sm w-full"
                    placeholder="e.g. Premium Switchgear, Certified & In Stock"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Badge / Tag Label
                  </label>
                  <input
                    value={fBadge}
                    onChange={(e) => setFBadge(e.target.value)}
                    className="input-field text-sm w-full"
                    placeholder="e.g. Pakistan's #1 Industrial Supplier"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {fType === "hero" ? "Hero Subtitle Description" : "Subtitle / Description"}
                </label>
                <textarea
                  value={fSubtitle}
                  onChange={(e) => setFSubtitle(e.target.value)}
                  className="input-field text-sm resize-none w-full"
                  rows={2}
                  placeholder="e.g. Source genuine ABB, CHINT, Himel, FICO & PCE products directly. Built for industry — backed by trust."
                />
              </div>

              {/* CTAs */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Call-to-Action Buttons
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Primary Button Text *</label>
                    <input value={fCtaText} onChange={(e) => setFCtaText(e.target.value)} required className="input-field text-sm w-full" placeholder="Browse Catalog" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Primary Button Link *</label>
                    <input value={fCtaLink} onChange={(e) => setFCtaLink(e.target.value)} required className="input-field text-sm w-full" placeholder="/products" />
                  </div>
                  {(fType === "carousel" || fType === "hero") && (
                    <>
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Secondary Button Text</label>
                        <input value={fCtaText2} onChange={(e) => setFCtaText2(e.target.value)} className="input-field text-sm w-full" placeholder="Get Quote" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-muted-foreground font-semibold mb-1">Secondary Button Link</label>
                        <input value={fCtaLink2} onChange={(e) => setFCtaLink2(e.target.value)} className="input-field text-sm w-full" placeholder="/contact" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Theme Colors
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
                <div className="mt-3 rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: fBgColor, color: fTextColor }}>
                  <div>
                    {fBadge && (
                      <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded mb-1 inline-block"
                        style={{ color: fAccent, backgroundColor: `${fAccent}25` }}>{fBadge}</span>
                    )}
                    <p className="text-xs font-extrabold leading-snug" style={{ color: fTextColor }}>{fTitle || "Banner Title"}</p>
                    <p className="text-[10px] mt-0.5 opacity-60" style={{ color: fTextColor }}>{fSubtitle || "Subtitle text..."}</p>
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
                  <p className="text-[11px] text-muted-foreground mt-0.5">When active, this video/banner appears on the storefront homepage.</p>
                </div>
                <div
                  className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${fActive ? "bg-primary" : "bg-secondary border border-border"}`}
                  onClick={() => setFActive(!fActive)}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200 ${fActive ? "left-7" : "left-1"}`} />
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="flex gap-3 p-5 border-t border-border flex-shrink-0">
              <button
                type="submit"
                form="banner-form"
                disabled={saving}
                className="btn-primary flex items-center gap-2 flex-1 justify-center text-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? "Saving…" : editing ? "Save Changes" : fType === "hero" ? "Upload & Save Video(s)" : "Add Banner"}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary px-6 text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-bold text-foreground mb-1">Delete Banner</h3>
            <p className="text-muted-foreground text-sm mb-5">
              Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors">
                Delete
              </button>
              <button onClick={() => setDeleteTarget(null)} className="flex-1 btn-secondary text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
