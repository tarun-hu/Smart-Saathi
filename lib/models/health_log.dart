class HealthLog {
  final String id;
  final String userId;
  final double? bp;
  final double? sugar;
  final String? symptoms;
  final DateTime timestamp;

  HealthLog({
    required this.id,
    required this.userId,
    this.bp,
    this.sugar,
    this.symptoms,
    required this.timestamp,
  });

  factory HealthLog.fromJson(Map<String, dynamic> json) {
    return HealthLog(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      bp: json['bp'] != null ? double.parse(json['bp'].toString()) : null,
      sugar: json['sugar'] != null ? double.parse(json['sugar'].toString()) : null,
      symptoms: json['symptoms'] as String?,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'bp': bp,
      'sugar': sugar,
      'symptoms': symptoms,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
