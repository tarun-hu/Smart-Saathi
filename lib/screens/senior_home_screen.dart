import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/voice_service.dart';
import '../services/nlp_service.dart';
import '../services/supabase_service.dart';

class SeniorHomeScreen extends ConsumerStatefulWidget {
  const SeniorHomeScreen({super.key});

  @override
  ConsumerState<SeniorHomeScreen> createState() => _SeniorHomeScreenState();
}

class _SeniorHomeScreenState extends ConsumerState<SeniorHomeScreen> {
  String _helperText = "\"Hey SmartSaathi, remind me to take my medicine\"";
  bool _isListeningUI = false;

  void _onMicPressed() async {
    final voice = ref.read(voiceServiceProvider);
    final nlp = ref.read(nlpServiceProvider);

    if (voice.isListening) {
      voice.stopListening();
      setState(() => _isListeningUI = false);
    } else {
      bool available = await voice.initSpeech();
      if (available) {
        setState(() {
          _isListeningUI = true;
          _helperText = "Listening...";
        });
        voice.startListening((text) async {
          setState(() {
            _helperText = text.isEmpty ? "Listening..." : '"$text"';
          });
          
          if (!voice.isListening && text.isNotEmpty) {
            final response = await nlp.processIntent(text);
            setState(() {
              _helperText = "(SmartSaathi) \${response['response']}";
            });
            voice.speakHindi(response['response']!);
            
            // Log intent to DB if it's SOS or Health
            if (response['intent'] == 'sos') {
               await ref.read(supabaseServiceProvider).triggerSOS(28.61, 77.20);
            }
          }
        });
      }
    }
  }

  void _triggerEmergency() async {
     try {
       await ref.read(supabaseServiceProvider).triggerSOS(28.61, 77.20);
       if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Emergency SOS Sent to Family!")));
     } catch (e) {
       if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
     }
  }

  @override
  Widget build(BuildContext context) {
    final medicationsAsync = ref.watch(medicationsStreamProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF4F8FA),
      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // App Bar Match
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const CircleAvatar(
                            radius: 25,
                            backgroundColor: Color(0xFFFFB74D),
                            child: Icon(Icons.person, color: Colors.white, size: 35),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text("Hello, John", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F2633))),
                              Text("Friday, Oct 25", style: TextStyle(fontSize: 14, color: Color(0xFF3B5768))),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        decoration: BoxDecoration(color: Colors.blue.withAlpha(25), shape: BoxShape.circle, border: Border.all(color: Colors.blue.withAlpha(50))),
                        child: IconButton(icon: const Icon(Icons.settings, color: Color(0xFF2196F3)), onPressed: () {}),
                      ),
                    ],
                  ),
                  const SizedBox(height: 30),

                  // Big Tap To Talk Button
                  Center(
                    child: Column(
                      children: [
                        GestureDetector(
                          onTap: _onMicPressed,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            width: 160,
                            height: 160,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _isListeningUI ? Colors.redAccent : const Color(0xFF1976D2),
                              border: Border.all(color: Colors.white, width: 6),
                              boxShadow: [BoxShadow(color: const Color(0xFF1976D2).withAlpha(60), blurRadius: 20, spreadRadius: 10)],
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(_isListeningUI ? Icons.stop : Icons.mic, size: 50, color: Colors.white),
                                const SizedBox(height: 8),
                                Text(_isListeningUI ? "TAP TO STOP" : "TAP TO TALK", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20.0),
                          child: Text(
                            _helperText,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF1976D2)),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 30),

                  // Next Task Card from DB
                  Row(
                    children: const [
                      Icon(Icons.medication, color: Color(0xFF1976D2), size: 28),
                      SizedBox(width: 8),
                      Text("Next Task", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F2633))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  
                  medicationsAsync.when(
                    data: (meds) {
                      if (meds.isEmpty) {
                        return _buildTaskCard("Take Aspirin", "1 Pill with water after breakfast", "10:00 AM");
                      }
                      final nextMed = meds.first;
                      return _buildTaskCard(nextMed.name, "${nextMed.dose} - ${nextMed.time}", nextMed.time);
                    },
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (err, stack) => Text('Error: $err'),
                  ),

                  const SizedBox(height: 30),

                  // Drink Water Section
                  Row(
                    children: const [
                      Icon(Icons.water_drop, color: Color(0xFF2196F3), size: 28),
                      SizedBox(width: 8),
                      Text("Drink Water", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F2633))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE3F2FD),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.blue.withAlpha(30)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: List.generate(4, (index) => Icon(Icons.local_drink, color: index < 3 ? const Color(0xFF1976D2) : Colors.blue.withAlpha(60), size: 32)),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: List.generate(4, (index) => Icon(Icons.local_drink, color: Colors.blue.withAlpha(60), size: 32)),
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text("3 of 8\nglasses\ndone", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2196F3),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                              ),
                              icon: const Icon(Icons.add, color: Colors.white),
                              label: const Text("ADD GLASS", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                              onPressed: () {},
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 30),

                  // Family Section
                  const Text("Family", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F2633))),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _buildFamilyCard("Sarah", "(Daughter)", "assets/avatar1.jpg"),
                      const SizedBox(width: 15),
                      _buildFamilyCard("David", "(Son)", "assets/avatar2.jpg"),
                    ],
                  ),
                  const SizedBox(height: 100), // padding for FAB
                ],
              ),
            ),

            // Drifting floating SOS Button
            Positioned(
              right: 20,
              bottom: 20,
              child: GestureDetector(
                onTap: _triggerEmergency,
                child: Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    color: const Color(0xFFD32F2F),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(color: Colors.red.withAlpha(100), blurRadius: 30, spreadRadius: 10),
                      BoxShadow(color: Colors.white, blurRadius: 10, spreadRadius: 2),
                    ]
                  ),
                  child: const Center(
                    child: Text("SOS\nSOS", textAlign: TextAlign.center, style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20, height: 1.0)),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskCard(String name, String details, String time) {
     return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF1976D2), width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("COMING UP AT $time", style: const TextStyle(color: Color(0xFF1976D2), fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          const SizedBox(height: 8),
          Text(name, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF0F2633))),
          const SizedBox(height: 4),
          Text(details, style: const TextStyle(fontSize: 16, color: Color(0xFF4A6572))),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 55,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D32),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
              ),
              icon: const Icon(Icons.check_circle, color: Colors.white),
              label: const Text("I TOOK IT", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18, letterSpacing: 1)),
              onPressed: () {},
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFamilyCard(String name, String rel, String asset) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.grey.withAlpha(50)),
        ),
        child: Column(
          children: [
            const CircleAvatar(radius: 30, backgroundColor: Colors.amber, child: Icon(Icons.person, color: Colors.white, size: 30)),
            const SizedBox(height: 10),
            Text("Call\n$name", textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
            Text(rel, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
