import 'dart:async';
import 'package:flutter/material.dart';
import '../services/supabase_service.dart';
import '../models/location_data.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class CaregiverScreen extends StatefulWidget {
  const CaregiverScreen({super.key});

  @override
  State<CaregiverScreen> createState() => _CaregiverScreenState();
}

class _CaregiverScreenState extends State<CaregiverScreen> {
  StreamSubscription? _sosSubscription;
  StreamSubscription? _locationSubscription;
  SOSAlert? _latestAlert;
  GoogleMapController? _mapController;
  String _seniorName = 'Senior';

  // Live location state
  LocationData? _latestLocation;
  List<LocationData> _locationHistory = [];
  String _lastSeenText = '';

  @override
  void initState() {
    super.initState();
    _initConnection();
  }

  Future<void> _initConnection() async {
    // Fetch the paired senior's ID and name
    final seniorId = await SupabaseService.getConnectedSeniorId();
    if (seniorId == null) return;

    final name = await SupabaseService.getConnectedSeniorName();
    if (mounted) setState(() => _seniorName = name);

    // ── Fetch initial latest location ──
    final loc = await SupabaseService.getLatestLocation(seniorId);
    if (loc != null && mounted) {
      setState(() {
        _latestLocation = loc;
        _lastSeenText = _formatTimestamp(loc.timestamp);
      });
      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(LatLng(loc.latitude, loc.longitude), 15),
      );
    }

    // ── Fetch location history ──
    final history = await SupabaseService.getLocationHistory(seniorId, limit: 20);
    if (mounted) {
      setState(() => _locationHistory = history);
    }

    // ── Start realtime location stream ──
    _locationSubscription = SupabaseService.listenToLocation(seniorId).listen((event) {
      if (!mounted || event.isEmpty) return;

      final loc = LocationData.fromMap(event.first);
      setState(() {
        _latestLocation = loc;
        _lastSeenText = _formatTimestamp(loc.timestamp);
        // Prepend to history, avoiding duplicates
        if (_locationHistory.isEmpty || _locationHistory.first.id != loc.id) {
          _locationHistory.insert(0, loc);
          if (_locationHistory.length > 20) _locationHistory.removeLast();
        }
      });

      // Only pan map if there's NO active emergency
      if (_latestAlert == null) {
        _mapController?.animateCamera(
          CameraUpdate.newLatLngZoom(LatLng(loc.latitude, loc.longitude), 15),
        );
      }
    });

