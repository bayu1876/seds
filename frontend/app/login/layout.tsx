"use client";

import { useEffect } from "react";
import { auth } from "@/lib/api";
import Link from "next/link";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (auth.isAuthenticated()) {
      window.location.href = "/dashboard";
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      {children}
    </div>
  );
}
