"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { API_URL, auth } from "@/lib/api";
import { usePermissions } from "@/lib/permissions";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "📊", module: "document", action: "view" },
  { name: "Documents", href: "/documents", icon: "📄", module: "document", action: "view" },
  { name: "Public Library", href: "/public-library", icon: "📚", module: "document", action: "view" },
  { name: "Favorites", href: "/favorites", icon: "⭐", module: "document", action: "view" },
  { name: "Recent", href: "/recently-opened", icon: "🕒", module: "document", action: "view" },
];

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("sed_token") : null;
}

export default function Topbar({
  onMenuToggle,
}: {
  onMenuToggle?: () => void;
}) {
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const pathname = usePathname();
  const { has } = usePermissions();

  useEffect(() => {
    const u = auth.getUser();
    setUser(u);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    async function loadAvatar() {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch(`${API_URL}/users/me/avatar`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const blob = await res.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setAvatarUrl(objectUrl);
      } catch {}
    }
    loadAvatar();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pathname]);

  const displayName = user?.full_name || user?.username || "User";
  const initials = (displayName || "U").trim().charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onMenuToggle?.()}
          className="md:hidden text-slate-600 hover:text-slate-900"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/dashboard" className="flex items-center">
          <span className="text-sm sm:text-base font-semibold text-slate-700">
            The Sunan Hotel Solo
          </span>
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <nav className="flex items-center gap-6">
          {navItems
            .filter((item) => has(item.module, item.action))
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
        </nav>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search documents..."
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm w-full"
          />
          <svg
            className="absolute left-3 top-3 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/profile" className="flex items-center gap-3 hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 max-w-[160px] truncate">{displayName}</span>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
            {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
          </div>
        </Link>
      </div>
    </header>
  );
}
