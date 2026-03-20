class Medication {
  final String id;
  final String userId;
  final String name;
  final String dosage;
  final String time; // e.g. "08:00"
  final String frequency; // daily, weekly, etc.
  final String status; // pending, taken, skipped
  final DateTime? takenAt;

  Medication({
    required this.id,
    required this.userId,
    required this.name,
    required this.dosage,
    required this.time,
    this.frequency = 'daily',
    this.status = 'pending',
    this.takenAt,
  });

  factory Medication.fromJson(Map<String, dynamic> json) {
    return Medication(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      name: json['name'] as String,
      dosage: (json['dosage'] ?? json['dose'] ?? '') as String,
      time: json['time'] as String,
      frequency: json['frequency'] as String? ?? 'daily',
      status: json['status'] as String? ?? 'pending',
      takenAt: json['taken_at'] != null
          ? DateTime.parse(json['taken_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'name': name,
      'dosage': dosage,
      'time': time,
      'frequency': frequency,
      'status': status,
      'taken_at': takenAt?.toIso8601String(),
    };
  }
}
