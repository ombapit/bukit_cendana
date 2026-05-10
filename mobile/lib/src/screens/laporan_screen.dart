import 'dart:async';
import 'package:flutter/material.dart';
import '../models/finance.dart';
import '../services/finance_service.dart';
import '../utils/format.dart';
import '../widgets/glass_card.dart';
import '../widgets/state_views.dart';

class LaporanScreen extends StatefulWidget {
  const LaporanScreen({super.key});

  @override
  State<LaporanScreen> createState() => _LaporanScreenState();
}

class _LaporanScreenState extends State<LaporanScreen> {
  final _service = FinanceService();
  final _searchController = TextEditingController();
  Timer? _debounce;

  bool _loading = true;
  bool _loadingMore = false;
  String? _error;

  FinanceSummary _summary = FinanceSummary();
  final List<Finance> _records = [];
  int _page = 1;
  int _totalPages = 1;
  int _total = 0;

  String _search = '';
  DateTime? _dateFrom;
  DateTime? _dateTo;

  @override
  void initState() {
    super.initState();
    _fetch(reset: true);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  String _fmtIso(DateTime? d) =>
      d == null ? '' : '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  Future<void> _fetch({bool reset = false}) async {
    if (reset) {
      setState(() {
        _loading = true;
        _error = null;
        _page = 1;
      });
    } else {
      setState(() => _loadingMore = true);
    }

    try {
      final results = await Future.wait([
        _service.getAll(
          page: _page,
          search: _search,
          dateFrom: _fmtIso(_dateFrom),
          dateTo: _fmtIso(_dateTo),
        ),
        if (reset)
          _service.getSummary(
            dateFrom: _fmtIso(_dateFrom),
            dateTo: _fmtIso(_dateTo),
          ),
      ]);

      final pageData = results[0] as FinancePage;
      if (!mounted) return;

      setState(() {
        if (reset) {
          _records
            ..clear()
            ..addAll(pageData.records);
          if (results.length > 1) _summary = results[1] as FinanceSummary;
        } else {
          _records.addAll(pageData.records);
        }
        _total = pageData.total;
        _totalPages = pageData.totalPages;
        _loading = false;
        _loadingMore = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Gagal memuat data';
        _loading = false;
        _loadingMore = false;
      });
    }
  }

