import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/supabase_service.dart';

class CaregiverHomeScreen extends ConsumerWidget {
  const CaregiverHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profAsync = ref.watch(userProfileProvider);
    final connAsync = ref.watch(connectionStatusProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(userProfileProvider);
            ref.invalidate(connectionStatusProvider);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Greeting
                profAsync.when(
                  data: (p) {
                    final name = p?['full_name'] ?? 'Caregiver';
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Welcome back,',
                            style: TextStyle(
                                fontSize: 17, color: Colors.grey.shade600)),
                        const SizedBox(height: 4),
                        Text(name,
                            style: const TextStyle(
                                fontSize: 30,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1A1A2E))),
                      ],
                    );
                  },
                  loading: () => const SizedBox(height: 56),
                  error: (_, _) =>
                      const Text('Hello!', style: TextStyle(fontSize: 30)),
                ),
                const SizedBox(height: 24),

                // Connection state
                connAsync.when(
                  data: (conn) {
                    if (conn == null || conn['connected'] != true) {
                      return _buildNotConnectedCard(context, ref);
                    }
                    return _buildConnectedDashboard(context, ref, conn);
                  },
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Text('Error: $e'),
                ),
                const SizedBox(height: 80),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNotConnectedCard(BuildContext context, WidgetRef ref) {
    final codeCtrl = TextEditingController();

    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(10),
              blurRadius: 10,
              offset: const Offset(0, 4))
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF2196F3).withAlpha(15),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.link_off,
                size: 48, color: Color(0xFF2196F3)),
          ),
          const SizedBox(height: 16),
          const Text('Not Connected',
              style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A1A2E))),
          const SizedBox(height: 6),
          Text(
            'Enter the pairing code shared by your senior to connect and monitor their health.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 15, color: Colors.grey.shade500),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: codeCtrl,
            textAlign: TextAlign.center,
            style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                letterSpacing: 6),
            decoration: InputDecoration(
              labelText: 'Pairing Code',
              hintText: '000000',
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16)),
              prefixIcon: const Icon(Icons.vpn_key),
            ),
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton.icon(
              onPressed: () async {
                if (codeCtrl.text.trim().isEmpty) return;
                try {
                  await ref
                      .read(supabaseServiceProvider)
                      .pairWithSenior(codeCtrl.text.trim());
                  ref.invalidate(connectionStatusProvider);
                  ref.invalidate(linkedSeniorProfileProvider);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('✅ Successfully paired!',
                            style: TextStyle(fontSize: 16))),
                  );
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Pairing failed: $e')),
                  );
                }
              },
              icon: const Icon(Icons.link),
              label: const Text('Connect',
                  style: TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2196F3),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConnectedDashboard(
      BuildContext context, WidgetRef ref, Map<String, dynamic> conn) {
    final service = ref.read(supabaseServiceProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Connected Senior Banner
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1565C0), Color(0xFF42A5F5)],
            ),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(30),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.elderly,
                    color: Colors.white, size: 30),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Monitoring',
                        style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withAlpha(180))),
                    Text(
                      conn['senior_name'] ?? 'Senior',
                      style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF4CAF50).withAlpha(60),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.circle, color: Color(0xFF4CAF50), size: 10),
                    SizedBox(width: 6),
                    Text('Connected',
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 13)),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Stats cards
        Row(
          children: [
            Expanded(
              child: FutureBuilder<int>(
                future: service.getPendingMedsCount(),
                builder: (_, snap) => _statsCard(
                  'Pending Meds',
                  snap.data?.toString() ?? '—',
                  Icons.medication,
                  const Color(0xFFFF5722),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: FutureBuilder<int>(
                future: service.getActiveAlertsCount(),
                builder: (_, snap) => _statsCard(
                  'Active Alerts',
                  snap.data?.toString() ?? '—',
                  Icons.notifications_active,
                  snap.data != null && snap.data! > 0
                      ? const Color(0xFFF44336)
                      : const Color(0xFF4CAF50),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        // Latest vitals card
        const Text('Latest Vitals',
            style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A1A2E))),
        const SizedBox(height: 10),
        FutureBuilder(
          future: service.getLatestHealthLog(),
          builder: (_, snap) {
            if (!snap.hasData || snap.data == null) {
              return Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16)),
                child: Center(
                  child: Text('No vitals recorded yet',
                      style: TextStyle(
                          fontSize: 16, color: Colors.grey.shade400)),
                ),
              );
            }
            final log = snap.data!;
            return Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withAlpha(8),
                      blurRadius: 6,
                      offset: const Offset(0, 2))
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _vitalBadge('BP', log.bp?.toString() ?? '—',
                      const Color(0xFFF44336)),
                  _vitalBadge('Sugar', log.sugar?.toString() ?? '—',
                      const Color(0xFFFF9800)),
                  _vitalBadge('Temp',
                      log.temperature != null ? '${log.temperature}°' : '—',
                      const Color(0xFF2196F3)),
                ],
              ),
            );
          },
        ),
        const SizedBox(height: 20),

        // Location card
        const Text('Senior Location',
            style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A1A2E))),
        const SizedBox(height: 10),
        FutureBuilder(
          future: service.getLatestSeniorLocation(),
          builder: (_, snap) {
            if (!snap.hasData || snap.data == null) {
              return Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16)),
                child: Row(
                  children: [
                    Icon(Icons.location_off,
                        color: Colors.grey.shade400, size: 32),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text('No location data available',
                          style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey.shade400)),
                    ),
                  ],
                ),
              );
            }
            final loc = snap.data!;
            return Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withAlpha(8),
                      blurRadius: 6)
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF4CAF50).withAlpha(15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.location_on,
                        color: Color(0xFF4CAF50), size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          loc.address ?? 'Lat: ${loc.latitude.toStringAsFixed(4)}, Lng: ${loc.longitude.toStringAsFixed(4)}',
                          style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1A1A2E)),
                        ),
                        Text(
                          _formatDate(loc.createdAt),
                          style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey.shade400),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _statsCard(
      String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 6,
              offset: const Offset(0, 2))
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 8),
          Text(value,
              style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: color)),
          const SizedBox(height: 4),
          Text(label,
              style: TextStyle(
                  fontSize: 13, color: Colors.grey.shade500)),
        ],
      ),
    );
  }

  Widget _vitalBadge(String label, String value, Color color) {
    return Column(
      children: [
        Text(label,
            style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: color)),
        const SizedBox(height: 4),
        Text(value,
            style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: color)),
      ],
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
