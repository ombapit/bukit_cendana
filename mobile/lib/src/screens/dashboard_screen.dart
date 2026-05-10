import 'dart:async';
import 'package:flutter/material.dart';
import '../models/pengumuman.dart';
import '../services/pengumuman_service.dart';
import '../utils/format.dart';
import '../widgets/app_chip.dart';
import '../widgets/glass_card.dart';
import '../widgets/hero_header.dart';
import '../widgets/section_header.dart';
import '../widgets/shell_nav.dart';
import '../widgets/state_views.dart';

const _kategoris = [
  ('', 'Semua', Icons.tune_rounded),
  ('Penting', 'Penting', Icons.priority_high_rounded),
  ('Umum', 'Umum', Icons.campaign_rounded),
  ('Keamanan', 'Keamanan', Icons.shield_rounded),
  ('Kebersihan', 'Kebersihan', Icons.cleaning_services_rounded),
  ('Kegiatan', 'Kegiatan', Icons.event_rounded),
  ('Keuangan', 'Keuangan', Icons.account_balance_wallet_rounded),
];

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _service = PengumumanService();
  final _searchController = TextEditingController();
  Timer? _debounce;

  bool _loading = true;
  String? _error;
  List<Pengumuman> _items = [];

  String _selectedKategori = '';
  String _search = '';

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await _service.getAll(
        search: _search,
        kategori: _selectedKategori,
      );
      if (!mounted) return;
      setState(() {
        _items = list;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Gagal memuat pengumuman';
        _loading = false;
      });
    }
  }

  void _onSearchChanged(String v) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () {
      _search = v.trim();
      _fetch();
    });
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now().hour;
    final greeting = now < 11
        ? 'Selamat pagi'
        : now < 15
            ? 'Selamat siang'
            : now < 19
                ? 'Selamat sore'
                : 'Selamat malam';

    return RefreshIndicator(
      color: Theme.of(context).colorScheme.primary,
      onRefresh: _fetch,
      child: ListView(
        padding: const EdgeInsets.only(bottom: 120),
        children: [
          HeroHeader(
            subtitle: greeting,
            title: 'Bukit Cendana',
            height: 220,
            actions: [
              HeroQuickAction(
                icon: Icons.people_rounded,
                label: 'Warga',
                onTap: () => ShellNav.instance.go(ShellNav.warga),
              ),
              HeroQuickAction(
                icon: Icons.receipt_long_rounded,
                label: 'Laporan',
                onTap: () => ShellNav.instance.go(ShellNav.laporan),
              ),
            ],
          ),
          const SizedBox(height: 16),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Cari pengumuman...',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: _search.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.close_rounded, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          _search = '';
                          _fetch();
                        },
                      ),
              ),
            ),
          ),

          const SizedBox(height: 12),
          SizedBox(
            height: 36,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: _kategoris.length,
              separatorBuilder: (_, _) => const SizedBox(width: 6),
              itemBuilder: (_, i) {
                final (value, label, icon) = _kategoris[i];
                return AppFilterChip(
                  label: label,
                  icon: icon,
                  selected: _selectedKategori == value,
                  onTap: () {
                    setState(() => _selectedKategori = value);
                    _fetch();
                  },
                );
              },
            ),
          ),

          const SizedBox(height: 16),
          SectionHeader(
            title: _selectedKategori.isEmpty ? 'Pengumuman Terbaru' : _selectedKategori,
          ),
          const SizedBox(height: 8),

          if (_loading)
            const LoadingView()
          else if (_error != null)
            ErrorView(message: _error!, onRetry: _fetch)
          else if (_items.isEmpty)
            const EmptyView(
              icon: Icons.campaign_rounded,
              title: 'Belum ada pengumuman',
              subtitle: 'Pengumuman baru akan muncul di sini.',
            )
          else
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  _PengumumanFeatured(item: _items.first),
                  if (_items.length > 1) ...[
                    const SizedBox(height: 16),
                    for (var i = 1; i < _items.length; i++) ...[
                      _PengumumanRow(item: _items[i]),
                      if (i < _items.length - 1) const SizedBox(height: 10),
                    ],
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _PengumumanFeatured extends StatelessWidget {
  final Pengumuman item;
  const _PengumumanFeatured({required this.item});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    return GlassCard(
      padding: EdgeInsets.zero,
      onTap: () => Navigator.pushNamed(context, '/pengumuman_detail', arguments: item),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 16 / 9,
            child: item.gambar.isNotEmpty
                ? Image.network(
                    absoluteImageUrl(item.gambar),
                    fit: BoxFit.cover,
                    errorBuilder: (_, _, _) => _placeholder(cs),
                  )
                : _placeholder(cs),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    if (item.kategori.isNotEmpty)
                      StatusBadge(
                        label: item.kategori,
                        background: cs.primary.withValues(alpha: 0.12),
                        foreground: cs.primary,
                      ),
                    const Spacer(),
                    Icon(Icons.schedule_rounded, size: 12, color: cs.onSurfaceVariant),
                    const SizedBox(width: 4),
                    Text(
                      formatRelative(item.createdAt),
                      style: theme.textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  item.judul,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                    height: 1.2,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Text(
                  stripHtml(item.konten),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _placeholder(ColorScheme cs) {
    return Container(
      color: cs.surfaceContainerHighest.withValues(alpha: 0.4),
      child: Center(
        child: Icon(Icons.image_rounded, size: 40, color: cs.onSurfaceVariant.withValues(alpha: 0.5)),
      ),
    );
  }
}

class _PengumumanRow extends StatelessWidget {
  final Pengumuman item;
  const _PengumumanRow({required this.item});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    return GlassCard(
      padding: const EdgeInsets.all(10),
      onTap: () => Navigator.pushNamed(context, '/pengumuman_detail', arguments: item),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              width: 80,
              height: 80,
              child: item.gambar.isNotEmpty
                  ? Image.network(
                      absoluteImageUrl(item.gambar),
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => _placeholder(cs),
                    )
                  : _placeholder(cs),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (item.kategori.isNotEmpty) ...[
                  StatusBadge(
                    label: item.kategori,
                    background: cs.primary.withValues(alpha: 0.1),
                    foreground: cs.primary,
                  ),
                  const SizedBox(height: 6),
                ],
                Text(
                  item.judul,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    height: 1.25,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.schedule_rounded, size: 11, color: cs.onSurfaceVariant),
                    const SizedBox(width: 3),
                    Text(
                      formatRelative(item.createdAt),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: cs.onSurfaceVariant,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _placeholder(ColorScheme cs) {
    return Container(
      color: cs.surfaceContainerHighest.withValues(alpha: 0.4),
      child: Center(
        child: Icon(Icons.image_rounded, size: 24, color: cs.onSurfaceVariant.withValues(alpha: 0.5)),
      ),
    );
  }
}
