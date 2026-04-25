"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { qurbanService, wargaService } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import { QRScanner } from "@/components/ui/qr-scanner";
import type { PengambilanQurban, WargaWithLastPayment } from "@/types";
import {
  Plus, Trash2, Search, Loader2, FileDown,
  ScanLine, X,
} from "lucide-react";
import ExcelJS from "exceljs";

function formatTanggal(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return "-"; }
}

async function exportQurbanXLS(filename: string, rows: PengambilanQurban[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Pengambilan Daging Qurban");
  ws.columns = [
    { header: "No",           key: "no",        width: 5  },
    { header: "Nama Warga",   key: "nama_warga", width: 30 },
    { header: "Blok",         key: "blok_warga", width: 10 },
    { header: "Status",       key: "status",     width: 20 },
    { header: "Waktu Catat",  key: "created_at", width: 24 },
    { header: "Dicatat Oleh", key: "created_by", width: 20 },
  ];
  ws.getRow(1).font = { bold: true };
  rows.forEach((r, i) => {
    const row = ws.addRow({
      no: i + 1,
      nama_warga: r.nama_warga,
      blok_warga: r.blok_warga,
      status: r.status,
      created_at: formatTanggal(r.created_at),
      created_by: r.created_by,
    });
    row.getCell("status").font = {
      color: { argb: r.status === "Sudah Diambil" ? "FF16A34A" : "FFCA8A04" },
    };
  });
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

// ── Searchable warga combobox ──────────────────────────────────────────────
interface WargaComboboxProps {
  warga: WargaWithLastPayment[];
  selectedID: string;
  onSelect: (id: string, label: string) => void;
}

function WargaCombobox({ warga, selectedID, onSelect }: WargaComboboxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = warga.find((w) => String(w.id) === selectedID);
  const displayValue = selected ? `${selected.blok} — ${selected.nama}` : "";

  const filtered = query.trim()
    ? warga.filter(
        (w) =>
          w.nama.toLowerCase().includes(query.toLowerCase()) ||
          w.blok.toLowerCase().includes(query.toLowerCase())
      )
    : warga;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Sync display when selection changes externally (e.g. QR scan)
  useEffect(() => {
    if (selectedID && selected) setQuery("");
  }, [selectedID, selected]);

  const inputValue = open ? query : displayValue;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          placeholder="Ketik nama atau blok..."
          onFocus={() => { setQuery(""); setOpen(true); }}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          className="w-full px-3 py-2 pr-8 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {selectedID && (
          <button
            type="button"
            onClick={() => { onSelect("", ""); setQuery(""); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-white/30 dark:border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto text-sm">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-gray-400 dark:text-gray-500">Tidak ditemukan</li>
          ) : (
            filtered
              .sort((a, b) => a.blok.localeCompare(b.blok) || a.nama.localeCompare(b.nama))
              .map((w) => (
                <li
                  key={String(w.id)}
                  onMouseDown={() => {
                    onSelect(String(w.id), `${w.blok} — ${w.nama}`);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-500/10 transition-colors ${
                    String(w.id) === selectedID ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium" : "text-gray-900 dark:text-white"
                  }`}
                >
                  <span className="font-medium">{w.blok}</span>
                  <span className="text-gray-500 dark:text-gray-400"> — {w.nama}</span>
                </li>
              ))
          )}
        </ul>
      )}
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────

export default function QurbanPage() {
  const [records, setRecords] = useState<PengambilanQurban[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [exporting, setExporting] = useState(false);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [allWarga, setAllWarga] = useState<WargaWithLastPayment[]>([]);
  const [wargaLoading, setWargaLoading] = useState(false);
  const [selectedWargaID, setSelectedWargaID] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<PengambilanQurban | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await qurbanService.getAll(1, 1000, search);
      const data = res.data?.data || [];
      setRecords(data);
      setTotal(data.length);
    } catch {
      setRecords([]);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => fetchRecords(), 300);
    return () => clearTimeout(t);
  }, [fetchRecords]);

  // ── Create ─────────────────────────────────────────────────────────────
  const openCreate = async () => {
    setSelectedWargaID("");
    setCreateError("");
    setScanFeedback(null);
    setCreateOpen(true);
    setWargaLoading(true);
    try {
      const res = await wargaService.getAll(1, 1000);
      const all: WargaWithLastPayment[] = res.data?.data || [];
      const takenIDs = new Set(records.map((r) => r.warga_id));
      setAllWarga(all.filter((w) => !takenIDs.has(String(w.id))));
    } catch {
      setAllWarga([]);
    }
    setWargaLoading(false);
  };

  const handleCreate = async () => {
    if (!selectedWargaID) {
      setCreateError("Pilih warga terlebih dahulu");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      await qurbanService.create({ warga_id: selectedWargaID, status: "Sudah Diambil" });
      setCreateOpen(false);
      showSuccess("Data pengambilan qurban berhasil disimpan");
      fetchRecords();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal menyimpan data";
      setCreateError(msg);
    }
    setCreating(false);
  };

  // ── QR Scan result ──────────────────────────────────────────────────────
  const handleScanResult = useCallback((text: string) => {
    setScannerOpen(false);
    setScanFeedback(null);

    let parsed: { app?: string; id?: string; nama?: string; blok?: string } = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      setScanFeedback({ type: "err", msg: "QR tidak dikenali — bukan format Bukit Cendana" });
      return;
    }

    if (parsed.app !== "bukitcendana" || !parsed.id) {
      setScanFeedback({ type: "err", msg: "QR bukan dari aplikasi Bukit Cendana" });
      return;
    }

    // Check if this warga is available (not yet recorded)
    const found = allWarga.find((w) => String(w.id) === parsed.id);
    if (!found) {
      // Maybe already recorded
      const alreadyRecorded = records.some((r) => r.warga_id === parsed.id);
      if (alreadyRecorded) {
        setScanFeedback({ type: "err", msg: `${parsed.nama} (${parsed.blok}) sudah tercatat` });
      } else {
        setScanFeedback({ type: "err", msg: "Warga tidak ditemukan dalam daftar" });
      }
      return;
    }

    setSelectedWargaID(parsed.id!);
    setScanFeedback({ type: "ok", msg: `QR terbaca: ${parsed.nama} — ${parsed.blok}` });
  }, [allWarga, records]);

  // ── Delete ──────────────────────────────────────────────────────────────
  const openDelete = (r: PengambilanQurban) => {
    setDeletingRecord(r);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    setDeleting(true);
    try {
      await qurbanService.delete(deletingRecord.id);
      setDeleteOpen(false);
      setDeletingRecord(null);
      showSuccess("Data berhasil dihapus");
      fetchRecords();
    } catch { /* stay open */ }
    setDeleting(false);
  };

  const columns = [
    {
      key: "nama_warga",
      header: "Nama Warga",
      render: (r: PengambilanQurban) => (
        <p className="font-medium text-gray-900 dark:text-white">{r.nama_warga}</p>
      ),
    },
    {
      key: "blok_warga",
      header: "Blok",
      render: (r: PengambilanQurban) => (
        <span className="px-2 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded text-sm font-medium">
          {r.blok_warga}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Waktu Catat",
      render: (r: PengambilanQurban) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{formatTanggal(r.created_at)}</span>
      ),
    },
    {
      key: "created_by",
      header: "Dicatat Oleh",
      render: (r: PengambilanQurban) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{r.created_by || "-"}</span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      render: (r: PengambilanQurban) => (
        <button
          onClick={() => openDelete(r)}
          className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
          title="Hapus"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pengambilan Daging Qurban</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Rekap pengambilan daging qurban warga Bukit Cendana
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              setExporting(true);
              await exportQurbanXLS("Pengambilan_Qurban_Bukit_Cendana", records);
              setExporting(false);
            }}
            loading={exporting}
            disabled={records.length === 0}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export XLS
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

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Cari nama atau blok warga..."
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
          <div className="lg:hidden space-y-3">
            {records.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Belum ada data</p>
            ) : (
              records.map((r) => (
                <div key={r.id} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{r.nama_warga}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">
                        {r.blok_warga}
                      </span>
                    </div>
                    <button onClick={() => openDelete(r)} className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/20 dark:border-white/5 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500">{formatTanggal(r.created_at)}</span>
                    {r.created_by && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">oleh {r.created_by}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden lg:block">
            <Table columns={columns} data={records} />
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Total {total} data tercatat
          </p>
        </>
      )}

      {/* ========== Modal: Create ========== */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Pengambilan Qurban" size="md">
        <div className="space-y-4">
          {createError && (
            <div className="bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm p-3 rounded-xl border border-rose-500/20">
              {createError}
            </div>
          )}

          {scanFeedback && (
            <div className={`text-sm p-3 rounded-xl border ${
              scanFeedback.type === "ok"
                ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
            }`}>
              {scanFeedback.msg}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Warga <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => { setScanFeedback(null); setScannerOpen(true); }}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ScanLine className="w-3.5 h-3.5" />
                Scan QR
              </button>
            </div>
            {wargaLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Memuat daftar warga...
              </div>
            ) : (
              <WargaCombobox
                warga={allWarga}
                selectedID={selectedWargaID}
                onSelect={(id) => setSelectedWargaID(id)}
              />
            )}
            {allWarga.length === 0 && !wargaLoading && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Semua warga sudah tercatat.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/20 dark:border-white/10">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} loading={creating} disabled={!selectedWargaID}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========== Modal: Delete ========== */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Hapus Data" size="sm">
        <div className="space-y-4">
          <div className="bg-rose-500/10 rounded-xl border border-rose-500/20 p-4">
            <p className="text-sm text-rose-700 dark:text-rose-400">
              Hapus data pengambilan qurban untuk{" "}
              <strong>{deletingRecord?.nama_warga}</strong> — Blok{" "}
              <strong>{deletingRecord?.blok_warga}</strong>?
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

      {/* ========== QR Scanner overlay ========== */}
      {scannerOpen && (
        <QRScanner
          onResult={handleScanResult}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}
