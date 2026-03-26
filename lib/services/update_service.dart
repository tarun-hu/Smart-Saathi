import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UpdateService {
  static const String _currentVersion = '3.0.0';
  static const String _githubOwner = 'tarun-hu';
  static const String _githubRepo = 'Smart-Saathi';

  /// Checks GitHub Releases for a newer version.
  /// Returns release info if update available, null otherwise.
  static Future<Map<String, String>?> checkForUpdate() async {
    try {
      // Don't check more than once per hour
      final prefs = await SharedPreferences.getInstance();
      final lastCheck = prefs.getInt('last_update_check') ?? 0;
      final now = DateTime.now().millisecondsSinceEpoch;
      if (now - lastCheck < 3600000) return null; // 1 hour cooldown
      await prefs.setInt('last_update_check', now);

      final response = await http.get(
        Uri.parse(
            'https://api.github.com/repos/$_githubOwner/$_githubRepo/releases/latest'),
        headers: {'Accept': 'application/vnd.github.v3+json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final latestTag = (data['tag_name'] as String?)?.replaceAll('v', '') ?? '';
        final releaseNotes = data['body'] as String? ?? 'Bug fixes and improvements';
        final htmlUrl = data['html_url'] as String? ?? '';

        // Find APK download URL from assets
        String downloadUrl = htmlUrl;
        final assets = data['assets'] as List? ?? [];
        for (final asset in assets) {
          final name = asset['name'] as String? ?? '';
          if (name.endsWith('.apk')) {
            downloadUrl = asset['browser_download_url'] as String? ?? htmlUrl;
            break;
          }
        }

        if (_isNewerVersion(latestTag, _currentVersion)) {
          return {
            'version': latestTag,
            'notes': releaseNotes,
            'url': downloadUrl,
          };
        }
      }
    } catch (e) {
      debugPrint('Update check failed: $e');
    }
    return null;
  }

  /// Compare semantic versions: returns true if remote > current
  static bool _isNewerVersion(String remote, String current) {
    try {
      final remoteParts = remote.split('.').map(int.parse).toList();
      final currentParts = current.split('.').map(int.parse).toList();

      // Pad to same length
      while (remoteParts.length < 3) { remoteParts.add(0); }
      while (currentParts.length < 3) { currentParts.add(0); }

      for (int i = 0; i < 3; i++) {
        if (remoteParts[i] > currentParts[i]) return true;
        if (remoteParts[i] < currentParts[i]) return false;
      }
      return false; // equal
    } catch (e) {
      return false;
    }
  }

  /// Shows the update dialog
  static Future<void> showUpdateDialog(
      BuildContext context, Map<String, String> release) async {
    await showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF2E7D32).withAlpha(20),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.system_update_rounded,
                  color: Color(0xFF2E7D32), size: 28),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Update Available!',
                style: GoogleFonts.poppins(
                    fontSize: 20, fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF1A237E).withAlpha(15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'v$_currentVersion → v${release['version']}',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF1A237E),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              "What's New:",
              style: GoogleFonts.poppins(
                  fontSize: 14, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 6),
            ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 150),
              child: SingleChildScrollView(
                child: Text(
                  release['notes'] ?? 'Bug fixes and improvements',
                  style: GoogleFonts.poppins(
                      fontSize: 13, color: Colors.grey.shade700, height: 1.5),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Later',
                style: GoogleFonts.poppins(color: Colors.grey.shade500)),
          ),
          ElevatedButton.icon(
            onPressed: () async {
              Navigator.pop(ctx);
              final url = Uri.parse(release['url'] ?? '');
              if (await canLaunchUrl(url)) {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              }
            },
            icon: const Icon(Icons.download_rounded, color: Colors.white, size: 20),
            label: Text('Update Now',
                style: GoogleFonts.poppins(
                    fontWeight: FontWeight.w700, color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2E7D32),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14)),
              padding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  static String get currentVersion => _currentVersion;
}
