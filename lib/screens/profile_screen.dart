import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../services/supabase_service.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final _pairingCodeCtrl = TextEditingController();
  bool _isPairing = false;

  Future<void> _pairWithSenior() async {
    final code = _pairingCodeCtrl.text.trim();
    if (code.isEmpty) return;
    setState(() => _isPairing = true);
    try {
      await ref.read(supabaseServiceProvider).pairWithSenior(code);
      ref.invalidate(userProfileProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('✅ Paired successfully!')),
        );
        _pairingCodeCtrl.clear();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isPairing = false);
    }
  }

  Future<void> _signOut() async {
    await ref.read(supabaseServiceProvider).signOut();
    if (mounted) context.go('/login');
  }

  @override
  void dispose() {
    _pairingCodeCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(userProfileProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Profile', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24)),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1A1A2E),
        elevation: 0,
      ),
      body: profileAsync.when(
        data: (profile) {
          if (profile == null) return const Center(child: Text('No profile data.'));
          final role = profile['role'] as String? ?? 'senior';
          final name = profile['full_name'] as String? ?? 'User';
          final code = profile['pairing_code'] as String?;
          final linkedId = profile['linked_senior_id'] as String?;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                // ── AVATAR + NAME ──
                CircleAvatar(
                  radius: 48,
                  backgroundColor: const Color(0xFF2196F3).withAlpha(30),
                  child: Text(
                    name.isNotEmpty ? name[0].toUpperCase() : '?',
                    style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Color(0xFF2196F3)),
                  ),
                ),
                const SizedBox(height: 14),
                Text(name, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                  decoration: BoxDecoration(
                    color: role == 'senior' ? const Color(0xFFFF5722).withAlpha(20) : const Color(0xFF2196F3).withAlpha(20),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    role == 'senior' ? '👴 Senior' : '🩺 Caregiver',
                    style: TextStyle(
                      fontSize: 15, fontWeight: FontWeight.bold,
                      color: role == 'senior' ? const Color(0xFFFF5722) : const Color(0xFF2196F3),
                    ),
                  ),
                ),
                const SizedBox(height: 28),

                // ── PAIRING CODE (Seniors) ──
                if (role == 'senior' && code != null) ...[
                  _sectionCard(
                    title: 'Your Pairing Code',
                    subtitle: 'Share this with your caregiver to connect',
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2196F3).withAlpha(10),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(
                        child: Text(
                          code,
                          style: const TextStyle(
                            fontSize: 36, fontWeight: FontWeight.w900, letterSpacing: 8,
                            color: Color(0xFF2196F3),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // ── PAIR WITH SENIOR (Caregivers) ──
                if (role == 'caregiver') ...[
                  _sectionCard(
                    title: linkedId != null ? 'Connected ✅' : 'Connect to Senior',
                    subtitle: linkedId != null ? 'You are paired with a senior' : 'Enter senior\'s 6-digit code',
                    child: linkedId == null
                        ? Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _pairingCodeCtrl,
                                  keyboardType: TextInputType.number,
                                  style: const TextStyle(fontSize: 20, letterSpacing: 4),
                                  decoration: InputDecoration(
                                    hintText: '000000',
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              SizedBox(
                                height: 56,
                                child: ElevatedButton(
                                  onPressed: _isPairing ? null : _pairWithSenior,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF2196F3),
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    minimumSize: const Size(80, 56),
                                  ),
                                  child: _isPairing
                                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                      : const Text('Pair', style: TextStyle(fontWeight: FontWeight.bold)),
                                ),
                              ),
                            ],
                          )
                        : Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFF4CAF50).withAlpha(15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.check_circle, color: Color(0xFF4CAF50), size: 24),
                                SizedBox(width: 10),
                                Text('Senior is linked', style: TextStyle(fontSize: 16, color: Color(0xFF4CAF50))),
                              ],
                            ),
                          ),
                  ),
                  const SizedBox(height: 16),
                ],

                // ── SIGN OUT ──
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: OutlinedButton.icon(
                    onPressed: _signOut,
                    icon: const Icon(Icons.logout, color: Color(0xFFF44336)),
                    label: const Text('Sign Out', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFFF44336))),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Color(0xFFF44336)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
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

  Widget _sectionCard({required String title, required String subtitle, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(8), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
          const SizedBox(height: 4),
          Text(subtitle, style: TextStyle(fontSize: 14, color: Colors.grey.shade500)),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}
