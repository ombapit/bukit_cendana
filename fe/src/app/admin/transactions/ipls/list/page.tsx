"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { iplService, wargaService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import type { IPL, WargaWithLastPayment } from "@/types";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";

const bulanIndonesia: Record<string, string> = {
  "01": "Januari",
  "02": "Februari",
  "03": "Maret",
  "04": "April",
  "05": "Mei",
  "06": "Juni",
  "07": "Juli",
  "08": "Agustus",
  "09": "September",
  "10": "Oktober",
  "11": "November",
  "12": "Desember",
};

function formatTanggalIPL(tanggal: string): string {
  if (!tanggal || tanggal.length !== 6) return "-";
  const tahun = tanggal.substring(0, 4);
  const bulan = tanggal.substring(4, 6);
  return `${bulanIndonesia[bulan] || bulan} ${tahun}`;
}

// Convert YYYYMM → YYYY-MM (for input[type="month"])
function yyyymmToInputMonth(tanggal: string): string {
  if (!tanggal || tanggal.length !== 6) return "";
  return `${tanggal.substring(0, 4)}-${tanggal.substring(4, 6)}`;
}

// Convert YYYY-MM → YYYYMM
function inputMonthToYYYYMM(val: string): string {
  return val.replace("-", "");
}

function getImageURL(gambar: string): string {
  if (!gambar) return "";
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace("/api/v1", "");
  return `${base}${gambar}`;
}

