import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/supabase_service.dart';
import '../../models/medication.dart';

class CaregiverMedsScreen extends ConsumerStatefulWidget {
  const CaregiverMedsScreen({super.key});

  @override
  ConsumerState<CaregiverMedsScreen> createState() =>
      _CaregiverMedsScreenState();
}

class _CaregiverMedsScreenState extends ConsumerState<CaregiverMedsScreen> {
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
          title: const Text('Add Medication for Senior',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _field(nameCtrl, 'Medicine Name', Icons.medication),
                const SizedBox(height: 12),
                _field(doseCtrl, 'Dosage', Icons.medical_information),
                const SizedBox(height: 12),
                _field(timeCtrl, 'Time', Icons.schedule),
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
                    DropdownMenuItem(value: 'daily', child: Text('Daily')),
                    DropdownMenuItem(
                        value: 'twice_daily', child: Text('Twice Daily')),
                    DropdownMenuItem(value: 'weekly', child: Text('Weekly')),
                    DropdownMenuItem(
                        value: 'as_needed', child: Text('As Needed')),
                  ],
                  onChanged: (v) =>
                      setDialogState(() => frequency = v ?? 'daily'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
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
                backgroundColor: const Color(0xFF1565C0),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Add',
                  style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _field(TextEditingController ctrl, String label, IconData icon) {
    return TextField(
      controller: ctrl,
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
        title: const Text('Senior Meds',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1A2E),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle,
                color: Color(0xFF1565C0), size: 32),
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
                  Text('No medications set',
                      style: TextStyle(
                          fontSize: 18, color: Colors.grey.shade400)),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: _showAddMedDialog,
                    icon: const Icon(Icons.add),
                    label: const Text('Add Medication'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1565C0),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
            );
          }

          final pending = meds.where((m) => m.status == 'pending').toList();
          final taken = meds.where((m) => m.status == 'taken').toList();

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              if (pending.isNotEmpty) ...[
                _header('Pending', pending.length, const Color(0xFFFF5722)),
                const SizedBox(height: 10),
                ...pending.map((m) => _medCard(m, true)),
                const SizedBox(height: 20),
              ],
              if (taken.isNotEmpty) ...[
                _header('Taken', taken.length, const Color(0xFF4CAF50)),
                const SizedBox(height: 10),
                ...taken.map((m) => _medCard(m, false)),
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

  Widget _header(String title, int count, Color color) {
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
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
          decoration: BoxDecoration(
              color: color.withAlpha(20),
              borderRadius: BorderRadius.circular(12)),
          child: Text('$count',
              style: TextStyle(
                  fontSize: 14, fontWeight: FontWeight.bold, color: color)),
        ),
      ],
    );
  }

  Widget _medCard(Medication med, bool isPending) {
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
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: (isPending
                      ? const Color(0xFFFF5722)
                      : const Color(0xFF4CAF50))
                  .withAlpha(20),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isPending ? Icons.pending_actions : Icons.check_circle,
              color: isPending
                  ? const Color(0xFFFF5722)
                  : const Color(0xFF4CAF50),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(med.name,
                    style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A2E))),
                Text('${med.dose} • ${med.time}',
                    style: TextStyle(
                        fontSize: 14, color: Colors.grey.shade500)),
              ],
            ),
          ),
          IconButton(
            onPressed: () =>
                ref.read(supabaseServiceProvider).deleteMedication(med.id),
            icon:
                Icon(Icons.delete_outline, color: Colors.grey.shade400),
          ),
        ],
      ),
    );
  }
}
