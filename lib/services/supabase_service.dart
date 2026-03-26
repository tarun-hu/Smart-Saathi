import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/medication.dart';
import '../models/nominee.dart';
import '../models/hydration_log.dart';
import '../models/wellbeing_log.dart';
import '../models/sos_event.dart';
import '../models/health_report.dart';
import '../models/vital_log.dart';

class SupabaseService {
  final SupabaseClient _client;
  SupabaseService(this._client);

  static SupabaseService get instance =>
      SupabaseService(Supabase.instance.client);

  String? get userId => _client.auth.currentUser?.id;

  // ──── AUTH ─────────────────────────────────────

  Future<void> signIn(String email, String password) async {
    await _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signUp(String email, String password, String fullName) async {
    final response =
        await _client.auth.signUp(email: email, password: password);
    if (response.user != null) {
      await _client.from('profiles').insert({
        'id': response.user!.id,
        'full_name': fullName,
        'role': 'senior',
      });
    }
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  // ──── PROFILE ──────────────────────────────────

  Future<Map<String, dynamic>?> getProfile() async {
    if (userId == null) return null;
    return await _client
        .from('profiles')
        .select()
        .eq('id', userId!)
        .maybeSingle();
  }

  Future<void> updateProfile(Map<String, dynamic> updates) async {
    if (userId == null) return;
    await _client.from('profiles').update(updates).eq('id', userId!);
  }

  // ──── NOMINEES ─────────────────────────────────

  Future<List<Nominee>> getNominees() async {
    if (userId == null) return [];
    final result = await _client
        .from('nominees')
        .select()
        .eq('senior_id', userId!)
        .order('position');
    return result.map<Nominee>((m) => Nominee.fromJson(m)).toList();
  }

  Future<void> addNominee(String name, String whatsappNumber, int position) async {
    if (userId == null) return;
    await _client.from('nominees').insert({
      'senior_id': userId!,
      'name': name,
      'whatsapp_number': whatsappNumber,
      'position': position,
    });
  }

  Future<void> updateNominee(String id, String name, String whatsappNumber) async {
    await _client.from('nominees').update({
      'name': name,
      'whatsapp_number': whatsappNumber,
    }).eq('id', id);
  }

  Future<void> deleteNominee(String id) async {
    await _client.from('nominees').delete().eq('id', id);
  }

  Future<void> saveAllNominees(List<Map<String, String>> nominees) async {
    if (userId == null) return;
    for (int i = 0; i < nominees.length; i++) {
      await _client.from('nominees').insert({
        'senior_id': userId!,
        'name': nominees[i]['name'],
        'whatsapp_number': nominees[i]['whatsapp'],
        'position': i + 1,
      });
    }
  }

  // ──── MEDICATIONS ──────────────────────────────

  Stream<List<Medication>> getMedicationsStream() {
    if (userId == null) return Stream.value([]);
    return _client
        .from('medications')
        .stream(primaryKey: ['id'])
        .eq('user_id', userId!)
        .map((maps) => maps.map((m) => Medication.fromJson(m)).toList());
  }

  Future<List<Medication>> getMedications() async {
    if (userId == null) return [];
    final result = await _client
        .from('medications')
        .select()
        .eq('user_id', userId!)
        .order('time');
    return result.map<Medication>((m) => Medication.fromJson(m)).toList();
  }

  Future<void> addMedication(
      String name, String dosage, String time, String frequency) async {
    if (userId == null) return;
    await _client.from('medications').insert({
      'user_id': userId!,
      'name': name,
      'dosage': dosage,
      'time': time,
      'frequency': frequency,
      'status': 'pending',
    });
  }

  Future<void> updateMedication(
      String id, String name, String dosage, String time, String frequency) async {
    await _client.from('medications').update({
      'name': name,
      'dosage': dosage,
      'time': time,
      'frequency': frequency,
    }).eq('id', id);
  }

  Future<void> updateMedicationStatus(String id, String status) async {
    final update = <String, dynamic>{'status': status};
    if (status == 'taken') {
      update['taken_at'] = DateTime.now().toIso8601String();
    }
    await _client.from('medications').update(update).eq('id', id);
  }

  Future<void> deleteMedication(String id) async {
    await _client.from('medications').delete().eq('id', id);
  }

  // ──── HYDRATION ────────────────────────────────

  Future<int> getTodayHydration() async {
    if (userId == null) return 0;
    final now = DateTime.now();
    final startOfDay = DateTime(now.year, now.month, now.day).toIso8601String();
    final result = await _client
        .from('hydration_logs')
        .select('amount')
        .eq('user_id', userId!)
        .gte('timestamp', startOfDay);
    int total = 0;
    for (final row in result) {
      total += (row['amount'] as int? ?? 250);
    }
    return total;
  }

  Future<List<HydrationLog>> getTodayHydrationLogs() async {
    if (userId == null) return [];
    final now = DateTime.now();
    final startOfDay = DateTime(now.year, now.month, now.day).toIso8601String();
    final result = await _client
        .from('hydration_logs')
        .select()
        .eq('user_id', userId!)
        .gte('timestamp', startOfDay)
        .order('timestamp', ascending: false);
    return result.map<HydrationLog>((m) => HydrationLog.fromJson(m)).toList();
  }

  Future<void> addHydration(int amountMl) async {
    if (userId == null) return;
    await _client.from('hydration_logs').insert({
      'user_id': userId!,
      'amount': amountMl,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  // ──── WELLBEING ────────────────────────────────

  Future<void> addWellbeingLog(String mood, {String? symptoms, String? notes}) async {
    if (userId == null) return;
    await _client.from('wellbeing_logs').insert({
      'user_id': userId!,
      'mood': mood,
      'symptoms': symptoms,
      'notes': notes,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  Future<List<WellbeingLog>> getWellbeingLogs({int limit = 30}) async {
    if (userId == null) return [];
    final result = await _client
        .from('wellbeing_logs')
        .select()
        .eq('user_id', userId!)
        .order('timestamp', ascending: false)
        .limit(limit);
    return result.map<WellbeingLog>((m) => WellbeingLog.fromJson(m)).toList();
  }

  Future<WellbeingLog?> getTodayWellbeing() async {
    if (userId == null) return null;
    final now = DateTime.now();
    final startOfDay = DateTime(now.year, now.month, now.day).toIso8601String();
    final result = await _client
        .from('wellbeing_logs')
        .select()
        .eq('user_id', userId!)
        .gte('timestamp', startOfDay)
        .order('timestamp', ascending: false)
        .limit(1)
        .maybeSingle();
    if (result == null) return null;
    return WellbeingLog.fromJson(result);
  }

  // ──── HEALTH REPORTS ───────────────────────────

  Future<String> uploadReportImage(File imageFile) async {
    if (userId == null) throw Exception('Not logged in');
    final fileName =
        '$userId/${DateTime.now().millisecondsSinceEpoch}.jpg';
    await _client.storage.from('health-reports').upload(fileName, imageFile);
    return _client.storage.from('health-reports').getPublicUrl(fileName);
  }

  Future<void> addHealthReport(String name, String imageUrl) async {
    if (userId == null) return;
    await _client.from('health_reports').insert({
      'user_id': userId!,
      'name': name,
      'image_url': imageUrl,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  Future<List<HealthReport>> getHealthReports({int limit = 20}) async {
    if (userId == null) return [];
    final result = await _client
        .from('health_reports')
        .select()
        .eq('user_id', userId!)
        .order('timestamp', ascending: false)
        .limit(limit);
    return result.map<HealthReport>((m) => HealthReport.fromJson(m)).toList();
  }

  Future<void> deleteHealthReport(String id) async {
    await _client.from('health_reports').delete().eq('id', id);
  }

  // ──── VITAL LOGS ───────────────────────────────

  Future<void> addVitalLog({
    required String type,
    double? value,
    int? systolic,
    int? diastolic,
  }) async {
    if (userId == null) return;
    await _client.from('vital_logs').insert({
      'user_id': userId!,
      'type': type,
      'value': value,
      'systolic': systolic,
      'diastolic': diastolic,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  Future<List<VitalLog>> getVitalLogs({int limit = 30}) async {
    if (userId == null) return [];
    final result = await _client
        .from('vital_logs')
        .select()
        .eq('user_id', userId!)
        .order('timestamp', ascending: false)
        .limit(limit);
    return result.map<VitalLog>((m) => VitalLog.fromJson(m)).toList();
  }

  Future<List<VitalLog>> getTodayVitals() async {
    if (userId == null) return [];
    final now = DateTime.now();
    final startOfDay = DateTime(now.year, now.month, now.day).toIso8601String();
    final result = await _client
        .from('vital_logs')
        .select()
        .eq('user_id', userId!)
        .gte('timestamp', startOfDay)
        .order('timestamp', ascending: false);
    return result.map<VitalLog>((m) => VitalLog.fromJson(m)).toList();
  }

  // ──── SOS EVENTS ───────────────────────────────

  Future<void> logSosEvent(double lat, double lng) async {
    if (userId == null) return;
    await _client.from('sos_events').insert({
      'user_id': userId!,
      'lat': lat,
      'lng': lng,
      'timestamp': DateTime.now().toIso8601String(),
      'message_sent': true,
    });
  }

  Future<List<SosEvent>> getSosHistory({int limit = 20}) async {
    if (userId == null) return [];
    final result = await _client
        .from('sos_events')
        .select()
        .eq('user_id', userId!)
        .order('timestamp', ascending: false)
        .limit(limit);
    return result.map<SosEvent>((m) => SosEvent.fromJson(m)).toList();
  }

  // ──── SUMMARY HELPERS ──────────────────────────

  Future<int> getPendingMedsCount() async {
    if (userId == null) return 0;
    final result = await _client
        .from('medications')
        .select('id')
        .eq('user_id', userId!)
        .eq('status', 'pending');
    return result.length;
  }

  Future<int> getTakenMedsCount() async {
    if (userId == null) return 0;
    final result = await _client
        .from('medications')
        .select('id')
        .eq('user_id', userId!)
        .eq('status', 'taken');
    return result.length;
  }
}
