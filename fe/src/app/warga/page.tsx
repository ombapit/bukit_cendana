"use client";

import { useEffect, useState, useCallback } from "react";
import { wargaService } from "@/lib/services";
import { Table } from "@/components/ui/table";
import type { WargaWithLastPayment } from "@/types";
import { Search, Loader2, ArrowLeft } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";
import { PublicNavbar } from "@/components/public-navbar";
import Link from "next/link";

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
        <span className="px-2 py-1 bg-red-700/10 text-red-700 dark:bg-red-700/20 dark:text-red-400 rounded text-sm whitespace-nowrap">
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
      <PublicNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.landing.features.warga.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Daftar penghuni resmi Perumahan Bukit Cendana beserta status pembayaran IPL terakhir.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:flex gap-3 mb-4">
          <div className="col-span-2 lg:flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Cari nama, blok, atau nomor telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-transparent backdrop-blur-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          <select
            value={blokFilter}
            onChange={(e) => setBlokFilter(e.target.value)}
            className="min-w-0 lg:w-auto px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white"
          >
            <option value="">Semua Blok</option>
            {allBlocks.map((blok) => (
              <option key={blok} value={blok}>{blok}</option>
            ))}
          </select>
          <select
            value={tunggakanFilter}
            onChange={(e) => setTunggakanFilter(e.target.value)}
            className="min-w-0 lg:w-auto px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white"
          >
            <option value="">Semua Pembayaran</option>
            <option value="2">Tunggakan &gt; 2 Bulan</option>
            <option value="3">Tunggakan &gt; 3 Bulan</option>
            <option value="4">Tunggakan 4+ Bulan</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-red-700" />
          </div>
        ) : (
          <>
            {/* Mobile & tablet: card list */}
            <div className="lg:hidden space-y-3">
              {filteredWarga.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">Tidak ada data</p>
              ) : (
                filteredWarga.map((w) => (
                  <div key={w.id} className="glass rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{w.nama}</p>
                        {w.no_telp && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{w.no_telp}</p>
                        )}
                      </div>
                      <span className="shrink-0 px-2.5 py-1 bg-red-700/10 text-red-700 dark:bg-red-700/20 dark:text-red-400 rounded-md text-xs font-semibold whitespace-nowrap">
                        {w.blok}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/20 dark:border-white/5">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Iuran/Bulan</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {w.iuran > 0 ? `Rp ${w.iuran.toLocaleString("id-ID")}` : "-"}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">Bayar Terakhir</p>
                        <p className="text-sm text-gray-900 dark:text-white truncate">{formatTanggalIPL(w.last_payment)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop: table */}
            <div className="hidden lg:block glass rounded-2xl overflow-hidden">
              <Table columns={columns} data={filteredWarga} />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Menampilkan {filteredWarga.length} dari {warga.length} warga
            </p>
          </>
        )}
      </div>
    </div>
  );
}