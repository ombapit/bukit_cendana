"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocale } from "@/contexts/locale-context";
import { userService, roleService, permissionService, menuService } from "@/lib/services";
import { Users, Shield, Lock, Menu } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [stats, setStats] = useState({ users: 0, roles: 0, permissions: 0, menus: 0 });

  useEffect(() => {
    Promise.allSettled([
      userService.getAll(1, 1),
      roleService.getAll(),
      permissionService.getAll(),
      menuService.getAll(),
    ]).then(([usersRes, rolesRes, permsRes, menusRes]) => {
      setStats({
        users: usersRes.status === "fulfilled" ? (usersRes.value.data.meta?.total ?? 0) : 0,
        roles: rolesRes.status === "fulfilled" ? (usersRes.status === "fulfilled" ? (rolesRes.value.data.data?.length ?? 0) : 0) : 0,
        permissions: permsRes.status === "fulfilled" ? (permsRes.value.data.data?.length ?? 0) : 0,
        menus: menusRes.status === "fulfilled" ? (menusRes.value.data.data?.length ?? 0) : 0,
      });
    });
  }, []);

  const cards = [
    { label: t.dashboard.totalUsers, value: stats.users, icon: Users, color: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25" },
    { label: t.dashboard.totalRoles, value: stats.roles, icon: Shield, color: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25" },
    { label: t.dashboard.totalPermissions, value: stats.permissions, icon: Lock, color: "bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25" },
    { label: t.dashboard.totalMenus, value: stats.menus, icon: Menu, color: "bg-gradient-to-br from-orange-500 to-rose-600 shadow-lg shadow-orange-500/25" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t.dashboard.welcome} <span className="font-medium">{user?.full_name || user?.username}</span>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.dashboard.systemInfo}</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between py-2 border-b border-white/20 dark:border-white/10">
            <span className="text-gray-500 dark:text-gray-400">{t.dashboard.yourRole}</span>
            <span className="font-medium text-gray-900 dark:text-white">{user?.role?.name || "-"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/20 dark:border-white/10">
            <span className="text-gray-500 dark:text-gray-400">{t.users.username}</span>
            <span className="font-medium text-gray-900 dark:text-white">{user?.username}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/20 dark:border-white/10">
            <span className="text-gray-500 dark:text-gray-400">{t.dashboard.backend}</span>
            <span className="font-medium text-gray-900 dark:text-white">Go + Gin + PostgreSQL</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/20 dark:border-white/10">
            <span className="text-gray-500 dark:text-gray-400">{t.dashboard.frontend}</span>
            <span className="font-medium text-gray-900 dark:text-white">Next.js + Tailwind CSS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
