class SosEvent {
  final String id;
  final String userId;
  final double lat;
  final double lng;
  final DateTime timestamp;
  final bool messageSent;

  SosEvent({
    required this.id,
    required this.userId,
    required this.lat,
    required this.lng,
    required this.timestamp,
    this.messageSent = false,
  });

  factory SosEvent.fromJson(Map<String, dynamic> json) {
    return SosEvent(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      lat: (json['lat'] as num?)?.toDouble() ?? 0.0,
      lng: (json['lng'] as num?)?.toDouble() ?? 0.0,
      timestamp: DateTime.parse(json['timestamp'] as String),
      messageSent: json['message_sent'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'lat': lat,
      'lng': lng,
      'timestamp': timestamp.toIso8601String(),
      'message_sent': messageSent,
    };
  }
}
