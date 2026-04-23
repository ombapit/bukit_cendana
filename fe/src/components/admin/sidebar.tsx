"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useLocale } from "@/contexts/locale-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/cn";
import type { Menu } from "@/types";
import {
  LayoutDashboard, Users, Shield, Lock, Menu as MenuIcon, BarChart3,
  Settings, ChevronDown, Eye, UserPlus, Key, Download, Zap, LogOut, User,
  ChevronsLeft, ChevronsRight, X,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard, people: Users, shield: Shield, lock: Lock,
  "bar-chart": BarChart3, settings: Settings, list: MenuIcon, "user-plus": UserPlus,
  key: Key, eye: Eye, download: Download, menu: MenuIcon,
};

function getIcon(name: string) {
  return iconMap[name] || LayoutDashboard;
}

function menuPathToAdmin(path: string) {
  return `/admin${path}`;
}

function SidebarItem({ menu, level = 0, collapsed = false }: { menu: Menu; level?: number; collapsed?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const hasChildren = menu.children && menu.children.length > 0;
  const Icon = getIcon(menu.icon);
  const adminPath = menuPathToAdmin(menu.path);
  const isActive = pathname === adminPath || pathname.startsWith(adminPath + "/");

  useEffect(() => {
    if (hasChildren && menu.children?.some((c) => pathname.startsWith(menuPathToAdmin(c.path)))) {
      setOpen(true);
    }
  }, [pathname, hasChildren, menu.children]);

  // Collapsed mode with children: show flyout on hover
  if (hasChildren && collapsed) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setFlyoutOpen(true)}
        onMouseLeave={() => setFlyoutOpen(false)}
      >
        <button
          className={cn(
            "w-full flex items-center justify-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
            isActive
              ? "bg-gradient-to-r from-red-700/20 to-rose-600/20 text-red-700 dark:text-red-300 shadow-sm shadow-red-700/10"
              : "text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
          )}
          title={menu.name}
        >
          <Icon className="w-5 h-5 shrink-0" />
        </button>
        {flyoutOpen && (
          <div className="absolute left-full top-0 ml-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 py-1 z-50">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              {menu.name}
            </div>
            {menu.children!.map((child) => {
              const ChildIcon = getIcon(child.icon);
              const childPath = menuPathToAdmin(child.path);
              const childActive = pathname === childPath || pathname.startsWith(childPath + "/");
              return (
                <Link
                  key={child.id}
                  href={childPath}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-sm transition-all duration-200",
                    childActive
                      ? "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/15"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <ChildIcon className="w-4 h-4 shrink-0" />
                  <span>{child.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
            isActive
              ? "bg-gradient-to-r from-red-700/20 to-rose-600/20 text-red-700 dark:text-red-300 shadow-sm shadow-red-700/10"
              : "text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
          )}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <Icon className="w-5 h-5 shrink-0" />
          <span className="flex-1 text-left">{menu.name}</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", open && "rotate-180")} />
        </button>
        {open && (
          <div className="mt-0.5">
            {menu.children!.map((child) => (
              <SidebarItem key={child.id} menu={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={adminPath}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
        collapsed ? "justify-center" : "",
        isActive
          ? "bg-gradient-to-r from-red-700/20 to-rose-600/20 text-red-700 dark:text-red-300 shadow-sm shadow-red-700/10"
          : "text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
      )}
      style={{ paddingLeft: collapsed ? undefined : `${12 + level * 16}px` }}
      title={collapsed ? menu.name : undefined}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!collapsed && <span>{menu.name}</span>}
    </Link>
  );
}

function SidebarContent({ collapsed = false }: { collapsed?: boolean }) {
  const { user, menus, logout } = useAuth();
  const { t } = useLocale();
  const { isOpen, close, toggleCollapse } = useSidebar();

  return (
    <>
      {/* Logo */}
      <div className={cn("h-14 flex items-center border-b border-white/20 dark:border-white/5 shrink-0", collapsed ? "justify-center px-2" : "justify-between px-4")}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-rose-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-700/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-red-700 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
              {t.sidebar.admin}
            </span>
          )}
        </div>
        {/* Mobile close button */}
        {isOpen && (
          <button onClick={close} className="lg:hidden p-1.5 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
        {/* Desktop collapse button */}
        {!isOpen && !collapsed && (
          <button onClick={toggleCollapse} className="hidden lg:block p-1.5 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors">
            <ChevronsLeft className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="flex justify-center py-2 border-b border-white/10">
          <button onClick={toggleCollapse} className="p-1.5 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors">
            <ChevronsRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* Menu */}
      <nav className={cn("flex-1 p-3 space-y-1", collapsed ? "overflow-visible" : "overflow-y-auto")}>
        {menus.map((menu) => (
          <SidebarItem key={menu.id} menu={menu} collapsed={collapsed} />
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/20 dark:border-white/5 p-3 space-y-1 shrink-0">
        {collapsed ? (
          <>
            <Link
              href="/admin/profile"
              className="flex justify-center py-2 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-all"
              title={user?.full_name || user?.username}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </Link>
            <button
              onClick={logout}
              className="w-full flex justify-center py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all"
              title={t.auth.logout}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <Link
              href="/admin/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-200"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-red-600 to-rose-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-gray-900 dark:text-white">{user?.full_name || user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{user?.role?.name}</p>
              </div>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>{t.auth.logout}</span>
            </button>
          </>
        )}
      </div>
    </>
  );
}

export function Sidebar() {
  const { isOpen, isCollapsed, close } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={close} />
      )}

      {/* Mobile sidebar (slide-in) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 glass-strong flex flex-col transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 z-30 glass-strong border-r border-white/20 dark:border-white/5 transition-all duration-300",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>
    </>
  );
}
