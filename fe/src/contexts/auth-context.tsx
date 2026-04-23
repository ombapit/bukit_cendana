"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authService, menuService } from "@/lib/services";
import type { UserResponse, Menu } from "@/types";

interface AuthContextType {
  user: UserResponse | null;
  menus: Menu[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasMenuAccess: (path: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Flatten menu tree ke array of paths
function flattenMenuPaths(menus: Menu[]): string[] {
  const paths: string[] = [];
  for (const menu of menus) {
    if (menu.path) paths.push(menu.path);
    if (menu.children) paths.push(...flattenMenuPaths(menu.children));
  }
  return paths;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [allowedPaths, setAllowedPaths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchMenus = useCallback(async () => {
    try {
      const res = await menuService.getMyMenus();
      const data = res.data.data || [];
      setMenus(data);
      setAllowedPaths(flattenMenuPaths(data));
    } catch {
      setMenus([]);
      setAllowedPaths([]);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const res = await authService.me();
      if (res.data.success && res.data.data) {
        setUser({
          id: res.data.data.user_id,
          username: res.data.data.username,
          email: "",
          full_name: res.data.data.username,
          is_active: true,
          role: { id: "", name: res.data.data.role_name, description: "", is_active: true, created_at: "", updated_at: "" },
        });
        await fetchMenus();
      }
    } catch {
      localStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMenus]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (cancelled) return;
      await refreshUser();
    };
    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authService.login({ username, password });
    if (res.data.success && res.data.data) {
      const { access_token, refresh_token, user: userData } = res.data.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      setUser(userData);
      await fetchMenus();
      router.push("/admin/dashboard");
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      localStorage.clear();
      setUser(null);
      setMenus([]);
      setAllowedPaths([]);
      router.push("/login");
    }
  };

  // Cek apakah user punya akses ke path tertentu
  // Path dari frontend: /admin/users/list → cek /users/list di allowedPaths
  const hasMenuAccess = useCallback(
    (path: string) => {
      // Superadmin bypass
      if (user?.role?.name === "superadmin") return true;

      // Strip /admin prefix untuk matching dengan menu path dari backend
      const menuPath = path.replace(/^\/admin/, "");

      // Exact match
      if (allowedPaths.includes(menuPath)) return true;

      // Parent match: /users/create → cek /users juga ada
      const parentPath = menuPath.split("/").slice(0, -1).join("/");
      if (parentPath && allowedPaths.includes(parentPath)) return true;

      return false;
    },
    [user, allowedPaths]
  );

  return (
    <AuthContext.Provider
      value={{ user, menus, isLoading, isAuthenticated: !!user, login, logout, refreshUser, hasMenuAccess }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
