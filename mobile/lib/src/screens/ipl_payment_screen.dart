import 'package:flutter/material.dart';
import '../models/warga.dart';
import '../models/ipl_payment.dart';
import '../services/warga_service.dart';
import '../services/ipl_payment_service.dart';
import '../utils/format.dart';
import '../widgets/app_background.dart';
import '../widgets/glass_card.dart';
import 'ipl_payment_webview_screen.dart';

class IPLPaymentScreen extends StatefulWidget {
  const IPLPaymentScreen({super.key});

  @override
  State<IPLPaymentScreen> createState() => _IPLPaymentScreenState();
}

class _IPLPaymentScreenState extends State<IPLPaymentScreen> {
  final _wargaService = WargaService();
  final _paymentService = IPLPaymentService();

  List<WargaWithLastPayment> _wargas = [];
  WargaWithLastPayment? _selectedWarga;
  bool _loadingWargas = true;

  // Month picker values — stored as DateTime (year+month only)
  DateTime? _startMonth;
  DateTime? _endMonth;

  bool _submitting = false;
  String? _errorMsg;

  // Warga search
  final _searchController = TextEditingController();
  String _wargaQuery = '';

  @override
  void initState() {
    super.initState();
    _loadWargas();
    _searchController.addListener(() => setState(() => _wargaQuery = _searchController.text));
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadWargas() async {
    final list = await _wargaService.getAll(limit: 1000);
    if (mounted) setState(() { _wargas = list; _loadingWargas = false; });
  }

  List<WargaWithLastPayment> get _filteredWargas {
    if (_wargaQuery.trim().isEmpty) return _wargas;
    final q = _wargaQuery.toLowerCase();
    return _wargas.where((w) =>
      w.nama.toLowerCase().contains(q) || w.blok.toLowerCase().contains(q)).toList();
  }

  int get _jumlahBulan {
    if (_startMonth == null) return 0;
    final end = _endMonth ?? _startMonth!;
    return (end.year - _startMonth!.year) * 12 + (end.month - _startMonth!.month) + 1;
  }

  int get _totalAmount => (_selectedWarga?.iuran ?? 0) * _jumlahBulan;

  // Returns YYYYMM string from DateTime
  String _toYYYYMM(DateTime dt) =>
      '${dt.year.toString().padLeft(4, '0')}${dt.month.toString().padLeft(2, '0')}';

  String _formatMonth(DateTime dt) {
    const months = [
      'Januari','Februari','Maret','April','Mei','Juni',
      'Juli','Agustus','September','Oktober','November','Desember',
    ];
    return '${months[dt.month - 1]} ${dt.year}';
  }

  Future<void> _pickMonth({required bool isStart}) async {
    final now = DateTime.now();
    final initial = isStart
        ? (_startMonth ?? DateTime(now.year, now.month))
        : (_endMonth ?? _startMonth ?? DateTime(now.year, now.month));

    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(2020),
      lastDate: DateTime(now.year + 2, 12),
      helpText: isStart ? 'Pilih bulan mulai' : 'Pilih bulan akhir',
      initialEntryMode: DatePickerEntryMode.calendarOnly,
      selectableDayPredicate: (d) => d.day == 1,
    );
    if (picked == null) return;
    final selected = DateTime(picked.year, picked.month);

    setState(() {
      if (isStart) {
        _startMonth = selected;
        if (_endMonth != null && _endMonth!.isBefore(_startMonth!)) {
          _endMonth = _startMonth;
        }
      } else {
        if (_startMonth != null && selected.isBefore(_startMonth!)) return;
        _endMonth = selected;
      }
    });
  }

