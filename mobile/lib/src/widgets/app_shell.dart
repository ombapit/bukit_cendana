import 'package:flutter/material.dart';
import '../screens/dashboard_screen.dart';
import '../screens/laporan_screen.dart';
import '../screens/warga_screen.dart';
import '../screens/account_screen.dart';
import 'ad_banner.dart';
import 'app_background.dart';
import 'shell_nav.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  static const _tabs = <_TabConfig>[
    _TabConfig(Icons.home_outlined, Icons.home_rounded, 'Beranda'),
    _TabConfig(Icons.people_outline_rounded, Icons.people_rounded, 'Warga'),
    _TabConfig(Icons.receipt_long_outlined, Icons.receipt_long_rounded, 'Laporan'),
    _TabConfig(Icons.tune_rounded, Icons.tune_rounded, 'Pengaturan'),
  ];

  Widget _buildTab(int index) {
    switch (index) {
      case 0:
        return const DashboardScreen();
      case 1:
        return const WargaScreen();
      case 2:
        return const LaporanScreen();
      case 3:
        return const AccountScreen();
    }
    return const SizedBox.shrink();
  }

  @override
  Widget build(BuildContext context) {
    return AppBackground(
      child: ValueListenableBuilder<int>(
        valueListenable: ShellNav.instance.index,
        builder: (_, current, _) => Scaffold(
          backgroundColor: Colors.transparent,
          extendBody: true,
          body: IndexedStack(
            index: current,
            children: List.generate(_tabs.length, _buildTab),
          ),
          bottomNavigationBar: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const AdBanner(),
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(22),
                    child: NavigationBar(
                      selectedIndex: current,
                      onDestinationSelected: ShellNav.instance.go,
                      destinations: [
                        for (final t in _tabs)
                          NavigationDestination(
                            icon: Icon(t.icon),
                            selectedIcon: Icon(t.iconSelected),
                            label: t.label,
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TabConfig {
  final IconData icon;
  final IconData iconSelected;
  final String label;
  const _TabConfig(this.icon, this.iconSelected, this.label);
}
