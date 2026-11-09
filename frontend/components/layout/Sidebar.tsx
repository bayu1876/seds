"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/api";

const adminItems = [
  { name: "Departments", href: "/admin/departments", icon: "🏢" },
  { name: "Categories", href: "/admin/categories", icon: "📁" },
  { name: "Tags", href: "/admin/tags", icon: "🏷️" },
  { name: "Users", href: "/admin/users", icon: "👥" },
  { name: "Roles", href: "/admin/roles", icon: "🎭" },
  { name: "Permissions", href: "/admin/permissions", icon: "🔐" },
  { name: "Audit Log", href: "/admin/audit-log", icon: "📋" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = auth.getUser();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen hidden md:flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">
          SEDS
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Document Management
        </p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <h2 className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Administration
        </h2>
        <div className="flex-1 space-y-1">
          {adminItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="w-8 text-center">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => {
            auth.logout();
            window.location.href = "/login";
          }}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm transition-colors"
        >
          Logout
        </button>
        <p className="text-xs text-slate-500 mt-2 text-center">
          {user?.full_name || "User"}<br />
          {user?.username || ""}
        </p>
      </div>
    </aside>
  );
}
