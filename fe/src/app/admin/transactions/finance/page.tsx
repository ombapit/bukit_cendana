"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { financeService } from "@/lib/services";
import { exportXLS } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import type { Finance, FinanceSummary } from "@/types";
import {
  Plus, Pencil, Trash2, Search, Loader2,
  ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, FileDown,
} from "lucide-react";

const KATEGORI_LIST = ["IPL", "Operasional", "Keamanan", "Kebersihan", "Perawatan", "Lain-lain"];

function formatRp(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
}

function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "-"; }
}

function isoToDateInput(iso: string): string {
  try { return new Date(iso).toISOString().split("T")[0]; } catch { return todayStr(); }
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function firstOfMonthStr(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}

const emptyForm = {
  nama_transaksi: "", deskripsi: "", kategori: "", debit: "", kredit: "", timestamp: todayStr(),
};

export default function FinancePage() {
  const [records, setRecords] = useState<Finance[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(firstOfMonthStr);
  const [dateTo, setDateTo] = useState(todayStr);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const [successMsg, setSuccessMsg] = useState("");

  // Create
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Finance | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState("");
  const [editing, setEditing] = useState(false);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<Finance | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [exporting, setExporting] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await financeService.getAll(1, 10000, debouncedSearch, dateFrom, dateTo);
      const all = res.data?.data || [];
      const suffix = dateFrom && dateTo ? `_${dateFrom}_sd_${dateTo}` : "";
      const rows = all.map((r, i) => ({
        "No": i + 1,
        "Tanggal": formatTanggal(r.timestamp),
        "Nama Transaksi": r.nama_transaksi,
        "Deskripsi": r.deskripsi || "-",
        "Kategori": r.kategori || "-",
        "Pemasukan (Rp)": r.kredit || 0,
        "Pengeluaran (Rp)": r.debit || 0,
        "Sumber": r.referensi_tipe || "-",
      }));
      exportXLS(`Laporan_Keuangan_Bukit_Cendana${suffix}`, "Keuangan", rows);
    } catch { /* ignore */ }
    setExporting(false);
  };

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setDebouncedSearch(search); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [dateFrom, dateTo]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        financeService.getAll(page, limit, debouncedSearch, dateFrom, dateTo),
        financeService.getSummary(dateFrom, dateTo),
      ]);
      const body = listRes.data;
      setRecords(body?.data || []);
      setTotal(body?.meta?.total || 0);
      setTotalPages(body?.meta?.total_pages || 1);
      setSummary(sumRes.data?.data ?? null);
    } catch {
      setRecords([]);
    }
    setLoading(false);
  }, [page, debouncedSearch, dateFrom, dateTo]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const pageRange = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1) as (number | "...")[];
    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages] as (number | "...")[];
    if (page >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as (number | "...")[];
    return [1, "...", page - 1, page, page + 1, "...", totalPages] as (number | "...")[];
  }, [page, totalPages]);

  // ========== Create ==========
  const openCreate = () => {
    setCreateForm({ ...emptyForm, timestamp: todayStr() });
    setCreateError("");
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.nama_transaksi.trim()) { setCreateError("Nama transaksi wajib diisi"); return; }
    if (!parseFloat(createForm.debit) && !parseFloat(createForm.kredit)) {
      setCreateError("Isi salah satu: debit atau kredit"); return;
    }
    setCreating(true);
    setCreateError("");
    try {
      await financeService.create({
        nama_transaksi: createForm.nama_transaksi.trim(),
        deskripsi: createForm.deskripsi.trim(),
        kategori: createForm.kategori,
        debit: parseFloat(createForm.debit) || 0,
        kredit: parseFloat(createForm.kredit) || 0,
        timestamp: createForm.timestamp,
      });
      setCreateOpen(false);
      showSuccess("Transaksi berhasil ditambahkan");
      fetchRecords();
    } catch { setCreateError("Gagal menambahkan transaksi"); }
    setCreating(false);
  };

  // ========== Edit ==========
  const openEdit = (r: Finance) => {
    setEditingRecord(r);
    setEditForm({
      nama_transaksi: r.nama_transaksi,
      deskripsi: r.deskripsi,
      kategori: r.kategori,
      debit: String(r.debit),
      kredit: String(r.kredit),
      timestamp: isoToDateInput(r.timestamp),
    });
    setEditError("");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingRecord) return;
    if (!editForm.nama_transaksi.trim()) { setEditError("Nama transaksi wajib diisi"); return; }
    setEditing(true);
    setEditError("");
    try {
      await financeService.update(editingRecord.id, {
        nama_transaksi: editForm.nama_transaksi.trim(),
        deskripsi: editForm.deskripsi.trim(),
        kategori: editForm.kategori,
        debit: parseFloat(editForm.debit) || 0,
        kredit: parseFloat(editForm.kredit) || 0,
        timestamp: editForm.timestamp,
      });
      setEditOpen(false);
      showSuccess("Transaksi berhasil diperbarui");
      fetchRecords();
    } catch { setEditError("Gagal memperbarui transaksi"); }
    setEditing(false);
  };

  // ========== Delete ==========
  const openDelete = (r: Finance) => { setDeletingRecord(r); setDeleteOpen(true); };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    setDeleting(true);
    try {
      await financeService.delete(deletingRecord.id);
      setDeleteOpen(false);
      setDeletingRecord(null);
      showSuccess("Transaksi berhasil dihapus");
      fetchRecords();
    } catch { /* stay open */ }
    setDeleting(false);
  };

  const columns = [
    {
      key: "timestamp",
      header: "Tanggal",
      render: (r: Finance) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{formatTanggal(r.timestamp)}</span>
      ),
    },
    {
      key: "nama_transaksi",
      header: "Transaksi",
      render: (r: Finance) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">{r.nama_transaksi}</p>
          {r.deskripsi && <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{r.deskripsi}</p>}
        </div>
      ),
    },
    {
      key: "kategori",
      header: "Kategori",
      render: (r: Finance) => (
        <div className="flex flex-col gap-1">
          {r.kategori && (
            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 w-fit">
              {r.kategori}
            </span>
          )}
          {r.referensi_tipe === "ipl" && (
            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 w-fit">
              auto-IPL
            </span>
          )}
        </div>
      ),
    },
    {
      key: "kredit",
      header: "Pemasukan",
      render: (r: Finance) => r.kredit > 0 ? (
        <span className="text-green-600 dark:text-green-400 font-medium text-sm">{formatRp(r.kredit)}</span>
      ) : <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>,
    },
    {
      key: "debit",
      header: "Pengeluaran",
      render: (r: Finance) => r.debit > 0 ? (
        <span className="text-red-600 dark:text-red-400 font-medium text-sm">{formatRp(r.debit)}</span>
      ) : <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>,
    },
    {
      key: "actions",
      header: "Aksi",
      render: (r: Finance) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 transition-colors" title="Edit">
            <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button onClick={() => openDelete(r)} className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors" title="Hapus">
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  const FormFields = ({ form, setForm, error }: {
    form: typeof emptyForm;
    setForm: (f: typeof emptyForm) => void;
    error: string;
  }) => (
    <div className="space-y-4">
      {error && (
        <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-xl border border-rose-500/20">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nama Transaksi <span className="text-red-500">*</span>
        </label>
        <input type="text" value={form.nama_transaksi}
          onChange={(e) => setForm({ ...form, nama_transaksi: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
          <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih --</option>
            {KATEGORI_LIST.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
          <input type="date" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pemasukan / Kredit (Rp)</label>
          <input type="number" min="0" value={form.kredit} onChange={(e) => setForm({ ...form, kredit: e.target.value })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pengeluaran / Debit (Rp)</label>
          <input type="number" min="0" value={form.debit} onChange={(e) => setForm({ ...form, debit: e.target.value })}
            placeholder="0"
            className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
        <textarea rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pemasukan & Pengeluaran</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{total} transaksi tercatat</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} loading={exporting}>
            <FileDown className="w-4 h-4 mr-2" />
            Export XLS
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-500/10 text-green-700 dark:text-green-400 text-sm p-3 rounded-xl border border-green-500/20">{successMsg}</div>
      )}

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Pemasukan</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatRp(summary.total_kredit)}</p>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Pengeluaran</p>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatRp(summary.total_debit)}</p>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${summary.saldo >= 0 ? "bg-blue-500/10" : "bg-rose-500/10"}`}>
              <Wallet className={`w-5 h-5 ${summary.saldo >= 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Saldo</p>
              <p className={`text-sm font-bold ${summary.saldo >= 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"}`}>
                {formatRp(summary.saldo)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input type="text" placeholder="Cari transaksi, kategori..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm dark:text-slate-100 dark:placeholder:text-gray-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Dari</label>
            <input type="date" value={dateFrom} max={dateTo || undefined}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Sampai</label>
            <input type="date" value={dateTo} min={dateFrom || undefined}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => { setDateFrom(firstOfMonthStr()); setDateTo(todayStr()); }}
            className="text-xs text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            title="Reset ke bulan berjalan"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-700" />
        </div>
      ) : (
        <>
          <Table columns={columns} data={records} />
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
                  <span key={`e-${i}`} className="px-1 text-sm text-gray-400">...</span>
                ) : (
                  <Button key={p} variant={page === p ? "primary" : "outline"} size="sm" onClick={() => setPage(p as number)}>
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

      {/* Modal: Create */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Transaksi" size="md">
        <div className="space-y-4">
          <FormFields form={createForm} setForm={setCreateForm} error={createError} />
          <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} loading={creating}>Simpan</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Edit */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Transaksi" size="md">
        <div className="space-y-4">
          {editingRecord?.referensi_tipe === "ipl" && (
            <div className="bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs p-3 rounded-xl border border-purple-500/20">
              Transaksi ini dibuat otomatis dari pembayaran IPL.
            </div>
          )}
          <FormFields form={editForm} setForm={setEditForm} error={editError} />
          <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button onClick={handleEdit} loading={editing}>Simpan Perubahan</Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Delete */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Hapus Transaksi" size="sm">
        <div className="space-y-4">
          <div className="bg-rose-500/10 rounded-xl border border-rose-500/20 p-4">
            <p className="text-sm text-rose-700 dark:text-rose-400">
              Apakah Anda yakin ingin menghapus transaksi <strong>{deletingRecord?.nama_transaksi}</strong>?
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
