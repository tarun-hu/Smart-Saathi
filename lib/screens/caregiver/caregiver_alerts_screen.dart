import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/supabase_service.dart';
import '../../models/sos_event.dart';

class CaregiverAlertsScreen extends ConsumerWidget {
  const CaregiverAlertsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alertsAsync = ref.watch(alertsStreamProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('SOS Alerts',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1A2E),
        elevation: 0,
      ),
      body: alertsAsync.when(
        data: (events) {
          if (events.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shield_outlined,
                      size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  Text('No alerts',
                      style: TextStyle(
                          fontSize: 20, color: Colors.grey.shade400)),
                  const SizedBox(height: 6),
                  Text('Your senior is safe 🟢',
                      style: TextStyle(
                          fontSize: 16, color: Colors.grey.shade400)),
                ],
              ),
            );
          }

          final active = events.where((e) => !e.isResolved).toList();
          final resolved = events.where((e) => e.isResolved).toList();

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              if (active.isNotEmpty) ...[
                _sectionHeader(
                    '🚨 Active Alerts', active.length, const Color(0xFFF44336)),
                const SizedBox(height: 10),
                ...active.map(
                    (e) => _alertTile(context, ref, e, isActive: true)),
                const SizedBox(height: 24),
              ],
              if (resolved.isNotEmpty) ...[
                _sectionHeader(
                    '✅ Resolved', resolved.length, const Color(0xFF4CAF50)),
                const SizedBox(height: 10),
                ...resolved.map(
                    (e) => _alertTile(context, ref, e, isActive: false)),
              ],
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
        Text(title,
            style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(width: 8),
        Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
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

  Widget _alertTile(
      BuildContext context, WidgetRef ref, SosEvent event,
      {required bool isActive}) {
    final color =
        isActive ? const Color(0xFFF44336) : const Color(0xFF4CAF50);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withAlpha(40)),
        boxShadow: isActive
            ? [
                BoxShadow(
                    color: color.withAlpha(20),
                    blurRadius: 12,
                    offset: const Offset(0, 4))
              ]
            : [],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: color.withAlpha(20),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isActive ? Icons.emergency : Icons.check_circle,
                  color: color,
                  size: 26,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isActive ? 'EMERGENCY ALERT' : 'Resolved',
                      style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: color),
                    ),
                    Text(_formatDate(event.createdAt),
                        style: TextStyle(
                            fontSize: 13, color: Colors.grey.shade500)),
                  ],
                ),
              ),
            ],
          ),
          if (event.message != null && event.message!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(event.message!,
                style: const TextStyle(
                    fontSize: 15, color: Color(0xFF555555))),
          ],
          if (event.latitude != null && event.longitude != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  Icon(Icons.location_on,
                      size: 18, color: Colors.grey.shade600),
                  const SizedBox(width: 6),
                  Text(
                    'Lat: ${event.latitude!.toStringAsFixed(4)}, Lng: ${event.longitude!.toStringAsFixed(4)}',
                    style: TextStyle(
                        fontSize: 13, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
          ],
          if (isActive) ...[
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: () async {
                  try {
                    await ref
                        .read(supabaseServiceProvider)
                        .resolveAlert(event.id);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('✅ Alert resolved',
                                style: TextStyle(fontSize: 16))),
                      );
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Error: $e')),
                      );
                    }
                  }
                },
                icon: const Icon(Icons.check),
                label: const Text('Mark as Resolved',
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4CAF50),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${dt.day}/${dt.month}/${dt.year} • ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
  }
}
