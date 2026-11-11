"use client";

import { useEffect } from "react";
import { auth } from "@/lib/api";

export default function HomePage() {
  useEffect(() => {
    if (auth.isAuthenticated()) {
      const permissions = auth.getAccess().permissions;
      window.location.href = permissions.includes("document:view")
        ? "/dashboard"
        : "/profile";
    } else {
      window.location.href = "/login";
    }
  }, []);

  return null;
}
