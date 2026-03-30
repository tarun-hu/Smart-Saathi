import 'dart:convert';

class HealthReport {
  final String id;
  final String userId;
  final String name;
  final List<String> imageUrls;
  final DateTime timestamp;

  HealthReport({
    required this.id,
    required this.userId,
    required this.name,
    required this.imageUrls,
    required this.timestamp,
  });

  /// Backward-compatible: if image_url is a JSON array string, parse it.
  /// Otherwise treat it as a single URL.
  factory HealthReport.fromJson(Map<String, dynamic> json) {
    List<String> urls = [];
    final rawUrl = json['image_url'];
    if (rawUrl is String) {
      // Try to parse as JSON array
      if (rawUrl.startsWith('[')) {
        try {
          final parsed = jsonDecode(rawUrl) as List;
          urls = parsed.cast<String>();
        } catch (_) {
          urls = [rawUrl];
        }
      } else {
        urls = [rawUrl];
      }
    }

    return HealthReport(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      name: json['name'] as String,
      imageUrls: urls,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  /// First image URL for thumbnail display
  String get thumbnailUrl => imageUrls.isNotEmpty ? imageUrls.first : '';

  /// Number of pages/images
  int get pageCount => imageUrls.length;

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'name': name,
      'image_url': jsonEncode(imageUrls),
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
