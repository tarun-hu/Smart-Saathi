import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/nominee.dart';
import 'supabase_service.dart';

class SosService {
  Timer? _repeatTimer;
  bool _isActive = false;
  final SupabaseService _supabase;

  bool get isActive => _isActive;

  SosService(this._supabase);

  /// Triggers SOS: sends WhatsApp messages to all 3 nominees with GPS location.
  /// Repeats every 30 seconds until [stopSos] is called.
  Future<void> triggerSos({
    required String seniorName,
    required String seniorPhone,
    required List<Nominee> nominees,
    VoidCallback? onStatusUpdate,
  }) async {
    if (_isActive) return;
    _isActive = true;

    // Get current GPS location
    Position position;
    try {
      position = await _getCurrentPosition();
    } catch (e) {
      debugPrint('Location error: $e');
      // Use a default / last known if GPS fails
      position = Position(
        latitude: 0,
        longitude: 0,
        timestamp: DateTime.now(),
        accuracy: 0,
        altitude: 0,
        altitudeAccuracy: 0,
        heading: 0,
        headingAccuracy: 0,
        speed: 0,
        speedAccuracy: 0,
      );
    }

    // Log SOS event to Supabase
    try {
      await _supabase.logSosEvent(position.latitude, position.longitude);
    } catch (e) {
      debugPrint('Failed to log SOS: $e');
    }

    // Send WhatsApp messages to all nominees
    await _sendToAllNominees(
      nominees: nominees,
      seniorName: seniorName,
      seniorPhone: seniorPhone,
      lat: position.latitude,
      lng: position.longitude,
    );

    // Repeat every 30 seconds
    _repeatTimer = Timer.periodic(const Duration(seconds: 30), (timer) async {
      if (!_isActive) {
        timer.cancel();
        return;
      }
      try {
        final newPos = await _getCurrentPosition();
        await _sendToAllNominees(
          nominees: nominees,
          seniorName: seniorName,
          seniorPhone: seniorPhone,
          lat: newPos.latitude,
          lng: newPos.longitude,
        );
      } catch (e) {
        debugPrint('SOS repeat error: $e');
      }
      onStatusUpdate?.call();
    });
  }

  void stopSos() {
    _isActive = false;
    _repeatTimer?.cancel();
    _repeatTimer = null;
  }

  Future<Position> _getCurrentPosition() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Location services are disabled.');
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Location permissions are denied');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception('Location permissions are permanently denied');
    }

    return await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        timeLimit: Duration(seconds: 10),
      ),
    );
  }

  Future<void> _sendToAllNominees({
    required List<Nominee> nominees,
    required String seniorName,
    required String seniorPhone,
    required double lat,
    required double lng,
  }) async {
    final mapsLink = 'https://maps.google.com/?q=$lat,$lng';
    final message = '''🚨 EMERGENCY ALERT 🚨

$seniorName needs help!

📍 Location: $mapsLink
📞 Call: $seniorPhone

⏰ Time: ${DateTime.now().toString().substring(0, 19)}

Please respond immediately!''';

    for (final nominee in nominees) {
      try {
        // Clean the WhatsApp number (remove +, spaces)
        String cleanNumber = nominee.whatsappNumber.replaceAll(RegExp(r'[^\d]'), '');
        // Ensure it starts with country code
        if (cleanNumber.length == 10) {
          cleanNumber = '91$cleanNumber';
        }

        final whatsappUrl =
            'https://wa.me/$cleanNumber?text=${Uri.encodeComponent(message)}';
        final uri = Uri.parse(whatsappUrl);

        await launchUrl(uri, mode: LaunchMode.externalApplication);

        // Small delay between opening multiple WhatsApp windows
        await Future.delayed(const Duration(milliseconds: 1500));
      } catch (e) {
        debugPrint('Failed to send WhatsApp to ${nominee.name}: $e');
      }
    }
  }
}
