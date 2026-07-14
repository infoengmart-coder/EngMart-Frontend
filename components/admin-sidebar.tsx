"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Sales",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart, badge: 7 },
      { name: "Quotations", href: "/admin/quotations", icon: FileText, badge: 2 },
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
      { name: "Queries", href: "/admin/queries", icon: MessageSquare, badge: 4 },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "bg-card border-r border-border h-screen sticky top-0 flex flex-col transition-all duration-300 shrink-0 z-30",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="border-b border-border flex items-center shrink-0 h-16 px-4">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
          {collapsed ? (
            <Image
              src="/header_logo.png"
              alt="Eng-Mart"
              width={36}
              height={36}
              className="h-8 w-8 object-contain shrink-0"
            />
          ) : (
            <Image
              src="/header_logo.png"
              alt="Eng-Mart"
              width={140}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
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
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-150 relative group",
                      collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
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
                      <span className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
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

      {/* Bottom: Logout + Collapse toggle */}
      <div className="border-t border-border p-3 space-y-1 shrink-0">
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors",
            collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2"
          )}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
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
  );
}
