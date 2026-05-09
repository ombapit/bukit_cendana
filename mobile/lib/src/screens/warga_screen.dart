import 'package:flutter/material.dart';
import '../models/warga.dart';
import '../services/warga_service.dart';

const _bulanIndonesia = {
  '01': 'Januari',
  '02': 'Februari',
  '03': 'Maret',
  '04': 'April',
  '05': 'Mei',
  '06': 'Juni',
  '07': 'Juli',
  '08': 'Agustus',
  '09': 'September',
  '10': 'Oktober',
  '11': 'November',
  '12': 'Desember',
};

String _formatTanggalIPL(String tanggal) {
  if (tanggal.length != 6) return '-';
  final tahun = tanggal.substring(0, 4);
  final bulan = tanggal.substring(4, 6);
  return '${_bulanIndonesia[bulan] ?? bulan} $tahun';
}

int _monthsSince(String yyyymm) {
  if (yyyymm.length != 6) return 999;
  final year = int.parse(yyyymm.substring(0, 4));
  final month = int.parse(yyyymm.substring(4, 6));
  final now = DateTime.now();
  return (now.year - year) * 12 + (now.month - month);
}

String _formatRupiah(int amount) {
  if (amount <= 0) return '-';
  final s = amount.toString();
  final result = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) result.write('.');
    result.write(s[i]);
  }
  return 'Rp $result';
}

class WargaScreen extends StatefulWidget {
  const WargaScreen({super.key});

  @override
  State<WargaScreen> createState() => _WargaScreenState();
}

class _WargaScreenState extends State<WargaScreen> {
  final WargaService _service = WargaService();
  List<WargaWithLastPayment> _warga = [];
  bool _loading = true;

  String _search = '';
  String _blokFilter = '';
  String _tunggakanFilter = '';
  String _kondisiFilter = '';

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    final data = await _service.getAll(
      tunggakan: _tunggakanFilter.isNotEmpty
          ? int.tryParse(_tunggakanFilter)
          : null,
    );
    if (mounted) setState(() { _warga = data; _loading = false; });
  }

  List<String> get _allBlocks {
    final blocks = <String>{};
    for (final w in _warga) {
      final prefix = w.blok.split('/')[0].trim();
      if (prefix.isNotEmpty) blocks.add(prefix);
    }
    final list = blocks.toList();
    list.sort();
    return list;
  }

  List<WargaWithLastPayment> get _filtered {
    return _warga.where((w) {
      final matchSearch = _search.isEmpty ||
          w.nama.toLowerCase().contains(_search.toLowerCase()) ||
          w.blok.toLowerCase().contains(_search.toLowerCase()) ||
          w.noTelp.contains(_search);
      final matchBlok =
          _blokFilter.isEmpty || w.blok.startsWith(_blokFilter);
      final matchKondisi = _kondisiFilter.isEmpty ||
          w.kondisiRumah == _kondisiFilter;
      return matchSearch && matchBlok && matchKondisi;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final filtered = _filtered;

    return Scaffold(
      appBar: AppBar(title: const Text('Data Warga')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(
                  'Daftar penghuni resmi Perumahan Bukit Cendana beserta status pembayaran IPL terakhir.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: cs.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 12,
                  runSpacing: 6,
                  children: [
                    _legendDot(cs.error, 'Tunggakan > 3 bln'),
                    _legendDot(Colors.amber.shade700, 'Tunggakan > 2 bln'),
                    _legendDot(cs.outlineVariant, 'Lancar'),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  onChanged: (v) => setState(() => _search = v),
                  decoration: const InputDecoration(
                    hintText: 'Cari nama, blok, atau no. telepon...',
                    prefixIcon: Icon(Icons.search_rounded),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _blokFilter,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.location_on_rounded),
                    isDense: true,
                  ),
                  items: [
                    const DropdownMenuItem(
                      value: '',
                      child: Text('Semua Blok'),
                    ),
                    ..._allBlocks.map(
                      (b) => DropdownMenuItem(
                        value: b,
                        child: Text(b),
                      ),
                    ),
                  ],
                  onChanged: (v) {
                    setState(() => _blokFilter = v ?? '');
                    _fetch();
                  },
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: _tunggakanFilter,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.payments_rounded),
                    isDense: true,
                  ),
                  items: const [
                    DropdownMenuItem(
                      value: '',
                      child: Text('Semua Pembayaran'),
                    ),
                    DropdownMenuItem(
                      value: '2',
                      child: Text('Tunggakan > 2 bln'),
                    ),
                    DropdownMenuItem(
                      value: '3',
                      child: Text('Tunggakan > 3 bln'),
                    ),
                    DropdownMenuItem(
                      value: '4',
                      child: Text('Tunggakan 4+ bln'),
                    ),
                  ],
                  onChanged: (v) {
                    setState(() => _tunggakanFilter = v ?? '');
                    _fetch();
                  },
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: _kondisiFilter,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.home_rounded),
                    isDense: true,
                  ),
                  items: const [
                    DropdownMenuItem(
                      value: '',
                      child: Text('Semua Kondisi'),
                    ),
                    DropdownMenuItem(
                      value: 'Ditinggali',
                      child: Text('Ditinggali'),
                    ),
                    DropdownMenuItem(
                      value: 'Kosong',
                      child: Text('Kosong'),
                    ),
                    DropdownMenuItem(
                      value: 'Disewakan',
                      child: Text('Disewakan'),
                    ),
                  ],
                  onChanged: (v) {
                    setState(() => _kondisiFilter = v ?? '');
                  },
                ),
                const SizedBox(height: 16),
                if (filtered.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 48),
                    child: Center(
                      child: Text(
                        'Tidak ada data',
                        style: TextStyle(color: cs.onSurfaceVariant),
                      ),
                    ),
                  )
                else
                  ...filtered.map((w) => _WargaCard(w: w, cs: cs, theme: theme)),
                const SizedBox(height: 8),
                Text(
                  'Menampilkan ${filtered.length} dari ${_warga.length} warga',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: cs.onSurfaceVariant,
                  ),
                ),
              ],
            ),
    );
  }

  Widget _legendDot(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 11)),
      ],
    );
  }
}

