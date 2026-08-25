"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { useAuth } from "@/lib/auth";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  // Viewport modes: <768px drawer, 768-1023px collapsed rail, >=1024px expanded
  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 767px)");
    const mqTablet = window.matchMedia("(max-width: 1023px)");
    const apply = () => {
      setCollapsed(!mqMobile.matches && mqTablet.matches);
      if (!mqMobile.matches) setMobileOpen(false);
    };
    apply();
    mqMobile.addEventListener("change", apply);
    mqTablet.addEventListener("change", apply);
    return () => {
      mqMobile.removeEventListener("change", apply);
      mqTablet.removeEventListener("change", apply);
    };
  }, []);

  // Auth guard — redirect non-admin users
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render admin content if not admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar. Shown at every size so the notification bell has a home on
            desktop too; the hamburger and logo stay mobile-only. */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/admin" className="md:hidden flex items-center gap-2">
            <Image
              src="/header_logo.png"
              alt="Eng-Mart"
              width={150}
              height={50}
              className="h-10 w-auto object-contain"
            />
            <span className="text-sm font-bold text-foreground">Admin</span>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
