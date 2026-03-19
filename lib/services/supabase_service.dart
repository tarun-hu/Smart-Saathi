import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/medication.dart';
import '../models/health_log.dart';
import '../models/family_member.dart';
import '../models/sos_event.dart';
import '../models/location_ping.dart';

final supabaseProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

final supabaseServiceProvider = Provider<SupabaseService>((ref) {
  final client = ref.watch(supabaseProvider);
  return SupabaseService(client);
});

// ──── PROFILE & ROLE PROVIDERS ─────────────────

final userProfileProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final client = ref.watch(supabaseProvider);
  if (client.auth.currentUser == null) return null;
  return await client
      .from('profiles')
      .select()
      .eq('id', client.auth.currentUser!.id)
      .maybeSingle();
});

final userRoleProvider = FutureProvider<String?>((ref) async {
  final profile = await ref.watch(userProfileProvider.future);
  return profile?['role'] as String?;
});

final linkedSeniorProfileProvider =
    FutureProvider<Map<String, dynamic>?>((ref) async {
  final service = ref.watch(supabaseServiceProvider);
  return await service.getLinkedSeniorProfile();
});

// ──── DATA STREAM PROVIDERS ────────────────────

final medicationsStreamProvider = StreamProvider<List<Medication>>((ref) {
  return ref.watch(supabaseServiceProvider).getMedicationsStream();
});

final healthLogsStreamProvider = StreamProvider<List<HealthLog>>((ref) {
  return ref.watch(supabaseServiceProvider).getHealthLogsStream();
});

final familyMembersStreamProvider = StreamProvider<List<FamilyMember>>((ref) {
  return ref.watch(supabaseServiceProvider).getFamilyMembersStream();
});

final alertsStreamProvider = StreamProvider<List<SosEvent>>((ref) {
  return ref.watch(supabaseServiceProvider).getAlertsStream();
});

final todayHydrationProvider = FutureProvider<int>((ref) async {
  return ref.watch(supabaseServiceProvider).getTodayHydration();
});

final connectionStatusProvider =
    FutureProvider<Map<String, dynamic>?>((ref) async {
  return ref.watch(supabaseServiceProvider).getConnectionStatus();
});

// ──── SERVICE CLASS ────────────────────────────

class SupabaseService {
  final SupabaseClient _client;
  SupabaseService(this._client);

  String? get _userId => _client.auth.currentUser?.id;

  /// Returns the target user ID for data operations.
  /// For seniors: returns own ID.
  /// For caregivers: returns their linked senior's ID.
  Future<String?> _getTargetId() async {
    if (_userId == null) return null;
    final profile =
        await _client.from('profiles').select().eq('id', _userId!).maybeSingle();
    if (profile == null) return _userId;

    if (profile['role'] == 'caregiver') {
      // First check linked_senior_id on profile
      final linkedId = profile['linked_senior_id'] as String?;
      if (linkedId != null) return linkedId;

      // Fallback: check connections table
      final conn = await _client
          .from('connections')
          .select()
          .eq('caregiver_id', _userId!)
          .eq('status', 'active')
          .maybeSingle();
      return conn?['senior_id'] as String?;
    }
    return _userId;
  }

  // ──── AUTH ─────────────────────────────────────

