"use client";

import { useEffect, useState, useCallback } from "react";
import { transaksiService } from "@/lib/services";
import { Table } from "@/components/ui/table";
import type { Transaksi } from "@/types";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";

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

export default function TransaksiPage() {
  const { t } = useLocale();
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTransaksi = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transaksiService.getAll(1, 1000);
      const data = (res as unknown as { data: { data: Transaksi[] } }).data?.data;
      setTransaksi(data || []);
    } catch {
      setTransaksi([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransaksi();
  }, [fetchTransaksi]);

  const filteredTransaksi = transaksi.filter((trx) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      trx.warga_nama.toLowerCase().includes(s) ||
      trx.warga_blok.toLowerCase().includes(s) ||
      trx.tanggal_ipl.includes(s)
    );
  });

  const columns = [
    {
      key: "warga_nama",
      header: "Nama Warga",
      render: (trx: Transaksi) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{trx.warga_nama}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{trx.warga_blok}</p>
        </div>
      ),
    },
    {
      key: "tanggal_ipl",
      header: "Periode IPL",
      render: (trx: Transaksi) => (
        <span className="px-2 py-1 bg-red-700/10 text-red-700 dark:bg-red-700/20 dark:text-red-400 rounded text-sm">
          {formatTanggalIPL(trx.tanggal_ipl)}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Tanggal Input",
      render: (trx: Transaksi) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {new Date(trx.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaksi Pembayaran IPL</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Daftar transaksi pembayaran iuran IPL warga
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, blok, atau periode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm dark:text-slate-100"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-700" />
        </div>
      ) : (
        <>
          <Table columns={columns} data={filteredTransaksi} />
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Total: {filteredTransaksi.length} transaksi
          </div>
        </>
      )}
    </div>
  );
}