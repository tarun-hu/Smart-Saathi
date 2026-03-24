import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';

class NearbyFacilitiesScreen extends StatefulWidget {
  const NearbyFacilitiesScreen({super.key});

  @override
  State<NearbyFacilitiesScreen> createState() => _NearbyFacilitiesScreenState();
}

class _NearbyFacilitiesScreenState extends State<NearbyFacilitiesScreen> {
  Position? _position;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchLocation();
  }

  Future<void> _fetchLocation() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      // Check if location services are enabled
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _error = 'Location services are disabled.\nPlease enable GPS and try again.';
          _loading = false;
        });
        return;
      }

      // Check / request permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() {
            _error = 'Location permission denied.\nPlease allow access to find nearby facilities.';
            _loading = false;
          });
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          _error = 'Location permission permanently denied.\nPlease enable it in Settings.';
          _loading = false;
        });
        return;
      }

      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );

      setState(() {
        _position = pos;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Could not get your location.\nPlease check GPS and try again.';
        _loading = false;
      });
    }
  }

  Future<void> _openMaps(String query) async {
    final lat = _position!.latitude;
    final lng = _position!.longitude;
    final uri = Uri.parse(
      'https://www.google.com/maps/search/${Uri.encodeComponent(query)}/@$lat,$lng,14z',
    );

    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open Google Maps')),
        );
      }
    }
  }

  Future<void> _callAmbulance() async {
    final uri = Uri.parse('tel:102');
    if (!await launchUrl(uri)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open dialer')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5FA),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Text(
                'Nearby Facilities',
                style: GoogleFonts.poppins(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF1A237E),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Find hospitals and healthcare near you',
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 24),

              // Body
              Expanded(
                child: _loading
                    ? _buildLoading()
                    : _error != null
                        ? _buildError()
                        : _buildFacilitiesList(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoading() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(color: Color(0xFF1A237E)),
          const SizedBox(height: 16),
          Text(
            'Finding your location...',
            style: GoogleFonts.poppins(fontSize: 16, color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.location_off_rounded, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text(
            _error!,
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(fontSize: 16, color: Colors.grey.shade600),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _fetchLocation,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Retry'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1A237E),
              foregroundColor: Colors.white,
              minimumSize: const Size(160, 50),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFacilitiesList() {
    final facilities = [
      _FacilityItem(
        icon: Icons.local_hospital_rounded,
        title: 'Hospitals',
        subtitle: 'Find nearby hospitals',
        color: const Color(0xFFD32F2F),
        bgColor: const Color(0xFFFFEBEE),
        onTap: () => _openMaps('hospital'),
      ),
      _FacilityItem(
        icon: Icons.local_pharmacy_rounded,
        title: 'Pharmacies',
        subtitle: 'Find nearby pharmacies & medical stores',
        color: const Color(0xFF1565C0),
        bgColor: const Color(0xFFE3F2FD),
        onTap: () => _openMaps('pharmacy'),
      ),
      _FacilityItem(
        icon: Icons.medical_services_rounded,
        title: 'Clinics',
        subtitle: 'Find nearby clinics & doctors',
        color: const Color(0xFF2E7D32),
        bgColor: const Color(0xFFE8F5E9),
        onTap: () => _openMaps('clinic'),
      ),
      _FacilityItem(
        icon: Icons.directions_run_rounded,
        title: 'Physiotherapy',
        subtitle: 'Find nearby physiotherapy centres',
        color: const Color(0xFFE65100),
        bgColor: const Color(0xFFFFF3E0),
        onTap: () => _openMaps('physiotherapy centre'),
      ),
      _FacilityItem(
        icon: Icons.emergency_rounded,
        title: 'Ambulance — Call 102',
        subtitle: 'Tap to call the ambulance service',
        color: const Color(0xFFB71C1C),
        bgColor: const Color(0xFFFFCDD2),
        onTap: _callAmbulance,
      ),
    ];

    return Column(
      children: [
        // Location chip
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFF1A237E).withAlpha(12),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF1A237E).withAlpha(30)),
          ),
          child: Row(
            children: [
              const Icon(Icons.my_location_rounded,
                  color: Color(0xFF1A237E), size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Your location: ${_position!.latitude.toStringAsFixed(4)}, '
                  '${_position!.longitude.toStringAsFixed(4)}',
                  style: GoogleFonts.poppins(
                    fontSize: 13,
                    color: const Color(0xFF1A237E),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              GestureDetector(
                onTap: _fetchLocation,
                child: const Icon(Icons.refresh_rounded,
                    color: Color(0xFF1A237E), size: 20),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Facility cards
        Expanded(
          child: ListView.separated(
            itemCount: facilities.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final f = facilities[index];
              return GestureDetector(
                onTap: f.onTap,
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(8),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 54,
                        height: 54,
                        decoration: BoxDecoration(
                          color: f.bgColor,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Icon(f.icon, color: f.color, size: 28),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              f.title,
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF1A1A2E),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              f.subtitle,
                              style: GoogleFonts.poppins(
                                fontSize: 13,
                                color: Colors.grey.shade500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        f.title.contains('Ambulance')
                            ? Icons.call_rounded
                            : Icons.open_in_new_rounded,
                        size: 20,
                        color: f.color,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _FacilityItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final Color bgColor;
  final VoidCallback onTap;

  const _FacilityItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.bgColor,
    required this.onTap,
  });
}
