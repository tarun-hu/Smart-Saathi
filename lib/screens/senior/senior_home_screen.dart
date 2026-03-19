import 'package:flutter/material.dart';
import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/supabase_service.dart';
import '../../services/voice_service.dart';
import '../../services/nlp_service.dart';
import '../../services/location_service.dart';

class SeniorHomeScreen extends ConsumerStatefulWidget {
  const SeniorHomeScreen({super.key});

  @override
  ConsumerState<SeniorHomeScreen> createState() => _SeniorHomeScreenState();
}

class _SeniorHomeScreenState extends ConsumerState<SeniorHomeScreen> {
  bool _isListening = false;
  String _lastResponse = '';
  String _lastCommand = '';

  Future<void> _startVoiceCommand() async {
    setState(() {
      _isListening = true;
      _lastCommand = '';
      _lastResponse = '';
    });
    try {
      final voiceService = ref.read(voiceServiceProvider);
      await voiceService.initSpeech();
      final completer = Completer<String>();
      voiceService.startListening((text) {
        if (!completer.isCompleted && text.isNotEmpty) completer.complete(text);
      });
      final command = await completer.future
          .timeout(const Duration(seconds: 6), onTimeout: () {
        voiceService.stopListening();
        return '';
      });
      voiceService.stopListening();
      setState(() {
        _isListening = false;
        _lastCommand = command;
      });
      if (command.isEmpty) return;

      final nlp = ref.read(nlpServiceProvider);
      final result = await nlp.processIntent(command);
      final intent = result['intent'] ?? 'UNKNOWN';
      final response = result['response'] ?? 'I did not understand.';

      switch (intent) {
        case 'HYDRATION':
          await ref.read(supabaseServiceProvider).addHydrationGlass();
          ref.invalidate(todayHydrationProvider);
          break;
        case 'SOS':
          final pos =
              await ref.read(locationServiceProvider).getCurrentPosition();
          await ref.read(supabaseServiceProvider).triggerSOS(
                pos?.latitude ?? 28.61,
                pos?.longitude ?? 77.20,
              );
          break;
        case 'SYMPTOM_TRIAGE':
          await ref
              .read(supabaseServiceProvider)
              .addHealthLog(symptoms: command);
          break;
        case 'LOG_BP':
          final bp = double.tryParse(result['entity'] ?? '');
          if (bp != null) {
            await ref.read(supabaseServiceProvider).addHealthLog(bp: bp);
          }
          break;
        case 'LOG_SUGAR':
          final sugar = double.tryParse(result['entity'] ?? '');
          if (sugar != null) {
            await ref.read(supabaseServiceProvider).addHealthLog(sugar: sugar);
          }
          break;
        case 'LOG_TEMPERATURE':
          final temp = double.tryParse(result['entity'] ?? '');
          if (temp != null) {
            await ref
                .read(supabaseServiceProvider)
                .addHealthLog(temperature: temp);
          }
          break;
      }

      setState(() => _lastResponse = response);
      try {
        await ref.read(voiceServiceProvider).speakHindi(response);
      } catch (_) {}
    } catch (e) {
      setState(() {
        _isListening = false;
        _lastResponse = 'Error: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final medsAsync = ref.watch(medicationsStreamProvider);
    final hydrationAsync = ref.watch(todayHydrationProvider);
    final profileAsync = ref.watch(userProfileProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── GREETING ────────────────────────
              profileAsync.when(
                data: (profile) {
                  final name = profile?['full_name'] ?? 'User';
                  final hour = DateTime.now().hour;
                  final greeting = hour < 12
                      ? 'Good Morning'
                      : hour < 17
                          ? 'Good Afternoon'
                          : 'Good Evening';
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(greeting,
                          style: TextStyle(
                              fontSize: 18, color: Colors.grey.shade600)),
                      const SizedBox(height: 4),
                      Text(name,
                          style: const TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1A1A2E))),
                    ],
                  );
                },
                loading: () => const SizedBox(height: 56),
                error: (_, _) => const Text('Hello!',
                    style: TextStyle(
                        fontSize: 32, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 28),

              // ── VOICE BUTTON ────────────────────
              Center(
                child: GestureDetector(
                  onTap: _isListening ? null : _startVoiceCommand,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    width: _isListening ? 160 : 140,
                    height: _isListening ? 160 : 140,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: _isListening
                            ? [
                                const Color(0xFFFF5722),
                                const Color(0xFFFF8A65)
                              ]
                            : [
                                const Color(0xFF2196F3),
                                const Color(0xFF64B5F6)
                              ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: (_isListening
                                  ? const Color(0xFFFF5722)
                                  : const Color(0xFF2196F3))
                              .withAlpha(80),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                            _isListening ? Icons.graphic_eq : Icons.mic,
                            color: Colors.white,
                            size: 48),
                        const SizedBox(height: 6),
                        Text(
                          _isListening ? 'Listening...' : 'Tap to Talk',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // ── VOICE RESPONSE BUBBLE ───────────
              if (_lastResponse.isNotEmpty) ...[
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                        color: const Color(0xFF2196F3).withAlpha(30)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (_lastCommand.isNotEmpty)
                        Text('You said: "$_lastCommand"',
                            style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey.shade500,
                                fontStyle: FontStyle.italic)),
                      if (_lastCommand.isNotEmpty) const SizedBox(height: 6),
                      Text(_lastResponse,
                          style: const TextStyle(
                              fontSize: 18, color: Color(0xFF1A1A2E))),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 24),

              // ── UPCOMING MEDICATIONS ────────────
              const Text('Upcoming Medications',
                  style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1A1A2E))),
              const SizedBox(height: 12),
              medsAsync.when(
                data: (meds) {
                  final pending =
                      meds.where((m) => m.status == 'pending').toList();
                  if (pending.isEmpty) {
                    return Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                          color: const Color(0xFF4CAF50).withAlpha(15),
                          borderRadius: BorderRadius.circular(16)),
                      child: const Row(
                        children: [
                          Icon(Icons.check_circle,
                              color: Color(0xFF4CAF50), size: 32),
                          SizedBox(width: 12),
                          Text('All medications taken! ✅',
                              style: TextStyle(
                                  fontSize: 18, color: Color(0xFF4CAF50))),
                        ],
                      ),
                    );
                  }
                  return Column(
                    children: pending
                        .take(3)
                        .map((m) =>
                            _buildMedCard(m.name, m.dose, m.time, m.id))
                        .toList(),
                  );
                },
                loading: () =>
                    const Center(child: CircularProgressIndicator()),
                error: (e, _) => Text('Error loading meds: $e'),
              ),
              const SizedBox(height: 24),

              // ── HYDRATION TRACKER ───────────────
              const Text('Hydration Today',
                  style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1A1A2E))),
              const SizedBox(height: 12),
              hydrationAsync.when(
                data: (glasses) => _buildHydrationCard(glasses),
                loading: () =>
                    const Center(child: CircularProgressIndicator()),
                error: (_, _) => _buildHydrationCard(0),
              ),
              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMedCard(String name, String dose, String time, String id) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 8,
              offset: const Offset(0, 2))
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: const Color(0xFFFF5722).withAlpha(20),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.medication,
                color: Color(0xFFFF5722), size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name,
                    style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A2E))),
                Text('$dose • $time',
                    style:
                        TextStyle(fontSize: 14, color: Colors.grey.shade500)),
              ],
            ),
          ),
          SizedBox(
            height: 44,
            child: ElevatedButton(
              onPressed: () async {
                await ref
                    .read(supabaseServiceProvider)
                    .updateMedicationStatus(id, 'taken');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4CAF50),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(80, 44),
              ),
              child: const Text('Taken',
                  style:
                      TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHydrationCard(int glasses) {
    const goal = 8;
    final progress = (glasses / goal).clamp(0.0, 1.0);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 8,
              offset: const Offset(0, 2))
        ],
      ),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            height: 80,
            child: Stack(
              fit: StackFit.expand,
              children: [
                CircularProgressIndicator(
                  value: progress,
                  strokeWidth: 8,
                  backgroundColor: Colors.blue.shade50,
                  valueColor:
                      const AlwaysStoppedAnimation(Color(0xFF2196F3)),
                ),
                Center(
                  child: Text('$glasses/$goal',
                      style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF2196F3))),
                ),
              ],
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Water Glasses',
                    style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A2E))),
                Text(
                    glasses >= goal
                        ? 'Goal reached! 🎉'
                        : '${goal - glasses} more to go',
                    style: TextStyle(
                        fontSize: 15, color: Colors.grey.shade500)),
              ],
            ),
          ),
          SizedBox(
            width: 56,
            height: 56,
            child: ElevatedButton(
              onPressed: () async {
                await ref
                    .read(supabaseServiceProvider)
                    .addHydrationGlass();
                ref.invalidate(todayHydrationProvider);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2196F3),
                foregroundColor: Colors.white,
                shape: const CircleBorder(),
                padding: EdgeInsets.zero,
                minimumSize: const Size(56, 56),
              ),
              child: const Icon(Icons.add, size: 28),
            ),
          ),
        ],
      ),
    );
  }
}
