"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/locale-context";

interface PermissionGuardProps {
  children: React.ReactNode;
}

export function PermissionGuard({ children }: PermissionGuardProps) {
  const { t } = useLocale();
  const { isLoading, isAuthenticated, hasMenuAccess } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Halaman yang tidak perlu cek permission (semua user yg login bisa akses)
  const publicAdminPaths = ["/admin/dashboard", "/admin/profile"];
  const isPublicAdmin = publicAdminPaths.some((p) => pathname === p);

  const hasAccess = isPublicAdmin || hasMenuAccess(pathname);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasAccess) {
      // Tidak redirect otomatis, tampilkan halaman forbidden
    }
  }, [isLoading, isAuthenticated, hasAccess]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShieldX className="w-16 h-16 text-red-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.guard.accessDenied}</h1>
        <p className="text-gray-500 text-sm mb-6 text-center max-w-md">
          {t.guard.noPermission}
        </p>
        <Button onClick={() => router.push("/admin/dashboard")}>
          {t.guard.backToDashboard}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
