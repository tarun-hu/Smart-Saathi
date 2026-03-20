import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/supabase_service.dart';
import '../services/voice_service.dart';
import '../models/nominee.dart';
import 'package:go_router/go_router.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _supabase = SupabaseService.instance;
  final _voice = VoiceService();
  String _name = '';
  String _email = '';
  List<Nominee> _nominees = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _voice.initialize();
    await _loadData();
  }

  Future<void> _loadData() async {
    try {
      final profile = await _supabase.getProfile();
      final nominees = await _supabase.getNominees();
      if (mounted) {
        setState(() {
          _name = profile?['full_name'] ?? '';
          _email = profile?['email'] ?? '';
          _nominees = nominees;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSnack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
          content: Text(msg),
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
    );
  }

  Future<void> _editNominee(Nominee nominee) async {
    final nameC = TextEditingController(text: nominee.name);
    final phoneC = TextEditingController(text: nominee.whatsappNumber);

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.fromLTRB(
            24, 24, 24, MediaQuery.of(ctx).viewInsets.bottom + 24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text('Edit Nominee #${nominee.position}',
                style: GoogleFonts.poppins(
                    fontSize: 20, fontWeight: FontWeight.w800)),
            const SizedBox(height: 20),
            TextField(
              controller: nameC,
              style: GoogleFonts.poppins(fontSize: 16),
              decoration: InputDecoration(
                labelText: 'Name',
                prefixIcon: const Icon(Icons.person),
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: phoneC,
              keyboardType: TextInputType.phone,
              style: GoogleFonts.poppins(fontSize: 16),
              decoration: InputDecoration(
                labelText: 'WhatsApp Number',
                prefixIcon: const Icon(Icons.phone),
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1A237E),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: () async {
                  if (nameC.text.trim().isEmpty || phoneC.text.trim().isEmpty) {
                    return;
                  }
                  await _supabase.updateNominee(
                      nominee.id, nameC.text.trim(), phoneC.text.trim());
                  if (ctx.mounted) Navigator.pop(ctx);
                  await _loadData();
                  _showSnack('Nominee updated ✅');
                },
                child: Text('Save Changes',
                    style: GoogleFonts.poppins(
                        fontSize: 17, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _signOut() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Sign Out', style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        content: Text('Are you sure you want to sign out?',
            style: GoogleFonts.poppins()),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: GoogleFonts.poppins()),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('Sign Out',
                style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await _supabase.signOut();
      if (mounted) context.go('/login');
    }
  }

  @override
  void dispose() {
    _voice.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Profile',
            style: GoogleFonts.poppins(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF1A237E))),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  // Profile card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1A237E), Color(0xFF283593)],
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF1A237E).withAlpha(40),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withAlpha(25),
                            border: Border.all(
                                color: Colors.white.withAlpha(50), width: 2),
                          ),
                          child: Center(
                            child: Text(
                              _name.isNotEmpty
                                  ? _name[0].toUpperCase()
                                  : '?',
                              style: GoogleFonts.poppins(
                                fontSize: 36,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),
                        Text(_name,
                            style: GoogleFonts.poppins(
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                                color: Colors.white)),
                        const SizedBox(height: 4),
                        Text(_email,
                            style: GoogleFonts.poppins(
                                fontSize: 14,
                                color: Colors.white.withAlpha(180))),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Language toggle
                  _settingsCard(
                    icon: Icons.language_rounded,
                    title: 'Language',
                    subtitle:
                        _voice.isHindi ? 'हिंदी' : 'English',
                    trailing: Switch(
                      value: _voice.isHindi,
                      onChanged: (v) async {
                        await _voice.toggleLanguage();
                        setState(() {});
                        _voice.speak(_voice.isHindi
                            ? 'भाषा हिंदी में बदल गई'
                            : 'Language changed to English');
                      },
                      activeThumbColor: const Color(0xFF1A237E),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Nominees section
                  Row(
                    children: [
                      Text('Family Nominees',
                          style: GoogleFonts.poppins(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: const Color(0xFF1A1A2E))),
                      const Spacer(),
                      Text('${_nominees.length}/3',
                          style: GoogleFonts.poppins(
                              fontSize: 14,
                              color: Colors.grey.shade500,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (_nominees.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: Colors.amber.shade200),
                      ),
                      child: Column(
                        children: [
                          const Icon(Icons.warning_rounded,
                              color: Colors.amber, size: 36),
                          const SizedBox(height: 8),
                          Text('No nominees added!',
                              style: GoogleFonts.poppins(
                                  fontWeight: FontWeight.w700)),
                          const SizedBox(height: 4),
                          Text('Add nominees to enable SOS alerts',
                              style: GoogleFonts.poppins(
                                  fontSize: 13,
                                  color: Colors.grey.shade600)),
                          const SizedBox(height: 12),
                          ElevatedButton(
                            onPressed: () => context.go('/nominees'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFFF6F00),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text('Add Nominees'),
                          ),
                        ],
                      ),
                    )
                  else
                    ..._nominees.map(_nomineeCard),

                  const SizedBox(height: 24),

                  // Sign out
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: OutlinedButton.icon(
                      onPressed: _signOut,
                      icon: const Icon(Icons.logout, color: Colors.red),
                      label: Text('Sign Out',
                          style: GoogleFonts.poppins(
                              color: Colors.red,
                              fontWeight: FontWeight.w700,
                              fontSize: 16)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.red),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(18)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 60),
                ],
              ),
            ),
    );
  }

  Widget _settingsCard({
    required IconData icon,
    required String title,
    required String subtitle,
    Widget? trailing,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(6),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF1A237E).withAlpha(15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: const Color(0xFF1A237E), size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: GoogleFonts.poppins(
                        fontSize: 16, fontWeight: FontWeight.w700)),
                Text(subtitle,
                    style: GoogleFonts.poppins(
                        fontSize: 13, color: Colors.grey.shade500)),
              ],
            ),
          ),
          ?trailing,
        ],
      ),
    );
  }

  Widget _nomineeCard(Nominee nominee) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(6),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFF2E7D32).withAlpha(15),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '${nominee.position}',
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF2E7D32),
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(nominee.name,
                    style: GoogleFonts.poppins(
                        fontSize: 16, fontWeight: FontWeight.w700)),
                Row(
                  children: [
                    Icon(Icons.phone, size: 14, color: Colors.grey.shade400),
                    const SizedBox(width: 4),
                    Text(nominee.whatsappNumber,
                        style: GoogleFonts.poppins(
                            fontSize: 13, color: Colors.grey.shade500)),
                  ],
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => _editNominee(nominee),
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF1A237E).withAlpha(10),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.edit,
                  size: 18, color: Color(0xFF1A237E)),
            ),
          ),
        ],
      ),
    );
  }
}
