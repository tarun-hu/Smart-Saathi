class Nominee {
  final String id;
  final String seniorId;
  final String name;
  final String whatsappNumber;
  final int position; // 1, 2, or 3

  Nominee({
    required this.id,
    required this.seniorId,
    required this.name,
    required this.whatsappNumber,
    required this.position,
  });

  factory Nominee.fromJson(Map<String, dynamic> json) {
    return Nominee(
      id: json['id'] as String,
      seniorId: json['senior_id'] as String,
      name: json['name'] as String,
      whatsappNumber: json['whatsapp_number'] as String,
      position: json['position'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'senior_id': seniorId,
      'name': name,
      'whatsapp_number': whatsappNumber,
      'position': position,
    };
  }
}
