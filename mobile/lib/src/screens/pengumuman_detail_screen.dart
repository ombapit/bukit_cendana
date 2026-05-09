import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import '../models/pengumuman.dart';

class PengumumanDetailScreen extends StatelessWidget {
  final Pengumuman data;

  const PengumumanDetailScreen({super.key, required this.data});

  String formatTanggal(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      final now = DateTime.now();
      final diff = now.difference(date);

      if (diff.inDays == 0) {
        if (diff.inHours == 0) return '${diff.inMinutes} menit lalu';
        return '${diff.inHours} jam lalu';
      } else if (diff.inDays == 1) {
        return '1 hari lalu';
      } else if (diff.inDays < 30) {
        return '${diff.inDays} hari lalu';
      }
      return date.toLocal().toString().split(' ')[0];
    } catch (_) {
      return '-';
    }
  }

  String getImageUrl(String gambar) {
    if (gambar.isEmpty) return '';
    const baseUrl = 'https://bukitcendana.my.id';
    return '$baseUrl$gambar';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (data.gambar.isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(
                  getImageUrl(data.gambar),
                  width: double.infinity,
                  height: 200,
                  fit: BoxFit.cover,
                  errorBuilder: (_, _, _) => Container(
                    height: 200,
                    color: cs.surfaceContainerHighest,
                    child: Center(
                      child: Icon(Icons.image_rounded,
                          size: 40, color: cs.onSurfaceVariant),
                    ),
                  ),
                ),
              ),
            if (data.gambar.isNotEmpty) const SizedBox(height: 20),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                if (data.kategori.isNotEmpty)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: cs.primaryContainer,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      data.kategori,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: cs.onPrimaryContainer,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                if (data.tags.isNotEmpty)
                  ...data.tags.split(',').map(
                        (tag) => Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: cs.surfaceContainerHighest,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.local_offer_rounded,
                                  size: 10, color: cs.onSurfaceVariant),
                              const SizedBox(width: 4),
                              Text(
                                tag.trim(),
                                style: theme.textTheme.labelSmall?.copyWith(
                                  color: cs.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              data.judul,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.calendar_today_rounded,
                    size: 14, color: cs.onSurfaceVariant),
                const SizedBox(width: 6),
                Text(
                  formatTanggal(data.createdAt),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: cs.onSurfaceVariant,
                  ),
                ),
                if (data.createdByName.isNotEmpty) ...[
                  const SizedBox(width: 16),
                  Icon(Icons.person_rounded,
                      size: 14, color: cs.onSurfaceVariant),
                  const SizedBox(width: 6),
                  Text(
                    data.createdByName,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: cs.onSurfaceVariant,
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 20),
            Html(
              data: data.konten,
              style: {
                'body': Style(
                  fontSize: FontSize(15),
                  lineHeight: const LineHeight(1.6),
                  color: cs.onSurface,
                  margin: Margins.zero,
                  padding: HtmlPaddings.zero,
                ),
                'p': Style(
                  margin: Margins.only(bottom: 12),
                ),
              },
            ),
          ],
        ),
      ),
    );
  }
}
