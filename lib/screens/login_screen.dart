import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/supabase_service.dart';
import 'main_navigator.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final LocalAuthentication auth = LocalAuthentication();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isCaregiver = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _authenticate() async {
    try {
      bool canAuthenticate = false;
      try {
        final bool canAuthenticateWithBiometrics = await auth.canCheckBiometrics;
        canAuthenticate = canAuthenticateWithBiometrics || await auth.isDeviceSupported();
      } catch (e) {
        canAuthenticate = false;
      }

      if (!canAuthenticate) {
        if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Biometrics not supported here. Using default login.')));
           Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const MainNavigator(role: 'senior')));
        }
        return;
      }
      final bool didAuthenticate = await auth.authenticate(
        localizedReason: 'Please authenticate to access SmartSaathi',
        options: const AuthenticationOptions(biometricOnly: true),
      );
      if (didAuthenticate && mounted) {
        Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const MainNavigator(role: 'senior')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
        Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const MainNavigator(role: 'senior')));
      }
    }
  }

  Future<void> _login() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    if (email.isEmpty || password.isEmpty) return;
    
    setState(() => _isLoading = true);
    try {
      final supabase = ref.read(supabaseServiceProvider);
      await supabase.signIn(email, password);
      if (mounted) {
        Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const MainNavigator(role: 'caregiver')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Login Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _signup() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    if (email.isEmpty || password.isEmpty) return;
    
    setState(() => _isLoading = true);
    try {
      final supabase = ref.read(supabaseServiceProvider);
      await supabase.signUp(email, password);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Account created! Please check your email to verify, or login if verification is disabled.')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Signup Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.health_and_safety, size: 80, color: Color(0xFF2196F3)),
              const SizedBox(height: 20),
              const Text("SmartSaathi", textAlign: TextAlign.center, style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF003049))),
              const Text("Healthcare Companion", textAlign: TextAlign.center, style: TextStyle(fontSize: 16, color: Colors.grey)),
              const SizedBox(height: 50),
              
              if (!_isCaregiver) ...[
                const Text("Welcome Back", textAlign: TextAlign.center, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 40),
                GestureDetector(
                  onTap: _authenticate,
                  child: Container(
                    height: 120,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0F8FF),
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF2196F3), width: 4),
                      boxShadow: [BoxShadow(color: Colors.blue.withAlpha(50), blurRadius: 20, spreadRadius: 5)],
                    ),
                    child: const Icon(Icons.fingerprint, size: 80, color: Color(0xFF2196F3)),
                  ),
                ),
                const SizedBox(height: 20),
                const Text("Tap Scanner to Login", textAlign: TextAlign.center, style: TextStyle(fontSize: 18, color: Colors.grey)),
              ] else ...[
                 const Text("Caregiver Access", textAlign: TextAlign.center, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                 const SizedBox(height: 40),
                 TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder())),
                 const SizedBox(height: 20),
                 TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder())),
                 const SizedBox(height: 20),
                 if (_isLoading) const Center(child: CircularProgressIndicator()) else Row(
                   mainAxisAlignment: MainAxisAlignment.spaceBetween,
                   children: [
                     TextButton(onPressed: _signup, child: const Text("Create Account")),
                     ElevatedButton(
                       style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2196F3), padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16)),
                       onPressed: _login,
                       child: const Text("Login", style: TextStyle(fontSize: 18, color: Colors.white)),
                     ),
                   ],
                 ),
              ],
              const Spacer(),
              TextButton(
                onPressed: () { setState(() { _isCaregiver = !_isCaregiver; }); },
                child: Text(_isCaregiver ? "Switch to Senior Login" : "I am a Caregiver", style: const TextStyle(fontSize: 16, color: Color(0xFFFF5722))),
              )
            ],
          ),
        ),
      ),
    );
  }
}
