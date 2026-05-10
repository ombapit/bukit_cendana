import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';
import 'package:in_app_update/in_app_update.dart';

/// Wraps Google Play's In-App Update API.
///
/// On Android, this asks Play whether a newer version is available. If yes
/// and it is `IMMEDIATE` priority (or we choose to enforce it), we block the
/// app behind Play's full-screen update flow.
///
/// On iOS / web / desktop this is a no-op.
class UpdateService {
  /// Triggers Play's blocking immediate-update UI when an update is available.
  /// Returns true if the user was redirected through an update flow.
  /// Errors are swallowed — we never want a broken update check to brick the app.
  static Future<bool> enforceImmediateUpdate() async {
    if (kIsWeb || !Platform.isAndroid) return false;
    try {
      final info = await InAppUpdate.checkForUpdate();
      if (info.updateAvailability != UpdateAvailability.updateAvailable) {
        return false;
      }
      if (!info.immediateUpdateAllowed) return false;
      final result = await InAppUpdate.performImmediateUpdate();
      return result == AppUpdateResult.success;
    } catch (e) {
      debugPrint('[UpdateService] check failed: $e');
      return false;
    }
  }
}
