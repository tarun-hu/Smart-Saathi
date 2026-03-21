class HydrationLog {
  final String id;
  final String userId;
  final int amount; // in ml
  final DateTime timestamp;

  HydrationLog({
    required this.id,
    required this.userId,
    required this.amount,
    required this.timestamp,
  });

  factory HydrationLog.fromJson(Map<String, dynamic> json) {
    return HydrationLog(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      amount: json['amount'] as int? ?? 250,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'amount': amount,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
