"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/api";
import { isRouteAllowed } from "@/lib/route-access";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (auth.isAuthenticated()) {
      const permissions = auth.getAccess().permissions;
      const has = (module: string, action: string) =>
        permissions.includes(`${module}:${action}`);
      router.replace(has("document", "view") ? "/dashboard" : "/profile");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await auth.login(username, password);
      const redirect = searchParams.get("redirect");
      const permissions: string[] = result.access?.permissions || [];
      const has = (module: string, action: string) =>
        permissions.includes(`${module}:${action}`);
      if (result.user?.must_change_password) {
        router.push("/change-password");
      } else if (
        redirect &&
        redirect.startsWith("/") &&
        isRouteAllowed(redirect, has)
      ) {
        router.push(redirect);
      } else if (has("document", "view")) {
        router.push("/dashboard");
      } else {
        router.push("/profile");
      }
    } catch (err: any) {
      setError(err?.message || "Username atau password tidak valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-4 shadow-sm">
              <img src="/logo.svg" alt="SEDS" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              The Sunan Hotel Solo
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Sunan Enterprise Document Management System
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium text-slate-800">Masuk ke akun Anda</h2>
            <p className="text-sm text-slate-500 mt-1">
              Silakan masukkan kredensial untuk melanjutkan.
            </p>
          </div>

          {error && (
            <div
              className="mb-5 flex items-start gap-3 p-3.5 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100"
              role="alert"
            >
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold shrink-0">
                !
              </span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-shadow"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-shadow"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:bg-slate-950 disabled:bg-slate-400 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; {new Date().getFullYear()} The Sunan Hotel Solo. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-pulse text-slate-400 text-sm">Memuat...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
