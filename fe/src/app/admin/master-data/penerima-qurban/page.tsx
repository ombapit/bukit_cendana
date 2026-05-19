"use client";

import { useEffect, useState, useCallback } from "react";
import { penerimaQurbanService } from "@/lib/services";
import { generateKuponQurbanPDF } from "@/lib/kupon-qurban";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import type { PenerimaQurban } from "@/types";
import { Plus, Pencil, Printer, FileDown, Trash2, Search, Loader2 } from "lucide-react";
import ExcelJS from "exceljs";

function blokPrefix(blok: string) {
  return (blok || "").split("/")[0].trim();
}

function addBlokSheet(wb: ExcelJS.Workbook, judulBase: string, blok: string, rows: PenerimaQurban[]) {
  const COLS = 4;
  const judul = `${judulBase} Blok ${blok}`;
  const ws = wb.addWorksheet(blok);

  // Title
  ws.mergeCells(1, 1, 1, COLS);
  const titleCell = ws.getCell("A1");
  titleCell.value = judul;
  titleCell.font = { bold: true, size: 13 };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 24;

  // Blank separator
  ws.addRow([]);

  // Header
  const headerRow = ws.addRow(["No", "Nama", "Blok", "Status"]);
  headerRow.height = 18;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
    cell.border = {
      top: { style: "thin" }, left: { style: "thin" },
      bottom: { style: "thin" }, right: { style: "thin" },
    };
  });

  // Data
  rows.forEach((r, i) => {
    const row = ws.addRow([i + 1, r.nama, r.blok, ""]);
    row.height = 16;
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      cell.alignment = {
        horizontal: col === 1 || col === 3 ? "center" : "left",
        vertical: "middle",
      };
      cell.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" },
      };
    });
  });

  ws.getColumn(1).width = 6;
  ws.getColumn(2).width = 32;
  ws.getColumn(3).width = 14;
  ws.getColumn(4).width = 22;

  ws.pageSetup = {
    orientation: "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
  };
}

