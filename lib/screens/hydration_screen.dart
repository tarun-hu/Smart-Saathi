import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/supabase_service.dart';
import '../services/voice_service.dart';

class HydrationScreen extends StatefulWidget {
  const HydrationScreen({super.key});

  @override
  State<HydrationScreen> createState() => _HydrationScreenState();
}

class _HydrationScreenState extends State<HydrationScreen>
    with SingleTickerProviderStateMixin {
  final _supabase = SupabaseService.instance;
  final _voice = VoiceService();
  int _todayMl = 0;
  final int _goalMl = 2000;
  bool _isLoading = true;

  late AnimationController _waveController;

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat();
    _init();
  }

  Future<void> _init() async {
    await _voice.initialize();
    await _loadData();
  }

  Future<void> _loadData() async {
    try {
      final ml = await _supabase.getTodayHydration();
      if (mounted) {
        setState(() {
          _todayMl = ml;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _addWater(int ml) async {
    await _supabase.addHydration(ml);
    setState(() => _todayMl += ml);

    final glassesDone = (_todayMl / 250).floor();
    final remaining = ((_goalMl - _todayMl) / 250).ceil();

    if (_todayMl >= _goalMl) {
      _voice.speak(_voice.isHindi
          ? 'शाबाश! आज का लक्ष्य पूरा हो गया!'
          : 'Excellent! You\'ve reached your daily goal!');
    } else {
      _voice.speak(_voice.isHindi
          ? '$ml ml पानी जोड़ा। कुल $glassesDone गिलास। $remaining गिलास और पीजिए!'
          : '${ml}ml added. $glassesDone glasses done. $remaining more to go!');
    }
  }

  @override
  void dispose() {
    _waveController.dispose();
    _voice.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final progress = (_todayMl / _goalMl).clamp(0.0, 1.0);
    final glasses = (_todayMl / 250).floor();
    final goalGlasses = (_goalMl / 250).floor();

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Hydration',
            style: GoogleFonts.poppins(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF1565C0))),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  // Water visual
                  Container(
                    height: 300,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          const Color(0xFF1565C0).withAlpha(10),
                          const Color(0xFF1565C0).withAlpha(30),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(28),
                      border: Border.all(
                          color: const Color(0xFF1565C0).withAlpha(30)),
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Water fill
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 800),
                            curve: Curves.easeOut,
                            height: 300 * progress,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  const Color(0xFF42A5F5).withAlpha(120),
                                  const Color(0xFF1565C0).withAlpha(180),
                                ],
                              ),
                              borderRadius: const BorderRadius.vertical(
                                  bottom: Radius.circular(28)),
                            ),
                          ),
                        ),
                        // Text overlay
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.water_drop_rounded,
                              size: 48,
                              color: progress > 0.5
                                  ? Colors.white
                                  : const Color(0xFF1565C0),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '${_todayMl}ml',
                              style: GoogleFonts.poppins(
                                fontSize: 42,
                                fontWeight: FontWeight.w900,
                                color: progress > 0.5
                                    ? Colors.white
                                    : const Color(0xFF1565C0),
                              ),
                            ),
                            Text(
                              'of ${_goalMl}ml goal',
                              style: GoogleFonts.poppins(
                                fontSize: 16,
                                color: progress > 0.5
                                    ? Colors.white.withAlpha(200)
                                    : const Color(0xFF1565C0).withAlpha(150),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '$glasses / $goalGlasses glasses 🥤',
                              style: GoogleFonts.poppins(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: progress > 0.5
                                    ? Colors.white
                                    : const Color(0xFF1565C0),
                              ),
                            ),
                            if (_todayMl >= _goalMl) ...[
                              const SizedBox(height: 8),
                              const Text('🎉 Goal reached!',
                                  style: TextStyle(fontSize: 22)),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Progress bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 12,
                      backgroundColor: const Color(0xFF1565C0).withAlpha(30),
                      valueColor: const AlwaysStoppedAnimation(Color(0xFF1565C0)),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${(progress * 100).toInt()}% of daily goal',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      color: Colors.grey.shade500,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Quick add buttons
                  Text('Add Water',
                      style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF1565C0))),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      _waterButton('🥤', '100ml', 100),
                      const SizedBox(width: 10),
                      _waterButton('🥛', '250ml', 250),
                      const SizedBox(width: 10),
                      _waterButton('🫗', '500ml', 500),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Voice button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        await _voice.speak(_voice.isHindi
                            ? 'बताइए कितना पानी पिया?'
                            : 'Tell me how much water you drank');
                        _voice.startListening((text) {
                          final cmd = _voice.parseCommand(text);
                          if (cmd.type == CommandType.hydration) {
                            final ml = int.tryParse(
                                    cmd.data?['amount'] ?? '250') ??
                                250;
                            _addWater(ml);
                          }
                        });
                      },
                      icon: const Icon(Icons.mic, color: Colors.white),
                      label: Text('Log by Voice',
                          style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontWeight: FontWeight.w700)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1565C0),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(18)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 60),
                ],
              ),
            ),
    );
  }

  Widget _waterButton(String emoji, String label, int ml) {
    return Expanded(
      child: GestureDetector(
        onTap: () => _addWater(ml),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 22),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                  color: Colors.blue.withAlpha(15),
                  blurRadius: 12,
                  offset: const Offset(0, 4)),
            ],
            border: Border.all(color: const Color(0xFF1565C0).withAlpha(20)),
          ),
          child: Column(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 32)),
              const SizedBox(height: 6),
              Text(label,
                  style: GoogleFonts.poppins(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF1565C0))),
            ],
          ),
        ),
      ),
    );
  }
}
