"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocale } from "@/contexts/locale-context";
import { parseAPIError } from "@/lib/validation";
import { authService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: t.auth.passwordMismatch });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: t.auth.passwordMinLength });
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({ old_password: oldPassword, new_password: newPassword });
      setMessage({ type: "success", text: t.auth.passwordChanged });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({ type: "error", text: parseAPIError(err, t) });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.profile.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t.profile.subtitle}</p>
      </div>

      {/* User Info */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.profile.accountInfo}</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-white/20 dark:border-white/10">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t.users.username}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/20 dark:border-white/10">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t.users.fullName}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.full_name || "-"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/20 dark:border-white/10">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t.users.email}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.email || "-"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/20 dark:border-white/10">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t.users.role}</span>
            <Badge variant="info">{user?.role?.name || "-"}</Badge>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{t.common.status}</span>
            <Badge variant={user?.is_active ? "success" : "danger"}>{user?.is_active ? t.common.active : t.common.inactive}</Badge>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.auth.changePassword}</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {message && (
            <div className={`text-sm p-3 rounded-lg ${message.type === "success" ? "glass bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "glass bg-rose-500/10 text-rose-700 dark:text-rose-400"}`}>
              {message.text}
            </div>
          )}
          <Input
            label={t.auth.oldPassword}
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <Input
            label={t.auth.newPassword}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label={t.auth.confirmNewPassword}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={loading}>{t.auth.changePassword}</Button>
        </form>
      </div>
    </div>
  );
}