async function exportPenerimaXLS(judulBase: string, filename: string, rows: PenerimaQurban[]) {
  const wb = new ExcelJS.Workbook();

  const sorted = [...rows].sort(
    (a, b) =>
      blokPrefix(a.blok).localeCompare(blokPrefix(b.blok), "id", { numeric: true }) ||
      a.blok.localeCompare(b.blok, "id", { numeric: true }) ||
      a.nama.localeCompare(b.nama, "id")
  );

  // Group by blok prefix
  const groups = new Map<string, PenerimaQurban[]>();
  for (const r of sorted) {
    const key = blokPrefix(r.blok);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  for (const [blok, members] of groups) {
    addBlokSheet(wb, judulBase, blok, members);
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

const KONDISI_OPTIONS = ["", "Ditinggali", "Kosong", "Disewakan"] as const;

const emptyForm = { nama: "", blok: "", no_telp: "", kondisi_rumah: "" };

export default function PenerimaQurbanPage() {
  const [data, setData] = useState<PenerimaQurban[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterBlok, setFilterBlok] = useState("");
  const [total, setTotal] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [printing, setPrinting] = useState(false);
  const [exportingKupon, setExportingKupon] = useState(false);
  const [exportingPenerimaan, setExportingPenerimaan] = useState(false);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PenerimaQurban | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState("");
  const [editing, setEditing] = useState(false);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<PenerimaQurban | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await penerimaQurbanService.getAll(1, 1000, search);
      const items = res.data?.data || [];
      setData(items);
      setTotal(items.length);
    } catch {
      setData([]);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  // ── Create ───────────────────────────────────────────────────────────────
  const openCreate = () => {
    setCreateForm(emptyForm);
    setCreateError("");
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.nama.trim() || !createForm.blok.trim()) {
      setCreateError("Nama dan Blok wajib diisi");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      await penerimaQurbanService.create({
        nama: createForm.nama.trim(),
        blok: createForm.blok.trim(),
        no_telp: createForm.no_telp.trim(),
        kondisi_rumah: createForm.kondisi_rumah,
      });
      setCreateOpen(false);
      showSuccess("Data penerima qurban berhasil ditambahkan");
      fetchData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal menyimpan data";
      setCreateError(msg);
    }
    setCreating(false);
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const openEdit = (item: PenerimaQurban) => {
    setEditingItem(item);
    setEditForm({
      nama: item.nama,
      blok: item.blok,
      no_telp: item.no_telp || "",
      kondisi_rumah: item.kondisi_rumah || "",
    });
    setEditError("");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingItem) return;
    if (!editForm.nama.trim() || !editForm.blok.trim()) {
      setEditError("Nama dan Blok wajib diisi");
      return;
    }
    setEditing(true);
    setEditError("");
    try {
      await penerimaQurbanService.update(editingItem.id, {
        nama: editForm.nama.trim(),
        blok: editForm.blok.trim(),
        no_telp: editForm.no_telp.trim(),
        kondisi_rumah: editForm.kondisi_rumah,
      });
      setEditOpen(false);
      showSuccess("Data berhasil diperbarui");
      fetchData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal memperbarui data";
      setEditError(msg);
    }
    setEditing(false);
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const openDelete = (item: PenerimaQurban) => {
    setDeletingItem(item);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await penerimaQurbanService.delete(deletingItem.id);
      setDeleteOpen(false);
      setDeletingItem(null);
      showSuccess("Data berhasil dihapus");
      fetchData();
    } catch { /* stay open */ }
    setDeleting(false);
  };

  const blokPrefix = (b: string) => (b || "").split("/")[0].trim();

  const blokOptions = Array.from(new Set(data.map((r) => blokPrefix(r.blok)).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "id", { numeric: true }));

  const displayedData = filterBlok
    ? data.filter((r) => blokPrefix(r.blok) === filterBlok)
    : data;

  const columns = [
    {
      key: "nama",
      header: "Nama",
      render: (r: PenerimaQurban) => (
        <p className="font-medium text-gray-900 dark:text-white">{r.nama}</p>
      ),
    },
    {
      key: "blok",
      header: "Blok",
      render: (r: PenerimaQurban) => (
        <span className="px-2 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded text-sm font-medium">
          {r.blok}
        </span>
      ),
    },
    {
      key: "no_telp",
      header: "No. Telp",
      render: (r: PenerimaQurban) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{r.no_telp || "-"}</span>
      ),
    },
    {
      key: "kondisi_rumah",
      header: "Kondisi Rumah",
      render: (r: PenerimaQurban) => {
        const kondisi = r.kondisi_rumah || "-";
        const colorMap: Record<string, string> = {
          Ditinggali: "bg-green-500/10 text-green-700 dark:text-green-400",
          Kosong: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
          Disewakan: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
        };
        return (
          <span className={`px-2 py-1 rounded text-sm font-medium ${colorMap[kondisi] || ""}`}>
            {kondisi}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Aksi",
      render: (r: PenerimaQurban) => (
        <div className="flex gap-1">
          <button
            onClick={() => openEdit(r)}
            className="p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => openDelete(r)}
            className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
            title="Hapus"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Penerima Qurban</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Daftar penerima daging qurban Bukit Cendana
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              setPrinting(true);
              try {
                const res = await penerimaQurbanService.getAll(1, 1000);
                const wargas = (res.data?.data || [])
                  .filter((w: PenerimaQurban) => w.kondisi_rumah !== "Kosong")
                  .sort((a: PenerimaQurban, b: PenerimaQurban) =>
                    a.blok.localeCompare(b.blok, "id", { numeric: true }) ||
                    a.nama.localeCompare(b.nama, "id")
                  );
                await generateKuponQurbanPDF(wargas);
              } finally {
                setPrinting(false);
              }
            }}
            loading={printing}
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak Kupon
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setExportingKupon(true);
              await exportPenerimaXLS("Pembagian Kupon Qurban", "Pembagian_Kupon_Qurban", data);
              setExportingKupon(false);
            }}
            loading={exportingKupon}
            disabled={data.length === 0}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Kupon
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              setExportingPenerimaan(true);
              await exportPenerimaXLS("Penerimaan Qurban", "Penerimaan_Qurban", data);
              setExportingPenerimaan(false);
            }}
            loading={exportingPenerimaan}
            disabled={data.length === 0}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Penerimaan
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-500/10 text-green-700 dark:text-green-400 text-sm p-3 rounded-xl border border-green-500/20">
          {successMsg}
        </div>
      )}

      {/* Search & Filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Cari nama atau blok..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm dark:text-slate-100 dark:placeholder:text-gray-500"
          />
        </div>
        <select
          value={filterBlok}
          onChange={(e) => setFilterBlok(e.target.value)}
          className="px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 dark:bg-white/5 dark:text-slate-100 sm:w-48"
        >
          <option value="">Semua Blok</option>
          {blokOptions.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-700" />
        </div>
      ) : (
        <>
          <div className="lg:hidden space-y-3">
            {displayedData.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Belum ada data</p>
            ) : (
              displayedData.map((r) => (
                <div key={r.id} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{r.nama}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="inline-block px-2 py-0.5 text-xs rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">
                          {r.blok}
                        </span>
                        {r.kondisi_rumah && (
                          <span className="inline-block px-2 py-0.5 text-xs rounded bg-gray-500/10 text-gray-600 dark:text-gray-400 font-medium">
                            {r.kondisi_rumah}
                          </span>
                        )}
                      </div>
                      {r.no_telp && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{r.no_telp}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors">
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </button>
                      <button onClick={() => openDelete(r)} className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden lg:block">
            <Table columns={columns} data={displayedData} />
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            {filterBlok
              ? `Menampilkan ${displayedData.length} dari ${total} data`
              : `Total ${total} data`}
          </p>
        </>
      )}

      {/* ========== Modal: Create ========== */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Penerima Qurban" size="md">
        <div className="space-y-4">
          {createError && (
            <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-xl border border-rose-500/20">
              {createError}
            </div>
          )}
          <FormFields form={createForm} onChange={(f) => setCreateForm(f)} />
          <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} loading={creating}>Simpan</Button>
          </div>
        </div>
      </Modal>

      {/* ========== Modal: Edit ========== */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Penerima Qurban" size="md">
        <div className="space-y-4">
          {editError && (
            <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-xl border border-rose-500/20">
              {editError}
            </div>
          )}
          <FormFields form={editForm} onChange={(f) => setEditForm(f)} />
          <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button onClick={handleEdit} loading={editing}>Simpan</Button>
          </div>
        </div>
      </Modal>

      {/* ========== Modal: Delete ========== */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Hapus Data" size="sm">
        <div className="space-y-4">
          <div className="bg-rose-500/10 rounded-xl border border-rose-500/20 p-4">
            <p className="text-sm text-rose-700 dark:text-rose-400">
              Hapus penerima qurban <strong>{deletingItem?.nama}</strong> — Blok{" "}
              <strong>{deletingItem?.blok}</strong>?
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

// ── Shared form fields ────────────────────────────────────────────────────
interface FormState {
  nama: string;
  blok: string;
  no_telp: string;
  kondisi_rumah: string;
}

function FormFields({ form, onChange }: { form: FormState; onChange: (f: FormState) => void }) {
  const field = (key: keyof FormState) => (val: string) => onChange({ ...form, [key]: val });

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nama <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.nama}
          onChange={(e) => field("nama")(e.target.value)}
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
          value={form.blok}
          onChange={(e) => field("blok")(e.target.value)}
          placeholder="Contoh: A1/1"
          className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          No. Telepon
        </label>
        <input
          type="text"
          value={form.no_telp}
          onChange={(e) => field("no_telp")(e.target.value)}
          placeholder="08xx..."
          className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Kondisi Rumah
        </label>
        <select
          value={form.kondisi_rumah}
          onChange={(e) => field("kondisi_rumah")(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {KONDISI_OPTIONS.map((o) => (
            <option key={o} value={o}>{o || "— Pilih —"}</option>
          ))}
        </select>
      </div>
    </>
  );
}
