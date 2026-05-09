import 'package:flutter/material.dart';
import '../models/pengumuman.dart';
import '../services/pengumuman_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final PengumumanService _service = PengumumanService();
  late Future<List<Pengumuman>> _pengumumanFuture;
  String _selectedKategori = '';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _pengumumanFuture = _service.getAll();
  }

  void _refresh() {
    setState(() {
      _pengumumanFuture = _service.getAll(
        search: _searchQuery,
        kategori: _selectedKategori,
      );
    });
  }

  String formatTanggal(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      final now = DateTime.now();
      final diff = now.difference(date);

      if (diff.inDays == 0) {
        if (diff.inHours == 0) {
          return '${diff.inMinutes} menit lalu';
        }
        return '${diff.inHours} jam lalu';
      } else if (diff.inDays == 1) {
        return '1 hari lalu';
      } else if (diff.inDays < 30) {
        return '${diff.inDays} hari lalu';
      } else {
        return date.toLocal().toString().split(' ')[0];
      }
    } catch (_) {
      return '-';
    }
  }

  String stripHtml(String html) {
    return html
        .replaceAll(RegExp(r'<[^>]+>'), ' ')
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '"')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }

  String getImageUrl(String gambar) {
    if (gambar.isEmpty) return '';
    const baseUrl = 'https://bukitcendana.my.id';
    return '$baseUrl$gambar';
  }

  Widget _imagePlaceholder(ColorScheme cs) {
    return Container(
      height: 80,
      color: cs.surfaceContainerHighest,
      child: Center(
        child: Icon(Icons.image_rounded, size: 28, color: cs.onSurfaceVariant),
      ),
    );
  }

  Widget _kategoriChip(String label, ColorScheme cs, ThemeData theme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: cs.tertiaryContainer,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: theme.textTheme.labelSmall?.copyWith(
          color: cs.onTertiaryContainer,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Bukit Cendana'), actions: []),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [cs.primary, cs.primary.withValues(alpha: 0.8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: SizedBox(
                width: double.infinity,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Icon(Icons.home_rounded, color: cs.onPrimary, size: 40),
                    const SizedBox(height: 12),
                    Text(
                      'Bukit Cendana',
                      style: TextStyle(
                        color: cs.onPrimary,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Perumahan Bukit Cendana',
                      style: TextStyle(
                        color: cs.onPrimary.withValues(alpha: 0.8),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.home_rounded),
              title: const Text('Home'),
              selected: true,
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.description_rounded),
              title: const Text('Laporan'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/laporan');
              },
            ),
            ListTile(
              leading: const Icon(Icons.people_rounded),
              title: const Text('Warga'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/warga');
              },
            ),
            ListTile(
              leading: const Icon(Icons.admin_panel_settings_rounded),
              title: const Text('Admin'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/admin');
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.login_rounded),
              title: const Text('Login'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/login');
              },
            ),
          ],
        ),
      ),
      body: ListView(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  onChanged: (value) {
                    _searchQuery = value;
                    _refresh();
                  },
                  decoration: InputDecoration(
                    hintText: 'Cari pengumuman...',
                    prefixIcon: const Icon(Icons.search_rounded),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _selectedKategori,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.filter_list_rounded),
                  ),
                  items: const [
                    DropdownMenuItem(value: '', child: Text('Semua Kategori')),
                    DropdownMenuItem(value: 'Umum', child: Text('Umum')),
                    DropdownMenuItem(
                      value: 'Keamanan',
                      child: Text('Keamanan'),
                    ),
                    DropdownMenuItem(
                      value: 'Kebersihan',
                      child: Text('Kebersihan'),
                    ),
                    DropdownMenuItem(
                      value: 'Kegiatan',
                      child: Text('Kegiatan'),
                    ),
                    DropdownMenuItem(value: 'Penting', child: Text('Penting')),
                    DropdownMenuItem(
                      value: 'Keuangan',
                      child: Text('Keuangan'),
                    ),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _selectedKategori = value ?? '';
                    });
                    _refresh();
                  },
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: FutureBuilder<List<Pengumuman>>(
              future: _pengumumanFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const SizedBox(
                    height: 200,
                    child: Center(child: CircularProgressIndicator()),
                  );
                }

                if (snapshot.hasError) {
                  final cs = Theme.of(context).colorScheme;
                  return SizedBox(
                    height: 100,
                    child: Center(
                      child: Text(
                        'Error: ${snapshot.error}',
                        style: TextStyle(color: cs.error),
                      ),
                    ),
                  );
                }

                final pengumumans = snapshot.data ?? [];

                if (pengumumans.isEmpty) {
                  final cs = Theme.of(context).colorScheme;
                  return SizedBox(
                    height: 100,
                    child: Center(
                      child: Text(
                        'Belum ada pengumuman',
                        style: TextStyle(color: cs.onSurfaceVariant),
                      ),
                    ),
                  );
                }

                return GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.75,
                  children: pengumumans.map((p) {
                    return Card(
                      child: InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () {
                          Navigator.pushNamed(
                            context,
                            '/pengumuman_detail',
                            arguments: p,
                          );
                        },
                        child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClipRRect(
                            borderRadius: const BorderRadius.vertical(
                              top: Radius.circular(16),
                            ),
                            child: p.gambar.isNotEmpty
                                ? Image.network(
                                    getImageUrl(p.gambar),
                                    height: 80,
                                    width: double.infinity,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, _, _) =>
                                        _imagePlaceholder(cs),
                                  )
                                : _imagePlaceholder(cs),
                          ),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.all(10),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (p.kategori.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(bottom: 6),
                                      child: _kategoriChip(
                                        p.kategori,
                                        cs,
                                        theme,
                                      ),
                                    ),
                                  Flexible(
                                    child: Text(
                                      p.judul,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: theme.textTheme.labelLarge
                                          ?.copyWith(
                                            fontWeight: FontWeight.w600,
                                          ),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Flexible(
                                    child: Text(
                                      stripHtml(p.konten),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color: cs.onSurfaceVariant,
                                          ),
                                    ),
                                  ),
                                  const Spacer(),
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.schedule_rounded,
                                        size: 10,
                                        color: cs.onSurfaceVariant,
                                      ),
                                      const SizedBox(width: 3),
                                      Text(
                                        formatTanggal(p.createdAt),
                                        style: theme.textTheme.labelSmall
                                            ?.copyWith(
                                              color: cs.onSurfaceVariant,
                                            ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                  }).toList(),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