  void _onSearchChanged(String v) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      _search = v.trim();
      _fetch(reset: true);
    });
  }

  Future<void> _pickDate({required bool isFrom}) async {
    final initial = (isFrom ? _dateFrom : _dateTo) ?? DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked == null) return;
    setState(() {
      if (isFrom) {
        _dateFrom = picked;
        if (_dateTo != null && _dateTo!.isBefore(picked)) _dateTo = null;
      } else {
        _dateTo = picked;
        if (_dateFrom != null && _dateFrom!.isAfter(picked)) _dateFrom = null;
      }
    });
    _fetch(reset: true);
  }

  void _resetDates() {
    setState(() {
      _dateFrom = null;
      _dateTo = null;
    });
    _fetch(reset: true);
  }

  void _loadMore() {
    if (_loadingMore || _page >= _totalPages) return;
    _page++;
    _fetch(reset: false);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        color: cs.primary,
        onRefresh: () => _fetch(reset: true),
        child: NotificationListener<ScrollNotification>(
          onNotification: (n) {
            if (n.metrics.pixels > n.metrics.maxScrollExtent - 200) _loadMore();
            return false;
          },
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
            children: [
              Text('Laporan Keuangan', style: theme.textTheme.headlineMedium),
              const SizedBox(height: 4),
              Text(
                'Transparansi keuangan lingkungan Bukit Cendana.',
                style: theme.textTheme.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
              ),
              const SizedBox(height: 20),
              _SummaryCards(summary: _summary),
              const SizedBox(height: 20),
              TextField(
                controller: _searchController,
                onChanged: _onSearchChanged,
                decoration: const InputDecoration(
                  hintText: 'Cari transaksi atau kategori...',
                  prefixIcon: Icon(Icons.search_rounded),
                ),
              ),
              const SizedBox(height: 10),
              _DateRangeBar(
                from: _dateFrom,
                to: _dateTo,
                onPickFrom: () => _pickDate(isFrom: true),
                onPickTo: () => _pickDate(isFrom: false),
                onReset: _resetDates,
              ),
              const SizedBox(height: 16),
              if (_loading)
                const LoadingView(label: 'Memuat transaksi...')
              else if (_error != null)
                ErrorView(message: _error!, onRetry: () => _fetch(reset: true))
              else if (_records.isEmpty)
                const EmptyView(
                  icon: Icons.receipt_long_outlined,
                  title: 'Belum ada transaksi',
                  subtitle: 'Coba ubah pencarian atau rentang tanggal.',
                )
              else ...[
                Padding(
                  padding: const EdgeInsets.only(bottom: 8, left: 4),
                  child: Text(
                    'Menampilkan ${_records.length} dari $_total transaksi',
                    style: theme.textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                  ),
                ),
                for (final r in _records) ...[
                  _FinanceCard(record: r),
                  const SizedBox(height: 10),
                ],
                if (_loadingMore)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 16),
                    child: Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
                  )
                else if (_page >= _totalPages && _records.length > 5)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Center(
                      child: Text(
                        '— akhir daftar —',
                        style: theme.textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                      ),
                    ),
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryCards extends StatelessWidget {
  final FinanceSummary summary;
  const _SummaryCards({required this.summary});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _summaryItem(
                context,
                icon: Icons.trending_up_rounded,
                label: 'Pemasukan',
                amount: summary.totalKredit,
                color: Colors.green.shade600,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _summaryItem(
                context,
                icon: Icons.trending_down_rounded,
                label: 'Pengeluaran',
                amount: summary.totalDebit,
                color: Colors.red.shade600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        _summaryItem(
          context,
          icon: Icons.account_balance_wallet_rounded,
          label: 'Saldo',
          amount: summary.saldo,
          color: summary.saldo >= 0 ? Colors.blue.shade600 : const Color(0xFFE11D48),
          big: true,
        ),
      ],
    );
  }

  Widget _summaryItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required num amount,
    required Color color,
    bool big = false,
  }) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    return GlassCard(
      padding: EdgeInsets.symmetric(horizontal: 14, vertical: big ? 16 : 14),
      child: Row(
        children: [
          Container(
            width: big ? 48 : 40,
            height: big ? 48 : 40,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: big ? 24 : 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: cs.onSurfaceVariant,
                    fontSize: 11,
                    letterSpacing: 0.6,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  formatRupiah(amount),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.w800,
                    fontSize: big ? 20 : 15,
                    letterSpacing: -0.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DateRangeBar extends StatelessWidget {
  final DateTime? from;
  final DateTime? to;
  final VoidCallback onPickFrom;
  final VoidCallback onPickTo;
  final VoidCallback onReset;

  const _DateRangeBar({
    required this.from,
    required this.to,
    required this.onPickFrom,
    required this.onPickTo,
    required this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    final hasRange = from != null || to != null;
    return Row(
      children: [
        Expanded(
          child: _DateField(label: 'Dari', date: from, onTap: onPickFrom),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _DateField(label: 'Sampai', date: to, onTap: onPickTo),
        ),
        if (hasRange)
          IconButton(
            tooltip: 'Reset',
            onPressed: onReset,
            icon: const Icon(Icons.close_rounded),
            visualDensity: VisualDensity.compact,
          ),
      ],
    );
  }
}

class _DateField extends StatelessWidget {
  final String label;
  final DateTime? date;
  final VoidCallback onTap;

  const _DateField({required this.label, required this.date, required this.onTap});

  String _fmt(DateTime d) {
    final iso = '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    return formatTanggal(iso, short: true);
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Material(
      color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.white.withValues(alpha: 0.6),
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isDark ? Colors.white.withValues(alpha: 0.08) : Colors.white.withValues(alpha: 0.6),
            ),
          ),
          child: Row(
            children: [
              Icon(Icons.calendar_today_rounded, size: 16, color: cs.onSurfaceVariant),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      label,
                      style: TextStyle(fontSize: 10, color: cs.onSurfaceVariant, letterSpacing: 0.4),
                    ),
                    const SizedBox(height: 1),
                    Text(
                      date == null ? '— pilih —' : _fmt(date!),
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: date == null ? cs.onSurfaceVariant : cs.onSurface,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FinanceCard extends StatelessWidget {
  final Finance record;
  const _FinanceCard({required this.record});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final isCredit = record.kredit > 0;
    final amount = isCredit ? record.kredit : record.debit;
    final amountColor = isCredit ? Colors.green.shade600 : Colors.red.shade600;
    final sign = isCredit ? '+' : '−';

    return GlassCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: amountColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  isCredit ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                  color: amountColor,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      record.namaTransaksi,
                      style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (record.deskripsi.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        record.deskripsi,
                        style: theme.textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Text(
                '$sign ${formatRupiah(amount)}',
                style: TextStyle(
                  color: amountColor,
                  fontWeight: FontWeight.w800,
                  fontSize: 14,
                  letterSpacing: -0.2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Icon(Icons.calendar_today_rounded, size: 12, color: cs.onSurfaceVariant),
              const SizedBox(width: 4),
              Text(
                formatTanggal(record.timestamp),
                style: theme.textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant),
              ),
              const Spacer(),
              if (record.kategori.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: cs.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    record.kategori,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: cs.primary,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
