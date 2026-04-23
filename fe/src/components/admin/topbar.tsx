"use client";

import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Menu } from "lucide-react";

export function Topbar() {
  const { user } = useAuth();
  const { toggle } = useSidebar();

  return (
    <header className="h-14 glass-strong border-b border-white/20 dark:border-white/5 flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Left: hamburger */}
      <button
        onClick={toggle}
        className="p-2 rounded-xl hover:bg-white/40 dark:hover:bg-white/10 transition-colors lg:hidden"
      >
        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {/* Desktop spacer */}
      <div className="hidden lg:block" />

      {/* Right: controls */}
      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="ml-2 pl-3 border-l border-white/30 dark:border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-500 rounded-full flex items-center justify-center shadow-md shadow-red-600/20">
            <span className="text-sm font-bold text-white">
              {user?.full_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user?.full_name || user?.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{user?.role?.name}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
