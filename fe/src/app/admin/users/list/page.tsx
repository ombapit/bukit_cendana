"use client";

import { useEffect, useState, useCallback } from "react";
import { userService, roleService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import type { UserResponse, Role } from "@/types";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Eye, Search, ToggleLeft, ToggleRight, EyeOff } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";
import { parseAPIError } from "@/lib/validation";

export default function UsersPage() {
  const { t } = useLocale();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create/Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [form, setForm] = useState({ username: "", email: "", password: "", full_name: "", role_id: "", is_active: true });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<UserResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getAll(page, limit);
      setUsers(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
      setTotalPages(res.data.meta?.total_pages || 1);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, limit]);

  // Fetch roles sekali saat mount
  useEffect(() => {
    roleService.getAll().then((r) => setRoles(r.data.data || [])).catch(() => {});
  }, []);

  // Fetch users saat page berubah
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtered users by search (client-side)
  const filteredUsers = search
    ? users.filter(
        (u) =>
          u.full_name.toLowerCase().includes(search.toLowerCase()) ||
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  // ========== Create ==========
  const openCreate = () => {
    setEditingUser(null);
    setForm({ username: "", email: "", password: "", full_name: "", role_id: "", is_active: true });
    setShowPassword(false);
    setError("");
    setModalOpen(true);
  };

  // ========== Edit ==========
  const openEdit = (u: UserResponse) => {
    setEditingUser(u);
    setForm({
      username: u.username,
      email: u.email,
      password: "",
      full_name: u.full_name,
      role_id: u.role?.id || "",
      is_active: u.is_active,
    });
    setShowPassword(false);
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingUser) {
        await userService.update(editingUser.id, {
          email: form.email || undefined,
          full_name: form.full_name || undefined,
          role_id: form.role_id || undefined,
          is_active: form.is_active,
        });
      } else {
        if (!form.username || !form.email || !form.password || !form.full_name || !form.role_id) {
          setError(t.users.allFieldsRequired);
          setSaving(false);
          return;
        }
        await userService.create({
          username: form.username,
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          role_id: form.role_id,
        });
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(parseAPIError(err, t));
    }
    setSaving(false);
  };

  // ========== Detail ==========
  const openDetail = async (u: UserResponse) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const res = await userService.getById(u.id);
      setDetailUser(res.data.data || u);
    } catch {
      setDetailUser(u);
    }
    setDetailLoading(false);
  };

  // ========== Toggle Active ==========
  const handleToggleActive = async (u: UserResponse) => {
    try {
      await userService.update(u.id, { is_active: !u.is_active });
      fetchUsers();
    } catch { /* ignore */ }
  };

  // ========== Delete ==========
  const openDelete = (u: UserResponse) => {
    setDeletingUser(u);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      await userService.delete(deletingUser.id);
      setDeleteOpen(false);
      setDeletingUser(null);
      fetchUsers();
    } catch { /* ignore */ }
    setDeleting(false);
  };

  // ========== Table Columns ==========
  const columns = [
    {
      key: "full_name",
      header: t.users.fullName,
      render: (u: UserResponse) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{u.full_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</p>
        </div>
      ),
    },
    { key: "email", header: t.users.email },
    {
      key: "role",
      header: t.users.role,
      render: (u: UserResponse) => <Badge variant="info">{u.role?.name || "-"}</Badge>,
    },
    {
      key: "is_active",
      header: t.common.status,
      render: (u: UserResponse) => (
        <button
          onClick={() => handleToggleActive(u)}
          className="flex items-center gap-1.5 group"
          title={u.is_active ? t.users.clickToDeactivate : t.users.clickToActivate}
        >
          {u.is_active ? (
            <ToggleRight className="w-5 h-5 text-green-600 group-hover:text-green-700" />
          ) : (
            <ToggleLeft className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-500" />
          )}
          <Badge variant={u.is_active ? "success" : "danger"}>
            {u.is_active ? t.common.active : t.common.inactive}
          </Badge>
        </button>
      ),
    },
    {
      key: "actions",
      header: t.common.actions,
      render: (u: UserResponse) => (
        <div className="flex gap-1">
          <button
            onClick={() => openDetail(u)}
            className="p-1.5 rounded-lg hover:bg-red-700/10 transition-colors"
            title={t.users.viewDetail}
          >
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={() => openEdit(u)}
            className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
            title={t.users.editUserBtn}
          >
            <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => openDelete(u)}
            className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
            title={t.users.deleteUserBtn}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  const getRoleName = (id: string) => roles.find((r) => r.id === id)?.name || "-";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.users.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t.users.subtitle} ({total} {t.users.total})</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          {t.users.addUser}
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={t.users.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent backdrop-blur-sm dark:text-slate-100 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          <Table columns={columns} data={filteredUsers as UserResponse[]} />
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.common.showing} {(page - 1) * limit + 1}-{Math.min(page * limit, total)} {t.common.of} {total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && <span className="text-sm text-gray-400 dark:text-gray-500">...</span>}
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ========== Modal: Create / Edit ========== */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? t.users.editUser : t.users.addUser}
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-xl border border-rose-500/20">{error}</div>
          )}

          {!editingUser && (
            <Input
              label={t.users.username}
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Masukkan username"
            />
          )}

          <Input
            label={t.users.fullName}
            required
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="Masukkan nama lengkap"
          />

          <Input
            label={t.users.email}
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Masukkan email"
          />

          {!editingUser && (
            <div className="relative">
              <Input
                label={t.users.password}
                required
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={t.users.minPassword}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          <Select
            label={t.users.role}
            required
            value={form.role_id}
            onChange={(e) => setForm({ ...form, role_id: e.target.value })}
            placeholder={t.users.selectRole}
            options={roles.map((r) => ({ value: r.id, label: r.name }))}
          />

          {editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.common.status}</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="is_active"
                    checked={form.is_active === true}
                    onChange={() => setForm({ ...form, is_active: true })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{t.common.active}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="is_active"
                    checked={form.is_active === false}
                    onChange={() => setForm({ ...form, is_active: false })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{t.common.inactive}</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editingUser ? t.users.saveChanges : t.users.createUser}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========== Modal: Detail ========== */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={t.users.userDetail} size="md">
        {detailLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : detailUser ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-red-700/10 to-rose-600/10 dark:from-red-700/20 dark:to-rose-600/20 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-rose-500 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {detailUser.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{detailUser.full_name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{detailUser.username}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-white/20 dark:border-white/10">
                <span className="text-sm text-gray-500 dark:text-gray-400">ID</span>
                <code className="text-xs bg-white/40 dark:bg-white/10 px-2 py-0.5 rounded">{detailUser.id}</code>
              </div>
              <div className="flex justify-between py-2 border-b border-white/20 dark:border-white/10">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t.users.email}</span>
                <span className="text-sm font-medium">{detailUser.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/20 dark:border-white/10">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t.users.role}</span>
                <Badge variant="info">{getRoleName(detailUser.role?.id || "")}</Badge>
              </div>
              <div className="flex justify-between py-2 border-b border-white/20 dark:border-white/10">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t.common.status}</span>
                <Badge variant={detailUser.is_active ? "success" : "danger"}>
                  {detailUser.is_active ? t.common.active : t.common.inactive}
                </Badge>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>
                {t.common.close}
              </Button>
              <Button
                onClick={() => {
                  setDetailOpen(false);
                  openEdit(detailUser);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                {t.users.editUser}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ========== Modal: Delete Confirmation ========== */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={t.users.deleteUser} size="sm">
        <div className="space-y-4">
          <div className="bg-rose-500/10 rounded-xl border border-rose-500/20 p-4">
            <p className="text-sm text-rose-700 dark:text-rose-400">
              {t.users.deleteConfirm} <strong>{deletingUser?.full_name}</strong> (@{deletingUser?.username})?
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">
              {t.users.deleteWarning}
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              {t.users.deleteUser}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
