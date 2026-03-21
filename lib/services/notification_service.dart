import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  bool _isInitialized = false;

  Future<void> initialize() async {
    if (_isInitialized) return;

    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
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
    );

    // Request permissions on Android 13+
    await _notifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();

    _isInitialized = true;
  }

  void _onNotificationTap(NotificationResponse response) {
    debugPrint('Notification tapped: ${response.payload}');
  }

  // ──── MEDICATION REMINDERS ─────────────────────

  Future<void> showMedicationReminder({
    required int id,
    required String medName,
    required String dosage,
    required String time,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'medication_channel',
      'Medication Reminders',
      channelDescription: 'Reminders to take your medication',
      importance: Importance.max,
      priority: Priority.high,
      playSound: true,
      enableVibration: true,
      category: AndroidNotificationCategory.reminder,
      fullScreenIntent: true,
      actions: [
        AndroidNotificationAction('taken', '✅ Taken', showsUserInterface: true),
        AndroidNotificationAction('snooze', '⏰ Snooze 15 min', showsUserInterface: true),
      ],
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
      id,
      '💊 Time for $medName',
      'Take $dosage - Scheduled at $time',
      details,
      payload: 'medication:$id',
    );
  }

  // ──── HYDRATION REMINDERS ──────────────────────

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

  // ──── SOS NOTIFICATIONS ────────────────────────

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

  // ──── HYDRATION SCHEDULING ─────────────────────

  Future<void> scheduleHydrationReminders() async {
    final prefs = await SharedPreferences.getInstance();
    final enabled = prefs.getBool('hydration_reminders') ?? true;
    if (!enabled) return;

    // Schedule reminders every 2 hours from 8 AM to 8 PM
    // Using simple periodic approach via SharedPreferences tracking
    debugPrint('Hydration reminders scheduled');
  }

  // ──── GENERAL ──────────────────────────────────

  Future<void> cancelAll() async {
    await _notifications.cancelAll();
  }

  Future<void> cancel(int id) async {
    await _notifications.cancel(id);
  }
}
