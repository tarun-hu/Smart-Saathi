import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../services/supabase_service.dart';
import '../services/location_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SeniorScreen extends StatefulWidget {
  const SeniorScreen({super.key});

  @override
  State<SeniorScreen> createState() => _SeniorScreenState();
}

class _SeniorScreenState extends State<SeniorScreen> {
  late stt.SpeechToText _speech;
  bool _isListening = false;
  String _text = 'Tap to Talk...';
  String _userName = 'User';
  
  // State for the medicine reminder demo
  bool _medicinePending = true;

  // Location tracking state
  bool _locationActive = false;
  bool _locationPermissionDenied = false;

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    _loadUserName();
    _startLocationTracking();
  }

  @override
  void dispose() {
    LocationService.stopTracking();
    super.dispose();
  }

  Future<void> _loadUserName() async {
    final name = await SupabaseService.getCurrentUserName();
    if (mounted) setState(() => _userName = name);
  }

  Future<void> _startLocationTracking() async {
    final hasPermission = await LocationService.ensurePermissions();
    if (!hasPermission) {
      if (mounted) {
        setState(() => _locationPermissionDenied = true);
      }
      return;
    }

    await LocationService.startPeriodicTracking();
    if (mounted) {
      setState(() {
        _locationActive = LocationService.isTracking;
        _locationPermissionDenied = false;
      });
    }
  }

  void _listen() async {
    if (!_isListening) {
      bool available = await _speech.initialize(
        onStatus: (val) {
          if (val == 'done') {
            setState(() => _isListening = false);
            _processCommand(_text);
          }
        },
        onError: (val) => print('onError: $val'),
      );
      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          onResult: (val) => setState(() {
            _text = val.recognizedWords;
          }),
        );
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
      _processCommand(_text);
    }
  }
  
  void _processCommand(String command) {
    if (command.toLowerCase().contains("medicine") || command.toLowerCase().contains("remind")) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Got it! I will remind you to take your medicine."),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 4),
        )
      );
    } else if (command.isNotEmpty && command != 'Tap to Talk...') {
       ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Heard: $command"),
          duration: const Duration(seconds: 2),
        )
      );
    }
  }

  Future<void> _triggerSOS() async {
    // Use LocationService for a cleaner permission + location flow
    final hasPermission = await LocationService.ensurePermissions();
    if (!hasPermission) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location permissions are denied')),
        );
      }
      return;
    }
    
    // Show sending feedback
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Fetching location and sending SOS...'), backgroundColor: Colors.orange,)
      );
    }

    try {
      final position = await LocationService.getCurrentLocation();
      
      await SupabaseService.triggerSOS(
        position.latitude, 
        position.longitude, 
        "Urgent: Medical Assistance Needed!"
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('SOS Alert Sent to Caregiver!'), backgroundColor: Colors.red, duration: Duration(seconds: 4),)
        );
      }
    } catch(e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to get location: $e'), backgroundColor: Colors.red)
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFf6f7f8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        toolbarHeight: 80,
        title: Row(
          children: [
            CircleAvatar(radius: 24, backgroundColor: Colors.grey[300], child: const Icon(Icons.person, color: Colors.white)),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Good Morning,', style: TextStyle(color: Colors.grey, fontSize: 12)),
                Text(_userName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.black87)),
              ],
            ),
          ],
        ),
        actions: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(20)),
            child: Text('Code: ${SupabaseService.getSeniorPairingCode()}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87)),
          ),
          const SizedBox(width: 12),
          Container(
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: const Color(0xFF1975d2).withOpacity(0.1),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFF1975d2), width: 2),
            ),
            child: IconButton(
              iconSize: 24,
              icon: const Icon(Icons.logout, color: Color(0xFF1975d2)),
              onPressed: () {
                LocationService.stopTracking();
                Supabase.instance.client.auth.signOut();
              },
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(left: 20, right: 20, top: 20, bottom: 120),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [

                // ── Location Sharing Status Banner ──
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: _locationActive
                        ? const Color(0xFF2e7d32).withOpacity(0.1)
                        : (_locationPermissionDenied ? Colors.orange.withOpacity(0.1) : Colors.grey.withOpacity(0.1)),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: _locationActive
                          ? const Color(0xFF2e7d32)
                          : (_locationPermissionDenied ? Colors.orange : Colors.grey),
                      width: 1.5,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _locationActive ? Icons.location_on : Icons.location_off,
                        color: _locationActive
                            ? const Color(0xFF2e7d32)
                            : (_locationPermissionDenied ? Colors.orange : Colors.grey),
                        size: 22,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _locationActive
                              ? 'Location sharing: Active'
                              : (_locationPermissionDenied
                                  ? 'Location permission denied — tap to retry'
                                  : 'Location sharing: Starting...'),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: _locationActive
                                ? const Color(0xFF2e7d32)
                                : (_locationPermissionDenied ? Colors.orange[800] : Colors.grey[700]),
                          ),
                        ),
                      ),
                      if (_locationPermissionDenied)
                        IconButton(
                          icon: const Icon(Icons.refresh, color: Colors.orange),
                          onPressed: _startLocationTracking,
                        ),
                    ],
                  ),
                ),

                // Voice Pulse Button section
                const SizedBox(height: 20),
                Center(
                  child: Column(
                    children: [
                      GestureDetector(
                        onTap: _listen,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          width: _isListening ? 200 : 180,
                          height: _isListening ? 200 : 180,
                          decoration: BoxDecoration(
                            color: _isListening ? Colors.red : const Color(0xFF1975d2),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 8),
                            boxShadow: [
                              BoxShadow(color: (_isListening ? Colors.red : const Color(0xFF1975d2)).withOpacity(0.4), blurRadius: _isListening ? 36 : 24, spreadRadius: _isListening ? 12 : 8),
                            ],
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(_isListening ? Icons.mic_rounded : Icons.mic, color: Colors.white, size: 64),
                              Text(_isListening ? 'LISTENING...' : 'TAP TO TALK', style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        _isListening ? '$_text' : '"Hey SmartSaathi, remind me to take my medicine"',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _isListening ? Colors.black87 : const Color(0xFF1975d2)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Medication Card
               if (_medicinePending) ...[
                  const Row(
                    children: [
                      Icon(Icons.medication, color: Color(0xFF1975d2), size: 32),
                      SizedBox(width: 8),
                      Text('Next Task', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF1975d2), width: 4),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 16, offset: const Offset(0, 8)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('COMING UP AT 10:00 AM', style: TextStyle(color: Color(0xFF1975d2), fontWeight: FontWeight.bold, fontSize: 16, letterSpacing: 1.5)),
                        const SizedBox(height: 8),
                        const Text('Take Aspirin', style: TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: Colors.black87)),
                        const SizedBox(height: 4),
                        const Text('1 Pill with water after breakfast', style: TextStyle(fontSize: 20, color: Colors.black54)),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          height: 64,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              setState(() => _medicinePending = false);
                            },
                            icon: const Icon(Icons.check_circle, size: 32),
                            label: const Text('I TOOK IT', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF2e7d32),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                ],

                // Water Tracker
                const Row(
                  children: [
                    Icon(Icons.water_drop, color: Colors.blue, size: 32),
                    SizedBox(width: 8),
                    Text('Drink Water', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.blue[200]!, width: 4),
                  ),
                  child: Column(
                    children: [
                      const Wrap(
                        spacing: 16,
                        runSpacing: 16,
                        alignment: WrapAlignment.center,
                        children: [
                          Icon(Icons.local_drink, color: Colors.blue, size: 48),
                          Icon(Icons.local_drink, color: Colors.blue, size: 48),
                          Icon(Icons.local_drink, color: Colors.blue, size: 48),
                          Icon(Icons.local_drink, color: Colors.blue, size: 48),
                          Icon(Icons.local_drink, color: Colors.grey, size: 48),
                          Icon(Icons.local_drink, color: Colors.grey, size: 48),
                          Icon(Icons.local_drink, color: Colors.grey, size: 48),
                          Icon(Icons.local_drink, color: Colors.grey, size: 48),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('4 of 8 glasses done', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          ElevatedButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.add),
                            label: const Text('ADD GLASS', style: TextStyle(fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue[600],
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                            ),
                          ),
                        ],
                      )
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Family Screen
                const Text('Family', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.grey[200]!, width: 2),
                        ),
                        child: Column(
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFF1975d2), width: 4),
                                color: Colors.grey[300],
                              ),
                              child: const Icon(Icons.person, size: 48, color: Colors.white),
                            ),
                            const SizedBox(height: 16),
                            const Text('Call Sarah', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                            const Text('(Daughter)', style: TextStyle(color: Colors.grey, fontSize: 16)),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.grey[200]!, width: 2),
                        ),
                        child: Column(
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(color: const Color(0xFF1975d2), width: 4),
                                color: Colors.grey[300],
                              ),
                              child: const Icon(Icons.person, size: 48, color: Colors.white),
                            ),
                            const SizedBox(height: 16),
                            const Text('Call David', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                            const Text('(Son)', style: TextStyle(color: Colors.grey, fontSize: 16)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 48),
              ],
            ),
          ),

          // SOS FAB
          Positioned(
            right: 20,
            bottom: 110,
            child: GestureDetector(
              onTap: _triggerSOS,
              child: Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: const Color(0xFFd32f2f),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 6),
                  boxShadow: [
                    BoxShadow(color: const Color(0xFFd32f2f).withOpacity(0.5), blurRadius: 20, spreadRadius: 4),
                  ],
                ),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.sos, color: Colors.white, size: 48),
                    Text('SOS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: const Color(0xFF1975d2).withOpacity(0.1), width: 8)),
        ),
        padding: const EdgeInsets.only(bottom: 24, top: 12),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.home, size: 40, color: Color(0xFF1975d2)),
                Text('HOME', style: TextStyle(color: Color(0xFF1975d2), fontWeight: FontWeight.bold)),
              ],
            ),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.calendar_month, size: 40, color: Colors.grey),
                Text('MY DAY', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
              ],
            ),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.group, size: 40, color: Colors.grey),
                Text('FAMILY', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
