"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useLocale } from "@/contexts/locale-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { parseAPIError } from "@/lib/validation";
import { Zap, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { t } = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(parseAPIError(err, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-rose-600 rounded-lg flex items-center justify-center glow-sm">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Bukit Cendana</span>
          </Link>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t.auth.loginTitle}</p>
        </div>

        <div className="glass-strong rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-lg border border-rose-500/20">
                {error}
              </div>
            )}

            <Input
              label={t.users.username}
              id="username"
              type="text"
              placeholder={t.auth.usernamePlaceholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label={t.users.password}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              {t.auth.loginButton}
            </Button>
          </form>
        </div>

        <div className="mt-4 glass-strong rounded-2xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">{t.auth.demoAccounts}</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { user: "superadmin", role: t.auth.superAdmin },
              { user: "admin", role: t.auth.admin },
              { user: "staff", role: t.auth.staff },
            ].map((acc) => (
              <button
                key={acc.user}
                type="button"
                className="p-2 rounded-lg border border-white/30 dark:border-white/10 hover:bg-white/40 dark:hover:bg-white/10 text-left transition-colors"
                onClick={() => { setUsername(acc.user); setPassword("password123"); }}
              >
                <p className="font-medium text-gray-900 dark:text-white">{acc.role}</p>
                <p className="text-gray-500 dark:text-gray-400">{acc.user}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
