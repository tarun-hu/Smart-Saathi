import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/supabase_service.dart';
import '../services/voice_service.dart';
import '../services/sos_service.dart';
import '../services/notification_service.dart';
import '../models/nominee.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  final _supabase = SupabaseService.instance;
  final _voice = VoiceService();
  late SosService _sos;
  final _notif = NotificationService();

  String _userName = 'Friend';
  String _userPhone = '';
  int _pendingMeds = 0;
  int _hydrationMl = 0;
  String? _todayMood;
  List<Nominee> _nominees = [];
  bool _isVoiceActive = false;
  String _voiceStatus = '';
  String _lastCommand = '';

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
    await _loadData();
  }

  Future<void> _loadData() async {
    try {
      final profile = await _supabase.getProfile();
      final pendingMeds = await _supabase.getPendingMedsCount();
      final hydration = await _supabase.getTodayHydration();
      final wellbeing = await _supabase.getTodayWellbeing();
      final nominees = await _supabase.getNominees();

      if (mounted) {
        setState(() {
          _userName = profile?['full_name'] ?? 'Friend';
          _userPhone = profile?['phone'] ?? '';
          _pendingMeds = pendingMeds;
          _hydrationMl = hydration;
          _todayMood = wellbeing?.mood;
          _nominees = nominees;
        });
      }
    } catch (e) {
      debugPrint('Load data error: $e');
    }
  }

  void _startVoice() async {
    if (_voice.isListening) {
      _voice.stopListening();
      setState(() {
        _isVoiceActive = false;
        _voiceStatus = '';
      });
      return;
    }

    setState(() {
      _isVoiceActive = true;
      _voiceStatus = 'Listening... Say something!';
    });

    await _voice.speak(_voice.isHindi
        ? 'मैं सुन रहा हूँ, बताइए क्या मदद चाहिए?'
        : 'How can I help you?');

    _voice.startListening(
      (text) => _processCommand(text),
      onPartial: (text) {
        setState(() => _lastCommand = text);
      },
    );
  }

  Future<void> _processCommand(String text) async {
    setState(() {
      _isVoiceActive = false;
      _lastCommand = text;
      _voiceStatus = 'Processing: "$text"';
    });

    final command = _voice.parseCommand(text);

    switch (command.type) {
      case CommandType.sos:
        await _triggerSos();
        break;
      case CommandType.medAdd:
        final name = command.data?['name'] ?? '';
        final time = command.data?['time'] ?? '8:00 AM';
        final freq = command.data?['frequency'] ?? 'daily';
        if (name.isNotEmpty) {
          await _supabase.addMedication(name, '1 tablet', time, freq);
          await _voice.speak('${_voice.isHindi ? "दवाई जोड़ दी गई" : "Medicine added"}: $name at $time');
          _notif.showMedicationReminder(
            id: DateTime.now().millisecondsSinceEpoch % 100000,
            medName: name,
            dosage: '1 tablet',
            time: time,
          );
        } else {
          await _voice.speak(_voice.isHindi
              ? 'कृपया दवाई का नाम बताइए'
              : 'Please tell me the medicine name');
        }
        break;
      case CommandType.medTaken:
        await _voice.speak(_voice.isHindi
            ? 'बहुत अच्छे! दवाई ली गई।'
            : 'Great! Medicine marked as taken.');
        break;
      case CommandType.hydration:
        final amount = int.tryParse(command.data?['amount'] ?? '250') ?? 250;
        await _supabase.addHydration(amount);
        setState(() => _hydrationMl += amount);
        await _voice.speak(_voice.isHindi
            ? '$amount ml पानी लॉग किया। आज कुल $_hydrationMl ml'
            : '$amount ml water logged. Today total: $_hydrationMl ml');
        break;
      case CommandType.wellbeingCheck:
        await _voice.speak(_voice.isHindi
            ? 'आप कैसा महसूस कर रहे हैं? खुश, ठीक, उदास, या अस्वस्थ?'
            : 'How are you feeling? Happy, okay, sad, or unwell?');
        // Start listening again for mood response
        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) _startVoice();
        });
        break;
      case CommandType.wellbeingLog:
        final mood = command.data?['mood'] ?? 'okay';
        await _supabase.addWellbeingLog(mood);
        setState(() => _todayMood = mood);
        await _voice.speak(_voice.isHindi
            ? 'आपका मूड "$mood" लॉग किया गया'
            : 'Mood logged as "$mood"');
        break;
      case CommandType.status:
        await _voice.speak(_voice.isHindi
            ? 'आज: $_pendingMeds दवाइयाँ बाकी, $_hydrationMl ml पानी पिया, मूड: ${_todayMood ?? "अभी तक नहीं"}'
            : 'Today: $_pendingMeds meds pending, ${_hydrationMl}ml water, mood: ${_todayMood ?? "not logged yet"}');
        break;
      case CommandType.unknown:
        await _voice.speak(_voice.isHindi
            ? 'समझ नहीं आया। कृपया फिर से कहें।'
            : 'I didn\'t understand that. Please try again.');
        break;
    }

    await _loadData();
    setState(() => _voiceStatus = '');
  }

  Future<void> _triggerSos() async {
    if (_nominees.isEmpty) {
      await _voice.speak(_voice.isHindi
          ? 'कोई नॉमिनी नहीं मिला। कृपया पहले परिवार के सदस्य जोड़ें।'
          : 'No nominees found. Please add family members first.');
      return;
    }

    await _voice.speak(_voice.isHindi
        ? 'आपातकालीन अलर्ट भेजा जा रहा है!'
        : 'Sending emergency alert to your family!');

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
      case 'happy':
        return '😊';
      case 'okay':
        return '🙂';
      case 'sad':
        return '😔';
      case 'unwell':
        return '🤒';
      default:
        return '❓';
    }
  }

  @override
  void dispose() {
    _voice.dispose();
    _pulseController.dispose();
    _sosGlowController.dispose();
    if (_sos.isActive) _sos.stopSos();
    super.dispose();
  }

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
                const SizedBox(height: 80),
              ],
            ),
          ),
        ),
      ),
    );
  }

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
                    'Sending alerts to ${_nominees.length} nominees...',
                    style: GoogleFonts.poppins(
                      fontSize: 13,
                      color: Colors.white.withAlpha(200),
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

  Widget _buildVoiceHub() {
    return GestureDetector(
      onTap: _startVoice,
      child: AnimatedBuilder(
        animation: _pulseController,
        builder: (context, _) {
          final scale = _isVoiceActive
              ? 1.0 + (_pulseController.value * 0.05)
              : 1.0;
          return Transform.scale(
            scale: scale,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: _isVoiceActive
                      ? [const Color(0xFF4A148C), const Color(0xFF7B1FA2)]
                      : [const Color(0xFF1A237E), const Color(0xFF283593)],
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: (_isVoiceActive
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
                      color: Colors.white.withAlpha(_isVoiceActive ? 40 : 25),
                    ),
                    child: Icon(
                      _isVoiceActive ? Icons.mic : Icons.mic_none_rounded,
                      size: 36,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _isVoiceActive ? 'Listening...' : '🎙  "Hey Saathi"',
                    style: GoogleFonts.poppins(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _isVoiceActive
                        ? _lastCommand.isNotEmpty
                            ? '"$_lastCommand"'
                            : 'Say a command...'
                        : 'Tap to speak',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      color: Colors.white.withAlpha(180),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

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
