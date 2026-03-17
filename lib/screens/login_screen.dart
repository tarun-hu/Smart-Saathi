import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _seniorEmail = TextEditingController();
  final _seniorPassword = TextEditingController();
  final _caregiverEmail = TextEditingController();
  final _caregiverPassword = TextEditingController();
  
  bool _isLoading = false;
  bool _isSignUp = false;

  @override
  void dispose() {
    _seniorEmail.dispose();
    _seniorPassword.dispose();
    _caregiverEmail.dispose();
    _caregiverPassword.dispose();
    super.dispose();
  }

  Future<void> _handleAuth(String email, String password, String role) async {
    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
      return;
    }
    
    setState(() => _isLoading = true);
    
    try {
      if (!_isSignUp) {
        await Supabase.instance.client.auth.signInWithPassword(email: email.trim(), password: password);
      } else {
        final res = await Supabase.instance.client.auth.signUp(email: email.trim(), password: password);
        if (res.user != null) {
          await Supabase.instance.client.from('profiles').upsert({
            'id': res.user!.id,
            'role': role,
          });

          final profile = await Supabase.instance.client
              .from('profiles')
              .select('role')
              .eq('id', res.user!.id)
              .single();

          if (profile['role'] != role) {
            throw Exception('Failed to finish account setup. Please try again.');
          }
        }
      }
    } on AuthException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message), backgroundColor: Colors.red));
      }
    } catch (e) {
      if (_isSignUp) {
        await Supabase.instance.client.auth.signOut();
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: ${e.toString()}'), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final actionText = _isSignUp ? 'Sign Up' : 'Login';
    
    return Scaffold(
      backgroundColor: const Color(0xFFf6f7f8),
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.diversity_1, color: Color(0xFF1975d2)),
            SizedBox(width: 8),
            Text('SmartSaathi', style: TextStyle(color: Color(0xFF1975d2), fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline),
            onPressed: () {},
          )
        ],
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const SizedBox(height: 10),
            // Header Section
            Text(
              _isSignUp ? 'Create an Account' : 'Welcome Back',
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.black87),
            ),
            const SizedBox(height: 8),
            Text(
              _isSignUp ? 'Sign up to start connecting' : 'Choose your profile to continue',
              style: const TextStyle(fontSize: 16, color: Colors.black54),
            ),
            const SizedBox(height: 30),

            // Senior Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF1975d2).withOpacity(0.2), width: 2),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1975d2).withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.elderly, color: Color(0xFF1975d2), size: 32),
                      ),
                      const SizedBox(width: 16),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('I am a Senior', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          Text('Quick & Easy Access', style: TextStyle(color: Colors.black54)),
                        ],
                      )
                    ],
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: _seniorEmail,
                    decoration: InputDecoration(
                      hintText: 'senior@email.com',
                      filled: true,
                      fillColor: Colors.grey[50],
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _seniorPassword,
                    obscureText: true,
                    decoration: InputDecoration(
                      hintText: '••••••••',
                      filled: true,
                      fillColor: Colors.grey[50],
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: () => _handleAuth(_seniorEmail.text, _seniorPassword.text, 'senior'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1975d2),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text('Senior $actionText', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 20),

            // Caregiver Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey[200]!),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.health_and_safety, color: Colors.black54, size: 32),
                      ),
                      const SizedBox(width: 16),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('I am a Caregiver', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          Text('Professional Portal', style: TextStyle(color: Colors.black54)),
                        ],
                      )
                    ],
                  ),
                  const SizedBox(height: 20),
                  TextField(
                    controller: _caregiverEmail,
                    decoration: InputDecoration(
                      hintText: 'caregiver@email.com',
                      filled: true,
                      fillColor: Colors.grey[50],
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _caregiverPassword,
                    obscureText: true,
                    decoration: InputDecoration(
                      hintText: '••••••••',
                      filled: true,
                      fillColor: Colors.grey[50],
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey[300]!)),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: () => _handleAuth(_caregiverEmail.text, _caregiverPassword.text, 'caregiver'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.grey[900],
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text('Caregiver $actionText', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            TextButton(
              onPressed: () {
                setState(() {
                  _isSignUp = !_isSignUp;
                });
              },
              child: Text(
                _isSignUp ? 'Already have an account? Login' : 'Don\'t have an account? Sign Up',
                style: const TextStyle(fontSize: 16, color: Color(0xFF1975d2), fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
