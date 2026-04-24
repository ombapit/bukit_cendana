"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { financeService } from "@/lib/services";
import { PublicNavbar } from "@/components/public-navbar";
import type { Finance, FinanceSummary } from "@/types";
import {
  TrendingUp, TrendingDown, Wallet, ChevronLeft, ChevronRight,
  Search, Loader2, ArrowLeft,
} from "lucide-react";

const bulanIndo: Record<string, string> = {
  "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
  "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
  "09": "September", "10": "Oktober", "11": "November", "12": "Desember",
};

function formatRp(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
}

function formatTanggal(iso: string): string {
  try {
    const d = new Date(iso);
    const tgl = d.getDate().toString().padStart(2, "0");
    const bln = bulanIndo[String(d.getMonth() + 1).padStart(2, "0")];
    const thn = d.getFullYear();
    return `${tgl} ${bln} ${thn}`;
  } catch { return "-"; }
}

export default function LaporanPage() {
  const [records, setRecords] = useState<Finance[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setDebouncedSearch(search); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when date range changes
  useEffect(() => { setPage(1); }, [dateFrom, dateTo]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        financeService.getAll(page, limit, debouncedSearch, dateFrom, dateTo),
        financeService.getSummary(dateFrom, dateTo),
      ]);
      setRecords(listRes.data?.data || []);
      setTotal(listRes.data?.meta?.total || 0);
      setTotalPages(listRes.data?.meta?.total_pages || 1);
      setSummary(sumRes.data?.data ?? null);
    } catch {
      setRecords([]);
    }
    setLoading(false);
  }, [page, debouncedSearch, dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pageRange = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1) as (number | "...")[];
    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages] as (number | "...")[];
    if (page >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as (number | "...")[];
    return [1, "...", page - 1, page, page + 1, "...", totalPages] as (number | "...")[];
  }, [page, totalPages]);

  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back + Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Laporan Keuangan</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Transparansi keuangan lingkungan Bukit Cendana
          </p>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Pemasukan</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatRp(summary.total_kredit)}</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Pengeluaran</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatRp(summary.total_debit)}</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${summary.saldo >= 0 ? "bg-blue-500/10" : "bg-rose-500/10"}`}>
                <Wallet className={`w-5 h-5 ${summary.saldo >= 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Saldo</p>
                <p className={`text-lg font-bold ${summary.saldo >= 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {formatRp(summary.saldo)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Cari transaksi atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-transparent backdrop-blur-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Dari</label>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-transparent backdrop-blur-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Sampai</label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg bg-transparent backdrop-blur-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors whitespace-nowrap"
              >
                × Reset
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-red-700" />
          </div>
        ) : records.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-gray-400 dark:text-gray-500 text-sm">
            Tidak ada data transaksi
          </div>
        ) : (
          <>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20 dark:border-white/10">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaksi</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Pemasukan</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Pengeluaran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 dark:divide-white/5">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                          {formatTanggal(r.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">{r.nama_transaksi}</p>
                          {r.deskripsi && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[220px]">{r.deskripsi}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {r.kategori && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400">
                              {r.kategori}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {r.kredit > 0 ? (
                            <span className="font-medium text-green-600 dark:text-green-400">{formatRp(r.kredit)}</span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {r.debit > 0 ? (
                            <span className="font-medium text-red-600 dark:text-red-400">{formatRp(r.debit)}</span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {total === 0 ? "Tidak ada data" : `Menampilkan ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} dari ${total} transaksi`}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1.5 rounded-lg border border-white/20 dark:border-white/10 disabled:opacity-40 hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  {pageRange.map((p, i) =>
                    p === "..." ? (
                      <span key={`e-${i}`} className="px-1 text-sm text-gray-400">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                          page === p
                            ? "bg-red-700 text-white"
                            : "border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/5"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-1.5 rounded-lg border border-white/20 dark:border-white/10 disabled:opacity-40 hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
