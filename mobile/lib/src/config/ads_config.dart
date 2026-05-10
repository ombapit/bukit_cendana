import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

/// Centralized AdMob unit IDs.
///
/// Currently returning Google's official **test** unit IDs so we never
/// accidentally serve fake clicks on a production unit during development.
///
/// TODO: Replace with production unit IDs before publishing.
class AdsConfig {
  AdsConfig._();

  /// Test banner unit ID (per Google docs).
  /// https://developers.google.com/admob/flutter/test-ads
  static String get bannerUnitId {
    if (kIsWeb) return '';
    if (Platform.isAndroid) {
      return 'ca-app-pub-3940256099942544/6300978111';
    }
    if (Platform.isIOS) {
      return 'ca-app-pub-3940256099942544/2934735716';
    }
    return '';
  }
}
