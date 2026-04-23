"use client";

import { useEffect, useState, useCallback } from "react";
import { menuService, permissionService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import type { Menu, Permission } from "@/types";
import { Plus, Pencil, Trash2, ChevronRight, GripVertical } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";
import { parseAPIError } from "@/lib/validation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ========== Sortable Menu Item ==========
function SortableMenuItem({
  menu,
  level = 0,
  onEdit,
  onDelete,
  onReorderChildren,
}: {
  menu: Menu;
  level?: number;
  onEdit: (m: Menu) => void;
  onDelete: (id: string) => void;
  onReorderChildren: (parentId: string | null, oldIndex: number, newIndex: number) => void;
}) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(true);
  const hasChildren = menu.children && menu.children.length > 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "opacity-50 z-50" : ""}>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-white/30 dark:hover:bg-white/5 rounded-lg group"
        style={{ paddingLeft: `${8 + level * 24}px` }}
      >
        {/* Drag handle */}
        <button
          className="p-0.5 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Expand/collapse */}
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="p-0.5">
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Order number */}
        <span className="text-xs text-gray-400 dark:text-gray-500 w-5 text-center font-mono">{menu.sort_order}</span>

        {/* Name */}
        <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{menu.name}</span>

        {/* Path */}
        <code className="text-xs text-gray-500 dark:text-gray-400 bg-white/40 dark:bg-white/10 px-2 py-0.5 rounded">{menu.path}</code>

        {/* Status */}
        <Badge variant={menu.is_active ? "success" : "danger"}>{menu.is_active ? t.common.active : t.common.inactive}</Badge>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(menu)} className="p-1 rounded hover:bg-white/50 dark:hover:bg-white/10">
            <Pencil className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
          <button onClick={() => onDelete(menu.id)} className="p-1 rounded hover:bg-rose-500/10">
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
          </button>
        </div>
      </div>

      {/* Children (also sortable) */}
      {expanded && hasChildren && (
        <SortableMenuList
          menus={menu.children!}
          level={level + 1}
          parentId={menu.id}
          onEdit={onEdit}
          onDelete={onDelete}
          onReorderChildren={onReorderChildren}
        />
      )}
    </div>
  );
}

