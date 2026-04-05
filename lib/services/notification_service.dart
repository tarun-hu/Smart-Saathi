import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:shared_preferences/shared_preferences.dart';
import '../main.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  bool _isInitialized = false;

  Future<void> initialize() async {
    if (_isInitialized) return;

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTap,
      onDidReceiveBackgroundNotificationResponse: notificationTapBackground,
    );

    // Request permissions on Android 13+
    await _notifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();

    // Request exact alarm permission on Android 12+
    await _notifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestExactAlarmsPermission();

    _isInitialized = true;
  }

  void _onNotificationTap(NotificationResponse response) {
    debugPrint('Notification tapped: ${response.payload}');
  }

  // ──── MEDICATION REMINDERS (Real OS Notifications) ─────────────────────────

  /// Schedule a daily OS notification for a medication at the given time string.
  /// [id]      — unique notification ID (use med.id.hashCode)
  /// [medName] — medication name
  /// [dosage]  — dosage e.g. "1 tablet"
  /// [time]    — time string e.g. "8:00 AM" or "21:30"
  Future<void> scheduleMedicationReminder({
    required int id,
    required String medName,
    required String dosage,
    required String time,
  }) async {
    if (!_isInitialized) await initialize();

    // Cancel any existing notification for this ID first
    await _notifications.cancel(id);

    final scheduledTime = _nextOccurrenceFromTimeString(time);
    if (scheduledTime == null) {
      debugPrint('Could not parse medication time: $time');
      return;
    }

    const androidDetails = AndroidNotificationDetails(
      'medication_channel',
      'Medication Reminders',
      channelDescription: 'Reminders to take your medications',
      importance: Importance.max,
      priority: Priority.high,
      playSound: true,
      enableVibration: true,
      category: AndroidNotificationCategory.alarm,
      fullScreenIntent: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
      interruptionLevel: InterruptionLevel.timeSensitive,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    try {
      await _notifications.zonedSchedule(
        id,
        '💊 Medicine Reminder',
        'Time to take $dosage of $medName',
        scheduledTime,
        details,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        matchDateTimeComponents: DateTimeComponents.time, // repeat daily
        payload: 'medication:$id:$medName',
      );
      debugPrint('Scheduled medication reminder for $medName at $scheduledTime');
    } catch (e) {
      debugPrint('Failed to schedule medication notification: $e');
    }
  }

  Future<void> stopMedicationReminder(int id) async {
    await _notifications.cancel(id);
    debugPrint('Cancelled medication reminder ID: $id');
  }

  /// Schedule reminders for all given medications.
  Future<void> scheduleAllMedicationReminders(
      List<Map<String, dynamic>> medications) async {
    for (final med in medications) {
      final id = (med['id'] as String? ?? '').hashCode;
      final name = med['name'] as String? ?? '';
      final dosage = med['dosage'] ?? med['dose'] ?? '1 tablet';
      final time = med['time'] as String? ?? '8:00 AM';
      if (name.isNotEmpty) {
        await scheduleMedicationReminder(
          id: id,
          medName: name,
          dosage: dosage.toString(),
          time: time,
        );
      }
    }
  }

  // ──── HYDRATION REMINDERS ──────────────────────────────────────────────────

  Future<void> showHydrationReminder() async {
    const androidDetails = AndroidNotificationDetails(
      'hydration_channel',
      'Hydration Reminders',
      channelDescription: 'Reminders to drink water',
      importance: Importance.high,
      priority: Priority.high,
      playSound: true,
      enableVibration: true,
      category: AndroidNotificationCategory.reminder,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.show(
      9999,
      '💧 Time to drink water!',
      'Stay hydrated - drink a glass of water now',
      details,
      payload: 'hydration',
    );
  }

  Future<void> scheduleHydrationReminders() async {
    final prefs = await SharedPreferences.getInstance();
    final enabled = prefs.getBool('hydration_reminders') ?? true;
    if (!enabled) return;

    // Cancel existing hydration reminders
    for (int i = 7000; i <= 7012; i++) {
      await _notifications.cancel(i);
    }

    const androidDetails = AndroidNotificationDetails(
      'hydration_channel',
      'Hydration Reminders',
      channelDescription: 'Reminders to drink water',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
      playSound: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    // Schedule every 2 hours from 8 AM to 8 PM
    final hours = [8, 10, 12, 14, 16, 18, 20];
    for (int i = 0; i < hours.length; i++) {
      final now = tz.TZDateTime.now(tz.local);
      var scheduled = tz.TZDateTime(
        tz.local,
        now.year,
        now.month,
        now.day,
        hours[i],
        0,
      );
      if (scheduled.isBefore(now)) {
        scheduled = scheduled.add(const Duration(days: 1));
      }

      try {
        await _notifications.zonedSchedule(
          7000 + i,
          '💧 Drink Water',
          'Stay hydrated — have a glass of water',
          scheduled,
          details,
          uiLocalNotificationDateInterpretation:
              UILocalNotificationDateInterpretation.absoluteTime,
          androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
          matchDateTimeComponents: DateTimeComponents.time,
          payload: 'hydration',
        );
      } catch (e) {
        debugPrint('Failed to schedule hydration reminder at ${hours[i]}h: $e');
      }
    }
    debugPrint('Hydration reminders scheduled for ${hours.length} times');
  }

  // ──── SOS NOTIFICATIONS ────────────────────────────────────────────────────

  Future<void> showSosActiveNotification() async {
    const androidDetails = AndroidNotificationDetails(
      'sos_channel',
      'SOS Alerts',
      channelDescription: 'Emergency SOS alerts',
      importance: Importance.max,
      priority: Priority.max,
      playSound: true,
      enableVibration: true,
      ongoing: true,
      category: AndroidNotificationCategory.alarm,
    );

    const details = NotificationDetails(android: androidDetails);

    await _notifications.show(
      8888,
      '🚨 SOS ACTIVE',
      'Emergency alerts being sent to your nominees. Tap to stop.',
      details,
      payload: 'sos_active',
    );
  }

  Future<void> cancelSosNotification() async {
    await _notifications.cancel(8888);
  }

  // ──── GENERAL ──────────────────────────────────────────────────────────────

  Future<void> cancelAll() async {
    await _notifications.cancelAll();
  }

  Future<void> cancel(int id) async {
    await _notifications.cancel(id);
  }

  // ──── TIME PARSING HELPERS ─────────────────────────────────────────────────

  /// Parse a time string like "8:00 AM", "21:30", "8:30 PM" into the next
  /// TZDateTime occurrence from now (today or tomorrow if already past).
  tz.TZDateTime? _nextOccurrenceFromTimeString(String timeStr) {
    try {
      final cleaned = timeStr.trim().toUpperCase();
      int hour;
      int minute;

      if (cleaned.contains('AM') || cleaned.contains('PM')) {
        // 12-hour format: "8:00 AM", "9:30 PM"
        final isPm = cleaned.contains('PM');
        final timePart = cleaned.replaceAll('AM', '').replaceAll('PM', '').trim();
        final parts = timePart.split(':');
        hour = int.parse(parts[0]);
        minute = parts.length > 1 ? int.parse(parts[1]) : 0;

        // Convert to 24-hour
        if (isPm && hour != 12) hour += 12;
        if (!isPm && hour == 12) hour = 0;
      } else {
        // 24-hour format: "08:00", "21:30"
        final parts = cleaned.split(':');
        hour = int.parse(parts[0]);
        minute = parts.length > 1 ? int.parse(parts[1]) : 0;
      }

      final now = tz.TZDateTime.now(tz.local);
      var scheduled = tz.TZDateTime(
        tz.local,
        now.year,
        now.month,
        now.day,
        hour,
        minute,
      );

      // If time is already past today, schedule for tomorrow
      if (scheduled.isBefore(now.add(const Duration(minutes: 1)))) {
        scheduled = scheduled.add(const Duration(days: 1));
      }

      return scheduled;
    } catch (e) {
      debugPrint('Failed to parse time string "$timeStr": $e');
      return null;
    }
  }
}