class _WargaCard extends StatelessWidget {
  final WargaWithLastPayment w;
  final ColorScheme cs;
  final ThemeData theme;

  const _WargaCard({
    required this.w,
    required this.cs,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    final late = _monthsSince(w.lastPayment);
    final isRed = late > 3;
    final isAmber = late > 2;

    final Color bgColor;
    final Color borderColor;
    final Color textColor;
    final Color mutedColor;
    final Color labelColor;

    if (isRed) {
      bgColor = cs.errorContainer;
      borderColor = cs.error.withValues(alpha: 0.4);
      textColor = cs.onErrorContainer;
      mutedColor = cs.onErrorContainer.withValues(alpha: 0.7);
      labelColor = cs.error;
    } else if (isAmber) {
      bgColor = Colors.amber.shade100;
      borderColor = Colors.amber.shade400;
      textColor = Colors.amber.shade900;
      mutedColor = Colors.amber.shade700;
      labelColor = Colors.amber.shade800;
    } else {
      bgColor = cs.surfaceContainerLow;
      borderColor = cs.outlineVariant;
      textColor = cs.onSurface;
      mutedColor = cs.onSurfaceVariant;
      labelColor = cs.onSurfaceVariant;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      w.nama,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: textColor,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (w.noTelp.isNotEmpty)
                      Text(
                        w.noTelp,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: mutedColor,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isRed
                          ? cs.error.withValues(alpha: 0.2)
                          : isAmber
                              ? Colors.amber.shade300
                              : cs.primaryContainer,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      w.blok,
                      style: theme.textTheme.labelSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: isRed
                            ? cs.onErrorContainer
                            : isAmber
                                ? Colors.amber.shade900
                                : cs.onPrimaryContainer,
                      ),
                    ),
                  ),
                  if (w.kondisiRumah.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    _kondisiBadge(w.kondisiRumah, theme),
                  ],
                ],
              ),
            ],
          ),
          const Divider(height: 20),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'IURAN/BULAN',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: labelColor,
                        fontSize: 10,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _formatRupiah(w.iuran),
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: textColor,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'BAYAR TERAKHIR',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: labelColor,
                        fontSize: 10,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _formatTanggalIPL(w.lastPayment),
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: textColor,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _kondisiBadge(String kondisi, ThemeData theme) {
    Color bg;
    Color fg;
    switch (kondisi) {
      case 'Ditinggali':
        bg = Colors.green.shade100;
        fg = Colors.green.shade800;
      case 'Kosong':
        bg = Colors.grey.shade200;
        fg = Colors.grey.shade700;
      default:
        bg = Colors.blue.shade100;
        fg = Colors.blue.shade800;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        kondisi,
        style: theme.textTheme.labelSmall?.copyWith(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: fg,
        ),
      ),
    );
  }
}
