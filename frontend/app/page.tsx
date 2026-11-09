"use client";

import { useEffect } from "react";
import { auth } from "@/lib/api";

export default function HomePage() {
  useEffect(() => {
    if (auth.isAuthenticated()) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/login";
    }
  }, []);

  return null;
}
