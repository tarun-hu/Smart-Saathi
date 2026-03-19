class Connection {
  final String id;
  final String seniorId;
  final String caregiverId;
  final String status; // 'pending', 'active', 'rejected'
  final DateTime createdAt;

  Connection({
    required this.id,
    required this.seniorId,
    required this.caregiverId,
    required this.status,
    required this.createdAt,
  });

  factory Connection.fromJson(Map<String, dynamic> json) {
    return Connection(
      id: json['id'] as String,
      seniorId: json['senior_id'] as String,
      caregiverId: json['caregiver_id'] as String,
      status: json['status'] as String? ?? 'pending',
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'senior_id': seniorId,
      'caregiver_id': caregiverId,
      'status': status,
    };
  }
}
