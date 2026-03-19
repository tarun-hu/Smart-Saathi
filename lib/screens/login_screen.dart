import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/supabase_service.dart';
import 'package:go_router/go_router.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  final LocalAuthentication auth = LocalAuthentication();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();

  String? _selectedRole;
  bool _isSignUp = false;
  bool _isLoading = false;
  bool _obscurePassword = true;

  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 400));
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

  void _selectRole(String role) {
    setState(() {
      _selectedRole = role;
      _isSignUp = false;
      _emailController.clear();
      _passwordController.clear();
      _nameController.clear();
    });
    _fadeController.reset();
    _fadeController.forward();
  }

  void _goBackToRoleSelection() {
    setState(() {
      _selectedRole = null;
      _isSignUp = false;
      _emailController.clear();
      _passwordController.clear();
      _nameController.clear();
    });
    _fadeController.reset();
    _fadeController.forward();
  }

  void _toggleMode() {
    setState(() {
      _isSignUp = !_isSignUp;
      _nameController.clear();
    });
    _fadeController.reset();
    _fadeController.forward();
  }

  void _showSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _navigateByRole() async {
    if (!mounted) return;
    ref.invalidate(userProfileProvider);
    ref.invalidate(userRoleProvider);

    try {
      final profile = await ref.read(supabaseServiceProvider).getProfile();
      final role = profile?['role'] as String? ?? 'senior';
      if (!mounted) return;
      context.go(role == 'caregiver' ? '/caregiver/home' : '/senior/home');
    } catch (_) {
      if (mounted) context.go('/senior/home');
    }
  }

  Future<void> _authenticateBiometric() async {
    try {
      bool canAuthenticate = false;
      try {
        final bool canAuthenticateWithBiometrics =
            await auth.canCheckBiometrics;
        canAuthenticate =
            canAuthenticateWithBiometrics || await auth.isDeviceSupported();
      } catch (e) {
        canAuthenticate = false;
      }

      if (!canAuthenticate) {
        _showSnack('Biometrics not available on this device.');
        return;
      }

      final bool didAuthenticate = await auth.authenticate(
        localizedReason: 'Authenticate to access SmartSaathi',
        options: const AuthenticationOptions(biometricOnly: true),
      );

      if (didAuthenticate && mounted) {
        final client = ref.read(supabaseProvider);
        if (client.auth.currentUser == null) {
          _showSnack('No active session. Please login with email first.');
          return;
        }
        await _navigateByRole();
      }
    } catch (e) {
      _showSnack('Biometric Error: $e');
    }
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
      final supabase = ref.read(supabaseServiceProvider);
      await supabase.signIn(email, password);
      await _navigateByRole();
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
      final supabase = ref.read(supabaseServiceProvider);
      await supabase.signUpWithProfile(email, password, name, _selectedRole!);
      _showSnack('Account created! Logging you in...');
      // Auto-login after signup
      await supabase.signIn(email, password);
      await _navigateByRole();
    } catch (e) {
      _showSnack('Signup failed: ${_friendlyError(e)}');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _friendlyError(dynamic e) {
    final msg = e.toString();
    if (msg.contains('Invalid login')) return 'Invalid email or password.';
    if (msg.contains('already registered')) return 'Email already registered.';
    if (msg.contains('network')) return 'Network error. Check your connection.';
    return msg.replaceAll('Exception: ', '');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: _selectedRole == 'caregiver'
                ? [
                    const Color(0xFF0D47A1),
                    const Color(0xFF1565C0),
                    const Color(0xFF1E88E5)
                  ]
                : [
                    const Color(0xFF003049),
                    const Color(0xFF0A5C8A),
                    const Color(0xFF1976D2)
                  ],
          ),
        ),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: _selectedRole == null
                ? _buildRoleSelection()
                : _buildAuthForm(),
          ),
        ),
      ),
    );
  }

  Widget _buildRoleSelection() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(25),
                shape: BoxShape.circle,
                border:
                    Border.all(color: Colors.white.withAlpha(50), width: 2),
              ),
              child: const Icon(Icons.health_and_safety,
                  size: 55, color: Colors.white),
            ),
            const SizedBox(height: 20),
            const Text(
              "SmartSaathi",
              style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 1.5),
            ),
            const SizedBox(height: 6),
            Text(
              "Healthcare Companion",
              style: TextStyle(
                  fontSize: 16,
                  color: Colors.white.withAlpha(180),
                  letterSpacing: 0.5),
            ),
            const SizedBox(height: 60),
            Text(
              "I am a...",
              style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.white.withAlpha(220)),
            ),
            const SizedBox(height: 24),
            _buildRoleCard(
              role: 'senior',
              title: 'Senior',
              subtitle: 'I need daily health assistance',
              icon: Icons.elderly,
              gradientColors: [const Color(0xFFFF8A65), const Color(0xFFFF5722)],
            ),
            const SizedBox(height: 16),
            _buildRoleCard(
              role: 'caregiver',
              title: 'Caregiver',
              subtitle: 'I help monitor a senior\'s health',
              icon: Icons.supervisor_account,
              gradientColors: [const Color(0xFF42A5F5), const Color(0xFF1565C0)],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRoleCard({
    required String role,
    required String title,
    required String subtitle,
    required IconData icon,
    required List<Color> gradientColors,
  }) {
    return GestureDetector(
      onTap: () => _selectRole(role),
      child: Container(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: gradientColors),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
                color: gradientColors.last.withAlpha(80),
                blurRadius: 20,
                offset: const Offset(0, 8)),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(40),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 32, color: Colors.white),
            ),
            const SizedBox(width: 18),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Colors.white)),
                  const SizedBox(height: 4),
                  Text(subtitle,
                      style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withAlpha(200))),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios,
                color: Colors.white.withAlpha(180), size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildAuthForm() {
    final isSenior = _selectedRole == 'senior';
    final roleColor =
        isSenior ? const Color(0xFFFF5722) : const Color(0xFF1565C0);
    final roleIcon = isSenior ? Icons.elderly : Icons.supervisor_account;
    final roleLabel = isSenior ? 'Senior' : 'Caregiver';

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                GestureDetector(
                  onTap: _goBackToRoleSelection,
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withAlpha(20),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withAlpha(40)),
                    ),
                    child: const Icon(Icons.arrow_back,
                        color: Colors.white, size: 22),
                  ),
                ),
                const Spacer(),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: roleColor.withAlpha(40),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: roleColor.withAlpha(80)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(roleIcon, color: Colors.white, size: 18),
                      const SizedBox(width: 6),
                      Text(roleLabel,
                          style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),
            Text(
              _isSignUp ? "Create Account" : "Welcome Back",
              style: const TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.w900,
                  color: Colors.white),
            ),
            const SizedBox(height: 6),
            Text(
              _isSignUp
                  ? "Sign up as a $roleLabel to get started"
                  : "Sign in to your $roleLabel account",
              style:
                  TextStyle(fontSize: 15, color: Colors.white.withAlpha(180)),
            ),
            const SizedBox(height: 36),

            // Login / Sign Up toggle tabs
            Container(
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(15),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: _isSignUp ? _toggleMode : null,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: !_isSignUp ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          "Login",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: !_isSignUp
                                ? const Color(0xFF003049)
                                : Colors.white.withAlpha(160),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: !_isSignUp ? _toggleMode : null,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: _isSignUp ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          "Sign Up",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: _isSignUp
                                ? const Color(0xFF003049)
                                : Colors.white.withAlpha(160),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Form fields
            if (_isSignUp) ...[
              _buildTextField(
                  _nameController, 'Full Name', Icons.person_outline, false),
              const SizedBox(height: 14),
            ],
            _buildTextField(
                _emailController, 'Email', Icons.email_outlined, false),
            const SizedBox(height: 14),
            _buildTextField(
                _passwordController, 'Password', Icons.lock_outline, true),
            const SizedBox(height: 28),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: Colors.white))
                  : ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF003049),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16)),
                        elevation: 8,
                        shadowColor: Colors.black.withAlpha(40),
                      ),
                      onPressed: _isSignUp ? _signup : _login,
                      child: Text(
                        _isSignUp
                            ? "Create $roleLabel Account"
                            : "Login as $roleLabel",
                        style: const TextStyle(
                            fontSize: 17, fontWeight: FontWeight.w800),
                      ),
                    ),
            ),

            // Biometric for seniors (login mode only)
            if (isSenior && !_isSignUp) ...[
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                      child: Divider(color: Colors.white.withAlpha(40))),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text("or",
                        style: TextStyle(
                            color: Colors.white.withAlpha(140),
                            fontSize: 14)),
                  ),
                  Expanded(
                      child: Divider(color: Colors.white.withAlpha(40))),
                ],
              ),
              const SizedBox(height: 20),
              GestureDetector(
                onTap: _authenticateBiometric,
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(15),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withAlpha(40)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.fingerprint,
                          color: Colors.white, size: 28),
                      const SizedBox(width: 12),
                      Text(
                        "Use Fingerprint",
                        style: TextStyle(
                            color: Colors.white.withAlpha(220),
                            fontWeight: FontWeight.w600,
                            fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ),
            ],

            const SizedBox(height: 30),
            GestureDetector(
              onTap: _goBackToRoleSelection,
              child: Text.rich(
                TextSpan(
                  text: "Not a $roleLabel? ",
                  style: TextStyle(
                      color: Colors.white.withAlpha(140), fontSize: 14),
                  children: [
                    TextSpan(
                      text: "Change Role",
                      style: TextStyle(
                        color: Colors.white.withAlpha(240),
                        fontWeight: FontWeight.bold,
                        decoration: TextDecoration.underline,
                        decorationColor: Colors.white.withAlpha(180),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label,
      IconData icon, bool isPassword) {
    return TextField(
      controller: controller,
      obscureText: isPassword && _obscurePassword,
      style: const TextStyle(color: Colors.white, fontSize: 16),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: Colors.white.withAlpha(160)),
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