  Future<void> signIn(String email, String password) async {
    await _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signUpWithProfile(
      String email, String password, String fullName, String role) async {
    final response =
        await _client.auth.signUp(email: email, password: password);
    if (response.user != null) {
      final pairingCode = role == 'senior'
          ? (DateTime.now().millisecondsSinceEpoch % 1000000)
              .toString()
              .padLeft(6, '0')
          : null;
      await _client.from('profiles').insert({
        'id': response.user!.id,
        'full_name': fullName,
        'role': role,
        'pairing_code': pairingCode,
      });
    }
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  // ──── PROFILE ──────────────────────────────────

  Future<Map<String, dynamic>?> getProfile() async {
    if (_userId == null) return null;
    return await _client
        .from('profiles')
        .select()
        .eq('id', _userId!)
        .maybeSingle();
  }

  Future<void> updateProfile(Map<String, dynamic> updates) async {
    if (_userId == null) return;
    await _client.from('profiles').update(updates).eq('id', _userId!);
  }

  Future<Map<String, dynamic>?> getLinkedSeniorProfile() async {
    final targetId = await _getTargetId();
    if (targetId == null || targetId == _userId) return null;
    return await _client
        .from('profiles')
        .select()
        .eq('id', targetId)
        .maybeSingle();
  }

  // ──── PAIRING / CONNECTIONS ────────────────────

  Future<void> pairWithSenior(String code) async {
    if (_userId == null) return;

    // Find senior by pairing code
    final senior = await _client
        .from('profiles')
        .select()
        .eq('pairing_code', code)
        .eq('role', 'senior')
        .maybeSingle();
    if (senior == null) {
      throw Exception('Invalid pairing code or senior not found.');
    }

    final seniorId = senior['id'] as String;

    // Update linked_senior_id on caregiver profile
    await _client
        .from('profiles')
        .update({'linked_senior_id': seniorId}).eq('id', _userId!);

    // Create or update connection record
    final existing = await _client
        .from('connections')
        .select()
        .eq('caregiver_id', _userId!)
        .eq('senior_id', seniorId)
        .maybeSingle();

    if (existing == null) {
      await _client.from('connections').insert({
        'senior_id': seniorId,
        'caregiver_id': _userId,
        'status': 'active',
      });
    } else {
      await _client
          .from('connections')
          .update({'status': 'active'}).eq('id', existing['id']);
    }
  }

  Future<Map<String, dynamic>?> getConnectionStatus() async {
    if (_userId == null) return null;
    final profile = await getProfile();
    if (profile == null) return null;

    final role = profile['role'] as String?;
    if (role == 'caregiver') {
      final targetId = await _getTargetId();
      if (targetId != null && targetId != _userId) {
        final seniorProfile = await _client
            .from('profiles')
            .select()
            .eq('id', targetId)
            .maybeSingle();
        return {
          'connected': true,
          'senior_name': seniorProfile?['full_name'] ?? 'Senior',
          'senior_id': targetId,
        };
      }
      return {'connected': false};
    } else if (role == 'senior') {
      // Check if any caregiver is connected
      final conn = await _client
          .from('connections')
          .select()
          .eq('senior_id', _userId!)
          .eq('status', 'active')
          .maybeSingle();
      if (conn != null) {
        final caregiverProfile = await _client
            .from('profiles')
            .select()
            .eq('id', conn['caregiver_id'])
            .maybeSingle();
        return {
          'connected': true,
          'caregiver_name': caregiverProfile?['full_name'] ?? 'Caregiver',
          'caregiver_id': conn['caregiver_id'],
        };
      }
      return {'connected': false};
    }
    return null;
  }

  // ──── MEDICATIONS ──────────────────────────────

  Stream<List<Medication>> getMedicationsStream() async* {
    final targetId = await _getTargetId();
    if (targetId == null) {
      yield [];
      return;
    }
    yield* _client
        .from('medications')
        .stream(primaryKey: ['id'])
        .eq('user_id', targetId)
        .map((maps) => maps.map((m) => Medication.fromJson(m)).toList());
  }

  Future<void> addMedication(String name, String dose, String time,
      {String frequency = 'daily'}) async {
    final targetId = await _getTargetId();
    if (targetId == null) return;
    await _client.from('medications').insert({
      'user_id': targetId,
      'name': name,
      'dose': dose,
      'time': time,
      'frequency': frequency,
      'status': 'pending',
    });
  }

  Future<void> updateMedicationStatus(String id, String status) async {
    final update = <String, dynamic>{'status': status};
    if (status == 'taken') update['taken_at'] = DateTime.now().toIso8601String();
    await _client.from('medications').update(update).eq('id', id);
  }

  Future<void> deleteMedication(String id) async {
    await _client.from('medications').delete().eq('id', id);
  }

  // ──── HEALTH LOGS ──────────────────────────────

  Stream<List<HealthLog>> getHealthLogsStream() async* {
    final targetId = await _getTargetId();
    if (targetId == null) {
      yield [];
      return;
    }
    yield* _client
        .from('health_logs')
        .stream(primaryKey: ['id'])
        .eq('user_id', targetId)
        .order('timestamp', ascending: false)
        .map((maps) => maps.map((m) => HealthLog.fromJson(m)).toList());
  }

  Future<void> addHealthLog(
      {double? bp,
      double? sugar,
      double? temperature,
      String? symptoms}) async {
    if (_userId == null) return;
    await _client.from('health_logs').insert({
      'user_id': _userId,
      'bp': bp,
      'sugar': sugar,
      'temperature': temperature,
      'symptoms': symptoms,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  // ──── HYDRATION ────────────────────────────────

  Future<int> getTodayHydration() async {
    final targetId = await _getTargetId();
    if (targetId == null) return 0;
    final today = DateTime.now().toIso8601String().substring(0, 10);
    final result = await _client
        .from('hydration_logs')
        .select('glasses')
        .eq('user_id', targetId)
        .eq('date', today);
    int total = 0;
    for (final row in result) {
      total += (row['glasses'] as int? ?? 1);
    }
    return total;
  }

  Future<void> addHydrationGlass() async {
    if (_userId == null) return;
    final today = DateTime.now().toIso8601String().substring(0, 10);
    await _client.from('hydration_logs').insert({
      'user_id': _userId,
      'glasses': 1,
      'date': today,
    });
  }

  // ──── ALERTS (SOS) ─────────────────────────────

  Future<void> triggerSOS(double lat, double lng, {String? message}) async {
    if (_userId == null) return;
    await _client.from('alerts').insert({
      'senior_id': _userId,
      'latitude': lat,
      'longitude': lng,
      'message': message ?? 'Emergency SOS',
    });
    // Also insert into sos_events for backward compat
    await _client.from('sos_events').insert({
      'user_id': _userId,
      'latitude': lat,
      'longitude': lng,
      'message': message ?? 'Emergency SOS',
    });
  }

  Stream<List<SosEvent>> getAlertsStream() async* {
    final targetId = await _getTargetId();
    if (targetId == null) {
      yield [];
      return;
    }
    yield* _client
        .from('sos_events')
        .stream(primaryKey: ['id'])
        .eq('user_id', targetId)
        .order('created_at', ascending: false)
        .map((maps) => maps.map((m) => SosEvent.fromJson(m)).toList());
  }

  Future<void> resolveAlert(String alertId) async {
    await _client.from('sos_events').update({
      'is_resolved': true,
      'responded_at': DateTime.now().toIso8601String(),
    }).eq('id', alertId);
    // Also resolve in alerts table if exists
    try {
      await _client.from('alerts').update({
        'is_resolved': true,
      }).eq('id', alertId);
    } catch (_) {}
  }

  // ──── FAMILY ───────────────────────────────────

  Stream<List<FamilyMember>> getFamilyMembersStream() async* {
    final targetId = await _getTargetId();
    if (targetId == null) {
      yield [];
      return;
    }
    yield* _client
        .from('family_members')
        .stream(primaryKey: ['id'])
        .eq('user_id', targetId)
        .map((maps) => maps.map((m) => FamilyMember.fromJson(m)).toList());
  }

  Future<void> addFamilyMember(
      String name, String phone, String relation) async {
    if (_userId == null) return;
    await _client.from('family_members').insert({
      'user_id': _userId,
      'name': name,
      'phone': phone,
      'relation': relation,
    });
  }

  Future<void> deleteFamilyMember(String id) async {
    await _client.from('family_members').delete().eq('id', id);
  }

  // ──── LOCATION PINGS ──────────────────────────

  Future<void> sendLocationPing(double lat, double lng,
      {String? address}) async {
    if (_userId == null) return;
    await _client.from('location_pings').insert({
      'senior_id': _userId,
      'latitude': lat,
      'longitude': lng,
      'address': address,
    });
  }

  Future<LocationPing?> getLatestSeniorLocation() async {
    final targetId = await _getTargetId();
    if (targetId == null) return null;
    final result = await _client
        .from('location_pings')
        .select()
        .eq('senior_id', targetId)
        .order('created_at', ascending: false)
        .limit(1)
        .maybeSingle();
    if (result == null) return null;
    return LocationPing.fromJson(result);
  }

  // ──── CAREGIVER SUMMARY HELPERS ────────────────

  Future<int> getPendingMedsCount() async {
    final targetId = await _getTargetId();
    if (targetId == null) return 0;
    final result = await _client
        .from('medications')
        .select('id')
        .eq('user_id', targetId)
        .eq('status', 'pending');
    return result.length;
  }

  Future<int> getActiveAlertsCount() async {
    final targetId = await _getTargetId();
    if (targetId == null) return 0;
    final result = await _client
        .from('sos_events')
        .select('id')
        .eq('user_id', targetId)
        .eq('is_resolved', false);
    return result.length;
  }

  Future<HealthLog?> getLatestHealthLog() async {
    final targetId = await _getTargetId();
    if (targetId == null) return null;
    final result = await _client
        .from('health_logs')
        .select()
        .eq('user_id', targetId)
        .order('timestamp', ascending: false)
        .limit(1)
        .maybeSingle();
    if (result == null) return null;
    return HealthLog.fromJson(result);
  }
}
