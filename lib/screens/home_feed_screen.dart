import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/voice_service.dart';
import '../services/nlp_service.dart';
import '../services/supabase_service.dart';
import '../services/location_service.dart';

class HomeFeedScreen extends ConsumerStatefulWidget {
  const HomeFeedScreen({super.key});

  @override
  ConsumerState<HomeFeedScreen> createState() => _HomeFeedScreenState();
}

class _HomeFeedScreenState extends ConsumerState<HomeFeedScreen> {
  String _sttOutput = "Tap to talk...";
  String _ttsResponse = "";

  void _triggerEmergency() async {
    final locationService = ref.read(locationServiceProvider);
    final supabaseService = ref.read(supabaseServiceProvider);
    
    final position = await locationService.getCurrentPosition();
    if (position != null) {
      await supabaseService.triggerSOS(position.latitude, position.longitude);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('SOS Alert sent to Family!')));
      }
    }
  }

  void _onMicPressed() async {
    final voice = ref.read(voiceServiceProvider);
    final nlp = ref.read(nlpServiceProvider);

    if (voice.isListening) {
      voice.stopListening();
    } else {
      setState(() {
        _sttOutput = "Listening...";
        _ttsResponse = "";
      });
      
      bool available = await voice.initSpeech();
      if (available) {
        voice.startListening((text) async {
          setState(() {
            _sttOutput = text;
          });
          
          // Only process when speech concludes (simple delay check can be done, or force user to tap stop to send)
           final response = await nlp.processIntent(text);
           setState(() {
             _ttsResponse = response['response']!;
           });
           voice.speakHindi(response['response']!);
        });
      } else {
        setState(() => _sttOutput = "Mic access denied");
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final voice = ref.watch(voiceServiceProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF6F7F8),
      appBar: AppBar(
        title: const Text('Smart Saathi'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text("Hello John,", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              
              // Speech Bubble
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10, spreadRadius: 2)],
                ),
                child: Column(
                  children: [
                    Text("💬 $_sttOutput", style: const TextStyle(fontSize: 20, fontStyle: FontStyle.italic)),
                    if (_ttsResponse.isNotEmpty) ...[
                      const Divider(height: 30),
                      Text("SmartSaathi: $_ttsResponse", style: const TextStyle(fontSize: 18, color: Color(0xFF2196F3))),
                    ]
                  ],
                ),
              ),
              const SizedBox(height: 40),

              // Mic Button
              GestureDetector(
                onTap: _onMicPressed,
                child: CircleAvatar(
                  radius: 60,
                  backgroundColor: voice.isListening ? Colors.red : const Color(0xFF2196F3),
                  child: Icon(voice.isListening ? Icons.stop : Icons.mic, size: 60, color: Colors.white),
                ),
              ),
              const SizedBox(height: 10),
              Center(
                child: Text(
                  voice.isListening ? "Tap to Stop" : "Tap to Talk", 
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)
                )
              ),
              
              const Spacer(),
              
              // Upcoming Schedule & Water
              const Card(
                child: ListTile(
                  leading: Icon(Icons.medical_information, color: Color(0xFFFF5722), size: 40),
                  title: Text("Upcoming: Aspirin", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  subtitle: Text("10:00 AM after breakfast", style: TextStyle(fontSize: 16)),
                ),
              ),
              const SizedBox(height: 10),
              const Card(
                child: ListTile(
                  leading: Icon(Icons.water_drop, color: Colors.blue, size: 40),
                  title: Text("Drink Water Tracker", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  subtitle: Text("3/5 glasses today", style: TextStyle(fontSize: 16)),
                  trailing: CircularProgressIndicator(value: 0.6, backgroundColor: Colors.grey),
                ),
              ),
              const SizedBox(height: 10),
              // Family Section
              Card(
                child: ListTile(
                  leading: const CircleAvatar(child: Text("S")),
                  title: const Text("Family: Sarah", style: TextStyle(fontSize: 18)),
                  trailing: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    onPressed: _triggerEmergency,
                    child: const Text("SOS", style: TextStyle(color: Colors.white)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
