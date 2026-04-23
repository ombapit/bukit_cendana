"use client";

import { useEffect, useState, useCallback } from "react";
import { permissionService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import type { Permission } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";
import { parseAPIError } from "@/lib/validation";

export default function PermissionsPage() {
  const { t } = useLocale();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [form, setForm] = useState({ name: "", code: "", module: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filterModule, setFilterModule] = useState("");

  const fetchPerms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await permissionService.getAll(filterModule || undefined);
      setPermissions(res.data.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filterModule]);

  useEffect(() => { fetchPerms(); }, [fetchPerms]);

  const openCreate = () => {
    setEditingPerm(null);
    setForm({ name: "", code: "", module: "", description: "" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (p: Permission) => {
    setEditingPerm(p);
    setForm({ name: p.name, code: p.code, module: p.module, description: p.description });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingPerm) {
        await permissionService.update(editingPerm.id, form);
      } else {
        await permissionService.create(form);
      }
      setModalOpen(false);
      fetchPerms();
    } catch (err) {
      setError(parseAPIError(err, t));
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus permission ini?")) return;
    try { await permissionService.delete(id); fetchPerms(); } catch { /* ignore */ }
  };

  const modules = [...new Set(permissions.map((p) => p.module))];

  const columns = [
    { key: "name", header: t.common.name },
    { key: "code", header: t.permissions.code, render: (p: Permission) => <code className="text-sm bg-white/40 dark:bg-white/10 dark:text-gray-300 px-2 py-0.5 rounded">{p.code}</code> },
    { key: "module", header: t.permissions.module, render: (p: Permission) => <Badge variant="info">{p.module}</Badge> },
    { key: "description", header: t.common.description },
    {
      key: "actions", header: t.common.actions,
      render: (p: Permission) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/5"><Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" /></button>
          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10"><Trash2 className="w-4 h-4 text-red-600" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.permissions.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t.permissions.subtitle}</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />{t.permissions.addPermission}</Button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilterModule("")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filterModule ? "bg-gradient-to-r from-red-700 to-rose-600 text-white shadow-md shadow-red-700/25" : "glass text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-white/10"}`}
        >
          {t.common.all}
        </button>
        {modules.map((m) => (
          <button
            key={m}
            onClick={() => setFilterModule(m)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterModule === m ? "bg-gradient-to-r from-red-700 to-rose-600 text-white shadow-md shadow-red-700/25" : "glass text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-white/10"}`}
          >
            {m}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : (
        <Table columns={columns} data={permissions as Permission[]} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingPerm ? t.permissions.editPermission : t.permissions.addPermission}>
        <div className="space-y-4">
          {error && <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 rounded-xl text-sm p-3">{error}</div>}
          <Input label={t.common.name} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="View Users" />
          <Input label={t.permissions.code} required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="user.view" />
          <Input label={t.permissions.module} required value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} placeholder="user" />
          <Input label={t.common.description} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t.common.cancel}</Button>
            <Button onClick={handleSave} loading={saving}>{editingPerm ? t.permissions.saveChanges : t.permissions.createPermission}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
