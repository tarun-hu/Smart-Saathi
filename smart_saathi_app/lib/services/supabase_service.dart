import 'package:supabase_flutter/supabase_flutter.dart';

class SOSAlert {
  final double latitude;
  final double longitude;
  final String message;
  final DateTime timestamp;

  SOSAlert({
    required this.latitude,
    required this.longitude,
    required this.message,
    required this.timestamp,
  });

  factory SOSAlert.fromMap(Map<String, dynamic> map) {
    return SOSAlert(
      latitude: map['latitude'] as double,
      longitude: map['longitude'] as double,
      message: map['message'] as String,
      timestamp: DateTime.parse(map['created_at'] as String),
    );
  }
}

class SupabaseService {
  static final _client = Supabase.instance.client;

  // --- Connection Management ---

  // Senior: Shows this to the caregiver
  static String getSeniorPairingCode() {
    final id = _client.auth.currentUser!.id;
    return id.substring(0, 8).toUpperCase();
  }

  // Caregiver: Input the 8 char pairing code
  static Future<void> pairWithSenior(String partialId) async {
    final curUser = _client.auth.currentUser!;
    
    // Find the senior
    final data = await _client.from('profiles')
        .select('id, role')
        .ilike('id', '${partialId.toLowerCase()}%')
        .eq('role', 'senior')
        .limit(1);
        
    if (data.isEmpty) {
      throw Exception('Senior not found with that code.');
    }
    
    final seniorId = data[0]['id'];
    
    // Insert into connections
    await _client.from('connections').insert({
      'senior_id': seniorId,
      'caregiver_id': curUser.id,
      'status': 'active', // For demo purposes, auto-approve
    });
  }

  // Check if Caregiver has any connections
  static Future<bool> hasConnections() async {
     final curUser = _client.auth.currentUser!;
     final data = await _client.from('connections')
         .select('id')
         .eq('caregiver_id', curUser.id)
         .limit(1);
     return data.isNotEmpty;
  }

  // --- Realtime SOS ---

  static Future<void> triggerSOS(double lat, double lng, String message) async {
    final curUser = _client.auth.currentUser!;
    await _client.from('alerts').insert({
      'senior_id': curUser.id,
      'latitude': lat,
      'longitude': lng,
      'message': message,
      'is_resolved': false,
    });
  }

  static Stream<List<Map<String, dynamic>>> listenToAlerts() {
    return _client.from('alerts').stream(primaryKey: ['id']).eq('is_resolved', false).order('created_at', ascending: false).limit(1);
  }
}
