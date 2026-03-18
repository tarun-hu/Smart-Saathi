class Medication {
  final String id;
  final String userId;
  final String name;
  final String dose;
  final String time;
  final String status;

  Medication({
    required this.id,
    required this.userId,
    required this.name,
    required this.dose,
    required this.time,
    required this.status,
  });

  factory Medication.fromJson(Map<String, dynamic> json) {
    return Medication(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      name: json['name'] as String,
      dose: json['dose'] as String,
      time: json['time'] as String,
      status: json['status'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'dose': dose,
      'time': time,
      'status': status,
    };
  }
}