  Future<void> _submit() async {
    if (_selectedWarga == null) {
      setState(() => _errorMsg = 'Pilih warga terlebih dahulu');
      return;
    }
    if (_startMonth == null) {
      setState(() => _errorMsg = 'Pilih periode IPL terlebih dahulu');
      return;
    }

    setState(() { _submitting = true; _errorMsg = null; });

    try {
      final result = await _paymentService.initiate(
        wargaId: _selectedWarga!.id,
        tanggalIpl: _toYYYYMM(_startMonth!),
        tanggalIplEnd: _endMonth != null ? _toYYYYMM(_endMonth!) : '',
      );
      if (!mounted) return;
      await _openPayment(result);
    } catch (e) {
      if (mounted) setState(() => _errorMsg = 'Gagal membuat pembayaran. Coba lagi.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _openPayment(InitiateIPLPaymentResponse result) async {
    final webResult = await Navigator.of(context).push<IPLPaymentWebViewResult>(
      MaterialPageRoute(
        builder: (_) => IPLPaymentWebViewScreen(
          paymentUrl: result.paymentUrl,
          referenceId: result.referenceId,
        ),
        fullscreenDialog: true,
      ),
    );

    if (!mounted) return;

    if (webResult == IPLPaymentWebViewResult.success) {
      _showResultDialog(
        success: true,
        message: 'Pembayaran IPL ${result.wargaNama} berhasil!\n'
            '${result.jumlahBulan} bulan — ${formatRupiah(result.totalAmount)}',
      );
    } else if (webResult == IPLPaymentWebViewResult.cancelled) {
      _showResultDialog(success: false, message: 'Pembayaran dibatalkan.');
    }
  }

  void _showResultDialog({required bool success, required String message}) {
    showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(success ? 'Pembayaran Berhasil' : 'Pembayaran Dibatalkan'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // close dialog
              if (success) Navigator.of(context).pop(); // close form
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final cs = Theme.of(context).colorScheme;

    return AppBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: const Text('Bayar IPL'),
        ),
        body: _loadingWargas
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
                children: [
                  // ── Pilih Warga ──────────────────────────────────────
                  GlassCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Warga', style: Theme.of(context).textTheme.labelLarge),
                        const SizedBox(height: 8),
                        TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            hintText: 'Cari nama atau blok...',
                            prefixIcon: const Icon(Icons.search, size: 18),
                            isDense: true,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                        const SizedBox(height: 8),
                        ConstrainedBox(
                          constraints: const BoxConstraints(maxHeight: 200),
                          child: _filteredWargas.isEmpty
                              ? const Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(12),
                                    child: Text('Tidak ada warga'),
                                  ),
                                )
                              : ListView.builder(
                                  shrinkWrap: true,
                                  itemCount: _filteredWargas.length,
                                  itemBuilder: (_, i) {
                                    final w = _filteredWargas[i];
                                    final selected = _selectedWarga?.id == w.id;
                                    return ListTile(
                                      dense: true,
                                      selected: selected,
                                      selectedTileColor: scheme.primary.withValues(alpha:0.12),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      title: Text(w.nama, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                                      subtitle: Text(w.blok, style: const TextStyle(fontSize: 12)),
                                      trailing: selected
                                          ? Icon(Icons.check_circle_rounded, color: scheme.primary, size: 18)
                                          : null,
                                      onTap: () => setState(() { _selectedWarga = w; _wargaQuery = ''; _searchController.clear(); }),
                                    );
                                  },
                                ),
                        ),
                        if (_selectedWarga != null) ...[
                          const Divider(height: 16),
                          Row(
                            children: [
                              Icon(Icons.person_rounded, size: 16, color: scheme.primary),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  '${_selectedWarga!.nama} — ${_selectedWarga!.blok}',
                                  style: TextStyle(fontSize: 13, color: scheme.primary, fontWeight: FontWeight.w600),
                                ),
                              ),
                              GestureDetector(
                                onTap: () => setState(() => _selectedWarga = null),
                                child: Icon(Icons.close, size: 16, color: cs.onSurfaceVariant),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // ── Pilih Periode ─────────────────────────────────────
                  GlassCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Periode IPL', style: Theme.of(context).textTheme.labelLarge),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: _MonthPicker(
                                label: 'Dari bulan',
                                value: _startMonth != null ? _formatMonth(_startMonth!) : null,
                                onTap: () => _pickMonth(isStart: true),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _MonthPicker(
                                label: 'Sampai bulan',
                                value: _endMonth != null
                                    ? _formatMonth(_endMonth!)
                                    : (_startMonth != null ? _formatMonth(_startMonth!) : null),
                                onTap: () => _pickMonth(isStart: false),
                              ),
                            ),
                          ],
                        ),
                        if (_startMonth != null) ...[
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: scheme.primary.withValues(alpha:0.12),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  '$_jumlahBulan bulan',
                                  style: TextStyle(fontSize: 12, color: scheme.primary, fontWeight: FontWeight.w600),
                                ),
                              ),
                              if (_selectedWarga != null) ...[
                                const SizedBox(width: 10),
                                Text(
                                  'Total: ',
                                  style: TextStyle(fontSize: 12, color: cs.onSurfaceVariant),
                                ),
                                Text(
                                  formatRupiah(_totalAmount),
                                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: scheme.primary),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // ── Error ─────────────────────────────────────────────
                  if (_errorMsg != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(_errorMsg!, style: TextStyle(color: scheme.error, fontSize: 13)),
                    ),

                  // ── Bayar button ──────────────────────────────────────
                  FilledButton.icon(
                    onPressed: _submitting ? null : _submit,
                    icon: _submitting
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.payment_rounded),
                    label: Text(_submitting ? 'Memproses...' : 'Bayar Sekarang'),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size.fromHeight(50),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

class _MonthPicker extends StatelessWidget {
  final String label;
  final String? value;
  final VoidCallback onTap;

  const _MonthPicker({required this.label, required this.value, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          border: Border.all(color: scheme.outline.withValues(alpha:0.4)),
          borderRadius: BorderRadius.circular(10),
          color: scheme.surfaceContainerHighest.withValues(alpha:0.3),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 10, color: scheme.onSurfaceVariant)),
            const SizedBox(height: 2),
            Row(
              children: [
                Icon(Icons.calendar_month_rounded, size: 14, color: scheme.primary),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    value ?? 'Pilih bulan',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: value != null ? FontWeight.w600 : FontWeight.normal,
                      color: value != null ? scheme.onSurface : scheme.onSurfaceVariant,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
