import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/supabase_service.dart';
import '../services/voice_service.dart';
import '../services/ai_service.dart';
import '../models/medication.dart';

class MedicationsScreen extends StatefulWidget {
  const MedicationsScreen({super.key});

  @override
  State<MedicationsScreen> createState() => _MedicationsScreenState();
}

class _MedicationsScreenState extends State<MedicationsScreen> {
  final _supabase = SupabaseService.instance;
  final _voice = VoiceService();
  List<Medication> _medications = [];
  bool _isLoading = true;
  StreamSubscription<List<Medication>>? _medicationsSub;
  Future<void>? _voiceInitFuture;
  bool _voiceReady = false;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _refreshMeds();
    _listenForMeds();
  }

  Future<void> _refreshMeds() async {
    try {
      final meds = await _supabase.getMedications();
      _setMedications(meds);
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
      _showSnack('Could not load medications: ${_friendlyError(e)}');
    }
  }

  void _listenForMeds() {
    _medicationsSub?.cancel();
    _medicationsSub = _supabase.getMedicationsStream().listen((meds) {
      _setMedications(meds);
    }, onError: (error) {
      _showSnack('Live updates are unavailable. Refreshing medications instead.');
      unawaited(_refreshMeds());
    });
  }

  Future<void> _ensureVoiceReady() {
    if (_voiceReady) return Future.value();
    return _voiceInitFuture ??= _voice.initialize().then((_) {
      _voiceReady = true;
    }).catchError((error) {
      _voiceInitFuture = null;
      throw error;
    });
  }

  Future<void> _speakIfReady(String message) async {
    if (!_voiceReady) return;
    await _voice.speak(message);
  }

  void _setMedications(List<Medication> meds) {
    if (!mounted) return;
    final sorted = [...meds]..sort((a, b) => a.time.compareTo(b.time));
    setState(() {
      _medications = sorted;
      _isLoading = false;
    });
  }

  void _upsertMedication(Medication medication) {
    final meds = [..._medications];
    final index = meds.indexWhere((m) => m.id == medication.id);
    if (index == -1) {
      meds.add(medication);
    } else {
      meds[index] = medication;
    }
    _setMedications(meds);
  }

  void _showSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  String _friendlyError(Object error) {
    final message = error.toString().replaceFirst('Exception: ', '');
    if (message.contains('linked_senior_id')) {
      return 'The medications database policy is outdated. Run fix_medications_policies.sql in Supabase and try again.';
    }
    return message;
  }

  Future<void> _addMedDialog() async {
    final nameC = TextEditingController();
    final dosageC = TextEditingController(text: '1 tablet');
    final timeC = TextEditingController(text: '08:00 AM');
    String frequency = 'daily';

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDlg) => Container(
          padding: EdgeInsets.fromLTRB(
              24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text('Add Medication',
                  style: GoogleFonts.poppins(
                      fontSize: 22, fontWeight: FontWeight.w800)),
              const SizedBox(height: 20),
              _dialogField(nameC, 'Medicine Name', Icons.medication),
              const SizedBox(height: 12),
              _dialogField(dosageC, 'Dosage', Icons.medical_services),
              const SizedBox(height: 12),
              _dialogField(timeC, 'Time (e.g. 8:00 AM)', Icons.access_time),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: frequency,
                decoration: InputDecoration(
                  labelText: 'Frequency',
                  prefixIcon: const Icon(Icons.repeat),
                  filled: true,
                  fillColor: Colors.grey.shade100,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none),
                ),
                items: ['daily', 'twice daily', 'weekly', 'as needed']
                    .map((f) => DropdownMenuItem(value: f, child: Text(f)))
                    .toList(),
                onChanged: (v) => setDlg(() => frequency = v ?? 'daily'),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF6F00),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () async {
                    final name = nameC.text.trim();
                    if (name.isEmpty) {
                      _showSnack('Please enter a medicine name.');
                      return;
                    }

                    try {
                      final medication = await _supabase.addMedication(
                        name,
                        dosageC.text.trim(),
                        timeC.text.trim(),
                        frequency,
                      );
                      _upsertMedication(medication);
                      if (ctx.mounted) Navigator.pop(ctx);
                      _showSnack('Medicine added.');
                      unawaited(_speakIfReady('Medicine "$name" added'));
                    } catch (e) {
                      _showSnack('Could not add medicine: ${_friendlyError(e)}');
                    }
                  },
                  child: Text('Add Medicine',
                      style: GoogleFonts.poppins(
                          fontSize: 17, fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _dialogField(
      TextEditingController c, String label, IconData icon) {
    return TextField(
      controller: c,
      style: GoogleFonts.poppins(fontSize: 16),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        filled: true,
        fillColor: Colors.grey.shade100,
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none),
      ),
    );
  }

  @override
  void dispose() {
    _medicationsSub?.cancel();
    _voice.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pending = _medications.where((m) => m.status == 'pending').toList();
    final taken = _medications.where((m) => m.status == 'taken').toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Medications',
            style: GoogleFonts.poppins(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF1A237E))),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFFF6F00).withAlpha(20),
              borderRadius: BorderRadius.circular(12),
            ),
            child: IconButton(
              onPressed: _addMedDialog,
              icon: const Icon(Icons.add_rounded,
                  color: Color(0xFFFF6F00), size: 28),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _medications.isEmpty
              ? _emptyState()
              : ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    if (pending.isNotEmpty) ...[
                      _sectionHeader('⏳ Pending (${pending.length})', const Color(0xFFFF6F00)),
                      const SizedBox(height: 10),
                      ...pending.map(_medCard),
                      const SizedBox(height: 20),
                    ],
                    if (taken.isNotEmpty) ...[
                      _sectionHeader('✅ Taken (${taken.length})', const Color(0xFF2E7D32)),
                      const SizedBox(height: 10),
                      ...taken.map(_medCard),
                    ],
                  ],
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          try {
            await _ensureVoiceReady();
          } catch (e) {
            _showSnack('Voice is unavailable: ${_friendlyError(e)}');
            return;
          }

          _voice.startListening((text) async {
            final aiResponse = await AIService.instance.chat(text);
            if (aiResponse.isToolCall && aiResponse.toolName == 'add_medication') {
              final args = aiResponse.toolArgs ?? {};
              final name = args['name'] as String? ?? '';
              final time = args['time'] as String? ?? '8:00 AM';
              final freq = args['frequency'] as String? ?? 'daily';
              if (name.isNotEmpty) {
                try {
                  final medication =
                      await _supabase.addMedication(name, '1 tablet', time, freq);
                  _upsertMedication(medication);
                  unawaited(_speakIfReady('Added $name at $time'));
                } catch (e) {
                  _showSnack(
                      'Could not add medicine by voice: ${_friendlyError(e)}');
                }
              }
            }
          });
          await _voice.speak('Tell me the medicine name and time');
        },
        icon: const Icon(Icons.mic, color: Colors.white),
        label: Text('Add by Voice',
            style: GoogleFonts.poppins(
                color: Colors.white, fontWeight: FontWeight.w600)),
        backgroundColor: const Color(0xFF1A237E),
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.medication_rounded,
              size: 80, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text('No medications yet',
              style: GoogleFonts.poppins(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey.shade500)),
          const SizedBox(height: 8),
          Text('Tap + or use voice to add',
              style: GoogleFonts.poppins(
                  fontSize: 14, color: Colors.grey.shade400)),
        ],
      ),
    );
  }

  Widget _sectionHeader(String text, Color color) {
    return Text(text,
        style: GoogleFonts.poppins(
            fontSize: 16, fontWeight: FontWeight.w700, color: color));
  }

  Widget _medCard(Medication med) {
    final isPending = med.status == 'pending';
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: isPending
            ? Border.all(color: const Color(0xFFFF6F00).withAlpha(40))
            : null,
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(6),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: isPending
                  ? const Color(0xFFFFF3E0)
                  : const Color(0xFFE8F5E9),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              isPending ? Icons.medication : Icons.check_circle,
              color: isPending
                  ? const Color(0xFFFF6F00)
                  : const Color(0xFF2E7D32),
              size: 24,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(med.name,
                    style: GoogleFonts.poppins(
                        fontSize: 17, fontWeight: FontWeight.w700)),
                Text('${med.dosage} • ${med.time} • ${med.frequency}',
                    style: GoogleFonts.poppins(
                        fontSize: 13, color: Colors.grey.shade500)),
              ],
            ),
          ),
          if (isPending)
            GestureDetector(
              onTap: () async {
                await _supabase.updateMedicationStatus(med.id, 'taken');
                unawaited(_speakIfReady('${med.name} marked as taken'));
              },
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF2E7D32),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text('Take',
                    style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 14)),
              ),
            ),
          if (isPending) const SizedBox(width: 8),
          GestureDetector(
            onTap: () async {
              await _supabase.deleteMedication(med.id);
            },
            child: Icon(Icons.delete_outline,
                color: Colors.grey.shade400, size: 22),
          ),
        ],
      ),
    );
  }
}
