"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/api";
import { usePermissions } from "@/lib/permissions";
import type { PermissionRequirement } from "@/lib/route-access";

type NavItem = {
  name: string;
  href: string;
  icon: string;
  module?: string;
  action?: string;
  requirements?: PermissionRequirement[];
  superOnly?: boolean;
};

const mainItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "📊", module: "document", action: "view" },
  { name: "Documents", href: "/documents", icon: "📄", module: "document", action: "view" },
  { name: "Public Library", href: "/public-library", icon: "📚", module: "document", action: "view" },
  { name: "Favorites", href: "/favorites", icon: "⭐", module: "document", action: "view" },
  { name: "Recent", href: "/recently-opened", icon: "🕒", module: "document", action: "view" },
  { name: "Profile", href: "/profile", icon: "👤" },
];

const adminItems: NavItem[] = [
  { name: "Announcements", href: "/admin/announcements", icon: "📢", module: "announcement", action: "view" },
  { name: "Departments", href: "/admin/departments", icon: "🏢", module: "department", action: "view" },
  { name: "Categories", href: "/admin/categories", icon: "📁", module: "category", action: "view" },
  { name: "Tags", href: "/admin/tags", icon: "🏷️", module: "tag", action: "view" },
  { name: "Users", href: "/admin/users", icon: "👥", module: "user", action: "view" },
  { name: "Roles", href: "/admin/roles", icon: "🎭", module: "role", action: "view" },
  { name: "Permissions", href: "/admin/permissions", icon: "🔐", requirements: [
    { module: "permission", action: "view" },
    { module: "role", action: "view" },
    { module: "role_permission", action: "view" },
  ] },
  { name: "Audit Log", href: "/admin/audit-log", icon: "📋", module: "audit", action: "view" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️", superOnly: true },
];

export default function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
} = {}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const prevPath = useRef(pathname);
  const { has, hasAll, hasRole } = usePermissions();

  useEffect(() => {
    setMounted(true);
    setUser(auth.getUser());
  }, []);

  useEffect(() => {
    if (prevPath.current !== pathname && mobileOpen) {
      onClose?.();
    }
    prevPath.current = pathname;
  }, [pathname, mobileOpen, onClose]);

  const isVisible = (item: NavItem) => {
    if (item.superOnly) return hasRole("SUPER_ADMIN");
    if (item.requirements) return hasAll(item.requirements);
    if (!item.module || !item.action) return true;
    return has(item.module, item.action);
  };

  const visibleMain = mainItems.filter(isVisible);
  const visibleAdmin = adminItems.filter(isVisible);

  const userName = user?.full_name || "User";
  const userName2 = user?.username || "";

  const handleLogout = () => {
    auth.logout();
    window.location.href = "/login";
  };

  const Brand = ({ showClose = false }: { showClose?: boolean }) => (
    <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-2">
      <div className="flex flex-col items-center text-center flex-1 min-w-0">
        <img src="/logo.svg" alt="SEDS Logo" className="w-14 h-14 object-contain" />
        <p className="text-[10px] leading-snug text-slate-400 mt-2 uppercase tracking-wide">
          SUNAN ENTERPRISE DOCUMENT MANAGEMENT SYSTEM (SEDS)
        </p>
      </div>
      {showClose && (
        <button
          onClick={onClose}
          className="md:hidden text-slate-400 hover:text-white p-1 -mr-1"
          aria-label="Close menu"
        >
          ✕
        </button>
      )}
    </div>
  );

  const ItemLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={
          isActive
            ? "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800 text-white"
            : "flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white"
        }
      >
        <span className="w-8 text-center">{item.icon}</span>
        {item.name}
      </Link>
    );
  };

  const NavContent = ({ includeMain = false }: { includeMain?: boolean }) => (
    <>
      <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {includeMain && visibleMain.length > 0 && (
          <div>
            <h2 className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Menu
            </h2>
            <div className="space-y-1">
              {visibleMain.map((item) => (
                <ItemLink key={item.name} item={item} />
              ))}
            </div>
          </div>
        )}
        {visibleAdmin.length > 0 && (
          <div>
            <h2 className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Administration
            </h2>
            <div className="space-y-1">
              {visibleAdmin.map((item) => (
                <ItemLink key={item.name} item={item} />
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium text-sm transition-colors"
        >
          Logout
        </button>
        {mounted && (
          <>
            <p className="text-xs text-slate-500 mt-2 text-center">{userName}</p>
            <p className="text-xs text-slate-500 mt-0 text-center">{userName2}</p>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 h-screen hidden md:flex md:flex-col md:sticky md:top-16 md:self-start">
        <Brand />
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 ${mobileOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
        />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col transform transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Brand showClose />
          <NavContent includeMain />
        </aside>
      </div>
    </>
  );
}
