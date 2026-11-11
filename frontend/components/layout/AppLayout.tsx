"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import AccessDenied from "@/components/auth/AccessDenied";
import { auth } from "@/lib/api";
import { PermissionsProvider, usePermissions } from "@/lib/permissions";
import { getRouteRequirements } from "@/lib/route-access";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!auth.isAuthenticated()) {
      window.location.href = "/login";
    }
    setAuthChecked(true);
  }, []);

  if (!mounted || !authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 pt-16">
        <Topbar />
        <div className="flex pt-4">
          <aside className="w-64 bg-slate-900 text-slate-300 h-screen hidden md:flex flex-col" />
          <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8">
            <div className="animate-pulse bg-slate-200 rounded-lg h-96 w-full mx-auto"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <PermissionsProvider>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </PermissionsProvider>
  );
}

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { ready, has, hasRole } = usePermissions();

  const requirements = getRouteRequirements(pathname);
  const isSuperAdminOnly = pathname.startsWith("/admin/settings");

  const allowed =
    (!requirements ||
      requirements.every((req) => has(req.module, req.action))) &&
    (!isSuperAdminOnly || hasRole("SUPER_ADMIN"));

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <Topbar onMenuToggle={() => setMobileMenuOpen((value) => !value)} />
      <div className="flex pt-4">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8">
          {!ready ? (
            <div className="animate-pulse bg-slate-200 rounded-lg h-96 w-full mx-auto" />
          ) : allowed ? (
            children
          ) : (
            <AccessDenied />
          )}
        </main>
      </div>
    </div>
  );
}
