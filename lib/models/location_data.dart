/// Data model representing a single location ping from a senior's device.
class LocationData {
  final String? id;
  final String seniorId;
  final double latitude;
  final double longitude;
  final String? address;
  final DateTime timestamp;

  LocationData({
    this.id,
    required this.seniorId,
    required this.latitude,
    required this.longitude,
    this.address,
    required this.timestamp,
  });

  factory LocationData.fromMap(Map<String, dynamic> map) {
    return LocationData(
      id: map['id'] as String?,
      seniorId: map['senior_id'] as String,
      latitude: (map['latitude'] as num).toDouble(),
      longitude: (map['longitude'] as num).toDouble(),
      address: map['address'] as String?,
      timestamp: DateTime.parse(map['created_at'] as String),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'senior_id': seniorId,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
    };
  }
}
