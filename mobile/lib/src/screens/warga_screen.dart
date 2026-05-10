import 'package:flutter/material.dart';
import '../models/warga.dart';
import '../services/warga_service.dart';
import '../utils/format.dart';
import '../widgets/app_chip.dart';
import '../widgets/glass_card.dart';
import '../widgets/state_views.dart';

class WargaScreen extends StatefulWidget {
  const WargaScreen({super.key});

  @override
  State<WargaScreen> createState() => _WargaScreenState();
}

class _WargaScreenState extends State<WargaScreen> {
  final _service = WargaService();
  final _searchController = TextEditingController();

  List<WargaWithLastPayment> _warga = [];
  bool _loading = true;
  String? _error;

  String _search = '';
  String _blokFilter = '';
  String _kondisiFilter = '';
  int? _tunggakan; // null = semua, 2/3/4 = threshold

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await _service.getAll(tunggakan: _tunggakan);
      if (!mounted) return;
      setState(() {
        _warga = data;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Gagal memuat data warga';
        _loading = false;
      });
    }
  }

  List<String> get _allBlocks {
    final blocks = <String>{};
    for (final w in _warga) {
      final prefix = w.blok.split('/')[0].trim();
      if (prefix.isNotEmpty) blocks.add(prefix);
    }
    final list = blocks.toList()
      ..sort((a, b) => a.compareTo(b));
    return list;
  }

  List<WargaWithLastPayment> get _filtered {
    final list = _warga.where((w) {
      final s = _search.toLowerCase();
      final matchSearch = s.isEmpty ||
          w.nama.toLowerCase().contains(s) ||
          w.blok.toLowerCase().contains(s) ||
          w.noTelp.contains(s);
      final matchBlok = _blokFilter.isEmpty || w.blok.startsWith(_blokFilter);
      final matchKondisi = _kondisiFilter.isEmpty || w.kondisiRumah == _kondisiFilter;
      return matchSearch && matchBlok && matchKondisi;
    }).toList();
    list.sort((a, b) => _compareBlok(a.blok, b.blok));
    return list;
  }

  /// Numeric-aware blok compare so "A2" < "A10".
  int _compareBlok(String a, String b) {
    final ra = RegExp(r'(\D+|\d+)').allMatches(a).map((m) => m.group(0)!).toList();
    final rb = RegExp(r'(\D+|\d+)').allMatches(b).map((m) => m.group(0)!).toList();
    final n = ra.length < rb.length ? ra.length : rb.length;
    for (var i = 0; i < n; i++) {
      final pa = ra[i];
      final pb = rb[i];
      final na = int.tryParse(pa);
      final nb = int.tryParse(pb);
      int cmp;
      if (na != null && nb != null) {
        cmp = na.compareTo(nb);
      } else {
        cmp = pa.toLowerCase().compareTo(pb.toLowerCase());
      }
      if (cmp != 0) return cmp;
    }
    return ra.length.compareTo(rb.length);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final filtered = _filtered;

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        color: cs.primary,
        onRefresh: _fetch,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
          children: [
            Text('Data Warga', style: theme.textTheme.headlineMedium),
            const SizedBox(height: 4),
            Text(
              'Daftar penghuni resmi Bukit Cendana beserta status IPL.',
              style: theme.textTheme.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
            ),
            const SizedBox(height: 14),

            // Legend
            Wrap(
              spacing: 14,
              runSpacing: 6,
              children: const [
                _LegendDot(color: Color(0xFFEF4444), label: 'Tunggakan > 3 bln'),
                _LegendDot(color: Color(0xFFF59E0B), label: 'Tunggakan > 2 bln'),
                _LegendDot(color: Colors.transparent, label: 'Lancar', outlined: true),
              ],
            ),

            const SizedBox(height: 16),
            TextField(
              controller: _searchController,
              onChanged: (v) => setState(() => _search = v),
              decoration: InputDecoration(
                hintText: 'Cari nama, blok, atau no. telepon...',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: _search.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.close_rounded, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _search = '');
                        },
                      ),
              ),
            ),
            const SizedBox(height: 12),

            // Tunggakan chips
            _ChipRow(
              label: 'Pembayaran',
              children: [
                AppFilterChip(
                  label: 'Semua',
                  selected: _tunggakan == null,
                  onTap: () { setState(() => _tunggakan = null); _fetch(); },
                ),
                AppFilterChip(
                  label: '> 2 bln',
                  selected: _tunggakan == 2,
                  onTap: () { setState(() => _tunggakan = 2); _fetch(); },
                ),
                AppFilterChip(
                  label: '> 3 bln',
                  selected: _tunggakan == 3,
                  onTap: () { setState(() => _tunggakan = 3); _fetch(); },
                ),
                AppFilterChip(
                  label: '4+ bln',
                  selected: _tunggakan == 4,
                  onTap: () { setState(() => _tunggakan = 4); _fetch(); },
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Kondisi chips
            _ChipRow(
              label: 'Kondisi',
              children: [
                AppFilterChip(
                  label: 'Semua',
                  selected: _kondisiFilter.isEmpty,
                  onTap: () => setState(() => _kondisiFilter = ''),
                ),
                AppFilterChip(
                  label: 'Ditinggali',
                  selected: _kondisiFilter == 'Ditinggali',
                  onTap: () => setState(() => _kondisiFilter = 'Ditinggali'),
                ),
                AppFilterChip(
                  label: 'Kosong',
                  selected: _kondisiFilter == 'Kosong',
                  onTap: () => setState(() => _kondisiFilter = 'Kosong'),
                ),
                AppFilterChip(
                  label: 'Disewakan',
                  selected: _kondisiFilter == 'Disewakan',
                  onTap: () => setState(() => _kondisiFilter = 'Disewakan'),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Blok chips (only show if there are blocks)
            if (_allBlocks.isNotEmpty)
              _ChipRow(
                label: 'Blok',
                children: [
                  AppFilterChip(
                    label: 'Semua',
                    selected: _blokFilter.isEmpty,
                    onTap: () => setState(() => _blokFilter = ''),
                  ),
                  for (final b in _allBlocks)
                    AppFilterChip(
                      label: b,
                      selected: _blokFilter == b,
                      onTap: () => setState(() => _blokFilter = b),
                    ),
                ],
              ),

            const SizedBox(height: 16),

            if (_loading)
              const LoadingView(label: 'Memuat data warga...')
            else if (_error != null)
              ErrorView(message: _error!, onRetry: _fetch)
            else if (filtered.isEmpty)
              const EmptyView(
                icon: Icons.people_outline_rounded,
                title: 'Tidak ada warga',
                subtitle: 'Coba ubah pencarian atau filter di atas.',
              )
            else ...[
              Padding(
                padding: const EdgeInsets.only(bottom: 8, left: 4),
                child: Text(
                  'Menampilkan ${filtered.length} dari ${_warga.length} warga',
                  style: theme.textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                ),
              ),
              for (final w in filtered) ...[
                _WargaCard(w: w),
                const SizedBox(height: 10),
              ],
            ],
          ],
        ),
      ),
    );
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;
  final bool outlined;
  const _LegendDot({required this.color, required this.label, this.outlined = false});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            border: outlined ? Border.all(color: cs.outlineVariant, width: 1.5) : null,
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: TextStyle(fontSize: 11, color: cs.onSurfaceVariant),
        ),
      ],
    );
  }
}

