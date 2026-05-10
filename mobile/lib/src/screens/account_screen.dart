import 'package:flutter/material.dart';
import '../config/theme_controller.dart';
import '../widgets/glass_card.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
        children: [
          Text(
            'Pengaturan',
            style: theme.textTheme.headlineMedium,
          ),
          const SizedBox(height: 4),
          Text(
            'Atur tampilan aplikasi sesuai preferensi.',
            style: theme.textTheme.bodyMedium?.copyWith(color: cs.onSurfaceVariant),
          ),
          const SizedBox(height: 20),

          _SectionLabel('Tampilan'),
          const SizedBox(height: 8),
          GlassCard(
            padding: EdgeInsets.zero,
            child: ValueListenableBuilder<ThemeMode>(
              valueListenable: ThemeController.instance.mode,
              builder: (_, mode, _) => Column(
                children: [
                  _ThemeOption(
                    icon: Icons.brightness_auto_rounded,
                    label: 'Ikuti sistem',
                    selected: mode == ThemeMode.system,
                    onTap: () => ThemeController.instance.set(ThemeMode.system),
                  ),
                  const Divider(height: 1),
                  _ThemeOption(
                    icon: Icons.light_mode_rounded,
                    label: 'Mode terang',
                    selected: mode == ThemeMode.light,
                    onTap: () => ThemeController.instance.set(ThemeMode.light),
                  ),
                  const Divider(height: 1),
                  _ThemeOption(
                    icon: Icons.dark_mode_rounded,
                    label: 'Mode gelap',
                    selected: mode == ThemeMode.dark,
                    onTap: () => ThemeController.instance.set(ThemeMode.dark),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),
          _SectionLabel('Tentang'),
          const SizedBox(height: 8),
          GlassCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                ListTile(
                  leading: Icon(Icons.info_outline_rounded, color: cs.onSurfaceVariant),
                  title: const Text('Bukit Cendana'),
                  subtitle: const Text('Versi 1.0.0'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: Icon(Icons.public_rounded, color: cs.onSurfaceVariant),
                  title: const Text('Situs web'),
                  subtitle: const Text('bukitcendana.my.id'),
                  trailing: Icon(Icons.open_in_new_rounded, size: 18, color: cs.onSurfaceVariant),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        text.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          letterSpacing: 1.2,
          fontWeight: FontWeight.w700,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }
}

class _ThemeOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _ThemeOption({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return ListTile(
      leading: Icon(icon, color: selected ? cs.primary : cs.onSurfaceVariant),
      title: Text(
        label,
        style: TextStyle(
          fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
          color: selected ? cs.primary : cs.onSurface,
        ),
      ),
      trailing: selected ? Icon(Icons.check_rounded, color: cs.primary) : null,
      onTap: onTap,
    );
  }
}
