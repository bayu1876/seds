"use client";

import Link from "next/link";
import { auth } from "@/lib/api";
import { usePermissions } from "@/lib/permissions";

export default function AccessDenied() {
  const { has } = usePermissions();
  const canViewDocuments = has("document", "view");
  const fallbackHref = canViewDocuments ? "/dashboard" : "/profile";
  const fallbackLabel = canViewDocuments
    ? "Kembali ke Dashboard"
    : "Buka Profil";

  const handleLogout = () => {
    auth.logout();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-slate-900">Akses Ditolak</h1>
        <p className="mt-2 text-sm text-slate-500">
          Akun Anda tidak memiliki izin untuk mengakses halaman ini. Silakan
          hubungi administrator jika Anda memerlukan akses.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={fallbackHref}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            {fallbackLabel}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