class _ChipRow extends StatelessWidget {
  final String label;
  final List<Widget> children;
  const _ChipRow({required this.label, required this.children});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 4),
          child: Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 10,
              letterSpacing: 1,
              fontWeight: FontWeight.w700,
              color: cs.onSurfaceVariant,
            ),
          ),
        ),
        SizedBox(
          height: 36,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemBuilder: (_, i) => children[i],
            separatorBuilder: (_, _) => const SizedBox(width: 6),
            itemCount: children.length,
          ),
        ),
      ],
    );
  }
}

class _WargaCard extends StatelessWidget {
  final WargaWithLastPayment w;
  const _WargaCard({required this.w});

  ({Color bg, Color border, Color accent, Color text, Color muted}) _palette(
    BuildContext context,
  ) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;
    final late = monthsSince(w.lastPayment);

    if (late > 3) {
      // Red
      return (
        bg: isDark ? const Color(0xFF3F1212) : const Color(0xFFFEE2E2),
        border: const Color(0xFFEF4444).withValues(alpha: 0.4),
        accent: const Color(0xFFEF4444),
        text: isDark ? const Color(0xFFFCA5A5) : const Color(0xFF7F1D1D),
        muted: isDark ? const Color(0xFFF87171) : const Color(0xFFB91C1C),
      );
    }
    if (late > 2) {
      // Amber
      return (
        bg: isDark ? const Color(0xFF3A2914) : const Color(0xFFFEF3C7),
        border: const Color(0xFFF59E0B).withValues(alpha: 0.4),
        accent: const Color(0xFFF59E0B),
        text: isDark ? const Color(0xFFFCD34D) : const Color(0xFF78350F),
        muted: isDark ? const Color(0xFFFBBF24) : const Color(0xFFB45309),
      );
    }
    return (
      bg: isDark ? Colors.white.withValues(alpha: 0.04) : Colors.white.withValues(alpha: 0.55),
      border: isDark ? Colors.white.withValues(alpha: 0.07) : Colors.white.withValues(alpha: 0.7),
      accent: cs.primary,
      text: cs.onSurface,
      muted: cs.onSurfaceVariant,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final p = _palette(context);

    return GlassCard(
      color: p.bg,
      padding: const EdgeInsets.all(14),
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
                        fontWeight: FontWeight.w700,
                        color: p.text,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (w.noTelp.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        w.noTelp,
                        style: theme.textTheme.bodySmall?.copyWith(color: p.muted),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  StatusBadge(
                    label: w.blok,
                    background: p.accent.withValues(alpha: 0.18),
                    foreground: p.accent,
                  ),
                  if (w.kondisiRumah.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    _kondisiBadge(w.kondisiRumah),
                  ],
                ],
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Container(
              height: 1,
              color: p.border,
            ),
          ),
          Row(
            children: [
              Expanded(
                child: _stat('Iuran/Bulan', formatRupiah(w.iuran), p.muted, p.text),
              ),
              Expanded(
                child: _stat('Bayar Terakhir', formatTanggalIPL(w.lastPayment), p.muted, p.text),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _stat(String label, String value, Color labelColor, Color valueColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: TextStyle(
            fontSize: 10,
            letterSpacing: 0.6,
            color: labelColor,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(
            fontSize: 13.5,
            fontWeight: FontWeight.w700,
            color: valueColor,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  Widget _kondisiBadge(String kondisi) {
    Color bg, fg;
    switch (kondisi) {
      case 'Ditinggali':
        bg = const Color(0xFF22C55E).withValues(alpha: 0.15);
        fg = const Color(0xFF15803D);
      case 'Kosong':
        bg = const Color(0xFF6B7280).withValues(alpha: 0.18);
        fg = const Color(0xFF374151);
      default:
        bg = const Color(0xFF3B82F6).withValues(alpha: 0.15);
        fg = const Color(0xFF1D4ED8);
    }
    return StatusBadge(label: kondisi, background: bg, foreground: fg);
  }
}