// ========== Sortable Menu List (wrapper) ==========
function SortableMenuList({
  menus,
  level = 0,
  parentId = null,
  onEdit,
  onDelete,
  onReorderChildren,
}: {
  menus: Menu[];
  level?: number;
  parentId?: string | null;
  onEdit: (m: Menu) => void;
  onDelete: (id: string) => void;
  onReorderChildren: (parentId: string | null, oldIndex: number, newIndex: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = menus.findIndex((m) => m.id === active.id);
    const newIndex = menus.findIndex((m) => m.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderChildren(parentId, oldIndex, newIndex);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={menus.map((m) => m.id)} strategy={verticalListSortingStrategy}>
        {menus.map((menu) => (
          <SortableMenuItem
            key={menu.id}
            menu={menu}
            level={level}
            onEdit={onEdit}
            onDelete={onDelete}
            onReorderChildren={onReorderChildren}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

// ========== Main Page ==========
export default function MenusPage() {
  const { t } = useLocale();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [form, setForm] = useState({ name: "", path: "", icon: "", parent_id: "", sort_order: "0", permission_id: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reordering, setReordering] = useState(false);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const [treeRes, allRes] = await Promise.all([menuService.getTree(), menuService.getAll()]);
      setMenus(treeRes.data.data || []);
      setAllMenus(allRes.data.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    permissionService.getAll().then((r) => setPermissions(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // ========== Reorder via drag & drop ==========
  const handleReorderChildren = useCallback(async (parentId: string | null, oldIndex: number, newIndex: number) => {
    // Find the correct array (root or children of a parent)
    const reorderInTree = (items: Menu[]): Menu[] => {
      return items.map((item) => {
        if (parentId === null) return item; // root level handled below
        if (item.id === parentId && item.children) {
          const newChildren = [...item.children];
          const [moved] = newChildren.splice(oldIndex, 1);
          newChildren.splice(newIndex, 0, moved);
          return { ...item, children: newChildren };
        }
        if (item.children) {
          return { ...item, children: reorderInTree(item.children) };
        }
        return item;
      });
    };

    let newMenus: Menu[];
    if (parentId === null) {
      // Root level reorder
      newMenus = [...menus];
      const [moved] = newMenus.splice(oldIndex, 1);
      newMenus.splice(newIndex, 0, moved);
    } else {
      newMenus = reorderInTree(menus);
    }

    // Optimistic update
    setMenus(newMenus);

    // Persist sort_order to backend
    setReordering(true);
    try {
      const targetItems = parentId === null
        ? newMenus
        : findChildren(newMenus, parentId);

      if (targetItems) {
        await Promise.all(
          targetItems.map((item, index) =>
            menuService.update(item.id, { sort_order: index + 1 })
          )
        );
      }
      // Refresh from server
      const [treeRes, allRes] = await Promise.all([menuService.getTree(), menuService.getAll()]);
      setMenus(treeRes.data.data || []);
      setAllMenus(allRes.data.data || []);
    } catch {
      // Revert on error
      fetchMenus();
    }
    setReordering(false);
  }, [menus, fetchMenus]);

  const openCreate = () => {
    setEditingMenu(null);
    setForm({ name: "", path: "", icon: "", parent_id: "", sort_order: "0", permission_id: "" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (m: Menu) => {
    setEditingMenu(m);
    setForm({
      name: m.name, path: m.path, icon: m.icon,
      parent_id: m.parent_id || "", sort_order: String(m.sort_order),
      permission_id: m.permission_id || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const data = {
        name: form.name, path: form.path, icon: form.icon,
        parent_id: form.parent_id || undefined,
        sort_order: parseInt(form.sort_order) || 0,
        permission_id: form.permission_id || undefined,
      };
      if (editingMenu) {
        await menuService.update(editingMenu.id, data);
      } else {
        await menuService.create(data);
      }
      setModalOpen(false);
      fetchMenus();
    } catch (err) {
      setError(parseAPIError(err, t));
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;
    try { await menuService.delete(id); fetchMenus(); } catch { /* ignore */ }
  };

  const parentOptions = allMenus
    .filter((m) => !m.parent_id && (!editingMenu || m.id !== editingMenu.id))
    .map((m) => ({ value: m.id, label: m.name }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.menus.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t.menus.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {reordering && (
            <span className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">Saving order...</span>
          )}
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />{t.menus.addMenu}</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" /></div>
      ) : (
        <div className="glass rounded-2xl">
          {menus.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t.menus.noMenus}</p>
          ) : (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">
                <span className="w-4" />
                <span className="w-5" />
                <span className="w-5 text-center">#</span>
                <span className="flex-1">Menu</span>
                <span>Path</span>
                <span className="ml-4">{t.common.status}</span>
                <span className="ml-1">{t.common.actions}</span>
              </div>
              <SortableMenuList
                menus={menus}
                onEdit={openEdit}
                onDelete={handleDelete}
                onReorderChildren={handleReorderChildren}
              />
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingMenu ? t.menus.editMenu : t.menus.addMenu}>
        <div className="space-y-4">
          {error && <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 rounded-xl text-sm p-3">{error}</div>}
          <Input label={t.common.name} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dashboard" />
          <Input label={t.menus.path} value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} placeholder="/dashboard" />
          <Input label={t.menus.icon} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="dashboard" />
          <Select label={t.menus.parentMenu} value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} placeholder={t.menus.rootMenu} options={parentOptions} />
          <Input label={t.menus.sortOrder} type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          <Select
            label={t.menus.permission}
            value={form.permission_id}
            onChange={(e) => setForm({ ...form, permission_id: e.target.value })}
            placeholder={t.menus.noPermission}
            options={permissions.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t.common.cancel}</Button>
            <Button onClick={handleSave} loading={saving}>{editingMenu ? t.menus.saveChanges : t.menus.createMenu}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ========== Helper ==========
function findChildren(menus: Menu[], parentId: string): Menu[] | null {
  for (const menu of menus) {
    if (menu.id === parentId) return menu.children || null;
    if (menu.children) {
      const found = findChildren(menu.children, parentId);
      if (found) return found;
    }
  }
  return null;
}
