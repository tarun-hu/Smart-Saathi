import 'package:supabase_flutter/supabase_flutter.dart';

class SOSAlert {
  final String id;
  final double latitude;
  final double longitude;
  final String message;
  final DateTime timestamp;

  SOSAlert({
    required this.id,
    required this.latitude,
    required this.longitude,
    required this.message,
    required this.timestamp,
  });

  factory SOSAlert.fromMap(Map<String, dynamic> map) {
    return SOSAlert(
      id: map['id'] as String,
      latitude: (map['latitude'] as num).toDouble(),
      longitude: (map['longitude'] as num).toDouble(),
      message: map['message'] as String,
      timestamp: DateTime.parse(map['created_at'] as String),
    );
  }
}

class SupabaseService {
  static final _client = Supabase.instance.client;

  // --- Profile Helpers ---

  /// Fetches the current user's full name from the profiles table.
  static Future<String> getCurrentUserName() async {
    final userId = _client.auth.currentUser!.id;
    try {
      final data = await _client.from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single();
      return (data['full_name'] as String?) ?? 'User';
    } catch (_) {
      return 'User';
    }
  }

  /// Fetches the connected senior's full name (for caregiver use).
  static Future<String> getConnectedSeniorName() async {
    final seniorId = await getConnectedSeniorId();
    if (seniorId == null) return 'Senior';
    try {
      final data = await _client.from('profiles')
          .select('full_name')
          .eq('id', seniorId)
          .single();
      return (data['full_name'] as String?) ?? 'Senior';
    } catch (_) {
      return 'Senior';
    }
  }

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

  /// Returns the senior_id that the current caregiver is paired with, or null.
  static Future<String?> getConnectedSeniorId() async {
    final curUser = _client.auth.currentUser!;
    final data = await _client.from('connections')
        .select('senior_id')
        .eq('caregiver_id', curUser.id)
        .limit(1);
    if (data.isEmpty) return null;
    return data[0]['senior_id'] as String;
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

  /// Listens only to alerts from the specified [seniorId].
  static Stream<List<Map<String, dynamic>>> listenToAlerts(String seniorId) {
    return _client
        .from('alerts')
        .stream(primaryKey: ['id'])
        .eq('senior_id', seniorId)
        .order('created_at', ascending: false)
        .limit(5);
  }

  /// Marks an alert as resolved so it stops triggering.
  static Future<void> resolveAlert(String alertId) async {
    await _client.from('alerts').update({
      'is_resolved': true,
    }).eq('id', alertId);
  }
}
