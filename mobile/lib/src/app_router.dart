import 'package:flutter/material.dart';
import 'models/pengumuman.dart';
import 'screens/dashboard_screen.dart';
import 'screens/login_screen.dart';
import 'screens/admin_screen.dart';
import 'screens/laporan_screen.dart';
import 'screens/pengumuman_screen.dart';
import 'screens/pengumuman_detail_screen.dart';
import 'screens/warga_screen.dart';

class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/login':
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case '/admin':
        return MaterialPageRoute(builder: (_) => const AdminScreen());
      case '/laporan':
        return MaterialPageRoute(builder: (_) => const LaporanScreen());
      case '/pengumuman':
        return MaterialPageRoute(builder: (_) => const PengumumanScreen());
      case '/warga':
        return MaterialPageRoute(builder: (_) => const WargaScreen());
      case '/pengumuman_detail':
        final args = settings.arguments as Pengumuman;
        return MaterialPageRoute(
          builder: (_) => PengumumanDetailScreen(data: args),
        );
      case '/':
      default:
        return MaterialPageRoute(builder: (_) => const DashboardScreen());
    }
  }
}

