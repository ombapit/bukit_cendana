import 'package:flutter/material.dart';
import 'models/pengumuman.dart';
import 'screens/pengumuman_detail_screen.dart';
import 'screens/splash_screen.dart';
import 'widgets/app_shell.dart';

class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/shell':
        return MaterialPageRoute(builder: (_) => const AppShell());
      case '/pengumuman_detail':
        final args = settings.arguments as Pengumuman;
        return MaterialPageRoute(builder: (_) => PengumumanDetailScreen(data: args));
      case '/':
      default:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
    }
  }
}
