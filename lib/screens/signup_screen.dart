import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/supabase_service.dart';
import 'package:go_router/go_router.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen>
    with SingleTickerProviderStateMixin {
  final _supabase = SupabaseService.instance;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();

  bool _isSignUp = false;
  bool _isLoading = false;
  bool _obscurePassword = true;

  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 500));
    _fadeAnimation =
        CurvedAnimation(parent: _fadeController, curve: Curves.easeInOut);
    _fadeController.forward();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  void _showSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(fontSize: 16)),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Future<void> _login() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    if (email.isEmpty || password.isEmpty) {
      _showSnack('Please enter email and password.');
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _supabase.signIn(email, password);
      if (!mounted) return;

      // Check if nominees exist
      final nominees = await _supabase.getNominees();
      if (!mounted) return;

      if (nominees.length < 3) {
        context.go('/nominees');
      } else {
        context.go('/home');
      }
    } catch (e) {
      _showSnack('Login failed: ${_friendlyError(e)}');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _signup() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final name = _nameController.text.trim();
    if (email.isEmpty || password.isEmpty || name.isEmpty) {
      _showSnack('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      _showSnack('Password must be at least 6 characters.');
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _supabase.signUp(email, password, name);
      await _supabase.signIn(email, password);
      if (!mounted) return;
      context.go('/nominees');
    } catch (e) {
      _showSnack('Signup failed: ${_friendlyError(e)}');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _friendlyError(dynamic e) {
    final msg = e.toString();
    if (msg.contains('Invalid login')) return 'Invalid email or password.';
    if (msg.contains('already registered')) return 'Email already in use.';
    if (msg.contains('network')) return 'No internet connection.';
    return msg.replaceAll('Exception: ', '');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1A237E), Color(0xFF283593), Color(0xFF3949AB)],
          ),
        ),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 28),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(25),
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: Colors.white.withAlpha(50), width: 2),
                      ),
                      child: const Icon(Icons.health_and_safety,
                          size: 55, color: Colors.white),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'SmartSaathi',
                      style: GoogleFonts.poppins(
                        fontSize: 38,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Your Voice-First Care Companion',
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        color: Colors.white.withAlpha(180),
                      ),
                    ),
                    const SizedBox(height: 40),

                    // Tab toggle
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(15),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          _buildTab('Login', !_isSignUp),
                          _buildTab('Sign Up', _isSignUp),
                        ],
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Form
                    if (_isSignUp) ...[
                      _buildField(_nameController, 'Full Name',
                          Icons.person_outline, false),
                      const SizedBox(height: 14),
                    ],
                    _buildField(
                        _emailController, 'Email', Icons.email_outlined, false),
                    const SizedBox(height: 14),
                    _buildField(_passwordController, 'Password',
                        Icons.lock_outline, true),
                    const SizedBox(height: 28),

                    // Submit
                    SizedBox(
                      width: double.infinity,
                      height: 58,
                      child: _isLoading
                          ? const Center(
                              child:
                                  CircularProgressIndicator(color: Colors.white))
                          : ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFFF6F00),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(18)),
                                elevation: 8,
                                shadowColor: const Color(0xFFFF6F00).withAlpha(100),
                              ),
                              onPressed: _isSignUp ? _signup : _login,
                              child: Text(
                                _isSignUp ? 'Create Account' : 'Login',
                                style: GoogleFonts.poppins(
                                    fontSize: 18, fontWeight: FontWeight.w700),
                              ),
                            ),
                    ),
                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTab(String label, bool isActive) {
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() => _isSignUp = label == 'Sign Up');
          _fadeController.reset();
          _fadeController.forward();
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: isActive ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isActive
                  ? const Color(0xFF1A237E)
                  : Colors.white.withAlpha(160),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildField(TextEditingController controller, String label,
      IconData icon, bool isPassword) {
    return TextField(
      controller: controller,
      obscureText: isPassword && _obscurePassword,
      style: GoogleFonts.poppins(color: Colors.white, fontSize: 16),
      decoration: InputDecoration(
        labelText: label,
        labelStyle:
            GoogleFonts.poppins(color: Colors.white.withAlpha(160), fontSize: 15),
        prefixIcon: Icon(icon, color: Colors.white.withAlpha(180)),
        suffixIcon: isPassword
            ? IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility_off : Icons.visibility,
                  color: Colors.white.withAlpha(140),
                ),
                onPressed: () =>
                    setState(() => _obscurePassword = !_obscurePassword),
              )
            : null,
        filled: true,
        fillColor: Colors.white.withAlpha(15),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.white.withAlpha(30)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.white.withAlpha(30)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Colors.white, width: 1.5),
        ),
      ),
    );
  }
}
