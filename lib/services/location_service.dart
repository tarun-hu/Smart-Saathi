import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'supabase_service.dart';

/// Centralized service for all geolocation logic:
/// permissions, one-shot reads, periodic tracking, and reverse geocoding.
class LocationService {
  static StreamSubscription<Position>? _positionSubscription;
  static bool _isTracking = false;

  /// Whether periodic tracking is currently active.
  static bool get isTracking => _isTracking;

  // ──────────────────────── Permissions ────────────────────────

  /// Ensures location services are enabled and permissions are granted.
  /// Returns `true` if everything is ready, `false` otherwise.
  static Future<bool> ensurePermissions() async {
    // 1. Check if the location service itself is turned on.
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }

    // 2. Check (and request) app-level permission.
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      // The user permanently denied location — we can't request again.
      return false;
    }

    return true;
  }

  // ──────────────────────── One-shot read ────────────────────────

  /// Returns the device's current position with high accuracy.
  static Future<Position> getCurrentLocation() async {
    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  // ──────────────────────── Periodic tracking ────────────────────────

  /// Starts streaming position updates and upserting them to Supabase.
  ///
  /// Uses a balanced approach:
  /// - `distanceFilter`: only emits if the device moves ≥ 50 m.
  /// - High accuracy GPS for safety-critical senior tracking.
  ///
  /// Call [stopTracking] to cancel.
  static Future<void> startPeriodicTracking() async {
    if (_isTracking) return; // already running

    final hasPermission = await ensurePermissions();
    if (!hasPermission) return;

    _isTracking = true;

    // Send an initial location immediately.
    try {
      final pos = await getCurrentLocation();
      await _pushLocation(pos);
    } catch (_) {
      // Non-fatal — the stream will pick up the next update.
    }

    const LocationSettings settings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 50, // metres
    );

    _positionSubscription = Geolocator.getPositionStream(
      locationSettings: settings,
    ).listen(
      (Position position) async {
        await _pushLocation(position);
      },
      onError: (error) {
        // Silently handle stream errors; tracking continues.
      },
    );
  }

  /// Stops the position stream.
  static Future<void> stopTracking() async {
    await _positionSubscription?.cancel();
    _positionSubscription = null;
    _isTracking = false;
  }

  // ──────────────────────── Reverse geocoding ────────────────────────

  /// Converts lat/lng to a human-readable address string.
  /// Returns `null` on failure (e.g. no network).
  static Future<String?> reverseGeocode(double lat, double lng) async {
    try {
      final placemarks = await placemarkFromCoordinates(lat, lng);
      if (placemarks.isNotEmpty) {
        final p = placemarks.first;
        // Build a compact address: "Street, Locality, Country"
        final parts = <String>[
          if (p.street != null && p.street!.isNotEmpty) p.street!,
          if (p.subLocality != null && p.subLocality!.isNotEmpty) p.subLocality!,
          if (p.locality != null && p.locality!.isNotEmpty) p.locality!,
        ];
        return parts.isNotEmpty ? parts.join(', ') : null;
      }
    } catch (_) {
      // Geocoding can fail without network — not critical.
    }
    return null;
  }

  // ──────────────────────── Internal helpers ────────────────────────

  /// Pushes a position to Supabase with an optional reverse-geocoded address.
  static Future<void> _pushLocation(Position pos) async {
    String? address;
    try {
      address = await reverseGeocode(pos.latitude, pos.longitude);
    } catch (_) {}

    await SupabaseService.upsertLocation(
      pos.latitude,
      pos.longitude,
      address,
    );
  }
}
