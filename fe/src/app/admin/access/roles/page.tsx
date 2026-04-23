"use client";

import { useEffect, useState, useCallback } from "react";
import { roleService, permissionService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import type { Role, Permission } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";
import { parseAPIError } from "@/lib/validation";

export default function RolesPage() {
  const { t } = useLocale();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: "", description: "", permission_ids: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roleService.getAll();
      setRoles(res.data.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    permissionService.getAll().then((r) => setPermissions(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const openCreate = () => {
    setEditingRole(null);
    setForm({ name: "", description: "", permission_ids: [] });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (r: Role) => {
    setEditingRole(r);
    setForm({ name: r.name, description: r.description, permission_ids: r.permissions?.map((p) => p.id) || [] });
    setError("");
    setModalOpen(true);
  };

  const togglePermission = (id: string) => {
    setForm((f) => ({
      ...f,
      permission_ids: f.permission_ids.includes(id)
        ? f.permission_ids.filter((p) => p !== id)
        : [...f.permission_ids, id],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingRole) {
        await roleService.update(editingRole.id, { name: form.name, description: form.description, permission_ids: form.permission_ids });
      } else {
        await roleService.create({ name: form.name, description: form.description, permission_ids: form.permission_ids });
      }
      setModalOpen(false);
      fetchRoles();
    } catch (err) {
      setError(parseAPIError(err, t));
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus role ini?")) return;
    try { await roleService.delete(id); fetchRoles(); } catch { /* ignore */ }
  };

  const groupedPerms = permissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  const columns = [
    { key: "name", header: t.roles.roleName },
    { key: "description", header: t.common.description },
    {
      key: "permissions", header: t.roles.permissions,
      render: (r: Role) => (
        <div className="flex flex-wrap gap-1">
          {(r.permissions || []).slice(0, 5).map((p) => <Badge key={p.id} variant="info">{p.code}</Badge>)}
          {(r.permissions?.length || 0) > 5 && <Badge>+{r.permissions!.length - 5}</Badge>}
        </div>
      ),
    },
    {
      key: "is_active", header: t.common.status,
      render: (r: Role) => <Badge variant={r.is_active ? "success" : "danger"}>{r.is_active ? t.common.active : t.common.inactive}</Badge>,
    },
    {
      key: "actions", header: t.common.actions,
      render: (r: Role) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/5"><Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" /></button>
          <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10"><Trash2 className="w-4 h-4 text-red-600" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.roles.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t.roles.subtitle}</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />{t.roles.addRole}</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : (
        <Table columns={columns} data={roles as Role[]} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingRole ? t.roles.editRole : t.roles.addRole} size="lg">
        <div className="space-y-4">
          {error && <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 rounded-xl text-sm p-3">{error}</div>}
          <Input label={t.roles.roleName} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label={t.common.description} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.roles.permissions}</label>
            <div className="space-y-3 max-h-64 overflow-y-auto glass rounded-xl p-3">
              {Object.entries(groupedPerms).map(([module, perms]) => (
                <div key={module}>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">{module}</p>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((p) => (
                      <label key={p.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.permission_ids.includes(p.id)}
                          onChange={() => togglePermission(p.id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        {p.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t.common.cancel}</Button>
            <Button onClick={handleSave} loading={saving}>{editingRole ? t.roles.saveChanges : t.roles.createRole}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
