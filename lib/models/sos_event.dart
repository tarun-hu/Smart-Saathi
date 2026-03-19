class SosEvent {
  final String id;
  final String userId;
  final double? latitude;
  final double? longitude;
  final String? vitalsSnapshot;
  final String? message;
  final bool isResolved;
  final DateTime? respondedAt;
  final DateTime createdAt;

  SosEvent({
    required this.id,
    required this.userId,
    this.latitude,
    this.longitude,
    this.vitalsSnapshot,
    this.message,
    this.isResolved = false,
    this.respondedAt,
    required this.createdAt,
  });

  factory SosEvent.fromJson(Map<String, dynamic> json) {
    return SosEvent(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
      vitalsSnapshot: json['vitals_snapshot'] as String?,
      message: json['message'] as String?,
      isResolved: json['is_resolved'] as bool? ?? false,
      respondedAt: json['responded_at'] != null ? DateTime.parse(json['responded_at'] as String) : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
