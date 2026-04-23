"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userService, roleService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Role } from "@/types";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/contexts/locale-context";
import { parseAPIError } from "@/lib/validation";

export default function CreateUserPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState({ username: "", email: "", password: "", full_name: "", role_id: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    roleService.getAll().then((r) => setRoles(r.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.full_name || !form.role_id) {
      setError(t.users.allFieldsRequired);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await userService.create(form);
      router.push("/admin/users/list");
    } catch (err) {
      setError(parseAPIError(err, t));
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/users/list"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> {t.users.backToList}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.users.addUser}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t.users.createSubtitle}</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-xl border border-rose-500/20">{error}</div>
          )}

          <Input
            label={t.users.username}
            id="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder={t.users.minChars}
            required
          />

          <Input
            label={t.users.fullName}
            id="full_name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="Masukkan nama lengkap"
            required
          />

          <Input
            label={t.users.email}
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Masukkan email"
            required
          />

          <div className="relative">
            <Input
              label={t.users.password}
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={t.users.minPassword}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Select
            label={t.users.role}
            id="role_id"
            value={form.role_id}
            onChange={(e) => setForm({ ...form, role_id: e.target.value })}
            placeholder={t.users.selectRole}
            options={roles.map((r) => ({ value: r.id, label: r.name }))}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/users/list")}>
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={saving}>
              {t.users.createUser}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
