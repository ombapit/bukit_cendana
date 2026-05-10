import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import '../models/pengumuman.dart';
import '../utils/format.dart';
import '../widgets/app_background.dart';
import '../widgets/app_chip.dart';

class PengumumanDetailScreen extends StatelessWidget {
  final Pengumuman data;

  const PengumumanDetailScreen({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tags = data.tags
        .split(',')
        .map((t) => t.trim())
        .where((t) => t.isNotEmpty)
        .toList();

    return AppBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (data.gambar.isNotEmpty) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: AspectRatio(
                    aspectRatio: 16 / 9,
                    child: Image.network(
                      absoluteImageUrl(data.gambar),
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => Container(
                        color: cs.surfaceContainerHighest.withValues(alpha: 0.4),
                        child: Center(
                          child: Icon(Icons.image_rounded, size: 40, color: cs.onSurfaceVariant),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
              if (data.kategori.isNotEmpty || tags.isNotEmpty)
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    if (data.kategori.isNotEmpty)
                      StatusBadge(
                        label: data.kategori,
                        background: cs.primary.withValues(alpha: 0.12),
                        foreground: cs.primary,
                      ),
                    for (final tag in tags)
                      StatusBadge(
                        icon: Icons.local_offer_rounded,
                        label: tag,
                        background: cs.surfaceContainerHighest.withValues(alpha: 0.5),
                        foreground: cs.onSurfaceVariant,
                      ),
                  ],
                ),
              const SizedBox(height: 14),
              Text(
                data.judul,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  height: 1.2,
                  color: cs.onSurface,
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 16,
                runSpacing: 4,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.schedule_rounded, size: 14, color: cs.onSurfaceVariant),
                      const SizedBox(width: 5),
                      Text(
                        formatRelative(data.createdAt),
                        style: theme.textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                      ),
                    ],
                  ),
                  if (data.createdByName.isNotEmpty)
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.person_rounded, size: 14, color: cs.onSurfaceVariant),
                        const SizedBox(width: 5),
                        Text(
                          data.createdByName,
                          style: theme.textTheme.bodySmall?.copyWith(color: cs.onSurfaceVariant),
                        ),
                      ],
                    ),
                ],
              ),
              const SizedBox(height: 20),
              Container(
                height: 1,
                color: cs.outlineVariant.withValues(alpha: 0.4),
              ),
              const SizedBox(height: 16),
              Html(
                data: data.konten,
                style: {
                  'body': Style(
                    fontSize: FontSize(15),
                    lineHeight: const LineHeight(1.65),
                    color: cs.onSurface,
                    margin: Margins.zero,
                    padding: HtmlPaddings.zero,
                  ),
                  'p': Style(
                    margin: Margins.only(bottom: 12),
                    color: cs.onSurface,
                  ),
                  'h1, h2, h3, h4': Style(
                    color: cs.onSurface,
                    fontWeight: FontWeight.w700,
                  ),
                  'a': Style(
                    color: cs.primary,
                    textDecoration: TextDecoration.underline,
                  ),
                  'strong, b': Style(
                    color: cs.onSurface,
                    fontWeight: FontWeight.w700,
                  ),
                  'li': Style(color: cs.onSurface),
                  'blockquote': Style(
                    color: cs.onSurfaceVariant,
                    border: Border(left: BorderSide(color: cs.primary, width: 3)),
                    padding: HtmlPaddings.only(left: 12),
                  ),
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
