import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../services/supabase_service.dart';
import '../services/voice_service.dart';
import '../services/sos_service.dart';
import '../services/notification_service.dart';
import '../services/ai_service.dart';
import '../services/update_service.dart';
import '../models/nominee.dart';
import '../models/hydration_log.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  final _supabase = SupabaseService.instance;
  final _voice = VoiceService.instance;
  late SosService _sos;
  final _notif = NotificationService();
  final _ai = AIService.instance;

  String _userName = 'Friend';
  String _userPhone = '';
  int _pendingMeds = 0;
  int _hydrationMl = 0;
  String? _todayMood;
  List<Nominee> _nominees = [];
  List<HydrationLog> _hydrationLogs = [];

  // Voice assistant state
  bool _isVoiceActive = false;
  String _voiceStatus = '';
  String _lastCommand = '';
  String _aiResponse = '';
  bool _isConversationMode = false;
  Timer? _conversationTimer;

  late AnimationController _pulseController;
  late AnimationController _sosGlowController;

  @override
  void initState() {
    super.initState();
    _sos = SosService(_supabase);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _sosGlowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);

    _init();
  }

  Future<void> _init() async {
    await _voice.initialize();
    await _notif.initialize();
    await _ai.initialize();
    await _loadData();

    // Start wake word listening — "Hey Saathi"
    _startWakeWordMode();

    // Check for app updates
    _checkForUpdates();
  }

  void _startWakeWordMode() {
    if (!_voice.isInitialized) return;
    _voice.startWakeWordListening((command) async {
      // Wake word detected! Process the command
      if (command.isNotEmpty) {
        await _processCommand(command);
      } else {
        // Wake word detected but no command — activate listening mode
        await _startVoice();
      }
    });
    if (mounted) setState(() {});
  }

  Future<void> _checkForUpdates() async {
    final release = await UpdateService.checkForUpdate();
    if (release != null && mounted) {
      UpdateService.showUpdateDialog(context, release);
    }
  }

  Future<void> _loadData() async {
    try {
      final profile = await _supabase.getProfile();
      final pendingMeds = await _supabase.getPendingMedsCount();
      final hydration = await _supabase.getTodayHydration();
      final wellbeing = await _supabase.getTodayWellbeing();
      final nominees = await _supabase.getNominees();
      final hydrationLogs = await _supabase.getTodayHydrationLogs();

      if (mounted) {
        setState(() {
          _userName = profile?['full_name'] ?? 'Friend';
          _userPhone = profile?['phone'] ?? '';
          _pendingMeds = pendingMeds;
          _hydrationMl = hydration;
          _todayMood = wellbeing?.mood;
          _nominees = nominees;
          _hydrationLogs = hydrationLogs;
        });

        // Update AI service with user context
        _ai.updateUserContext(
          userName: _userName,
          pendingMeds: _pendingMeds,
          hydrationMl: _hydrationMl,
          mood: _todayMood,
        );
      }
    } catch (e) {
      debugPrint('Load data error: $e');
    }
  }

  // ──── VOICE ASSISTANT ──────────────────────────

  Future<void> _startVoice() async {
    // Toggle off if already active
    if (_voice.isListening && _isVoiceActive) {
      _voice.stopListening();
      setState(() {
        _isVoiceActive = false;
        _voiceStatus = '';
        _isConversationMode = false;
      });
      _conversationTimer?.cancel();
      // Resume wake word mode
      _startWakeWordMode();
      return;
    }

    // Stop wake word mode temporarily
    _voice.stopWakeWordListening();

    setState(() {
      _isVoiceActive = true;
      _voiceStatus = _voice.isHindi ? 'सुन रहा हूँ...' : 'Listening...';
      _aiResponse = '';
    });

    await _voice.speak(_voice.isHindi
        ? 'मैं सुन रहा हूँ, बताइए क्या मदद चाहिए?'
        : 'How can I help you?');

    _startActiveListening();
  }

  void _startActiveListening() {
    _voice.startListening(
      (text) => _processCommand(text),
      onPartial: (text) {
        if (mounted) setState(() => _lastCommand = text);
      },
    );
  }

  /// After AI responds, stay in conversation mode for a few seconds
  void _enterConversationMode() {
    _conversationTimer?.cancel();
    _isConversationMode = true;

    // Wait for TTS to finish, then listen for 8 more seconds
    _conversationTimer = Timer(const Duration(seconds: 2), () {
      if (!mounted || !_isConversationMode) return;

      setState(() {
        _isVoiceActive = true;
        _voiceStatus = _voice.isHindi
            ? 'और कुछ बताइए...'
            : 'Anything else?';
      });

      _voice.startListening(
        (text) => _processCommand(text),
        onPartial: (text) {
          if (mounted) setState(() => _lastCommand = text);
        },
      );

      // Auto-exit conversation mode after timeout
      _conversationTimer = Timer(const Duration(seconds: 10), () {
        if (!mounted) return;
        setState(() {
          _isVoiceActive = false;
          _isConversationMode = false;
          _voiceStatus = '';
        });
        _startWakeWordMode();
      });
    });
  }

  Future<void> _processCommand(String text) async {
    _conversationTimer?.cancel();
    _voice.setProcessing(true);

    setState(() {
      _isVoiceActive = false;
      _lastCommand = text;
      _voiceStatus = _voice.isHindi ? 'सोच रहा हूँ...' : 'Processing...';
    });

    final aiResponse = await _ai.chat(text);

    if (aiResponse.isToolCall) {
      final name = aiResponse.toolName;
      final args = aiResponse.toolArgs ?? {};

      switch (name) {
        case 'trigger_sos':
          await _triggerSos();
          break;
        case 'add_medication':
          final medName = args['name'] as String? ?? '';
          final time = args['time'] as String? ?? '8:00 AM';
          final freq = args['frequency'] as String? ?? 'daily';
          if (medName.isNotEmpty) {
            try {
              await _supabase.addMedication(medName, '1 tablet', time, freq);
              await _voice.speak(_voice.isHindi
                  ? 'दवाई "$medName" जोड़ दी गई, $time पर याद दिलाऊंगा'
                  : 'Medicine "$medName" added. I\'ll remind you at $time');
              _notif.scheduleMedicationReminder(
                id: DateTime.now().millisecondsSinceEpoch % 100000,
                medName: medName,
                dosage: '1 tablet',
                time: time,
              );
            } catch (e) {
              await _voice.speak(_voice.isHindi
                  ? 'दवाई जोड़ने में समस्या हुई'
                  : 'There was a problem adding the medicine');
            }
          }
          break;
        case 'mark_medication_taken':
          try {
            final meds = await _supabase.getMedications();
            final pending = meds.where((m) => m.status == 'pending').toList();
            if (pending.isNotEmpty) {
              await _supabase.updateMedicationStatus(pending.first.id, 'taken');
              await _voice.speak(_voice.isHindi
                  ? 'बहुत अच्छे! "${pending.first.name}" ली गई।'
                  : 'Great! "${pending.first.name}" marked as taken.');
            } else {
              await _voice.speak(_voice.isHindi
                  ? 'कोई दवाई बाकी नहीं है!'
                  : 'No pending medicines to mark as taken!');
            }
          } catch (e) {
            await _voice.speak(_voice.isHindi
                ? 'बहुत अच्छे! दवाई ली गई।'
                : 'Great! Medicine marked as taken.');
          }
          break;
        case 'log_water':
          final amount = args['amount'] as int? ?? 250;
          await _supabase.addHydration(amount);
          setState(() => _hydrationMl += amount);
          await _voice.speak(_voice.isHindi
              ? '$amount ml पानी लॉग किया। आज कुल $_hydrationMl ml'
              : '$amount ml water logged. Today total: $_hydrationMl ml');
          break;
        case 'log_wellbeing':
          final mood = args['mood'] as String? ?? 'okay';
          await _supabase.addWellbeingLog(mood);
          setState(() => _todayMood = mood);
          await _voice.speak(_voice.isHindi
              ? 'आपका मूड "$mood" लॉग किया गया'
              : 'Mood logged as "$mood"');
          break;
        case 'get_status':
          await _voice.speak(_voice.isHindi
              ? 'आज: $_pendingMeds दवाइयाँ बाकी, $_hydrationMl ml पानी पिया, मूड: ${_todayMood ?? "अभी तक नहीं"}'
              : 'Today: $_pendingMeds meds pending, ${_hydrationMl}ml water, mood: ${_todayMood ?? "not logged yet"}');
          break;
        case 'navigate_to':
          final target = args['target'] as String? ?? '/home';
          if (mounted) {
            context.go(target);
            await _voice.speak(_voice.isHindi
                ? 'पीछे ले जा रहा हूँ।'
                : 'Taking you there now.');
          }
          break;
        default:
          await _voice.speak(_voice.isHindi
              ? 'मुझे समझ नहीं आया।'
              : 'I am not sure how to do that.');
      }
    } else if (aiResponse.text != null && aiResponse.text!.isNotEmpty) {
      setState(() => _aiResponse = aiResponse.text!);
      await _voice.speak(aiResponse.text!);
    } else {
      await _voice.speak(_voice.isHindi
          ? 'समझ नहीं आया। कृपया फिर से कहें।'
          : 'I didn\'t understand that. Please try again.');
    }

    await _loadData();
    _voice.setProcessing(false);
    setState(() => _voiceStatus = '');

    // After processing, enter conversation mode briefly
    _enterConversationMode();
  }

  // ──── SOS ──────────────────────────────────────

  Future<void> _triggerSos() async {
    // Always re-fetch nominees fresh from database
    try {
      final freshNominees = await _supabase.getNominees();
      setState(() => _nominees = freshNominees);
    } catch (e) {
      debugPrint('Failed to refresh nominees: $e');
    }

    if (_nominees.isEmpty) {
      await _voice.speak(_voice.isHindi
          ? 'कोई नॉमिनी नहीं मिला। कृपया पहले प्रोफ़ाइल में परिवार के सदस्य जोड़ें।'
          : 'No nominees found. Please add family members in your Profile first.');
      // Navigate to profile screen to add nominees
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Add nominees in Profile to enable SOS',
                style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            action: SnackBarAction(
              label: 'Go to Profile',
              textColor: Colors.white,
              onPressed: () => context.go('/profile'),
            ),
            backgroundColor: const Color(0xFFD32F2F),
            duration: const Duration(seconds: 5),
          ),
        );
      }
      return;
    }

    await _voice.speak(_voice.isHindi
        ? 'आपातकालीन अलर्ट ${_nominees.length} सदस्यों को भेजा जा रहा है!'
        : 'Sending emergency alert to ${_nominees.length} family member${_nominees.length > 1 ? "s" : ""}!');

    await _notif.showSosActiveNotification();

    await _sos.triggerSos(
      seniorName: _userName,
      seniorPhone: _userPhone,
      nominees: _nominees,
      onStatusUpdate: () {
        if (mounted) setState(() {});
      },
    );
  }

  void _stopSos() {
    _sos.stopSos();
    _notif.cancelSosNotification();
    _voice.speak(_voice.isHindi
        ? 'आपातकालीन अलर्ट बंद किया गया'
        : 'Emergency alert stopped');
    setState(() {});
  }

  // ──── HELPERS ──────────────────────────────────

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (_voice.isHindi) {
      if (hour < 12) return 'सुप्रभात';
      if (hour < 17) return 'नमस्ते';
      return 'शुभ संध्या';
    }
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  String _moodEmoji(String? mood) {
    switch (mood) {
      case 'happy': return '😊';
      case 'okay': return '🙂';
      case 'sad': return '😔';
      case 'unwell': return '🤒';
      default: return '❓';
    }
  }

  String _getVoiceStateLabel() {
    if (_voice.isSpeaking) return '🗣 Speaking...';
    if (_voice.isProcessing) return '🧠 Thinking...';
    if (_isVoiceActive) {
      if (_lastCommand.isNotEmpty) return '"$_lastCommand"';
      return _voice.isHindi ? '🎙 बोलिए...' : '🎙 Say something...';
    }
    if (_voice.isWakeWordMode) {
      return '🟢 "Hey Saathi" active';
    }
    return 'Tap to speak';
  }

  @override
  void dispose() {
    _conversationTimer?.cancel();
    _voice.stopWakeWordListening();
    _voice.dispose();
    _pulseController.dispose();
    _sosGlowController.dispose();
    if (_sos.isActive) _sos.stopSos();
    super.dispose();
  }

  // ──── BUILD ────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5FA),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Greeting
                Text(
                  _getGreeting(),
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  _userName,
                  style: GoogleFonts.poppins(
                    fontSize: 30,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF1A237E),
                  ),
                ),
                const SizedBox(height: 20),

                // SOS Button
                _buildSosButton(),
                const SizedBox(height: 20),

                // Voice Hub
                _buildVoiceHub(),
                const SizedBox(height: 20),

                // AI Response
                if (_aiResponse.isNotEmpty) ...[
                  _buildAIResponseCard(),
                  const SizedBox(height: 16),
                ],

                // Quick Status Cards
                Text(
                  "Today's Summary",
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF1A237E),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _statusCard(
                        icon: Icons.medication_rounded,
                        label: 'Meds Pending',
                        value: '$_pendingMeds',
                        color: const Color(0xFFFF6F00),
                        bgColor: const Color(0xFFFFF3E0),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _statusCard(
                        icon: Icons.water_drop_rounded,
                        label: 'Water',
                        value: '${_hydrationMl}ml',
                        color: const Color(0xFF1565C0),
                        bgColor: const Color(0xFFE3F2FD),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _statusCard(
                        icon: Icons.mood_rounded,
                        label: 'Mood',
                        value: _moodEmoji(_todayMood),
                        color: const Color(0xFF2E7D32),
                        bgColor: const Color(0xFFE8F5E9),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Voice status
                if (_voiceStatus.isNotEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1A237E).withAlpha(10),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF1A237E).withAlpha(30)),
                    ),
                    child: Row(
                      children: [
                        const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Color(0xFF1A237E),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _voiceStatus,
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              color: const Color(0xFF1A237E),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                // Quick actions
                Text(
                  'Quick Actions',
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF1A237E),
                  ),
                ),
                const SizedBox(height: 12),
                _quickAction(
                  Icons.water_drop,
                  'Drink Water',
                  'Log a glass of water',
                  const Color(0xFF1565C0),
                  () async {
                    await _supabase.addHydration(250);
                    setState(() => _hydrationMl += 250);
                    await _loadData();
                    _voice.speak(_voice.isHindi
                        ? 'एक गिलास पानी लॉग किया गया'
                        : 'One glass of water logged');
                  },
                ),
                const SizedBox(height: 10),
                _quickAction(
                  Icons.mood,
                  'How am I?',
                  'Check daily summary',
                  const Color(0xFF2E7D32),
                  () async {
                    await _voice.speak(_voice.isHindi
                        ? 'आज: $_pendingMeds दवाइयाँ बाकी, $_hydrationMl ml पानी।'
                        : 'Today: $_pendingMeds meds pending, ${_hydrationMl}ml water');
                  },
                ),
                const SizedBox(height: 24),

                // Water tracking section
                _buildWaterSection(),
                const SizedBox(height: 80),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ──── SOS BUTTON WIDGET ────────────────────────

  Widget _buildSosButton() {
    final isActive = _sos.isActive;
    return AnimatedBuilder(
      animation: _sosGlowController,
      builder: (context, child) {
        return GestureDetector(
          onTap: isActive ? _stopSos : _triggerSos,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isActive
                    ? [const Color(0xFFB71C1C), const Color(0xFFD32F2F)]
                    : [const Color(0xFFD32F2F), const Color(0xFFE53935)],
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.red.withAlpha(isActive
                      ? (60 + (_sosGlowController.value * 80).toInt())
                      : 60),
                  blurRadius: isActive ? 30 : 20,
                  offset: const Offset(0, 8),
                  spreadRadius: isActive ? 5 : 0,
                ),
              ],
            ),
            child: Column(
              children: [
                Icon(
                  isActive ? Icons.stop_circle : Icons.sos_rounded,
                  size: 56,
                  color: Colors.white,
                ),
                const SizedBox(height: 8),
                Text(
                  isActive ? 'TAP TO STOP SOS' : '🚨 SOS EMERGENCY',
                  style: GoogleFonts.poppins(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: 2,
                  ),
                ),
                if (isActive) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Sending SMS + WhatsApp to ${_nominees.length} nominee${_nominees.length != 1 ? "s" : ""}...',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      color: Colors.white.withAlpha(200),
                    ),
                  ),
                ] else if (_nominees.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    '${_nominees.length} nominee${_nominees.length != 1 ? "s" : ""} ready',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      color: Colors.white.withAlpha(180),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  // ──── VOICE HUB WIDGET ─────────────────────────

  Widget _buildVoiceHub() {
    final isActive = _isVoiceActive || _voice.isSpeaking || _voice.isProcessing;
    return GestureDetector(
      onTap: _startVoice,
      child: AnimatedBuilder(
        animation: _pulseController,
        builder: (context, _) {
          final scale = isActive
              ? 1.0 + (_pulseController.value * 0.05)
              : 1.0;
          return Transform.scale(
            scale: scale,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isActive
                      ? [const Color(0xFF4A148C), const Color(0xFF7B1FA2)]
                      : _voice.isWakeWordMode
                          ? [const Color(0xFF1A237E), const Color(0xFF283593)]
                          : [const Color(0xFF37474F), const Color(0xFF455A64)],
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: (isActive
                            ? const Color(0xFF7B1FA2)
                            : const Color(0xFF1A237E))
                        .withAlpha(50),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withAlpha(isActive ? 40 : 25),
                    ),
                    child: Icon(
                      isActive
                          ? Icons.mic
                          : _voice.isWakeWordMode
                              ? Icons.hearing_rounded
                              : Icons.mic_none_rounded,
                      size: 36,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    isActive
                        ? (_voice.isSpeaking ? 'Speaking...' : 'Listening...')
                        : '🎙  "Hey Saathi"',
                    style: GoogleFonts.poppins(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _getVoiceStateLabel(),
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      color: Colors.white.withAlpha(180),
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // ──── AI RESPONSE CARD ─────────────────────────

  Widget _buildAIResponseCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF7B1FA2).withAlpha(12),
            const Color(0xFF4A148C).withAlpha(8),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF7B1FA2).withAlpha(25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFF7B1FA2).withAlpha(20),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.smart_toy_rounded,
                    size: 18, color: Color(0xFF7B1FA2)),
              ),
              const SizedBox(width: 8),
              Text('Saathi',
                  style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF7B1FA2))),
              const Spacer(),
              GestureDetector(
                onTap: () => setState(() => _aiResponse = ''),
                child: Icon(Icons.close, size: 18, color: Colors.grey.shade400),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            _aiResponse,
            style: GoogleFonts.poppins(
              fontSize: 15,
              color: const Color(0xFF1A1A2E),
              height: 1.5,
            ),
          ),
          if (_lastCommand.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              'You said: "$_lastCommand"',
              style: GoogleFonts.poppins(
                  fontSize: 11, color: Colors.grey.shade500, fontStyle: FontStyle.italic),
            ),
          ],
        ],
      ),
    );
  }

  // ──── WATER SECTION ────────────────────────────

  Widget _buildWaterSection() {
    final progress = (_hydrationMl / 2000).clamp(0.0, 1.0);
    final glasses = (_hydrationMl / 250).floor();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.withAlpha(12),
            blurRadius: 15,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.water_drop_rounded,
                  size: 24, color: Color(0xFF1565C0)),
              const SizedBox(width: 8),
              Text("Today's Water",
                  style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF1565C0))),
              const Spacer(),
              Text('$glasses 🥤',
                  style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF1565C0))),
            ],
          ),
          const SizedBox(height: 14),

          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 10,
              backgroundColor: const Color(0xFF1565C0).withAlpha(25),
              valueColor:
                  const AlwaysStoppedAnimation(Color(0xFF1565C0)),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '${_hydrationMl}ml / 2000ml  •  ${(progress * 100).toInt()}%',
            style: GoogleFonts.poppins(
                fontSize: 13,
                color: Colors.grey.shade500,
                fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 16),

          // Quick add buttons
          Row(
            children: [
              _miniWaterBtn('🥤', '100ml', 100),
              const SizedBox(width: 8),
              _miniWaterBtn('🥛', '250ml', 250),
              const SizedBox(width: 8),
              _miniWaterBtn('🫗', '500ml', 500),
            ],
          ),
          const SizedBox(height: 14),

          // Recent logs
          if (_hydrationLogs.isNotEmpty) ...[
            Text('Recent',
                style: GoogleFonts.poppins(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade500)),
            const SizedBox(height: 6),
            ..._hydrationLogs.take(5).map((log) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      const Icon(Icons.water_drop,
                          size: 14, color: Color(0xFF42A5F5)),
                      const SizedBox(width: 6),
                      Text('${log.amount}ml',
                          style: GoogleFonts.poppins(
                              fontSize: 13, fontWeight: FontWeight.w600)),
                      const Spacer(),
                      Text(
                        DateFormat('h:mm a').format(log.timestamp),
                        style: GoogleFonts.poppins(
                            fontSize: 12, color: Colors.grey.shade400),
                      ),
                    ],
                  ),
                )),
          ],
        ],
      ),
    );
  }

  Widget _miniWaterBtn(String emoji, String label, int ml) {
    return Expanded(
      child: GestureDetector(
        onTap: () async {
          await _supabase.addHydration(ml);
          setState(() => _hydrationMl += ml);
          await _loadData();
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFF1565C0).withAlpha(12),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF1565C0).withAlpha(20)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(emoji, style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 4),
              Text(label,
                  style: GoogleFonts.poppins(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF1565C0))),
            ],
          ),
        ),
      ),
    );
  }

  // ──── REUSABLE WIDGETS ─────────────────────────

  Widget _statusCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withAlpha(30)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 28, color: color),
          const SizedBox(height: 8),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 11,
              color: color.withAlpha(180),
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _quickAction(IconData icon, String title, String subtitle, Color color,
      VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
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
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: color.withAlpha(20),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: color, size: 26),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: GoogleFonts.poppins(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF1A1A2E))),
                  Text(subtitle,
                      style: GoogleFonts.poppins(
                          fontSize: 13, color: Colors.grey.shade500)),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios,
                size: 18, color: Colors.grey.shade400),
          ],
        ),
      ),
    );
  }
}
