import 'package:flutter/foundation.dart';

/// Tiny global controller so non-shell screens can switch the active bottom tab.
/// Tab indices match `AppShell._tabs` order.
class ShellNav {
  ShellNav._();
  static final ShellNav instance = ShellNav._();

  static const int beranda = 0;
  static const int warga = 1;
  static const int laporan = 2;
  static const int pengaturan = 3;

  final ValueNotifier<int> index = ValueNotifier(beranda);

  void go(int i) => index.value = i;
}
