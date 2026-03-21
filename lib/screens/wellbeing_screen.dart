import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../services/supabase_service.dart';
import '../services/voice_service.dart';
import '../models/wellbeing_log.dart';

class WellbeingScreen extends StatefulWidget {
  const WellbeingScreen({super.key});

  @override
  State<WellbeingScreen> createState() => _WellbeingScreenState();
}

class _WellbeingScreenState extends State<WellbeingScreen> {
  final _supabase = SupabaseService.instance;
  final _voice = VoiceService();
  List<WellbeingLog> _logs = [];
  String? _selectedMood;
  final _symptomsController = TextEditingController();
  bool _isLoading = true;

  final _moods = [
    {'key': 'happy', 'emoji': '😊', 'label': 'Happy'},
    {'key': 'okay', 'emoji': '🙂', 'label': 'Okay'},
    {'key': 'sad', 'emoji': '😔', 'label': 'Sad'},
    {'key': 'unwell', 'emoji': '🤒', 'label': 'Unwell'},
  ];

  final _commonSymptoms = [
    'Headache', 'Body pain', 'Fever', 'Cough', 'Fatigue',
    'Dizziness', 'Nausea', 'Breathless', 'Joint pain', 'No appetite',
  ];

  final Set<String> _selectedSymptoms = {};

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _voice.initialize();
    await _loadData();
  }

  Future<void> _loadData() async {
    try {
      final logs = await _supabase.getWellbeingLogs(limit: 14);
      final today = await _supabase.getTodayWellbeing();
      if (mounted) {
        setState(() {
          _logs = logs;
          _selectedMood = today?.mood;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveMood(String mood) async {
    String? symptoms;
    if (_selectedSymptoms.isNotEmpty) {
      symptoms = _selectedSymptoms.join(', ');
    }
    if (_symptomsController.text.isNotEmpty) {
      symptoms = symptoms != null
          ? '$symptoms, ${_symptomsController.text}'
          : _symptomsController.text;
    }

    await _supabase.addWellbeingLog(mood, symptoms: symptoms);
    setState(() => _selectedMood = mood);
    _symptomsController.clear();
    _selectedSymptoms.clear();

    final moodLabel = _moods.firstWhere((m) => m['key'] == mood)['label'];
    _voice.speak(_voice.isHindi
        ? 'आपका मूड "$moodLabel" लॉग किया गया। ख्याल रखें!'
        : 'Mood logged as "$moodLabel". Take care!');

    await _loadData();
  }

  @override
  void dispose() {
    _symptomsController.dispose();
    _voice.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Well-Being',
            style: GoogleFonts.poppins(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF2E7D32))),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Mood selection
                  Text(
                    'How are you feeling today?',
                    style: GoogleFonts.poppins(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: const Color(0xFF1A1A2E),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: _moods
                        .map((m) => Expanded(
                              child: GestureDetector(
                                onTap: () {
                                  setState(
                                      () => _selectedMood = m['key'] as String);
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  margin:
                                      const EdgeInsets.symmetric(horizontal: 4),
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 18),
                                  decoration: BoxDecoration(
                                    color: _selectedMood == m['key']
                                        ? const Color(0xFF2E7D32).withAlpha(25)
                                        : Colors.white,
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(
                                      color: _selectedMood == m['key']
                                          ? const Color(0xFF2E7D32)
                                          : Colors.grey.shade200,
                                      width:
                                          _selectedMood == m['key'] ? 2 : 1,
                                    ),
                                    boxShadow: _selectedMood == m['key']
                                        ? [
                                            BoxShadow(
                                              color: const Color(0xFF2E7D32)
                                                  .withAlpha(20),
                                              blurRadius: 10,
                                              offset: const Offset(0, 4),
                                            ),
                                          ]
                                        : null,
                                  ),
                                  child: Column(
                                    children: [
                                      Text(m['emoji'] as String,
                                          style:
                                              const TextStyle(fontSize: 32)),
                                      const SizedBox(height: 6),
                                      Text(
                                        m['label'] as String,
                                        style: GoogleFonts.poppins(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: _selectedMood == m['key']
                                              ? const Color(0xFF2E7D32)
                                              : Colors.grey.shade600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ))
                        .toList(),
                  ),
                  const SizedBox(height: 24),

                  // Symptoms
                  Text('Any symptoms?',
                      style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF1A1A2E))),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _commonSymptoms.map((s) {
                      final isSelected = _selectedSymptoms.contains(s);
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            if (isSelected) {
                              _selectedSymptoms.remove(s);
                            } else {
                              _selectedSymptoms.add(s);
                            }
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFFE53935).withAlpha(20)
                                : Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isSelected
                                  ? const Color(0xFFE53935)
                                  : Colors.grey.shade200,
                            ),
                          ),
                          child: Text(
                            s,
                            style: GoogleFonts.poppins(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: isSelected
                                  ? const Color(0xFFE53935)
                                  : Colors.grey.shade700,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),

                  // Notes field
                  TextField(
                    controller: _symptomsController,
                    style: GoogleFonts.poppins(fontSize: 16),
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'Any other notes...',
                      hintStyle: GoogleFonts.poppins(color: Colors.grey.shade400),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Save button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: _selectedMood != null
                          ? () => _saveMood(_selectedMood!)
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2E7D32),
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: Colors.grey.shade300,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(18)),
                      ),
                      child: Text(
                        'Save Check-in',
                        style: GoogleFonts.poppins(
                            fontSize: 17, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Voice button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        await _voice.speak(_voice.isHindi
                            ? 'आप कैसा महसूस कर रहे हैं?'
                            : 'How are you feeling?');
                        _voice.startListening((text) {
                          final cmd = _voice.parseCommand(text);
                          if (cmd.type == CommandType.wellbeingLog) {
                            _saveMood(cmd.data?['mood'] ?? 'okay');
                          }
                        });
                      },
                      icon: const Icon(Icons.mic),
                      label: Text('Voice Check-in',
                          style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF2E7D32),
                        side: const BorderSide(color: Color(0xFF2E7D32)),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(18)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),

                  // History
                  Text('Recent Check-ins',
                      style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF1A1A2E))),
                  const SizedBox(height: 12),
                  if (_logs.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      child: Center(
                        child: Text('No check-ins yet',
                            style: GoogleFonts.poppins(
                                color: Colors.grey.shade400, fontSize: 15)),
                      ),
                    )
                  else
                    ..._logs.map(_historyCard),
                  const SizedBox(height: 60),
                ],
              ),
            ),
    );
  }

  Widget _historyCard(WellbeingLog log) {
    final moodData = _moods.firstWhere(
      (m) => m['key'] == log.mood,
      orElse: () => {'key': 'okay', 'emoji': '🙂', 'label': 'Okay'},
    );
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(6),
              blurRadius: 10,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Row(
        children: [
          Text(moodData['emoji'] as String,
              style: const TextStyle(fontSize: 32)),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(moodData['label'] as String,
                    style: GoogleFonts.poppins(
                        fontSize: 16, fontWeight: FontWeight.w700)),
                if (log.symptoms != null)
                  Text(log.symptoms!,
                      style: GoogleFonts.poppins(
                          fontSize: 13, color: Colors.grey.shade500)),
              ],
            ),
          ),
          Text(
            DateFormat('MMM d\nh:mm a').format(log.timestamp),
            style: GoogleFonts.poppins(
                fontSize: 12,
                color: Colors.grey.shade400,
                fontWeight: FontWeight.w500),
            textAlign: TextAlign.right,
          ),
        ],
      ),
    );
  }
}
