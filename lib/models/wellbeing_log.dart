class WellbeingLog {
  final String id;
  final String userId;
  final String mood; // happy, okay, sad, unwell
  final String? symptoms;
  final String? notes;
  final DateTime timestamp;

  WellbeingLog({
    required this.id,
    required this.userId,
    required this.mood,
    this.symptoms,
    this.notes,
    required this.timestamp,
  });

  factory WellbeingLog.fromJson(Map<String, dynamic> json) {
    return WellbeingLog(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      mood: json['mood'] as String? ?? 'okay',
      symptoms: json['symptoms'] as String?,
      notes: json['notes'] as String?,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'mood': mood,
      'symptoms': symptoms,
      'notes': notes,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
