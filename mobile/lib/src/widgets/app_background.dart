import 'package:flutter/material.dart';
import '../config/theme.dart';

/// Animated gradient background that fills the whole screen.
/// Use as the body's outermost wrapper (above SafeArea / scaffold body).
class AppBackground extends StatelessWidget {
  final Widget child;
  const AppBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: isDark ? AppColors.darkBgGradient : AppColors.lightBgGradient,
      ),
      child: child,
    );
  }
}
