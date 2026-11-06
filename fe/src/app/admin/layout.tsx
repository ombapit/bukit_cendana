"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { PermissionGuard } from "@/components/admin/permission-guard";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-3xl space-y-4 px-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen transition-colors">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6">
            <PermissionGuard>{children}</PermissionGuard>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
