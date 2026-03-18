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
  final TextEditingController _nameController = TextEditingController();
  bool _isCaregiver = false;
  bool _isLoading = false;
  bool _isSigningUp = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
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
           ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Biometrics not supported here. Please sign up or login.')));
        }
        return;
      }
      final bool didAuthenticate = await auth.authenticate(
        localizedReason: 'Please authenticate to access SmartSaathi',
        options: const AuthenticationOptions(biometricOnly: true),
      );
      if (didAuthenticate && mounted) {
        // Simplified: assuming senior if biometric succeeds for now, 
        // usually we'd check session/role but let's go to navigator.
        Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const MainNavigator(role: 'senior')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
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
      
      // Refresh user profile
      ref.invalidate(userProfileProvider);
      final profile = await ref.read(userProfileProvider.future);
      
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => MainNavigator(role: profile?['role'] ?? 'senior'))
        );
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
    final name = _nameController.text.trim();
    if (email.isEmpty || password.isEmpty || name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields')));
      return;
    }
    
    setState(() => _isLoading = true);
    try {
      final supabase = ref.read(supabaseServiceProvider);
      await supabase.signUpWithProfile(
        email, 
        password, 
        name, 
        _isCaregiver ? 'caregiver' : 'senior'
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Account created! Logging you in...')));
        await _login();
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
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.health_and_safety, size: 80, color: Color(0xFF2196F3)),
              const SizedBox(height: 20),
              const Text("SmartSaathi", textAlign: TextAlign.center, style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF003049))),
              const Text("Healthcare Companion", textAlign: TextAlign.center, style: TextStyle(fontSize: 16, color: Colors.grey)),
              const SizedBox(height: 50),
              
              Text(
                _isSigningUp ? "Create \${_isCaregiver ? 'Caregiver' : 'Senior'} Account" : (_isCaregiver ? "Caregiver Access" : "Hello, Senior"),
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 40),

              if (!_isCaregiver && !_isSigningUp) ...[
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
                const SizedBox(height: 40),
                const Divider(),
                const Text("OR", textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
                const SizedBox(height: 20),
              ],

              if (_isSigningUp || _isCaregiver) ...[
                if (_isSigningUp) ...[
                  TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder(), prefixIcon: Icon(Icons.person))),
                  const SizedBox(height: 16),
                ],
                TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder(), prefixIcon: Icon(Icons.email))),
                const SizedBox(height: 16),
                TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder(), prefixIcon: Icon(Icons.lock))),
                const SizedBox(height: 24),
                
                if (_isLoading) 
                  const Center(child: CircularProgressIndicator()) 
                else 
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2196F3),
                      padding: const EdgeInsets.all(16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _isSigningUp ? _signup : _login,
                    child: Text(_isSigningUp ? "Create Account" : "Login", style: const TextStyle(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
              ],

              const SizedBox(height: 30),
              TextButton(
                onPressed: () { setState(() { _isSigningUp = !_isSigningUp; }); },
                child: Text(_isSigningUp ? "Already have an account? Login" : "Don't have an account? Sign Up", style: const TextStyle(fontSize: 16)),
              ),
              
              TextButton(
                onPressed: () { setState(() { _isCaregiver = !_isCaregiver; _isSigningUp = false; }); },
                child: Text(_isCaregiver ? "Switch to Senior Login" : "I am a Caregiver", style: const TextStyle(fontSize: 16, color: Color(0xFFFF5722))),
              )
            ],
          ),
        ),
      ),
    );
  }
}
