import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/supabase_service.dart';
import '../services/voice_service.dart';
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

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _voice.initialize();
    _loadMeds();
  }

  void _loadMeds() {
    _supabase.getMedicationsStream().listen((meds) {
      if (mounted) {
        setState(() {
          _medications = meds;
          _isLoading = false;
        });
      }
    });
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
                    if (nameC.text.trim().isEmpty) return;
                    await _supabase.addMedication(
                      nameC.text.trim(),
                      dosageC.text.trim(),
                      timeC.text.trim(),
                      frequency,
                    );
                    if (ctx.mounted) Navigator.pop(ctx);
                    _voice.speak('Medicine "${nameC.text.trim()}" added');
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
          _voice.startListening((text) {
            final cmd = _voice.parseCommand(text);
            if (cmd.type == CommandType.medAdd) {
              final name = cmd.data?['name'] ?? '';
              final time = cmd.data?['time'] ?? '8:00 AM';
              final freq = cmd.data?['frequency'] ?? 'daily';
              if (name.isNotEmpty) {
                _supabase.addMedication(name, '1 tablet', time, freq);
                _voice.speak('Added $name at $time');
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
                _voice.speak('${med.name} marked as taken');
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
