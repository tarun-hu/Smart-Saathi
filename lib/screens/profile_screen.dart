import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/supabase_service.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(userProfileProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF6F7F8),
      appBar: AppBar(
        title: const Text('My Profile'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 60,
              backgroundColor: Color(0xFF2196F3),
              child: Icon(Icons.person, size: 80, color: Colors.white),
            ),
            const SizedBox(height: 20),
            
            profileAsync.when(
              data: (profile) => Column(
                children: [
                  Text(profile?['full_name'] ?? 'User', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text("Role: \${profile?['role']?.toUpperCase() ?? 'NONE'}", style: const TextStyle(fontSize: 16, color: Colors.grey)),
                  const SizedBox(height: 20),
                  if (profile?['role'] == 'senior')
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(16)),
                      child: Column(
                        children: [
                          const Text("Your Pairing Code", style: TextStyle(fontSize: 14)),
                          Text(profile?['pairing_code'] ?? 'Not Generated', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Color(0xFF1976D2))),
                          const SizedBox(height: 5),
                          const Text("Share this code with your Caregiver.", style: TextStyle(color: Colors.black54, fontSize: 12)),
                        ],
                      ),
                    ),
                ],
              ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Text('Error loading profile: $err'),
            ),
            
            const SizedBox(height: 20),

            profileAsync.when(
              data: (profile) {
                if (profile?['role'] == 'caregiver' && profile?['linked_senior_id'] == null) {
                  return Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.orange.shade200)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text("Action Required: Link to Senior", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.orange)),
                        const SizedBox(height: 8),
                        const Text("Enter the 6-digit access code from your Senior's app.", style: TextStyle(fontSize: 13)),
                        const SizedBox(height: 12),
                        TextField(
                          decoration: const InputDecoration(labelText: 'Access Code', border: OutlineInputBorder()),
                          onSubmitted: (val) async {
                             try {
                               await ref.read(supabaseServiceProvider).pairWithSenior(val);
                               ref.invalidate(userProfileProvider);
                               if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Successfully linked to Senior!")));
                             } catch (e) {
                               if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
                             }
                          },
                        ),
                      ],
                    ),
                  );
                }
                if (profile?['role'] == 'caregiver' && profile?['linked_senior_id'] != null) {
                   return const Center(child: Text("✅ You are linked to a Senior.", style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)));
                }
                return const SizedBox.shrink();
              },
              loading: () => const SizedBox.shrink(),
              error: (err, stack) => const SizedBox.shrink(),
            ),

            const SizedBox(height: 40),
            
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                  textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                icon: const Icon(Icons.logout),
                onPressed: () async {
                  await ref.read(supabaseServiceProvider).signOut();
                },
                label: const Text('Sign Out'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
