"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { activityLogService } from "@/lib/services";
import { Table } from "@/components/ui/table";
import type { ActivityLog } from "@/types";
import { Search, Loader2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/admin/permission-guard";

function formatDate(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function shortUA(ua: string) {
  if (!ua) return "-";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/") && !ua.includes("Chromium/")) return "Chrome";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";
  return ua.substring(0, 40);
}

type LogRow = ActivityLog & { _no: number };

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityLogService.getAll(page, limit, debouncedSearch);
      const body = res.data;
      setLogs(body?.data ?? []);
      const meta = body?.meta;
      setTotal(meta?.total ?? 0);
      setTotalPages(meta?.total_pages ?? 1);
    } catch {
      setLogs([]);
    }
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const numberedLogs = useMemo<LogRow[]>(
    () => logs.map((log, idx) => ({ ...log, _no: (page - 1) * limit + idx + 1 })),
    [logs, page]
  );

  const pageRange = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1) as (number | "...")[];
    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages] as (number | "...")[];
    if (page >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as (number | "...")[];
    return [1, "...", page - 1, page, page + 1, "...", totalPages] as (number | "...")[];
  }, [page, totalPages]);

  const columns = [
    {
      key: "_no",
      header: "No",
      render: (row: LogRow) => (
        <span className="text-gray-400 text-xs">{row._no}</span>
      ),
    },
    {
      key: "path",
      header: "Path",
      render: (row: LogRow) => (
        <span className="font-mono text-sm text-blue-600 dark:text-blue-400">{row.path}</span>
      ),
    },
    {
      key: "ip",
      header: "IP",
      render: (row: LogRow) => <span className="font-mono text-xs">{row.ip || "-"}</span>,
    },
    {
      key: "user_agent",
      header: "Browser",
      render: (row: LogRow) => <span className="text-sm">{shortUA(row.user_agent)}</span>,
    },
    {
      key: "referer",
      header: "Referer",
      render: (row: LogRow) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 max-w-[180px] truncate block">
          {row.referer || "-"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Waktu",
      render: (row: LogRow) => (
        <span className="text-xs whitespace-nowrap">{formatDate(row.created_at)}</span>
      ),
    },
  ];

  return (
    <PermissionGuard>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Riwayat kunjungan halaman publik ({total} total)
            </p>
          </div>
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Cari path atau IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-white/30 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent backdrop-blur-sm dark:text-slate-100 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <Table columns={columns} data={numberedLogs} emptyMessage="Belum ada aktivitas tercatat" />

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-3">
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
      </div>
    </PermissionGuard>
  );
}
