"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { auth } from "@/lib/api";

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
          <aside className="w-64 bg-slate-900 text-slate-300 h-screen hidden md:flex flex-col">
            <div className="p-6 border-b border-slate-800">
              <h1 className="text-2xl font-bold text-white tracking-tight">SEDS</h1>
              <p className="text-xs text-slate-500 mt-1">Knowledge System</p>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              <h2 className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ADMINISTRATION
              </h2>
              <div className="flex-1 space-y-1">
                <Link key="departments" href="/admin/departments" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
                  <span className="w-8 text-center">🏢</span>
                  Departments
                </Link>
                <Link key="categories" href="/admin/categories" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
                  <span className="w-8 text-center">📁</span>
                  Categories
                </Link>
                <Link key="tags" href="/admin/tags" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
                  <span className="w-8 text-center">🏷️</span>
                  Tags
                </Link>
                <Link key="users" href="/admin/users" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
                  <span className="w-8 text-center">👥</span>
                  Users
                </Link>
                <Link key="roles" href="/admin/roles" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
                  <span className="w-8 text-center">🎭</span>
                  Roles
                </Link>
                <Link key="audit-log" href="/admin/audit-log" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
                  <span className="w-8 text-center">📋</span>
                  Audit Log
                </Link>
                <Link key="settings" href="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
                  <span className="w-8 text-center">⚙️</span>
                  Settings
                </Link>
              </div>
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button className="w-full py-2 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium text-sm transition-colors">
                Logout
              </button>
              <p className="text-xs text-slate-500 mt-2 text-center">User</p>
              <p className="text-xs text-slate-500 mt-0 text-center">user</p>
            </div>
          </aside>
          <main className="flex-1 p-6 md:p-8">
            <div className="animate-pulse bg-slate-200 rounded-lg h-96 w-full mx-auto"></div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <Topbar />
      <div className="flex pt-4">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
