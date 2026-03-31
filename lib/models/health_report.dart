import 'dart:convert';

class HealthReport {
  final String id;
  final String userId;
  final String name;
  final List<String> imageUrls;
  final DateTime timestamp;
  final String? aiSummary;

  HealthReport({
    required this.id,
    required this.userId,
    required this.name,
    required this.imageUrls,
    required this.timestamp,
    this.aiSummary,
  });

  /// Backward-compatible: if image_url is a JSON array string, parse it.
  /// Otherwise treat it as a single URL.
  factory HealthReport.fromJson(Map<String, dynamic> json) {
    List<String> urls = [];
    final rawUrl = json['image_url'];
    if (rawUrl is String) {
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
      aiSummary: json['ai_summary'] as String?,
    );
  }

  String get thumbnailUrl => imageUrls.isNotEmpty ? imageUrls.first : '';

  int get pageCount => imageUrls.length;

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'name': name,
      'image_url': jsonEncode(imageUrls),
      'timestamp': timestamp.toIso8601String(),
      'ai_summary': aiSummary,
    };
  }
}
