"use client";

import { useEffect, useState, useCallback } from "react";
import { wargaService } from "@/lib/services";
import { exportWargaXLS } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import type { WargaWithLastPayment } from "@/types";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  FileDown,
} from "lucide-react";

function formatIuran(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatLastPayment(val: string): string {
  if (!val || val.length !== 6) return "-";
  const tahun = val.substring(0, 4);
  const bulan = val.substring(4, 6);
  const bulanNames: Record<string, string> = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
    "05": "Mei", "06": "Jun", "07": "Jul", "08": "Ags",
    "09": "Sep", "10": "Okt", "11": "Nov", "12": "Des",
  };
  return `${bulanNames[bulan] || bulan} ${tahun}`;
}

const emptyForm = { nama: "", blok: "", no_telp: "", iuran: "" };

export default function WargaAdminPage() {
  const [wargas, setWargas] = useState<WargaWithLastPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const [successMsg, setSuccessMsg] = useState("");

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingWarga, setEditingWarga] = useState<WargaWithLastPayment | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState("");
  const [editing, setEditing] = useState(false);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingWarga, setDeletingWarga] = useState<WargaWithLastPayment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const fetchWargas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await wargaService.getAll(1, 1000);
      const body = res.data;
      const data = body?.data || [];
      setWargas(data);
      setTotal(data.length);
    } catch {
      setWargas([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWargas();
  }, [fetchWargas]);

  const filtered = search
    ? wargas.filter((w) => {
        const s = search.toLowerCase();
        return (
          w.nama.toLowerCase().includes(s) ||
          w.blok.toLowerCase().includes(s) ||
          (w.no_telp || "").includes(s)
        );
      })
    : wargas;

  // ========== Create ==========
  const openCreate = () => {
    setCreateForm(emptyForm);
    setCreateError("");
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.nama.trim() || !createForm.blok.trim()) {
      setCreateError("Nama dan blok wajib diisi");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      await wargaService.create({
        nama: createForm.nama.trim(),
        blok: createForm.blok.trim(),
        no_telp: createForm.no_telp.trim() || undefined,
        iuran: parseFloat(createForm.iuran) || 0,
      });
      setCreateOpen(false);
      showSuccess("Warga berhasil ditambahkan");
      fetchWargas();
    } catch {
      setCreateError("Gagal menambahkan warga");
    }
    setCreating(false);
  };

  // ========== Edit ==========
  const openEdit = (w: WargaWithLastPayment) => {
    setEditingWarga(w);
    setEditForm({
      nama: w.nama,
      blok: w.blok,
      no_telp: w.no_telp || "",
      iuran: String(w.iuran),
    });
    setEditError("");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingWarga) return;
    if (!editForm.nama.trim() || !editForm.blok.trim()) {
      setEditError("Nama dan blok wajib diisi");
      return;
    }
    setEditing(true);
    setEditError("");
    try {
      await wargaService.update(String(editingWarga.id), {
        nama: editForm.nama.trim(),
        blok: editForm.blok.trim(),
        no_telp: editForm.no_telp.trim(),
        iuran: parseFloat(editForm.iuran) || 0,
      });
      setEditOpen(false);
      showSuccess("Data warga berhasil diperbarui");
      fetchWargas();
    } catch {
      setEditError("Gagal memperbarui data warga");
    }
    setEditing(false);
  };

  // ========== Delete ==========
  const openDelete = (w: WargaWithLastPayment) => {
    setDeletingWarga(w);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingWarga) return;
    setDeleting(true);
    try {
      await wargaService.delete(String(deletingWarga.id));
      setDeleteOpen(false);
      setDeletingWarga(null);
      showSuccess("Warga berhasil dihapus");
      fetchWargas();
    } catch { /* stay open */ }
    setDeleting(false);
  };

  const columns = [
    {
      key: "nama",
      header: "Nama",
      render: (w: WargaWithLastPayment) => (
        <p className="font-medium text-gray-900 dark:text-white">{w.nama}</p>
      ),
    },
    {
      key: "blok",
      header: "Blok",
      render: (w: WargaWithLastPayment) => (
        <span className="px-2 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded text-sm font-medium">
          {w.blok}
        </span>
      ),
    },
    {
      key: "no_telp",
      header: "No. Telp",
      render: (w: WargaWithLastPayment) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {w.no_telp || "-"}
        </span>
      ),
    },
    {
      key: "iuran",
      header: "Iuran/Bulan",
      render: (w: WargaWithLastPayment) => (
        <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">
          {formatIuran(w.iuran)}
        </span>
      ),
    },
    {
      key: "last_payment",
      header: "Bayar Terakhir",
      render: (w: WargaWithLastPayment) => (
        <span className={`text-sm ${w.last_payment ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>
          {formatLastPayment(w.last_payment)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      render: (w: WargaWithLastPayment) => (
        <div className="flex gap-1">
          <button
            onClick={() => openEdit(w)}
            className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => openDelete(w)}
            className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
            title="Hapus"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    await exportWargaXLS("Data_Warga_Bukit_Cendana", wargas.map((w, i) => ({
      no: i + 1,
      nama: w.nama,
      blok: w.blok,
      no_telp: w.no_telp || "-",
      iuran: w.iuran,
      last_payment_label: formatLastPayment(w.last_payment),
      last_payment_raw: w.last_payment,
    })));
    setExporting(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Warga</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Daftar penghuni Bukit Cendana ({total} warga)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} loading={exporting} disabled={wargas.length === 0}>
            <FileDown className="w-4 h-4 mr-2" />
            Export XLS
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Warga
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-500/10 text-green-700 dark:text-green-400 text-sm p-3 rounded-xl border border-green-500/20">
          {successMsg}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Cari nama, blok, atau no. telp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm dark:text-slate-100 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-700" />
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="lg:hidden space-y-3">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Tidak ada data</p>
            ) : (
              filtered.map((w) => (
                <div key={w.id} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{w.nama}</p>
                      {w.no_telp && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{w.no_telp}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 transition-colors" title="Edit">
                        <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button onClick={() => openDelete(w)} className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">{w.blok}</span>
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/20 dark:border-white/5">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Iuran/Bulan</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatIuran(w.iuran)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Bayar Terakhir</p>
                      <p className={`text-sm ${w.last_payment ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}>{formatLastPayment(w.last_payment)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block">
            <Table columns={columns} data={filtered} />
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            {filtered.length === total
              ? `Total ${total} warga`
              : `Menampilkan ${filtered.length} dari ${total} warga`}
          </p>
        </>
      )}

      {/* ========== Modal: Create ========== */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Warga" size="md">
        <div className="space-y-4">
          {createError && (
            <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-xl border border-rose-500/20">
              {createError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={createForm.nama}
                onChange={(e) => setCreateForm({ ...createForm, nama: e.target.value })}
                placeholder="Nama lengkap"
                className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Blok <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={createForm.blok}
                onChange={(e) => setCreateForm({ ...createForm, blok: e.target.value })}
                placeholder="Cth: A1"
                className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                No. Telp
              </label>
              <input
                type="text"
                value={createForm.no_telp}
                onChange={(e) => setCreateForm({ ...createForm, no_telp: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Iuran/Bulan (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={createForm.iuran}
                onChange={(e) => setCreateForm({ ...createForm, iuran: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} loading={creating}>Simpan</Button>
          </div>
        </div>
      </Modal>

      {/* ========== Modal: Edit ========== */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Data Warga" size="md">
        <div className="space-y-4">
          {editError && (
            <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-xl border border-rose-500/20">
              {editError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.nama}
                onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Blok <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.blok}
                onChange={(e) => setEditForm({ ...editForm, blok: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                No. Telp
              </label>
              <input
                type="text"
                value={editForm.no_telp}
                onChange={(e) => setEditForm({ ...editForm, no_telp: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Iuran/Bulan (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={editForm.iuran}
                onChange={(e) => setEditForm({ ...editForm, iuran: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button onClick={handleEdit} loading={editing}>Simpan Perubahan</Button>
          </div>
        </div>
      </Modal>

      {/* ========== Modal: Delete ========== */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Hapus Warga" size="sm">
        <div className="space-y-4">
          <div className="bg-rose-500/10 rounded-xl border border-rose-500/20 p-4">
            <p className="text-sm text-rose-700 dark:text-rose-400">
              Apakah Anda yakin ingin menghapus warga{" "}
              <strong>{deletingWarga?.nama}</strong> — Blok{" "}
              <strong>{deletingWarga?.blok}</strong>?
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">
              Tindakan ini tidak dapat dibatalkan.
            </p>
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
