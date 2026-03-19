import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/medication.dart';
import '../models/health_log.dart';
import '../models/family_member.dart';
import '../models/sos_event.dart';

final supabaseProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

final supabaseServiceProvider = Provider<SupabaseService>((ref) {
  final client = ref.watch(supabaseProvider);
  return SupabaseService(client);
});

final userProfileProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final client = ref.watch(supabaseProvider);
  if (client.auth.currentUser == null) return null;
  return await client.from('profiles').select().eq('id', client.auth.currentUser!.id).maybeSingle();
});

final medicationsStreamProvider = StreamProvider<List<Medication>>((ref) {
  return ref.watch(supabaseServiceProvider).getMedicationsStream();
});

final healthLogsStreamProvider = StreamProvider<List<HealthLog>>((ref) {
  return ref.watch(supabaseServiceProvider).getHealthLogsStream();
});

final familyMembersStreamProvider = StreamProvider<List<FamilyMember>>((ref) {
  return ref.watch(supabaseServiceProvider).getFamilyMembersStream();
});

final sosEventsStreamProvider = StreamProvider<List<SosEvent>>((ref) {
  return ref.watch(supabaseServiceProvider).getSosEventsStream();
});

final todayHydrationProvider = FutureProvider<int>((ref) async {
  return ref.watch(supabaseServiceProvider).getTodayHydration();
});

class SupabaseService {
  final SupabaseClient _client;
  SupabaseService(this._client);

  String? get _userId => _client.auth.currentUser?.id;

  Future<String?> _getTargetId() async {
    if (_userId == null) return null;
    final profile = await _client.from('profiles').select().eq('id', _userId!).maybeSingle();
    if (profile != null && profile['role'] == 'caregiver') {
      return profile['linked_senior_id'] as String?;
    }
    return _userId;
  }

  // ──── AUTH ─────────────────────────────────────

  Future<void> signIn(String email, String password) async {
    await _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signUpWithProfile(String email, String password, String fullName, String role) async {
    final response = await _client.auth.signUp(email: email, password: password);
    if (response.user != null) {
      final pairingCode = role == 'senior'
          ? (DateTime.now().millisecondsSinceEpoch % 1000000).toString().padLeft(6, '0')
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

  Future<void> pairWithSenior(String code) async {
    if (_userId == null) return;
    final senior = await _client.from('profiles').select().eq('pairing_code', code).eq('role', 'senior').maybeSingle();
    if (senior == null) throw Exception("Invalid Pairing Code or Senior not found.");
    await _client.from('profiles').update({'linked_senior_id': senior['id']}).eq('id', _userId!);
  }

  // ──── MEDICATIONS ──────────────────────────────

  Stream<List<Medication>> getMedicationsStream() async* {
    final targetId = await _getTargetId();
    if (targetId == null) { yield []; return; }
    yield* _client
        .from('medications')
        .stream(primaryKey: ['id'])
        .eq('user_id', targetId)
        .map((maps) => maps.map((m) => Medication.fromJson(m)).toList());
  }

  Future<void> addMedication(String name, String dose, String time, {String frequency = 'daily'}) async {
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
    if (targetId == null) { yield []; return; }
    yield* _client
        .from('health_logs')
        .stream(primaryKey: ['id'])
        .eq('user_id', targetId)
        .order('timestamp', ascending: false)
        .map((maps) => maps.map((m) => HealthLog.fromJson(m)).toList());
  }

  Future<void> addHealthLog({double? bp, double? sugar, double? temperature, String? symptoms}) async {
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
    if (_userId == null) return 0;
    final today = DateTime.now().toIso8601String().substring(0, 10);
    final result = await _client
        .from('hydration_logs')
        .select('glasses')
        .eq('user_id', _userId!)
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

  // ──── SOS ──────────────────────────────────────

  Future<void> triggerSOS(double lat, double lng, {String? message}) async {
    if (_userId == null) return;
    await _client.from('sos_events').insert({
      'user_id': _userId,
      'latitude': lat,
      'longitude': lng,
      'message': message ?? 'Emergency SOS',
    });
    // Also log in health_logs for backward compatibility
    await _client.from('health_logs').insert({
      'user_id': _userId,
      'symptoms': 'SOS TRIGGERED AT $lat, $lng',
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  Stream<List<SosEvent>> getSosEventsStream() async* {
    final targetId = await _getTargetId();
    if (targetId == null) { yield []; return; }
    yield* _client
        .from('sos_events')
        .stream(primaryKey: ['id'])
        .eq('user_id', targetId)
        .order('created_at', ascending: false)
        .map((maps) => maps.map((m) => SosEvent.fromJson(m)).toList());
  }

  // ──── FAMILY ───────────────────────────────────

  Stream<List<FamilyMember>> getFamilyMembersStream() async* {
    final targetId = await _getTargetId();
    if (targetId == null) { yield []; return; }
    yield* _client
        .from('family_members')
        .stream(primaryKey: ['id'])
        .eq('user_id', targetId)
        .map((maps) => maps.map((m) => FamilyMember.fromJson(m)).toList());
  }

  Future<void> addFamilyMember(String name, String phone, String relation) async {
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
}
