"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function PublicNavbar() {
  return (
    <nav className="glass-strong border-b border-white/20 dark:border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Bukit Cendana" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Bukit Cendana</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
