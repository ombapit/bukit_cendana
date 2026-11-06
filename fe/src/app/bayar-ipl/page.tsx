"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { wargaService, iplPaymentService } from "@/lib/services";
import type { WargaWithLastPayment } from "@/types";

function monthCount(start: string, end: string) {
  if (!start || !end) return 0;
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  const count = (ey - sy) * 12 + em - sm + 1;
  return count > 0 ? count : 0;
}

export default function BayarIPLPage() {
  const [warga, setWarga] = useState<WargaWithLastPayment[]>([]);
  const [wargaId, setWargaId] = useState("");
  const [tanggalIPL, setTanggalIPL] = useState("");
  const [tanggalIPLEnd, setTanggalIPLEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    wargaService.getAll(1, 1000)
      .then((res) => setWarga(res.data?.data || []))
      .catch(() => setError("Data warga gagal dimuat."))
      .finally(() => setLoading(false));
  }, []);

  const selectedWarga = warga.find((item) => item.id === wargaId);
  const jumlahBulan = monthCount(tanggalIPL, tanggalIPLEnd);
  const total = selectedWarga && jumlahBulan > 0 ? selectedWarga.iuran * jumlahBulan : 0;
  const canPay = Boolean(selectedWarga && tanggalIPL && tanggalIPLEnd && jumlahBulan > 0 && total > 0 && !paying);

  const formattedTotal = useMemo(() => `Rp ${total.toLocaleString("id-ID")}`, [total]);

  const handlePay = async () => {
    if (!canPay || !selectedWarga) return;
    setPaying(true);
    setError("");
    try {
      const res = await iplPaymentService.initiate({ warga_id: wargaId, tanggal_ipl: tanggalIPL.replace("-", ""), tanggal_ipl_end: tanggalIPLEnd.replace("-", "") });
      const paymentURL = res.data?.data?.payment_url;
      if (!paymentURL) throw new Error("Tautan pembayaran tidak tersedia.");
      window.location.href = paymentURL;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pembayaran gagal diinisiasi.");
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <div className="glass rounded-2xl p-5 sm:p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-red-700/10 dark:bg-red-700/20 flex items-center justify-center"><CreditCard className="w-5 h-5 text-red-700 dark:text-red-400" /></div>
            <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bayar IPL</h1><p className="text-sm text-gray-500 dark:text-gray-400">Pilih warga dan periode pembayaran.</p></div>
          </div>

          {error && <div className="mb-4 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 px-3 py-2 text-sm">{error}</div>}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama / Blok
              <select value={wargaId} onChange={(e) => setWargaId(e.target.value)} disabled={loading} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white">
                <option value="">{loading ? "Memuat data warga..." : "Pilih nama dan blok"}</option>
                {warga.map((item) => <option key={item.id} value={item.id}>{item.nama} — {item.blok}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dari bulan<input type="month" value={tanggalIPL} onChange={(e) => setTanggalIPL(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white" /></label>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sampai bulan<input type="month" value={tanggalIPLEnd} onChange={(e) => setTanggalIPLEnd(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/5 text-gray-900 dark:text-white" /></label>
            </div>
            <div className="rounded-xl bg-red-700/5 dark:bg-red-700/10 p-4 flex items-center justify-between"><div><p className="text-xs text-gray-500 dark:text-gray-400">Total pembayaran</p><p className="text-xl font-bold text-gray-900 dark:text-white">{formattedTotal}</p></div><p className="text-sm text-gray-500 dark:text-gray-400">{jumlahBulan} bulan</p></div>
            <button type="button" onClick={handlePay} disabled={!canPay} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-3 font-medium text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed">{paying && <Loader2 className="w-4 h-4 animate-spin" />} Bayar sekarang</button>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
