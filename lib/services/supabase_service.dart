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

  Future<void> signUp(String email, String password) async {
    await _client.auth.signUp(email: email, password: password);
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  Stream<List<Medication>> getMedicationsStream() {
    if (_client.auth.currentUser == null) return const Stream.empty();
    return _client
        .from('medications')
        .stream(primaryKey: ['id'])
        .eq('user_id', _client.auth.currentUser!.id)
        .map((maps) => maps.map((map) => Medication.fromJson(map)).toList());
  }

  Stream<List<HealthLog>> getHealthLogsStream() {
    if (_client.auth.currentUser == null) return const Stream.empty();
    return _client
        .from('health_logs')
        .stream(primaryKey: ['id'])
        .eq('user_id', _client.auth.currentUser!.id)
        .order('timestamp', ascending: false)
        .map((maps) => maps.map((map) => HealthLog.fromJson(map)).toList());
  }

  Stream<List<FamilyMember>> getFamilyMembersStream() {
    if (_client.auth.currentUser == null) return const Stream.empty();
    return _client
        .from('family_members')
        .stream(primaryKey: ['id'])
        .eq('user_id', _client.auth.currentUser!.id)
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
}
