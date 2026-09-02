"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Users,
  Award,
  Package,
  Image as ImageIcon,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Globe,
  FolderTree,
  Tag,
  BadgePercent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useScrollLock } from "@/components/confirm-dialog";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

type NavSection = { label: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Sales",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { name: "Quotations", href: "/admin/quotations", icon: FileText },
    ],
  },
  {
    label: "People",
    items: [
      { name: "Customers", href: "/admin/customers", icon: Users },
      { name: "Wholesale", href: "/admin/special-customers", icon: Award },
    ],
  },
  {
    label: "Catalog",
    items: [
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Categories", href: "/admin/categories", icon: FolderTree },
      { name: "Brands", href: "/admin/brands", icon: Tag },
      { name: "Discounts", href: "/admin/discounts", icon: BadgePercent },
      { name: "Banners", href: "/admin/banners", icon: ImageIcon },
    ],
  },
  {
    label: "Insights",
    items: [
      { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Support",
    items: [
      { name: "Queries", href: "/admin/queries", icon: MessageSquare },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  useScrollLock(mobileOpen);

  // Close the mobile drawer on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onMobileClose]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    onMobileClose();
    logout();
    router.replace("/login");
  };

  // Prevent sidebar nav scroll from leaking to the page (non-passive wheel handler).
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop <= 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
      if (atTop || atBottom || scrollHeight <= clientHeight) {
        e.preventDefault();
      }
      e.stopPropagation();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <>
      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 animate-fade-in md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Admin navigation"
        className={cn(
          // Mobile (<md): off-canvas drawer with full labels
          "bg-card border-r border-border flex flex-col fixed inset-y-0 left-0 z-50 h-dvh w-72 max-w-[85vw] transition-[transform,width] duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // md+: sticky rail/expanded sidebar
          "md:sticky md:top-0 md:z-30 md:translate-x-0 md:shrink-0",
          collapsed ? "md:w-[68px]" : "md:w-64"
        )}
      >
        {/* Logo */}
        <div className="border-b border-border flex items-center shrink-0 h-20 px-4">
          <Link href="/admin" onClick={onMobileClose} className="flex items-center gap-3 overflow-hidden">
            {collapsed ? (
              <Image
                src="/header_logo.png"
                alt="Eng-Mart"
                width={48}
                height={48}
                className="h-11 w-11 object-contain shrink-0"
              />
            ) : (
              <Image
                src="/header_logo.png"
                alt="Eng-Mart"
                width={180}
                height={60}
                className="h-12 w-auto object-contain"
                priority
              />
            )}
          </Link>
        </div>

        {/* Navigation */}
        {/* min-h-0 is what actually makes this scroll: a flex child defaults to
            min-height:auto, so the nav grew to fit its content instead of
            shrinking, and overflow-y-auto never had anything to scroll.
            overscroll-contain stops the scroll from chaining to the page. */}
        <nav ref={navRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-3 px-3 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <div className="px-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
                    {section.label}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onMobileClose}
                      title={collapsed ? item.name : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md text-sm font-medium transition-colors duration-150 relative group",
                        collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5 md:py-2",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <Icon className="w-[18px] h-[18px] shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "ml-auto text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5",
                                active
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {/* Collapsed badge dot */}
                      {collapsed && item.badge && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                      )}
                      {/* Collapsed tooltip */}
                      {collapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap z-50 pointer-events-none">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom: View Store + Logout + Collapse toggle */}
        <div className="border-t border-border p-3 space-y-1 shrink-0">
          <Link
            href="/"
            onClick={onMobileClose}
            className={cn(
              "flex w-full items-center gap-3 rounded-md text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5 md:py-2"
            )}
            title="Go to Frontend Store"
          >
            <Globe className="w-[18px] h-[18px] shrink-0 text-primary" />
            {!collapsed && <span>Go to Store</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-3 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer",
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5 md:py-2"
            )}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "hidden md:flex w-full items-center gap-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer",
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
            )}
          >
            {collapsed ? (
              <ChevronsRight className="w-[18px] h-[18px]" />
            ) : (
              <>
                <ChevronsLeft className="w-[18px] h-[18px]" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
