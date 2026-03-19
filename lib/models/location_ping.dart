class LocationPing {
  final String id;
  final String seniorId;
  final double latitude;
  final double longitude;
  final String? address;
  final DateTime createdAt;

  LocationPing({
    required this.id,
    required this.seniorId,
    required this.latitude,
    required this.longitude,
    this.address,
    required this.createdAt,
  });

  factory LocationPing.fromJson(Map<String, dynamic> json) {
    return LocationPing(
      id: json['id'] as String,
      seniorId: json['senior_id'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'senior_id': seniorId,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
    };
  }
}
