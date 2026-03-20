import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/supabase_service.dart';
import 'package:go_router/go_router.dart';

class NomineeSetupScreen extends StatefulWidget {
  const NomineeSetupScreen({super.key});

  @override
  State<NomineeSetupScreen> createState() => _NomineeSetupScreenState();
}

class _NomineeSetupScreenState extends State<NomineeSetupScreen>
    with SingleTickerProviderStateMixin {
  final _supabase = SupabaseService.instance;
  int _currentStep = 0; // 0, 1, 2 for each nominee
  bool _isLoading = false;

  final List<TextEditingController> _nameControllers =
      List.generate(3, (_) => TextEditingController());
  final List<TextEditingController> _phoneControllers =
      List.generate(3, (_) => TextEditingController());

  late AnimationController _animController;
  late Animation<Offset> _slideAnimation;

  final _stepLabels = [
    'First Family Member',
    'Second Family Member',
    'Third Family Member',
  ];

  final _stepEmojis = ['👨‍👩‍👦', '👪', '👨‍👩‍👧‍👦'];

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 400));
    _slideAnimation = Tween<Offset>(
      begin: const Offset(1, 0),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animController, curve: Curves.easeOut));
    _animController.forward();
  }

  @override
  void dispose() {
    for (final c in _nameControllers) {
      c.dispose();
    }
    for (final c in _phoneControllers) {
      c.dispose();
    }
    _animController.dispose();
    super.dispose();
  }

  void _showSnack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: const TextStyle(fontSize: 16)),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  bool _validateCurrentStep() {
    final name = _nameControllers[_currentStep].text.trim();
    final phone = _phoneControllers[_currentStep].text.trim();

    if (name.isEmpty) {
      _showSnack('Please enter the name');
      return false;
    }
    if (phone.isEmpty) {
      _showSnack('Please enter the WhatsApp number');
      return false;
    }

    // Validate Indian phone number
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d]'), '');
    if (cleanPhone.length != 10 &&
        !(cleanPhone.length == 12 && cleanPhone.startsWith('91'))) {
      _showSnack('Please enter a valid 10-digit Indian mobile number');
      return false;
    }

    return true;
  }

  void _nextStep() {
    if (!_validateCurrentStep()) return;

    if (_currentStep < 2) {
      setState(() => _currentStep++);
      _animController.reset();
      _animController.forward();
    } else {
      _saveNominees();
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
      _animController.reset();
      _animController.forward();
    }
  }

  Future<void> _saveNominees() async {
    setState(() => _isLoading = true);
    try {
      final nominees = <Map<String, String>>[];
      for (int i = 0; i < 3; i++) {
        String phone = _phoneControllers[i].text.trim().replaceAll(RegExp(r'[^\d]'), '');
        if (phone.length == 10) phone = '+91$phone';
        if (!phone.startsWith('+')) phone = '+$phone';

        nominees.add({
          'name': _nameControllers[i].text.trim(),
          'whatsapp': phone,
        });
      }

      await _supabase.saveAllNominees(nominees);
      if (!mounted) return;
      _showSnack('✅ Family members saved successfully!');
      context.go('/home');
    } catch (e) {
      _showSnack('Error: ${e.toString().replaceAll('Exception: ', '')}');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF1B5E20), Color(0xFF2E7D32), Color(0xFF43A047)],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                const SizedBox(height: 20),
                // Header
                Text(
                  'Add Family Members',
                  style: GoogleFonts.poppins(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'These people will receive your emergency alerts',
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    color: Colors.white.withAlpha(200),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),

                // Step indicators
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(3, (i) {
                    final isActive = i == _currentStep;
                    final isDone = i < _currentStep;
                    return Row(
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          width: isActive ? 40 : 32,
                          height: isActive ? 40 : 32,
                          decoration: BoxDecoration(
                            color: isDone
                                ? Colors.white
                                : isActive
                                    ? Colors.white.withAlpha(40)
                                    : Colors.white.withAlpha(15),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isActive || isDone
                                  ? Colors.white
                                  : Colors.white.withAlpha(60),
                              width: 2,
                            ),
                          ),
                          child: Center(
                            child: isDone
                                ? const Icon(Icons.check,
                                    color: Color(0xFF1B5E20), size: 20)
                                : Text(
                                    '${i + 1}',
                                    style: GoogleFonts.poppins(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: isActive ? 16 : 14,
                                    ),
                                  ),
                          ),
                        ),
                        if (i < 2)
                          Container(
                            width: 40,
                            height: 2,
                            color: isDone
                                ? Colors.white
                                : Colors.white.withAlpha(40),
                          ),
                      ],
                    );
                  }),
                ),
                const SizedBox(height: 32),

                // Form card
                Expanded(
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: Card(
                      color: Colors.white.withAlpha(20),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                        side: BorderSide(color: Colors.white.withAlpha(30)),
                      ),
                      elevation: 0,
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Center(
                                child: Text(
                                  _stepEmojis[_currentStep],
                                  style: const TextStyle(fontSize: 50),
                                ),
                              ),
                              const SizedBox(height: 12),
                              Center(
                                child: Text(
                                  _stepLabels[_currentStep],
                                  style: GoogleFonts.poppins(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 24),
                              Text(
                                'Name',
                                style: GoogleFonts.poppins(
                                  color: Colors.white.withAlpha(200),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              TextField(
                                controller: _nameControllers[_currentStep],
                                style: GoogleFonts.poppins(
                                    color: Colors.white, fontSize: 18),
                                decoration: _inputDecor(
                                    'Enter name', Icons.person_outline),
                              ),
                              const SizedBox(height: 20),
                              Text(
                                'WhatsApp Number',
                                style: GoogleFonts.poppins(
                                  color: Colors.white.withAlpha(200),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              TextField(
                                controller: _phoneControllers[_currentStep],
                                keyboardType: TextInputType.phone,
                                style: GoogleFonts.poppins(
                                    color: Colors.white, fontSize: 18),
                                decoration: _inputDecor(
                                  '+91 XXXXX XXXXX',
                                  Icons.phone,
                                  prefix: '+91 ',
                                ),
                              ),
                              const SizedBox(height: 28),

                              // Navigation buttons
                              Row(
                                children: [
                                  if (_currentStep > 0)
                                    Expanded(
                                      child: OutlinedButton.icon(
                                        onPressed: _prevStep,
                                        icon: const Icon(Icons.arrow_back,
                                            color: Colors.white),
                                        label: Text('Back',
                                            style: GoogleFonts.poppins(
                                                color: Colors.white,
                                                fontWeight: FontWeight.w600)),
                                        style: OutlinedButton.styleFrom(
                                          side: const BorderSide(
                                              color: Colors.white),
                                          padding: const EdgeInsets.symmetric(
                                              vertical: 16),
                                          shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(16),
                                          ),
                                        ),
                                      ),
                                    ),
                                  if (_currentStep > 0)
                                    const SizedBox(width: 12),
                                  Expanded(
                                    flex: 2,
                                    child: _isLoading
                                        ? const Center(
                                            child: CircularProgressIndicator(
                                                color: Colors.white))
                                        : ElevatedButton.icon(
                                            onPressed: _nextStep,
                                            icon: Icon(
                                              _currentStep < 2
                                                  ? Icons.arrow_forward
                                                  : Icons.check_circle,
                                              color: Colors.white,
                                            ),
                                            label: Text(
                                              _currentStep < 2
                                                  ? 'Next'
                                                  : 'Save All',
                                              style: GoogleFonts.poppins(
                                                fontSize: 17,
                                                fontWeight: FontWeight.w700,
                                                color: Colors.white,
                                              ),
                                            ),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor:
                                                  const Color(0xFFFF6F00),
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      vertical: 16),
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(16),
                                              ),
                                              elevation: 6,
                                            ),
                                          ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecor(String hint, IconData icon, {String? prefix}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.poppins(color: Colors.white.withAlpha(100)),
      prefixIcon: Icon(icon, color: Colors.white.withAlpha(180)),
      prefixText: prefix,
      prefixStyle: GoogleFonts.poppins(color: Colors.white, fontSize: 18),
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
    );
  }
}
