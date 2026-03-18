import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/medication.dart';
import '../models/health_log.dart';
import '../models/family_member.dart';

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

class SupabaseService {
  final SupabaseClient _client;

  SupabaseService(this._client);

  Future<void> signIn(String email, String password) async {
    await _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signUpWithProfile(String email, String password, String fullName, String role) async {
    final response = await _client.auth.signUp(email: email, password: password);
    if (response.user != null) {
      final pairingCode = role == 'senior' ? (DateTime.now().millisecondsSinceEpoch % 1000000).toString().padLeft(6, '0') : null;
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

  Stream<List<Medication>> getMedicationsStream() async* {
    if (_client.auth.currentUser == null) return;
    
    // Get profile to check role and linked senior
    final profile = await _client.from('profiles').select().eq('id', _client.auth.currentUser!.id).maybeSingle();
    final targetId = (profile != null && profile['role'] == 'caregiver') ? profile['linked_senior_id'] : _client.auth.currentUser!.id;
    
    if (targetId == null) {
      yield [];
      return;
    }

    yield* _client
        .from('medications')
        .stream(primaryKey: ['id'])
        .eq('user_id', targetId)
        .map((maps) => maps.map((map) => Medication.fromJson(map)).toList());
  }

  Stream<List<HealthLog>> getHealthLogsStream() async* {
    if (_client.auth.currentUser == null) return;

    final profile = await _client.from('profiles').select().eq('id', _client.auth.currentUser!.id).maybeSingle();
    final targetId = (profile != null && profile['role'] == 'caregiver') ? profile['linked_senior_id'] : _client.auth.currentUser!.id;

    if (targetId == null) {
      yield [];
      return;
    }

    yield* _client
        .from('health_logs')
        .stream(primaryKey: ['id'])
        .eq('user_id', targetId)
        .order('timestamp', ascending: false)
        .map((maps) => maps.map((map) => HealthLog.fromJson(map)).toList());
  }

  Stream<List<FamilyMember>> getFamilyMembersStream() async* {
    if (_client.auth.currentUser == null) return;

    final profile = await _client.from('profiles').select().eq('id', _client.auth.currentUser!.id).maybeSingle();
    final targetId = (profile != null && profile['role'] == 'caregiver') ? profile['linked_senior_id'] : _client.auth.currentUser!.id;

    if (targetId == null) {
      yield [];
      return;
    }

    yield* _client
        .from('family_members')
        .stream(primaryKey: ['id'])
        .eq('user_id', targetId)
        .map((maps) => maps.map((map) => FamilyMember.fromJson(map)).toList());
  }

  Future<void> updateMedicationStatus(String id, String status) async {
    await _client.from('medications').update({'status': status}).eq('id', id);
  }

  Future<void> triggerSOS(double lat, double lng) async {
    if (_client.auth.currentUser == null) return;
    // Notify family via Realtime or Edge function call
    await _client.from('health_logs').insert({
      'user_id': _client.auth.currentUser!.id,
      'symptoms': 'SOS TRIGGERED AT $lat, $lng',
      'timestamp': DateTime.now().toIso8601String()
    });
  }

  Future<void> addHealthLog(String intentMsg) async {
    if (_client.auth.currentUser == null) return;
    await _client.from('health_logs').insert({
      'user_id': _client.auth.currentUser!.id,
      'symptoms': intentMsg,
      'timestamp': DateTime.now().toIso8601String()
    });
  }

  Future<void> pairWithSenior(String code) async {
    if (_client.auth.currentUser == null) return;
    
    // Find senior with this code
    final senior = await _client.from('profiles').select().eq('pairing_code', code).eq('role', 'senior').maybeSingle();
    
    if (senior == null) throw Exception("Invalid Pairing Code or Senior not found.");
    
    await _client.from('profiles').update({
      'linked_senior_id': senior['id']
    }).eq('id', _client.auth.currentUser!.id);
  }

  Future<void> addFamilyMember(String name, String phone, String relation) async {
    if (_client.auth.currentUser == null) return;
    await _client.from('family_members').insert({
      'user_id': _client.auth.currentUser!.id,
      'name': name,
      'phone': phone,
      'relation': relation,
    });
  }
}
