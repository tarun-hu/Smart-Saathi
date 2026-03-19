import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/supabase_service.dart';
import '../../models/medication.dart';

class MedsScreen extends ConsumerStatefulWidget {
  const MedsScreen({super.key});

  @override
  ConsumerState<MedsScreen> createState() => _MedsScreenState();
}

class _MedsScreenState extends ConsumerState<MedsScreen> {
  void _showAddMedDialog() {
    final nameCtrl = TextEditingController();
    final doseCtrl = TextEditingController();
    final timeCtrl = TextEditingController();
    String frequency = 'daily';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Add Medication',
              style:
                  TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _dialogField(nameCtrl, 'Medicine Name', Icons.medication),
                const SizedBox(height: 12),
                _dialogField(
                    doseCtrl, 'Dosage (e.g., 500mg)', Icons.medical_information),
                const SizedBox(height: 12),
                _dialogField(
                    timeCtrl, 'Time (e.g., 8:00 AM)', Icons.schedule),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: frequency,
                  decoration: InputDecoration(
                    labelText: 'Frequency',
                    prefixIcon: const Icon(Icons.repeat),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  items: const [
                    DropdownMenuItem(
                        value: 'daily', child: Text('Daily')),
                    DropdownMenuItem(
                        value: 'twice_daily', child: Text('Twice Daily')),
                    DropdownMenuItem(
                        value: 'weekly', child: Text('Weekly')),
                    DropdownMenuItem(
                        value: 'as_needed', child: Text('As Needed')),
                  ],
                  onChanged: (v) {
                    if (v != null) {
                      setDialogState(() => frequency = v);
                    }
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(fontSize: 16)),
            ),
            ElevatedButton(
              onPressed: () async {
                if (nameCtrl.text.isNotEmpty &&
                    doseCtrl.text.isNotEmpty &&
                    timeCtrl.text.isNotEmpty) {
                  await ref.read(supabaseServiceProvider).addMedication(
                        nameCtrl.text.trim(),
                        doseCtrl.text.trim(),
                        timeCtrl.text.trim(),
                        frequency: frequency,
                      );
                  if (ctx.mounted) Navigator.pop(ctx);
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2196F3),
                foregroundColor: Colors.white,
                minimumSize: const Size(100, 48),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Add',
                  style:
                      TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _dialogField(
      TextEditingController ctrl, String label, IconData icon) {
    return TextField(
      controller: ctrl,
      style: const TextStyle(fontSize: 16),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border:
            OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final medsAsync = ref.watch(medicationsStreamProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Medications',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1A2E),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle,
                color: Color(0xFF2196F3), size: 32),
            onPressed: _showAddMedDialog,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: medsAsync.when(
        data: (meds) {
          if (meds.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.medication_outlined,
                      size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('No medications yet',
                      style: TextStyle(
                          fontSize: 20, color: Colors.grey.shade400)),
                  const SizedBox(height: 8),
                  Text('Tap + to add your first one',
                      style: TextStyle(
                          fontSize: 16, color: Colors.grey.shade400)),
                ],
              ),
            );
          }

          final pending =
              meds.where((m) => m.status == 'pending').toList();
          final taken = meds.where((m) => m.status == 'taken').toList();

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              if (pending.isNotEmpty) ...[
                _sectionHeader(
                    'Pending', pending.length, const Color(0xFFFF5722)),
                const SizedBox(height: 10),
                ...pending
                    .map((m) => _buildMedTile(m, isPending: true)),
                const SizedBox(height: 24),
              ],
              if (taken.isNotEmpty) ...[
                _sectionHeader(
                    'Taken', taken.length, const Color(0xFF4CAF50)),
                const SizedBox(height: 10),
                ...taken
                    .map((m) => _buildMedTile(m, isPending: false)),
              ],
              const SizedBox(height: 80),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _sectionHeader(String title, int count, Color color) {
    return Row(
      children: [
        Container(
          width: 6,
          height: 24,
          decoration: BoxDecoration(
              color: color, borderRadius: BorderRadius.circular(3)),
        ),
        const SizedBox(width: 10),
        Text(title,
            style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(width: 8),
        Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
          decoration: BoxDecoration(
              color: color.withAlpha(25),
              borderRadius: BorderRadius.circular(12)),
          child: Text('$count',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: color)),
        ),
      ],
    );
  }

  Widget _buildMedTile(Medication med, {required bool isPending}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 6,
              offset: const Offset(0, 2))
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: isPending
                  ? const Color(0xFFFF5722).withAlpha(20)
                  : const Color(0xFF4CAF50).withAlpha(20),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isPending ? Icons.pending_actions : Icons.check_circle,
              color: isPending
                  ? const Color(0xFFFF5722)
                  : const Color(0xFF4CAF50),
              size: 28,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(med.name,
                    style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A2E))),
                const SizedBox(height: 2),
                Text('${med.dose} • ${med.time}',
                    style: TextStyle(
                        fontSize: 14, color: Colors.grey.shade500)),
                Text(med.frequency,
                    style: TextStyle(
                        fontSize: 12, color: Colors.grey.shade400)),
              ],
            ),
          ),
          if (isPending)
            ElevatedButton(
              onPressed: () async {
                await ref
                    .read(supabaseServiceProvider)
                    .updateMedicationStatus(med.id, 'taken');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4CAF50),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                minimumSize: const Size(80, 44),
              ),
              child: const Text('Take',
                  style: TextStyle(fontWeight: FontWeight.bold)),
            )
          else
            IconButton(
              onPressed: () =>
                  ref.read(supabaseServiceProvider).deleteMedication(med.id),
              icon: Icon(Icons.delete_outline,
                  color: Colors.grey.shade400),
            ),
        ],
      ),
    );
  }
}
