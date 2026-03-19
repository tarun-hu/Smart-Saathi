class HydrationLog {
  final String id;
  final String userId;
  final int glasses;
  final DateTime date;
  final DateTime createdAt;

  HydrationLog({
    required this.id,
    required this.userId,
    required this.glasses,
    required this.date,
    required this.createdAt,
  });

  factory HydrationLog.fromJson(Map<String, dynamic> json) {
    return HydrationLog(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      glasses: json['glasses'] as int? ?? 1,
      date: DateTime.parse(json['date'] as String),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
