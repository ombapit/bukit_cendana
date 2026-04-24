"use client";

import { useEffect, useState, useCallback } from "react";
import { wargaService } from "@/lib/services";
import { Table } from "@/components/ui/table";
import type { WargaWithLastPayment } from "@/types";
import { Users, Search, Loader2 } from "lucide-react";
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

export default function WargaPage() {
  const { t } = useLocale();
  const [warga, setWarga] = useState<WargaWithLastPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [blokFilter, setBlokFilter] = useState("");
  const [tunggakanFilter, setTunggakanFilter] = useState("");

  const fetchWarga = useCallback(async () => {
    setLoading(true);
    try {
      const res = await wargaService.getAll(1, 1000, tunggakanFilter ? parseInt(tunggakanFilter) : undefined);
      const data = (res as unknown as { data: { data: WargaWithLastPayment[] } }).data?.data;
      setWarga(data || []);
    } catch {
      setWarga([]);
    }
    setLoading(false);
  }, [tunggakanFilter]);

  useEffect(() => {
    fetchWarga();
  }, [fetchWarga]);

  const allBlocks = [...new Set(warga.map((w) => w.blok.split("/")[0].trim()))].sort();

  const filteredWarga = warga.filter((w) => {
    const matchSearch =
      !search ||
      w.nama.toLowerCase().includes(search.toLowerCase()) ||
      w.blok.toLowerCase().includes(search.toLowerCase()) ||
      (w.no_telp || "").includes(search);
    const matchBlok = !blokFilter || w.blok.startsWith(blokFilter);
    return matchSearch && matchBlok;
  });

  const columns = [
    {
      key: "nama",
      header: t.common.name,
      render: (w: WargaWithLastPayment) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{w.nama}</p>
        </div>
      ),
    },
    {
      key: "blok",
      header: "Blok",
      render: (w: WargaWithLastPayment) => (
        <span className="px-2 py-1 bg-red-700/10 text-red-700 dark:bg-red-700/20 dark:text-red-400 rounded text-sm">
          {w.blok}
        </span>
      ),
    },
    { key: "no_telp", header: "No. Telepon" },
    {
      key: "iuran",
      header: "Iuran/Bulan",
      render: (w: WargaWithLastPayment) => (
        <span className="text-gray-900 dark:text-white font-medium">
          {w.iuran > 0 ? `Rp ${w.iuran.toLocaleString("id-ID")}` : "-"}
        </span>
      ),
    },
    {
      key: "last_payment",
      header: "Pembayaran Terakhir",
      render: (w: WargaWithLastPayment) => (
        <span className="text-gray-900 dark:text-white">
          {formatTanggalIPL(w.last_payment)}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <nav className="glass-strong border-b border-white/20 dark:border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-rose-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Bukit Cendana</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.landing.features.warga.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t.landing.features.warga.desc}
          </p>
        </div>

        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama, blok, atau nomor telepon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-transparent backdrop-blur-sm dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <select
              value={blokFilter}
              onChange={(e) => setBlokFilter(e.target.value)}
              className="px-4 py-2.5 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-transparent backdrop-blur-sm dark:text-white min-w-[150px]"
            >
              <option value="">Semua Blok</option>
              {allBlocks.map((blok) => (
                <option key={blok} value={blok}>
                  {blok}
                </option>
              ))}
            </select>
            <select
              value={tunggakanFilter}
              onChange={(e) => setTunggakanFilter(e.target.value)}
              className="px-4 py-2.5 border border-white/30 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-transparent backdrop-blur-sm dark:text-white min-w-[180px]"
            >
              <option value="">Semua Pembayaran</option>
              <option value="2">Tunggakan &gt; 2 Bulan</option>
              <option value="3">Tunggakan &gt; 3 Bulan</option>
              <option value="4">Tunggakan 4+ Bulan</option>
            </select>
          </div>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-700" />
            </div>
          ) : (
            <>
              <Table columns={columns} data={filteredWarga} />
              <div className="px-6 py-4 border-t border-white/20 dark:border-white/10">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Menampilkan {filteredWarga.length} dari {warga.length} warga
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="border-t border-white/20 dark:border-white/5 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {t.landing.footer}
        </div>
      </footer>
    </div>
  );
}