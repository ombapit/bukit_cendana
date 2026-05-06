"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { activityLogService } from "@/lib/services";

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return;
    activityLogService.track(pathname).catch(() => {});
  }, [pathname]);

  return null;
}