    // ── Listen for SOS alerts ──
    _sosSubscription = SupabaseService.listenToAlerts(seniorId).listen((event) {
      if (!mounted || event.isEmpty) return;

      // Filter to only unresolved alerts client-side as well
      final unresolved = event.where((e) => e['is_resolved'] == false).toList();
      if (unresolved.isEmpty) return;

      final alert = SOSAlert.fromMap(unresolved.first);
      if (_latestAlert == null || _latestAlert!.timestamp.isBefore(alert.timestamp)) {
        setState(() {
          _latestAlert = alert;
        });
        _mapController?.animateCamera(
          CameraUpdate.newLatLngZoom(LatLng(alert.latitude, alert.longitude), 15),
        );
        _showSOSDialog(alert);
      }
    });
  }

  String _formatTimestamp(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${dt.day}/${dt.month} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _sosSubscription?.cancel();
    _locationSubscription?.cancel();
    super.dispose();
  }

  void _showSOSDialog(SOSAlert alert) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Colors.red[50],
          title: const Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: Colors.red, size: 40),
              SizedBox(width: 8),
              Expanded(child: Text('EMERGENCY SOS', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold))),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('$_seniorName just triggered an SOS alert!', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 16),
              const Text('Message:', style: TextStyle(fontWeight: FontWeight.bold)),
              Text(alert.message),
              const SizedBox(height: 8),
              const Text('Location:', style: TextStyle(fontWeight: FontWeight.bold)),
              Text('Lat: ${alert.latitude.toStringAsFixed(4)}\nLng: ${alert.longitude.toStringAsFixed(4)}'),
            ],
          ),
          actions: <Widget>[
             ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
              child: const Text('Acknowledge'),
              onPressed: () async {
                await SupabaseService.resolveAlert(alert.id);
                if (context.mounted) Navigator.of(context).pop();
                if (mounted) {
                  setState(() => _latestAlert = null);
                }
              },
            ),
          ],
        );
      },
    );
  }

  /// Determine the map center, marker, and overlay label.
  LatLng get _mapCenter {
    if (_latestAlert != null) {
      return LatLng(_latestAlert!.latitude, _latestAlert!.longitude);
    }
    if (_latestLocation != null) {
      return LatLng(_latestLocation!.latitude, _latestLocation!.longitude);
    }
    return const LatLng(28.6139, 77.2090); // fallback: Delhi
  }

  Set<Marker> get _mapMarkers {
    final markers = <Marker>{};
    if (_latestAlert != null) {
      markers.add(Marker(
        markerId: const MarkerId('sos'),
        position: LatLng(_latestAlert!.latitude, _latestAlert!.longitude),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
      ));
    }
    if (_latestLocation != null) {
      markers.add(Marker(
        markerId: const MarkerId('live'),
        position: LatLng(_latestLocation!.latitude, _latestLocation!.longitude),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      ));
    }
    return markers;
  }

  String get _locationLabel {
    if (_latestAlert != null) return 'SOS Location';
    if (_latestLocation != null && _latestLocation!.address != null) {
      return _latestLocation!.address!;
    }
    if (_latestLocation != null) {
      return '${_latestLocation!.latitude.toStringAsFixed(4)}, ${_latestLocation!.longitude.toStringAsFixed(4)}';
    }
    return '$_seniorName is Home';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFf6f7f8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Color(0xFF1975d2), size: 32),
          onPressed: () {},
        ),
        title: const Text(
          'SmartSaathi Dashboard',
          style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.black87),
            onPressed: () {
              Supabase.instance.client.auth.signOut();
            },
          ),
          Container(
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              shape: BoxShape.circle,
            ),
            child: Stack(
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications, color: Colors.black87),
                  onPressed: () {},
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Quick Actions
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.call),
                          label: const Text('Call Senior', style: TextStyle(fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1975d2),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.chat_bubble),
                          label: const Text('Message', style: TextStyle(fontWeight: FontWeight.bold)),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF1975d2),
                            side: const BorderSide(color: Color(0xFF1975d2), width: 2),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Real-time Map Section
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Text('Current Location', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                              if (_lastSeenText.isNotEmpty) ...[
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[200],
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    _lastSeenText,
                                    style: TextStyle(color: Colors.grey[600], fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: _latestAlert != null ? Colors.red[100] : Colors.green[100],
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _latestAlert != null ? 'EMERGENCY' : (_latestLocation != null ? 'Live Now' : 'Waiting...'),
                              style: TextStyle(
                                color: _latestAlert != null ? Colors.red : Colors.green,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        height: 200,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: _latestAlert != null ? Colors.red : Colors.white, width: 4),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              GoogleMap(
                                initialCameraPosition: CameraPosition(
                                  target: _mapCenter,
                                  zoom: (_latestAlert != null || _latestLocation != null) ? 15 : 10,
                                ),
                                markers: _mapMarkers,
                                onMapCreated: (controller) {
                                  _mapController = controller;
                                },
                              ),
                              // Address overlay (bottom-left)
                              Positioned(
                                bottom: 8,
                                left: 8,
                                child: Container(
                                  constraints: const BoxConstraints(maxWidth: 220),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.9),
                                    borderRadius: BorderRadius.circular(8),
                                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)],
                                  ),
                                  child: Text(
                                    _locationLabel,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.black87),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ),
                              Positioned(
                                bottom: 16,
                                right: 16,
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(8),
                                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)],
                                  ),
                                  child: IconButton(
                                    icon: const Icon(Icons.my_location),
                                    onPressed: () {
                                      _mapController?.animateCamera(
                                        CameraUpdate.newLatLngZoom(_mapCenter, 15),
                                      );
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Health Logs
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Health Logs', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          TextButton(
                            onPressed: () {},
                            child: const Text('View History', style: TextStyle(color: Color(0xFF1975d2), fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      // Med Taken
                      Container(
                        padding: const EdgeInsets.all(16),
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: const Border(left: BorderSide(color: Colors.green, width: 4)),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8)],
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(color: Colors.green[100], shape: BoxShape.circle),
                              child: const Icon(Icons.medication, color: Colors.green),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text('Metformin (500mg)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                      Text('08:30 AM', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  const Text('Taken', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 14)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // ── Location History Section ──
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.history, color: Color(0xFF1975d2), size: 24),
                              SizedBox(width: 8),
                              Text('Location History', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          Text(
                            '${_locationHistory.length} entries',
                            style: TextStyle(color: Colors.grey[500], fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (_locationHistory.isEmpty)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Column(
                            children: [
                              Icon(Icons.location_off, color: Colors.grey, size: 40),
                              SizedBox(height: 8),
                              Text('No location history yet', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        )
                      else
                        ...List.generate(
                          _locationHistory.length > 10 ? 10 : _locationHistory.length,
                          (index) {
                            final loc = _locationHistory[index];
                            final isFirst = index == 0;
                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: isFirst ? const Color(0xFF1975d2).withOpacity(0.05) : Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isFirst ? const Color(0xFF1975d2).withOpacity(0.3) : Colors.grey.withOpacity(0.15),
                                  width: isFirst ? 1.5 : 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 36,
                                    height: 36,
                                    decoration: BoxDecoration(
                                      color: isFirst ? const Color(0xFF1975d2).withOpacity(0.15) : Colors.grey[100],
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      Icons.location_on,
                                      size: 18,
                                      color: isFirst ? const Color(0xFF1975d2) : Colors.grey,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          loc.address ?? '${loc.latitude.toStringAsFixed(4)}, ${loc.longitude.toStringAsFixed(4)}',
                                          style: TextStyle(
                                            fontWeight: isFirst ? FontWeight.bold : FontWeight.w500,
                                            fontSize: 14,
                                            color: Colors.black87,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          _formatTimestamp(loc.timestamp),
                                          style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (isFirst)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.green[100],
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Text('Latest', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 10)),
                                    ),
                                ],
                              ),
                            );
                          },
                        ),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),

                // Urgent Alerts
                if (_latestAlert != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Urgent Alerts', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(16),
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            color: Colors.red[50],
                            border: Border.all(color: Colors.red[100]!),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.emergency, color: Colors.red),
                              const SizedBox(width: 16),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('SOS Button Pressed', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 16)),
                                  const SizedBox(height: 4),
                                  Text('Triggered just now', style: TextStyle(color: Colors.red[700], fontSize: 12)),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          
          // Bottom Navigation Stack Hack
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              height: 70,
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, -4)),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _BottomNavItem(icon: Icons.grid_view, label: 'Home', isSelected: true),
                  _BottomNavItem(icon: Icons.monitor_heart, label: 'Health'),
                  const SizedBox(width: 60),
                  _BottomNavItem(icon: Icons.map, label: 'History'),
                  _BottomNavItem(icon: Icons.settings, label: 'Profile'),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 35,
            left: MediaQuery.of(context).size.width / 2 - 32,
            child: Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: const Color(0xFF1975d2),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 4),
                boxShadow: [
                  BoxShadow(color: const Color(0xFF1975d2).withOpacity(0.4), blurRadius: 12, offset: const Offset(0, 4)),
                ],
              ),
              child: const Icon(Icons.add, color: Colors.white, size: 32),
            ),
          ),
        ],
      ),
    );
  }
}

class _BottomNavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;

  const _BottomNavItem({
    required this.icon,
    required this.label,
    this.isSelected = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, color: isSelected ? const Color(0xFF1975d2) : Colors.grey, size: 28),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            color: isSelected ? const Color(0xFF1975d2) : Colors.grey,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}
