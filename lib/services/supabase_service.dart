import 'dart:convert';
import 'dart:io';
import 'dart:math' as math;
import 'package:shared_preferences/shared_preferences.dart';
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

  static const _vitalsTimezoneFixInstalledAtKey =
      'vitals_timezone_fix_installed_at_v1';
  static const _fixedVitalRowIdsKey = 'vitals_timezone_fixed_row_ids_v1';

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

  Future<Medication> addMedication(
      String name, String dosage, String time, String frequency) async {
    if (userId == null) {
      throw Exception('Please log in again to add medication.');
    }
    final inserted = await _insertMedicationWithDoseFallback({
      'user_id': userId!,
      'name': name,
      'time': time,
      'frequency': frequency,
      'status': 'pending',
    }, dosage);
    return Medication.fromJson(_normalizeMedicationRow(inserted));
  }

  Future<void> updateMedication(
      String id, String name, String dosage, String time, String frequency) async {
    await _updateMedicationWithDoseFallback(id, {
      'name': name,
      'time': time,
      'frequency': frequency,
    }, dosage);
  }

  Future<Map<String, dynamic>> _insertMedicationWithDoseFallback(
      Map<String, dynamic> payload, String dosage) async {
    try {
      return await _client.from('medications').insert({
        ...payload,
        'dose': dosage,
      }).select().single();
    } on PostgrestException catch (e) {
      if (!_isMedicationDoseSchemaMismatch(e)) rethrow;
      return await _client.from('medications').insert({
        ...payload,
        'dosage': dosage,
      }).select().single();
    }
  }

  Future<void> _updateMedicationWithDoseFallback(
      String id, Map<String, dynamic> payload, String dosage) async {
    try {
      await _client.from('medications').update({
        ...payload,
        'dose': dosage,
      }).eq('id', id);
    } on PostgrestException catch (e) {
      if (!_isMedicationDoseSchemaMismatch(e)) rethrow;
      await _client.from('medications').update({
        ...payload,
        'dosage': dosage,
      }).eq('id', id);
    }
  }

  bool _isMedicationDoseSchemaMismatch(PostgrestException e) {
    final details = '${e.message} ${e.details ?? ''} ${e.hint ?? ''}'.toLowerCase();
    return details.contains('dose') || details.contains('dosage');
  }

  Map<String, dynamic> _normalizeMedicationRow(Map<String, dynamic> row) {
    if (row.containsKey('dosage') || !row.containsKey('dose')) return row;
    return {
      ...row,
      'dosage': row['dose'],
    };
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
    // Start of local day, converted to UTC for database comparison
    final startOfDayLocal = DateTime(now.year, now.month, now.day);
    final startOfDayUtc = startOfDayLocal.toUtc().toIso8601String();
    
    final result = await _client
        .from('hydration_logs')
        .select('amount')
        .eq('user_id', userId!)
        .gte('timestamp', startOfDayUtc);
        
    int total = 0;
    for (final row in result) {
      total += (row['amount'] as int? ?? 250);
    }
    return total;
  }

  Future<List<HydrationLog>> getTodayHydrationLogs() async {
    if (userId == null) return [];
    
    final now = DateTime.now();
    final startOfDayLocal = DateTime(now.year, now.month, now.day);
    final startOfDayUtc = startOfDayLocal.toUtc().toIso8601String();
    
    final result = await _client
        .from('hydration_logs')
        .select()
        .eq('user_id', userId!)
        .gte('timestamp', startOfDayUtc)
        .order('timestamp', ascending: false);
        
    return result.map<HydrationLog>((m) => HydrationLog.fromJson(m)).toList();
  }

  Future<void> addHydration(int amountMl) async {
    if (userId == null) return;
    await _client.from('hydration_logs').insert({
      'user_id': userId!,
      'amount': amountMl,
      'timestamp': DateTime.now().toUtc().toIso8601String(),
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

  /// Upload a single report image and return its public URL.
  Future<String> uploadReportImage(File imageFile) async {
    if (userId == null) throw Exception('Not logged in');
    final fileName =
        '$userId/${DateTime.now().millisecondsSinceEpoch}.jpg';
    await _client.storage.from('health-reports').upload(fileName, imageFile);
    return _client.storage.from('health-reports').getPublicUrl(fileName);
  }

  /// Upload multiple report images and return list of public URLs.
  Future<List<String>> uploadReportImages(List<File> imageFiles) async {
    if (userId == null) throw Exception('Not logged in');
    final urls = <String>[];
    for (int i = 0; i < imageFiles.length; i++) {
      final fileName =
          '$userId/${DateTime.now().millisecondsSinceEpoch}_$i.jpg';
      await _client.storage.from('health-reports').upload(fileName, imageFiles[i]);
      final url = _client.storage.from('health-reports').getPublicUrl(fileName);
      urls.add(url);
    }
    return urls;
  }

  /// Add a health report with multiple image URLs stored as JSON array.
  Future<void> addHealthReport(String name, String imageUrlOrJson, {String? aiSummary}) async {
    if (userId == null) return;
    await _client.from('health_reports').insert({
      'user_id': userId!,
      'name': name,
      'image_url': imageUrlOrJson,
      'ai_summary': aiSummary,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  /// Convenience: add report with multiple URLs (encodes to JSON).
  Future<void> addHealthReportMulti(String name, List<String> imageUrls, {String? aiSummary}) async {
    await addHealthReport(name, jsonEncode(imageUrls), aiSummary: aiSummary);
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
    await _getVitalsTimezoneFixInstalledAt();
    final inserted = await _client.from('vital_logs').insert({
      'user_id': userId!,
      'type': type,
      'value': value,
      'systolic': systolic,
      'diastolic': diastolic,
      'timestamp': DateTime.now().toUtc().toIso8601String(),
    }).select('id').single();
    final insertedId = inserted['id'] as String?;
    if (insertedId != null && insertedId.isNotEmpty) {
      await _rememberFixedVitalRowId(insertedId);
    }
  }

  /// Fetch all vital logs between [from] and [to] (inclusive/exclusive).
  /// Reuses the existing timezone-fix pipeline in [_mapVitalLogs].
  Future<List<VitalLog>> getVitalLogsForRange(
      DateTime from, DateTime to) async {
    if (userId == null) return [];
    final fromUtc = from.toUtc().toIso8601String();
    final toUtc = to.toUtc().toIso8601String();
    final result = await _client
        .from('vital_logs')
        .select()
        .eq('user_id', userId!)
        .gte('timestamp', fromUtc)
        .lt('timestamp', toUtc)
        .order('timestamp', ascending: true);
    final logs = await _mapVitalLogs(result);
    logs.sort((a, b) => a.timestamp.compareTo(b.timestamp));
    return logs;
  }

  Future<List<VitalLog>> getVitalLogs({int limit = 30}) async {
    if (userId == null) return [];
    final result = await _client
        .from('vital_logs')
        .select()
        .eq('user_id', userId!)
        .order('timestamp', ascending: false)
        .limit(limit);
    final logs = await _mapVitalLogs(result);
    logs.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return logs;
  }

  Future<List<VitalLog>> getTodayVitals() async {
    final logs = await getVitalLogsForDay(DateTime.now());
    logs.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return logs;
  }

  Future<List<VitalLog>> getVitalLogsForDay(DateTime date) async {
    if (userId == null) return [];
    final startOfDayLocal = DateTime(date.year, date.month, date.day);
    final endOfDayLocal = startOfDayLocal.add(const Duration(days: 1));
    final startOfDayUtc = startOfDayLocal.toUtc();
    final endOfDayUtc = endOfDayLocal.toUtc();

    // Legacy vitals were stored as local wall-clock timestamps interpreted as
    // UTC, so fetch the overlap of both the fixed and legacy date windows.
    final legacyStartUtc = DateTime.utc(date.year, date.month, date.day);
    final legacyEndUtc = legacyStartUtc.add(const Duration(days: 1));
    final queryStartUtc =
        startOfDayUtc.isBefore(legacyStartUtc) ? startOfDayUtc : legacyStartUtc;
    final queryEndUtc =
        endOfDayUtc.isAfter(legacyEndUtc) ? endOfDayUtc : legacyEndUtc;

    final result = await _client
        .from('vital_logs')
        .select()
        .eq('user_id', userId!)
        .gte('timestamp', queryStartUtc.toIso8601String())
        .lt('timestamp', queryEndUtc.toIso8601String())
        .order('timestamp', ascending: true);

    final logs = await _mapVitalLogs(result);
    final filteredLogs = logs.where((log) {
      final timestamp = log.timestamp;
      return !timestamp.isBefore(startOfDayLocal) &&
          timestamp.isBefore(endOfDayLocal);
    }).toList();
    filteredLogs.sort((a, b) => a.timestamp.compareTo(b.timestamp));
    return filteredLogs;
  }

  Future<DateTime> _getVitalsTimezoneFixInstalledAt() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_vitalsTimezoneFixInstalledAtKey);
    if (stored != null) {
      return DateTime.parse(stored).toUtc();
    }

    final installedAt = DateTime.now().toUtc();
    await prefs.setString(
      _vitalsTimezoneFixInstalledAtKey,
      installedAt.toIso8601String(),
    );
    return installedAt;
  }

  Future<List<VitalLog>> _mapVitalLogs(List<dynamic> rows) async {
    final prefs = await SharedPreferences.getInstance();
    final legacyInterpretBeforeUtc = await _getVitalsTimezoneFixInstalledAt();
    final fixedRowIds = prefs.getStringList(_fixedVitalRowIdsKey)?.toSet() ?? {};

    return rows
        .map<VitalLog>(
          (row) {
            final map = Map<String, dynamic>.from(row as Map);
            final rowId = map['id'] as String? ?? '';
            final rawTimestamp = map['timestamp'] as String;
            final parsed = DateTime.parse(rawTimestamp);
            final parsedUtc = parsed.toUtc();

            // Legacy vitals were saved as local wall-clock timestamps into a
            // timestamptz column. Rows logged shortly before midnight can end
            // up after the fix-install cutoff in raw UTC, so we keep a grace
            // window up to the local timezone offset and exempt rows written
            // by the fixed client on this device.
            final localWallClock = DateTime(
              parsedUtc.year,
              parsedUtc.month,
              parsedUtc.day,
              parsedUtc.hour,
              parsedUtc.minute,
              parsedUtc.second,
              parsedUtc.millisecond,
              parsedUtc.microsecond,
            );
            final localOffset = localWallClock.timeZoneOffset;
            final ambiguousLegacyWindowEnd = legacyInterpretBeforeUtc.add(
              Duration(minutes: math.max(localOffset.inMinutes, 0)),
            );
            final shouldTreatAsLegacyWallClock =
                parsedUtc.isBefore(legacyInterpretBeforeUtc) ||
                (!fixedRowIds.contains(rowId) &&
                    parsedUtc.isBefore(ambiguousLegacyWindowEnd) &&
                    localWallClock.toUtc().isBefore(legacyInterpretBeforeUtc));

            return VitalLog.fromJson(
              map,
              treatAsLegacyWallClock: shouldTreatAsLegacyWallClock,
            );
          },
        )
        .toList();
  }

  Future<void> _rememberFixedVitalRowId(String rowId) async {
    final prefs = await SharedPreferences.getInstance();
    final existing = prefs.getStringList(_fixedVitalRowIdsKey) ?? <String>[];
    if (existing.contains(rowId)) return;

    final updated = <String>[...existing, rowId];
    const maxTrackedIds = 200;
    final trimmed = updated.length > maxTrackedIds
        ? updated.sublist(updated.length - maxTrackedIds)
        : updated;
    await prefs.setStringList(_fixedVitalRowIdsKey, trimmed);
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
