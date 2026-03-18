import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
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
  int _waterGlasses = 0;
  Timer? _hydrationTimer;

  @override
  void initState() {
    super.initState();
    _hydrationTimer = Timer.periodic(const Duration(hours: 1), (timer) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("🕰️ Time to drink a glass of water, Senior!", style: TextStyle(fontSize: 18)),
            backgroundColor: Color(0xFF1976D2),
            duration: Duration(seconds: 10),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _hydrationTimer?.cancel();
    super.dispose();
  }

  void _addWaterGlass() {
    if (_waterGlasses < 8) {
      setState(() {
        _waterGlasses++;
      });
      ref.read(supabaseServiceProvider).addHealthLog("Drank 1 glass of water (Total: $_waterGlasses/8)");
    }
  }

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
            
            final intent = response['intent'];
            final entity = response['entity'];
            
            // Handle logical branches
            if (intent == 'CALL_FAMILY' && entity != null) {
               final families = ref.read(familyMembersStreamProvider).value ?? [];
               final match = families.where((f) => f.name.toLowerCase().contains(entity.toLowerCase())).toList();
               if (match.isNotEmpty) {
                  voice.speakHindi("Calling ${match.first.name}");
                  final url = Uri.parse("tel:${match.first.phone}");
                  if (await canLaunchUrl(url)) await launchUrl(url);
               } else {
                  voice.speakHindi("Sorry, I couldn't find $entity in your family list.");
               }
            } 
            else if (intent == 'MARK_MEDICATION_DONE') {
               final meds = ref.read(medicationsStreamProvider).value ?? [];
               final pending = meds.where((m) => m.status != 'taken').toList();
               if (pending.isNotEmpty) {
                  await ref.read(supabaseServiceProvider).updateMedicationStatus(pending.first.id, 'taken');
                  voice.speakHindi("I marked ${pending.first.name} as taken.");
               } else {
                  voice.speakHindi("You have no pending medications.");
               }
            }
            else if (intent == 'READ_MEDICATIONS') {
               final meds = ref.read(medicationsStreamProvider).value ?? [];
               final pending = meds.where((m) => m.status != 'taken').toList();
               if (pending.isEmpty) {
                  voice.speakHindi("You have no upcoming medicines for today.");
               } else {
                  String speech = "You need to take ";
                  for (var m in pending) {
                    speech += "${m.name} at ${m.time}. ";
                  }
                  voice.speakHindi(speech);
               }
            }
            else if (intent == 'sos') {
               voice.speakHindi(response['response']!);
               await ref.read(supabaseServiceProvider).triggerSOS(28.61, 77.20);
            } 
            else if (intent == 'HYDRATION') {
               voice.speakHindi(response['response']!);
               _addWaterGlass();
            } 
            else {
               voice.speakHindi(response['response'] ?? "I heard you.");
               await ref.read(supabaseServiceProvider).addHealthLog(response['response'] ?? "Voice task logged");
            }
          }
        });
      }
    }
  }

  void _triggerEmergency() async {
     try {
       await ref.read(supabaseServiceProvider).triggerSOS(28.61, 77.20);
       if (!mounted) return;
       ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Emergency SOS Sent to Family!")));
     } catch (e) {
       if (!mounted) return;
       ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
     }
  }

  void _showAddFamilyDialog() {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final relationController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Add Family Member"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Name')),
            TextField(controller: phoneController, decoration: const InputDecoration(labelText: 'Phone Number (e.g. +91...)'), keyboardType: TextInputType.phone),
            TextField(controller: relationController, decoration: const InputDecoration(labelText: 'Relation (e.g. Son)')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          ElevatedButton(
            onPressed: () async {
               if (nameController.text.isNotEmpty && phoneController.text.isNotEmpty) {
                 Navigator.pop(context);
                 try {
                   await ref.read(supabaseServiceProvider).addFamilyMember(nameController.text, phoneController.text, relationController.text);
                   if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Family member added successfully!")));
                 } catch (e) {
                   if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
                 }
               }
            },
            child: const Text("Add"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final medicationsAsync = ref.watch(medicationsStreamProvider);
    final familyMembersAsync = ref.watch(familyMembersStreamProvider);
    final profileAsync = ref.watch(userProfileProvider);
    final todayDate = DateFormat('EEEE, MMM d').format(DateTime.now());

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
                            children: [
                              profileAsync.when(
                                data: (profile) => Text("Hello, ${profile?['full_name'] ?? 'Senior'}", style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F2633))),
                                loading: () => const Text("Loading...", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                                error: (err, stack) => const Text("Hello", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                              ),
                              Text(todayDate, style: const TextStyle(fontSize: 14, color: Color(0xFF3B5768))),
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
                      final pending = meds.where((m) => m.status != 'taken').toList();
                      if (pending.isEmpty) {
                        return Center(child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          child: Text("No upcoming tasks!", style: TextStyle(color: Colors.grey.shade600, fontSize: 16, fontWeight: FontWeight.w500)),
                        ));
                      }
                      final nextMed = pending.first;
                      return _buildTaskCard(nextMed.id, nextMed.name, "${nextMed.dose} - ${nextMed.time}", nextMed.time);
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
                          children: List.generate(4, (index) => Icon(Icons.local_drink, color: index < _waterGlasses ? const Color(0xFF1976D2) : Colors.blue.withAlpha(60), size: 32)),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: List.generate(4, (index) => Icon(Icons.local_drink, color: (index + 4) < _waterGlasses ? const Color(0xFF1976D2) : Colors.blue.withAlpha(60), size: 32)),
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text("$_waterGlasses of 8\nglasses\ndone", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF2196F3),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                              ),
                              icon: const Icon(Icons.add, color: Colors.white),
                              label: const Text("ADD GLASS", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                              onPressed: _addWaterGlass,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 30),

                  // Family Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("Family", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F2633))),
                      IconButton(
                        icon: const Icon(Icons.add_circle, color: Color(0xFF2196F3), size: 28),
                        onPressed: _showAddFamilyDialog,
                        tooltip: "Add Family",
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  familyMembersAsync.when(
                    data: (members) {
                      if (members.isEmpty) {
                        return Center(child: Text("No family members added yet.", style: TextStyle(color: Colors.grey.shade500)));
                      }
                      return SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: members.map((fam) => Padding(
                            padding: const EdgeInsets.only(right: 15),
                            child: _buildFamilyCard(fam.name, "(\${fam.relation})"),
                          )).toList(),
                        ),
                      );
                    },
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (err, stack) => Text('Error: $err'),
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

  Widget _buildTaskCard(String id, String name, String details, String time) {
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
              onPressed: () async {
                 await ref.read(supabaseServiceProvider).updateMedicationStatus(id, 'taken');
                 if (!mounted) return;
                 ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Awesome! Marked $name as taken.')));
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFamilyCard(String name, String rel) {
    return SizedBox(
      width: 120,
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
