"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { pengumumanService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type { Pengumuman } from "@/types";
import { Plus, Pencil, Trash2, Search, Loader2, Eye, EyeOff, Tag } from "lucide-react";

const KATEGORI_LIST = ["Umum", "Keamanan", "Kebersihan", "Kegiatan", "Penting", "Keuangan"];

const inputClass = "w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
const fileInputClass = "w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-red-700/10 file:text-red-700 dark:file:text-red-400 dark:file:bg-red-700/20 hover:file:bg-red-700/20 cursor-pointer";

function getImageURL(gambar: string): string {
  if (!gambar) return "";
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace("/api/v1", "");
  return `${base}${gambar}`;
}

function formatTanggal(iso: string): string {
  try { return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "-"; }
}

const emptyForm = { judul: "", konten: "", kategori: "", tags: "", is_published: true };

export default function PengumumanAdminPage() {
  const [records, setRecords] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createGambar, setCreateGambar] = useState<File | null>(null);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const createFileRef = useRef<HTMLInputElement>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Pengumuman | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editGambar, setEditGambar] = useState<File | null>(null);
  const [editError, setEditError] = useState("");
  const [editing, setEditing] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<Pengumuman | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pengumumanService.getAll(1, 100, search, kategoriFilter);
      const body = res.data;
      setRecords(body?.data || []);
      setTotal(body?.meta?.total || 0);
    } catch { setRecords([]); }
    setLoading(false);
  }, [search, kategoriFilter]);

  useEffect(() => {
    const t = setTimeout(() => fetchRecords(), 400);
    return () => clearTimeout(t);
  }, [fetchRecords]);

  const openCreate = () => {
    setCreateForm(emptyForm);
    setCreateGambar(null);
    if (createFileRef.current) createFileRef.current.value = "";
    setCreateError("");
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.judul.trim()) { setCreateError("Judul wajib diisi"); return; }
    setCreating(true); setCreateError("");
    try {
      const fd = new FormData();
      fd.append("judul", createForm.judul.trim());
      fd.append("konten", createForm.konten.trim());
      fd.append("kategori", createForm.kategori);
      fd.append("tags", createForm.tags.trim());
      fd.append("is_published", String(createForm.is_published));
      if (createGambar) fd.append("gambar", createGambar);
      await pengumumanService.create(fd);
      setCreateOpen(false);
      setCreateGambar(null);
      if (createFileRef.current) createFileRef.current.value = "";
      showSuccess("Pengumuman berhasil ditambahkan");
      fetchRecords();
    } catch { setCreateError("Gagal menambahkan pengumuman"); }
    setCreating(false);
  };

  const openEdit = (r: Pengumuman) => {
    setEditingRecord(r);
    setEditForm({ judul: r.judul, konten: r.konten, kategori: r.kategori, tags: r.tags, is_published: r.is_published });
    setEditGambar(null);
    if (editFileRef.current) editFileRef.current.value = "";
    setEditError("");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingRecord) return;
    if (!editForm.judul.trim()) { setEditError("Judul wajib diisi"); return; }
    setEditing(true); setEditError("");
    try {
      const fd = new FormData();
      fd.append("judul", editForm.judul.trim());
      fd.append("konten", editForm.konten.trim());
      fd.append("kategori", editForm.kategori);
      fd.append("tags", editForm.tags.trim());
      fd.append("is_published", String(editForm.is_published));
      if (editGambar) fd.append("gambar", editGambar);
      await pengumumanService.update(editingRecord.id, fd);
      setEditOpen(false);
      setEditGambar(null);
      if (editFileRef.current) editFileRef.current.value = "";
      showSuccess("Pengumuman berhasil diperbarui");
      fetchRecords();
    } catch { setEditError("Gagal memperbarui pengumuman"); }
    setEditing(false);
  };

  const openDelete = (r: Pengumuman) => { setDeletingRecord(r); setDeleteOpen(true); };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    setDeleting(true);
    try {
      await pengumumanService.delete(deletingRecord.id);
      setDeleteOpen(false);
      setDeletingRecord(null);
      showSuccess("Pengumuman berhasil dihapus");
      fetchRecords();
    } catch { /* stay open */ }
    setDeleting(false);
  };

  const togglePublish = async (r: Pengumuman) => {
    try {
      const fd = new FormData();
      fd.append("judul", r.judul);
      fd.append("konten", r.konten);
      fd.append("kategori", r.kategori);
      fd.append("tags", r.tags);
      fd.append("is_published", String(!r.is_published));
      await pengumumanService.update(r.id, fd);
      showSuccess(r.is_published ? "Pengumuman disembunyikan" : "Pengumuman dipublikasikan");
      fetchRecords();
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengumuman</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{total} pengumuman tercatat</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pengumuman
        </Button>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-500/10 text-green-700 dark:text-green-400 text-sm p-3 rounded-xl border border-green-500/20">{successMsg}</div>
      )}

      <div className="grid grid-cols-2 lg:flex gap-3 mb-4">
        <div className="col-span-2 lg:flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Cari judul, konten, atau tags..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm dark:text-slate-100 dark:placeholder:text-gray-500"
          />
        </div>
        <select value={kategoriFilter} onChange={(e) => setKategoriFilter(e.target.value)}
          className="min-w-0 px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white">
          <option value="">Semua Kategori</option>
          {KATEGORI_LIST.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-red-700" /></div>
      ) : records.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">Tidak ada pengumuman</p>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <div key={r.id} className="glass rounded-xl p-4">
              <div className="flex gap-4">
                {r.gambar && (
                  <a href={getImageURL(r.gambar)} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <img src={getImageURL(r.gambar)} alt={r.judul} className="w-20 h-16 object-cover rounded-lg border border-white/20" />
                  </a>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.judul}</p>
                        {!r.is_published && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Draft</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {r.kategori && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400">{r.kategori}</span>
                        )}
                        {r.tags && r.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                          <span key={tag} className="flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] rounded bg-white/40 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                            <Tag className="w-2.5 h-2.5" />{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => togglePublish(r)} className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 transition-colors" title={r.is_published ? "Sembunyikan" : "Publikasikan"}>
                        {r.is_published ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                        <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button onClick={() => openDelete(r)} className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  {r.konten && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">{r.konten.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim()}</p>}
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                    {formatTanggal(r.created_at)}{r.created_by_name ? ` · ${r.created_by_name}` : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Pengumuman" size="md">
        <div className="space-y-4">
          {createError && <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-xl border border-rose-500/20">{createError}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul <span className="text-red-500">*</span></label>
            <input type="text" value={createForm.judul} onChange={(e) => setCreateForm({ ...createForm, judul: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
              <select value={createForm.kategori} onChange={(e) => setCreateForm({ ...createForm, kategori: e.target.value })} className={inputClass}>
                <option value="">-- Pilih --</option>
                {KATEGORI_LIST.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
              <input type="text" value={createForm.tags} onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })} placeholder="tag1, tag2" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konten</label>
            <RichTextEditor value={createForm.konten} onChange={(html) => setCreateForm((f) => ({ ...f, konten: html }))} editorKey="create" />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setCreateForm({ ...createForm, is_published: !createForm.is_published })}
              className={`relative w-10 h-6 rounded-full overflow-hidden transition-colors ${createForm.is_published ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${createForm.is_published ? "translate-x-4" : "translate-x-0"}`} />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">{createForm.is_published ? "Dipublikasikan" : "Draft (tidak tampil di publik)"}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gambar</label>
            <input ref={createFileRef} type="file" accept="image/*" onChange={(e) => setCreateGambar(e.target.files?.[0] ?? null)} className={fileInputClass} />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} loading={creating}>Simpan</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Edit */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Pengumuman" size="md">
        <div className="space-y-4">
          {editError && <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-xl border border-rose-500/20">{editError}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul <span className="text-red-500">*</span></label>
            <input type="text" value={editForm.judul} onChange={(e) => setEditForm({ ...editForm, judul: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
              <select value={editForm.kategori} onChange={(e) => setEditForm({ ...editForm, kategori: e.target.value })} className={inputClass}>
                <option value="">-- Pilih --</option>
                {KATEGORI_LIST.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
              <input type="text" value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} placeholder="tag1, tag2" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Konten</label>
            <RichTextEditor value={editForm.konten} onChange={(html) => setEditForm((f) => ({ ...f, konten: html }))} editorKey={editingRecord?.id} />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setEditForm({ ...editForm, is_published: !editForm.is_published })}
              className={`relative w-10 h-6 rounded-full overflow-hidden transition-colors ${editForm.is_published ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${editForm.is_published ? "translate-x-4" : "translate-x-0"}`} />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">{editForm.is_published ? "Dipublikasikan" : "Draft (tidak tampil di publik)"}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gambar</label>
            {editingRecord?.gambar && !editGambar && (
              <div className="mb-2">
                <a href={getImageURL(editingRecord.gambar)} target="_blank" rel="noopener noreferrer">
                  <img src={getImageURL(editingRecord.gambar)} alt="gambar saat ini" className="h-24 object-cover rounded-lg border border-white/20" />
                </a>
                <p className="text-xs text-gray-400 mt-1">Upload baru untuk mengganti.</p>
              </div>
            )}
            <input ref={editFileRef} type="file" accept="image/*" onChange={(e) => setEditGambar(e.target.files?.[0] ?? null)} className={fileInputClass} />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button onClick={handleEdit} loading={editing}>Simpan Perubahan</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Delete */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Hapus Pengumuman" size="sm">
        <div className="space-y-4">
          <div className="bg-rose-500/10 rounded-xl border border-rose-500/20 p-4">
            <p className="text-sm text-rose-700 dark:text-rose-400">
              Hapus pengumuman <strong>{deletingRecord?.judul}</strong>?
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>Hapus</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
