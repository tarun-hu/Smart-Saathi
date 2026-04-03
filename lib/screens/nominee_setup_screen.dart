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
  bool _isLoading = false;

  // Dynamic list of nominee forms (start with 1, max 3)
  final List<TextEditingController> _nameControllers = [TextEditingController()];
  final List<TextEditingController> _phoneControllers = [TextEditingController()];

  late AnimationController _animController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 500));
    _fadeAnimation =
        CurvedAnimation(parent: _animController, curve: Curves.easeOut);
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

  int get _nomineeCount => _nameControllers.length;

  void _addNomineeSlot() {
    if (_nomineeCount >= 3) return;
    setState(() {
      _nameControllers.add(TextEditingController());
      _phoneControllers.add(TextEditingController());
    });
  }

  void _removeNomineeSlot(int index) {
    if (_nomineeCount <= 1) return;
    setState(() {
      _nameControllers[index].dispose();
      _phoneControllers[index].dispose();
      _nameControllers.removeAt(index);
      _phoneControllers.removeAt(index);
    });
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

  bool _validate() {
    // At least first nominee must be filled
    final name = _nameControllers[0].text.trim();
    final phone = _phoneControllers[0].text.trim();

    if (name.isEmpty) {
      _showSnack('Please enter the first nominee\'s name');
      return false;
    }
    if (phone.isEmpty) {
      _showSnack('Please enter the first nominee\'s WhatsApp number');
      return false;
    }

    // Validate all filled nominees
    for (int i = 0; i < _nomineeCount; i++) {
      final n = _nameControllers[i].text.trim();
      final p = _phoneControllers[i].text.trim();

      if (n.isEmpty && p.isEmpty && i > 0) continue; // Skip empty optional slots

      if (n.isEmpty || p.isEmpty) {
        _showSnack('Please fill both name and number for nominee ${i + 1}');
        return false;
      }

      final cleanPhone = p.replaceAll(RegExp(r'[^\d]'), '');
      if (cleanPhone.length != 10 &&
          !(cleanPhone.length == 12 && cleanPhone.startsWith('91'))) {
        _showSnack('Nominee ${i + 1}: Enter a valid 10-digit Indian mobile number');
        return false;
      }
    }
    return true;
  }

  Future<void> _saveNominees() async {
    if (!_validate()) return;

    setState(() => _isLoading = true);
    try {
      final nominees = <Map<String, String>>[];
      for (int i = 0; i < _nomineeCount; i++) {
        final name = _nameControllers[i].text.trim();
        final phone = _phoneControllers[i].text.trim();
        if (name.isEmpty || phone.isEmpty) continue;

        String cleanPhone = phone.replaceAll(RegExp(r'[^\d]'), '');
        if (cleanPhone.length == 10) cleanPhone = '+91$cleanPhone';
        if (!cleanPhone.startsWith('+')) cleanPhone = '+$cleanPhone';

        nominees.add({
          'name': name,
          'whatsapp': cleanPhone,
        });
      }

      await _supabase.saveAllNominees(nominees);
      if (!mounted) return;
      _showSnack('✅ Family member${nominees.length > 1 ? "s" : ""} saved!');
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
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Center(
                    child: Text(
                      'Add Family Member',
                      style: GoogleFonts.poppins(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Center(
                    child: Text(
                      'At least 1 family member is required for SOS alerts.\nYou can add up to 3.',
                      style: GoogleFonts.poppins(
                        fontSize: 14,
                        color: Colors.white.withAlpha(200),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Nominee forms
                  ...List.generate(_nomineeCount, (i) => _nomineeForm(i)),

                  // Add more button
                  if (_nomineeCount < 3)
                    Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: Center(
                        child: OutlinedButton.icon(
                          onPressed: _addNomineeSlot,
                          icon: const Icon(Icons.add, color: Colors.white),
                          label: Text(
                            'Add Another (Optional)',
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(
                                color: Colors.white.withAlpha(120)),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 24, vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                        ),
                      ),
                    ),

                  const SizedBox(height: 28),

                  // Save button
                  SizedBox(
                    width: double.infinity,
                    child: _isLoading
                        ? const Center(
                            child:
                                CircularProgressIndicator(color: Colors.white))
                        : ElevatedButton.icon(
                            onPressed: _saveNominees,
                            icon: const Icon(Icons.check_circle,
                                color: Colors.white),
                            label: Text(
                              'Continue',
                              style: GoogleFonts.poppins(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFFF6F00),
                              padding:
                                  const EdgeInsets.symmetric(vertical: 18),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(18),
                              ),
                              elevation: 6,
                            ),
                          ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _nomineeForm(int index) {
    final labels = ['First', 'Second', 'Third'];
    final emojis = ['👨‍👩‍👦', '👪', '👨‍👩‍👧‍👦'];

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(20),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withAlpha(30)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(emojis[index], style: const TextStyle(fontSize: 28)),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '${labels[index]} Family Member${index == 0 ? " *" : " (Optional)"}',
                  style: GoogleFonts.poppins(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
              if (index > 0)
                GestureDetector(
                  onTap: () => _removeNomineeSlot(index),
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.red.withAlpha(40),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.close, color: Colors.white, size: 18),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _nameControllers[index],
            style: GoogleFonts.poppins(color: Colors.white, fontSize: 17),
            decoration: _inputDecor('Enter name', Icons.person_outline),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _phoneControllers[index],
            keyboardType: TextInputType.phone,
            style: GoogleFonts.poppins(color: Colors.white, fontSize: 17),
            decoration: _inputDecor(
              '+91 XXXXX XXXXX',
              Icons.phone,
              prefix: '+91 ',
            ),
          ),
        ],
      ),
    );
  }

  InputDecoration _inputDecor(String hint, IconData icon, {String? prefix}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.poppins(color: Colors.white.withAlpha(100)),
      prefixIcon: Icon(icon, color: Colors.white.withAlpha(180)),
      prefixText: prefix,
      prefixStyle: GoogleFonts.poppins(color: Colors.white, fontSize: 17),
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
