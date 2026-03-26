class HealthReport {
  final String id;
  final String userId;
  final String name;
  final String imageUrl;
  final DateTime timestamp;

  HealthReport({
    required this.id,
    required this.userId,
    required this.name,
    required this.imageUrl,
    required this.timestamp,
  });

  factory HealthReport.fromJson(Map<String, dynamic> json) {
    return HealthReport(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      name: json['name'] as String,
      imageUrl: json['image_url'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'name': name,
      'image_url': imageUrl,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
