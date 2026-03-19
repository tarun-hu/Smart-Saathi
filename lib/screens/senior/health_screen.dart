import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/supabase_service.dart';

class HealthScreen extends ConsumerStatefulWidget {
  const HealthScreen({super.key});

  @override
  ConsumerState<HealthScreen> createState() => _HealthScreenState();
}

class _HealthScreenState extends ConsumerState<HealthScreen> {
  final _bpCtrl = TextEditingController();
  final _sugarCtrl = TextEditingController();
  final _tempCtrl = TextEditingController();
  final _symptomCtrl = TextEditingController();
  bool _isSaving = false;

  Future<void> _saveVitals() async {
    if (_bpCtrl.text.isEmpty &&
        _sugarCtrl.text.isEmpty &&
        _tempCtrl.text.isEmpty &&
        _symptomCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter at least one reading.')),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      await ref.read(supabaseServiceProvider).addHealthLog(
            bp: double.tryParse(_bpCtrl.text),
            sugar: double.tryParse(_sugarCtrl.text),
            temperature: double.tryParse(_tempCtrl.text),
            symptoms:
                _symptomCtrl.text.isNotEmpty ? _symptomCtrl.text : null,
          );
      _bpCtrl.clear();
      _sugarCtrl.clear();
      _tempCtrl.clear();
      _symptomCtrl.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content:
                  Text('✅ Vitals recorded!', style: TextStyle(fontSize: 16))),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  void dispose() {
    _bpCtrl.dispose();
    _sugarCtrl.dispose();
    _tempCtrl.dispose();
    _symptomCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final logsAsync = ref.watch(healthLogsStreamProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Health',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1A2E),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Record Vitals',
                style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A1A2E))),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                    child: _vitalCard('BP', _bpCtrl, Icons.favorite,
                        const Color(0xFFF44336), 'mmHg')),
                const SizedBox(width: 12),
                Expanded(
                    child: _vitalCard('Sugar', _sugarCtrl, Icons.bloodtype,
                        const Color(0xFFFF9800), 'mg/dL')),
                const SizedBox(width: 12),
                Expanded(
                    child: _vitalCard('Temp', _tempCtrl, Icons.thermostat,
                        const Color(0xFF2196F3), '°F')),
              ],
            ),
            const SizedBox(height: 14),
            Container(
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
              child: TextField(
                controller: _symptomCtrl,
                maxLines: 2,
                style: const TextStyle(fontSize: 16),
                decoration: InputDecoration(
                  labelText: 'Symptoms (optional)',
                  hintText: 'e.g., Headache, Gas, Dizziness',
                  prefixIcon: const Icon(Icons.sick_outlined),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: _isSaving ? null : _saveVitals,
                icon: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.save),
                label: Text(_isSaving ? 'Saving...' : 'Record Vitals',
                    style: const TextStyle(
                        fontSize: 18, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2196F3),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ),
            const SizedBox(height: 28),
            const Text('Recent Logs',
                style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1A1A2E))),
            const SizedBox(height: 12),
            logsAsync.when(
              data: (logs) {
                if (logs.isEmpty) {
                  return Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16)),
                    child: Center(
                      child: Text('No health logs yet',
                          style: TextStyle(
                              fontSize: 16, color: Colors.grey.shade400)),
                    ),
                  );
                }
                return Column(
                  children: logs.take(10).map((log) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                              color: Colors.black.withAlpha(6),
                              blurRadius: 4)
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Wrap(
                            spacing: 8,
                            runSpacing: 4,
                            children: [
                              if (log.bp != null)
                                _chip('BP: ${log.bp}',
                                    const Color(0xFFF44336)),
                              if (log.sugar != null)
                                _chip('Sugar: ${log.sugar}',
                                    const Color(0xFFFF9800)),
                              if (log.temperature != null)
                                _chip('Temp: ${log.temperature}°',
                                    const Color(0xFF2196F3)),
                            ],
                          ),
                          if (log.symptoms != null &&
                              log.symptoms!.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Text(log.symptoms!,
                                style: const TextStyle(
                                    fontSize: 14,
                                    color: Color(0xFF555555))),
                          ],
                          const SizedBox(height: 4),
                          Text(
                            _formatDate(log.timestamp),
                            style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade400),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                );
              },
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (e, _) => Text('Error: $e'),
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _vitalCard(String label, TextEditingController ctrl, IconData icon,
      Color color, String unit) {
    return Container(
      padding: const EdgeInsets.all(14),
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
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(label,
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: color)),
          const SizedBox(height: 8),
          TextField(
            controller: ctrl,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            style:
                const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              hintText: unit,
              hintStyle: TextStyle(
                  color: Colors.grey.shade300, fontSize: 14),
              contentPadding: const EdgeInsets.symmetric(vertical: 8),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _chip(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
          color: color.withAlpha(20),
          borderRadius: BorderRadius.circular(10)),
      child: Text(text,
          style: TextStyle(
              fontSize: 13, fontWeight: FontWeight.bold, color: color)),
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    if (dt.day == now.day &&
        dt.month == now.month &&
        dt.year == now.year) {
      return 'Today • ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
    }
    return '${dt.day}/${dt.month}/${dt.year} • ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
  }
}
