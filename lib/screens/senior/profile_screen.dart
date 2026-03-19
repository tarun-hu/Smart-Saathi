import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../services/supabase_service.dart';

class SeniorProfileScreen extends ConsumerStatefulWidget {
  const SeniorProfileScreen({super.key});

  @override
  ConsumerState<SeniorProfileScreen> createState() =>
      _SeniorProfileScreenState();
}

class _SeniorProfileScreenState extends ConsumerState<SeniorProfileScreen> {
  Future<void> _signOut() async {
    await ref.read(supabaseServiceProvider).signOut();
    if (mounted) context.go('/login');
  }

  Future<void> _editName() async {
    final profile = ref.read(userProfileProvider).valueOrNull;
    if (profile == null) return;

    final ctrl = TextEditingController(text: profile['full_name'] ?? '');
    final result = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Edit Name'),
        content: TextField(
          controller: ctrl,
          decoration: InputDecoration(
            labelText: 'Full Name',
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text.trim()),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2196F3),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Save'),
          ),
        ],
      ),
    );

    if (result != null && result.isNotEmpty) {
      await ref
          .read(supabaseServiceProvider)
          .updateProfile({'full_name': result});
      ref.invalidate(userProfileProvider);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(userProfileProvider);
    final connectionAsync = ref.watch(connectionStatusProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Profile',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1A2E),
        elevation: 0,
      ),
      body: profileAsync.when(
        data: (profile) {
          if (profile == null) {
            return const Center(child: Text('No profile data.'));
          }
          final name = profile['full_name'] as String? ?? 'User';
          final code = profile['pairing_code'] as String?;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                // Avatar
                CircleAvatar(
                  radius: 48,
                  backgroundColor:
                      const Color(0xFFFF5722).withAlpha(30),
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : '?',
                    style: const TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFFF5722)),
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(name,
                        style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1A1A2E))),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: _editName,
                      child: const Icon(Icons.edit,
                          size: 20, color: Color(0xFF2196F3)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFF5722).withAlpha(20),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    '👴 Senior',
                    style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFFF5722)),
                  ),
                ),
                const SizedBox(height: 28),

                // Pairing Code
                if (code != null)
                  _sectionCard(
                    title: 'Your Pairing Code',
                    subtitle: 'Share this with your caregiver',
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2196F3).withAlpha(10),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(
                        child: SelectableText(
                          code,
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 8,
                            color: Color(0xFF2196F3),
                          ),
                        ),
                      ),
                    ),
                  ),
                const SizedBox(height: 16),

                // Connection status
                connectionAsync.when(
                  data: (conn) {
                    if (conn == null || conn['connected'] != true) {
                      return _sectionCard(
                        title: 'Caregiver Status',
                        subtitle: 'No caregiver connected yet',
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.orange.withAlpha(15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.info_outline,
                                  color: Colors.orange, size: 24),
                              SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  'Share your pairing code with a caregiver to connect',
                                  style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.orange),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }
                    return _sectionCard(
                      title: 'Connected Caregiver',
                      subtitle: 'Your caregiver can monitor your health',
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF4CAF50).withAlpha(15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle,
                                color: Color(0xFF4CAF50), size: 24),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                conn['caregiver_name'] ?? 'Caregiver',
                                style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF4CAF50)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (_, _) => const SizedBox.shrink(),
                ),
                const SizedBox(height: 24),

                // Sign Out
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: OutlinedButton.icon(
                    onPressed: _signOut,
                    icon: const Icon(Icons.logout,
                        color: Color(0xFFF44336)),
                    label: const Text('Sign Out',
                        style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFF44336))),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFF44336)),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ),
                const SizedBox(height: 80),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _sectionCard(
      {required String title,
      required String subtitle,
      required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 8,
              offset: const Offset(0, 2))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A1A2E))),
          const SizedBox(height: 4),
          Text(subtitle,
              style: TextStyle(
                  fontSize: 14, color: Colors.grey.shade500)),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}