export default function IPLListPage() {
  const [ipls, setIpls] = useState<IPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const [wargas, setWargas] = useState<WargaWithLastPayment[]>([]);

  // Alerts
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ warga_id: "", tanggal_ipl: "", created_at: "", gambar: null as File | null });
  const [creating, setCreating] = useState(false);
  const createFileRef = useRef<HTMLInputElement>(null);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingIPL, setEditingIPL] = useState<IPL | null>(null);
  const [editForm, setEditForm] = useState({ tanggal_ipl: "", created_at: "", gambar: null as File | null });
  const [editing, setEditing] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  // Warga combobox
  const [wargaSearch, setWargaSearch] = useState("");
  const [wargaDropdownOpen, setWargaDropdownOpen] = useState(false);
  const wargaComboRef = useRef<HTMLDivElement>(null);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingIPL, setDeletingIPL] = useState<IPL | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg("");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg("");
    setTimeout(() => setErrorMsg(""), 5000);
  };

  // Close warga dropdown on outside click
  useEffect(() => {
    if (!wargaDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (wargaComboRef.current && !wargaComboRef.current.contains(e.target as Node)) {
        setWargaDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [wargaDropdownOpen]);

  const filteredWargas = useMemo(() => {
    if (!wargaSearch.trim()) return wargas;
    const q = wargaSearch.toLowerCase();
    return wargas.filter((w) => w.nama.toLowerCase().includes(q) || w.blok.toLowerCase().includes(q));
  }, [wargas, wargaSearch]);

  const selectedWargaLabel = useMemo(() => {
    if (!createForm.warga_id) return "";
    const w = wargas.find((w) => w.id === createForm.warga_id);
    return w ? `${w.nama} — ${w.blok}` : "";
  }, [createForm.warga_id, wargas]);

  // Debounce: reset page ke 1 dan trigger fetch setelah 400ms idle
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchIPLs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await iplService.getAll(page, limit, debouncedSearch);
      const body = res.data;
      setIpls(body?.data || []);
      setTotal(body?.meta?.total || 0);
      setTotalPages(body?.meta?.total_pages || 1);
    } catch {
      setIpls([]);
    }
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchIPLs();
  }, [fetchIPLs]);

  // Load wargas once for the dropdown
  useEffect(() => {
    wargaService.getAll(1, 1000).then((res) => {
      setWargas(res.data?.data || []);
    }).catch(() => {});
  }, []);

  const pageRange = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1) as (number | "...")[];
    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages] as (number | "...")[];
    if (page >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as (number | "...")[];
    return [1, "...", page - 1, page, page + 1, "...", totalPages] as (number | "...")[];
  }, [page, totalPages]);

  // ========== Create ==========
  const todayStr = () => new Date().toISOString().split("T")[0];
  const isoToDateInput = (iso: string) => {
    try { return new Date(iso).toISOString().split("T")[0]; } catch { return todayStr(); }
  };

  const openCreate = () => {
    setCreateForm({ warga_id: "", tanggal_ipl: "", created_at: todayStr(), gambar: null });
    setWargaSearch("");
    setWargaDropdownOpen(false);
    if (createFileRef.current) createFileRef.current.value = "";
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.warga_id || !createForm.tanggal_ipl) {
      showError("Warga dan periode IPL wajib diisi");
      return;
    }
    setCreating(true);
    try {
      const fd = new FormData();
      fd.append("warga_id", createForm.warga_id);
      fd.append("tanggal_ipl", inputMonthToYYYYMM(createForm.tanggal_ipl));
      if (createForm.created_at) fd.append("created_at", createForm.created_at);
      if (createForm.gambar) fd.append("gambar", createForm.gambar);
      await iplService.create(fd);
      setCreateOpen(false);
      showSuccess("Pembayaran IPL berhasil ditambahkan");
      fetchIPLs();
    } catch {
      showError("Gagal menambahkan pembayaran IPL");
    }
    setCreating(false);
  };

  // ========== Edit ==========
  const openEdit = (ipl: IPL) => {
    setEditingIPL(ipl);
    setEditForm({ tanggal_ipl: yyyymmToInputMonth(ipl.tanggal_ipl), created_at: isoToDateInput(ipl.created_at), gambar: null });
    if (editFileRef.current) editFileRef.current.value = "";
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingIPL) return;
    setEditing(true);
    try {
      const fd = new FormData();
      fd.append("tanggal_ipl", inputMonthToYYYYMM(editForm.tanggal_ipl));
      if (editForm.created_at) fd.append("created_at", editForm.created_at);
      if (editForm.gambar) fd.append("gambar", editForm.gambar);
      await iplService.update(editingIPL.id, fd);
      setEditOpen(false);
      showSuccess("Pembayaran IPL berhasil diperbarui");
      fetchIPLs();
    } catch {
      showError("Gagal memperbarui pembayaran IPL");
    }
    setEditing(false);
  };

  // ========== Delete ==========
  const openDelete = (ipl: IPL) => {
    setDeletingIPL(ipl);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingIPL) return;
    setDeleting(true);
    try {
      await iplService.delete(deletingIPL.id);
      setDeleteOpen(false);
      setDeletingIPL(null);
      showSuccess("Pembayaran IPL berhasil dihapus");
      fetchIPLs();
    } catch {
      showError("Gagal menghapus pembayaran IPL");
    }
    setDeleting(false);
  };

  // ========== Table columns ==========
  const columns = [
    {
      key: "warga_nama",
      header: "Nama Warga",
      render: (ipl: IPL) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{ipl.warga_nama}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{ipl.warga_blok}</p>
        </div>
      ),
    },
    {
      key: "tanggal_ipl",
      header: "Periode IPL",
      render: (ipl: IPL) => (
        <span className="px-2 py-1 bg-red-700/10 text-red-700 dark:bg-red-700/20 dark:text-red-400 rounded text-sm">
          {formatTanggalIPL(ipl.tanggal_ipl)}
        </span>
      ),
    },
    {
      key: "gambar",
      header: "Bukti",
      render: (ipl: IPL) => {
        if (!ipl.gambar) {
          return (
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <ImageIcon className="w-4 h-4" />
              Tidak ada
            </span>
          );
        }
        const imgUrl = getImageURL(ipl.gambar);
        return (
          <a href={imgUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={imgUrl}
              alt="Bukti IPL"
              className="w-12 h-12 object-cover rounded-lg border border-white/20 dark:border-white/10 hover:scale-105 transition-transform"
            />
          </a>
        );
      },
    },
    {
      key: "created_at",
      header: "Tanggal Input",
      render: (ipl: IPL) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {new Date(ipl.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      render: (ipl: IPL) => (
        <div className="flex gap-1">
          <button
            onClick={() => openEdit(ipl)}
            className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
            title="Edit IPL"
          >
            <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => openDelete(ipl)}
            className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
            title="Hapus IPL"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pembayaran IPL</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Daftar pembayaran iuran IPL warga ({total} total)
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah IPL
        </Button>
      </div>

      {/* Success / Error alerts */}
      {successMsg && (
        <div className="mb-4 bg-green-500/10 text-green-700 dark:text-green-400 text-sm p-3 rounded-xl border border-green-500/20">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-xl border border-rose-500/20">
          {errorMsg}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Cari nama, blok, atau periode..."
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
          <Table columns={columns} data={ipls} />

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Menampilkan {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} dari {total}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {pageRange.map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-sm text-gray-400 dark:text-gray-500">...</span>
                ) : (
                  <Button
                    key={p}
                    variant={page === p ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setPage(p as number)}
                  >
                    {p}
                  </Button>
                )
              )}
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ========== Modal: Create ========== */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Tambah Pembayaran IPL"
        size="md"
      >
        <div className="space-y-4">
          {/* Warga searchable combobox */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Warga <span className="text-red-500">*</span>
            </label>
            <div ref={wargaComboRef} className="relative">
              <input
                type="text"
                placeholder="Ketik nama atau blok..."
                value={wargaDropdownOpen ? wargaSearch : selectedWargaLabel}
                onFocus={() => { setWargaDropdownOpen(true); setWargaSearch(""); }}
                onChange={(e) => { setWargaSearch(e.target.value); setWargaDropdownOpen(true); }}
                className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {wargaDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 rounded-lg border border-white/20 dark:border-white/10 bg-white dark:bg-gray-900 shadow-xl max-h-52 overflow-y-auto">
                  {filteredWargas.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">Tidak ada warga ditemukan</div>
                  ) : (
                    filteredWargas.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onMouseDown={() => {
                          setCreateForm({ ...createForm, warga_id: w.id });
                          setWargaDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-blue-500/10 transition-colors ${createForm.warga_id === w.id ? "bg-blue-500/10" : ""}`}
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{w.nama}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-white/10 px-1.5 py-0.5 rounded">{w.blok}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {createForm.warga_id && !wargaDropdownOpen && (
              <button
                type="button"
                onClick={() => { setCreateForm({ ...createForm, warga_id: "" }); setWargaSearch(""); }}
                className="mt-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                × Hapus pilihan
              </button>
            )}
          </div>

          {/* Periode IPL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Periode IPL <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              value={createForm.tanggal_ipl}
              onChange={(e) => setCreateForm({ ...createForm, tanggal_ipl: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tanggal Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tanggal Pembayaran
            </label>
            <input
              type="date"
              value={createForm.created_at}
              onChange={(e) => setCreateForm({ ...createForm, created_at: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gambar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bukti Pembayaran
            </label>
            <input
              ref={createFileRef}
              type="file"
              accept="image/*"
              onChange={(e) => setCreateForm({ ...createForm, gambar: e.target.files?.[0] ?? null })}
              className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-700/10 file:text-red-700 dark:file:bg-red-700/20 dark:file:text-red-400 hover:file:bg-red-700/20 cursor-pointer"
            />
            {createForm.gambar && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                File dipilih: {createForm.gambar.name}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCreate} loading={creating}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========== Modal: Edit ========== */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Pembayaran IPL"
        size="md"
      >
        {editingIPL && (
          <div className="space-y-4">
            {/* Info warga (read-only) */}
            <div className="bg-white/30 dark:bg-white/5 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Warga</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {editingIPL.warga_nama} — {editingIPL.warga_blok}
              </p>
            </div>

            {/* Periode IPL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Periode IPL
              </label>
              <input
                type="month"
                value={editForm.tanggal_ipl}
                onChange={(e) => setEditForm({ ...editForm, tanggal_ipl: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tanggal Pembayaran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tanggal Pembayaran
              </label>
              <input
                type="date"
                value={editForm.created_at}
                onChange={(e) => setEditForm({ ...editForm, created_at: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Gambar lama */}
            {editingIPL.gambar && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bukti saat ini:</p>
                <a href={getImageURL(editingIPL.gambar)} target="_blank" rel="noopener noreferrer">
                  <img
                    src={getImageURL(editingIPL.gambar)}
                    alt="Bukti IPL"
                    className="h-24 w-auto rounded-lg border border-white/20 dark:border-white/10 object-cover hover:opacity-90 transition-opacity"
                  />
                </a>
              </div>
            )}

            {/* Upload gambar baru */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ganti Bukti Pembayaran
              </label>
              <input
                ref={editFileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setEditForm({ ...editForm, gambar: e.target.files?.[0] ?? null })}
                className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-700/10 file:text-red-700 dark:file:bg-red-700/20 dark:file:text-red-400 hover:file:bg-red-700/20 cursor-pointer"
              />
              {editForm.gambar && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  File baru: {editForm.gambar.name}
                </p>
              )}
              {!editForm.gambar && editingIPL.gambar && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Biarkan kosong untuk mempertahankan gambar saat ini
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleEdit} loading={editing}>
                Simpan Perubahan
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========== Modal: Delete Confirmation ========== */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Hapus Pembayaran IPL"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-rose-500/10 rounded-xl border border-rose-500/20 p-4">
            <p className="text-sm text-rose-700 dark:text-rose-400">
              Apakah Anda yakin ingin menghapus pembayaran IPL{" "}
              <strong>
                {deletingIPL?.warga_nama} — {formatTanggalIPL(deletingIPL?.tanggal_ipl ?? "")}
              </strong>
              ?
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
