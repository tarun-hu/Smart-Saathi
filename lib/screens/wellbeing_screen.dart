import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import '../services/supabase_service.dart';
import '../models/health_report.dart';
import '../models/vital_log.dart';

class WellbeingScreen extends StatefulWidget {
  const WellbeingScreen({super.key});

  @override
  State<WellbeingScreen> createState() => _WellbeingScreenState();
}

class _WellbeingScreenState extends State<WellbeingScreen>
    with SingleTickerProviderStateMixin {
  final _supabase = SupabaseService.instance;
  late TabController _tabController;

  List<HealthReport> _reports = [];
  List<VitalLog> _vitals = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final reports = await _supabase.getHealthReports();
      final vitals = await _supabase.getVitalLogs();
      if (mounted) {
        setState(() {
          _reports = reports;
          _vitals = vitals;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ──── HEALTH REPORTS ───────────────────────────

  Future<void> _captureReport() async {
    final picker = ImagePicker();
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40, height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text('Capture Report',
                style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _sourceButton(
                    icon: Icons.camera_alt_rounded,
                    label: 'Camera',
                    onTap: () => Navigator.pop(ctx, ImageSource.camera),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: _sourceButton(
                    icon: Icons.photo_library_rounded,
                    label: 'Gallery',
                    onTap: () => Navigator.pop(ctx, ImageSource.gallery),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );

    if (source == null) return;

    final image = await picker.pickImage(source: source, imageQuality: 80);
    if (image == null) return;
    if (!mounted) return;

    // Ask for report name
    final nameC = TextEditingController();
    final reportName = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Name this report',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        content: TextField(
          controller: nameC,
          autofocus: true,
          style: GoogleFonts.poppins(fontSize: 16),
          decoration: InputDecoration(
            hintText: 'e.g. Blood Test, X-Ray, Prescription',
            filled: true,
            fillColor: Colors.grey.shade100,
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide.none),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: GoogleFonts.poppins()),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, nameC.text.trim()),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2E7D32),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('Save', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );

    if (reportName == null || reportName.isEmpty) return;

    // Upload and save
    setState(() => _isLoading = true);
    try {
      final imageUrl = await _supabase.uploadReportImage(File(image.path));
      await _supabase.addHealthReport(reportName, imageUrl);
      await _loadData();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Report "$reportName" saved ✅'),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save report: ${e.toString().replaceAll('Exception: ', '')}'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Widget _sourceButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 24),
        decoration: BoxDecoration(
          color: const Color(0xFF2E7D32).withAlpha(15),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFF2E7D32).withAlpha(30)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 36, color: const Color(0xFF2E7D32)),
            const SizedBox(height: 8),
            Text(label,
                style: GoogleFonts.poppins(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF2E7D32))),
          ],
        ),
      ),
    );
  }

  // ──── VITALS ───────────────────────────────────

  Future<void> _logBloodSugar() async {
    final controller = TextEditingController();
    final result = await showDialog<double>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Log Blood Sugar',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Enter your blood sugar reading',
                style: GoogleFonts.poppins(fontSize: 14, color: Colors.grey.shade600)),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              autofocus: true,
              style: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.w700),
              textAlign: TextAlign.center,
              decoration: InputDecoration(
                suffix: Text('mg/dL',
                    style: GoogleFonts.poppins(fontSize: 16, color: Colors.grey)),
                filled: true,
                fillColor: Colors.red.shade50,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: GoogleFonts.poppins()),
          ),
          ElevatedButton(
            onPressed: () {
              final val = double.tryParse(controller.text);
              if (val != null) Navigator.pop(ctx, val);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE53935),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('Save', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );

    if (result != null) {
      await _supabase.addVitalLog(type: 'blood_sugar', value: result);
      await _loadData();
    }
  }

  Future<void> _logBloodPressure() async {
    final sysC = TextEditingController();
    final diaC = TextEditingController();

    final result = await showDialog<Map<String, int>>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Log Blood Pressure',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Enter systolic / diastolic',
                style: GoogleFonts.poppins(fontSize: 14, color: Colors.grey.shade600)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: sysC,
                    keyboardType: TextInputType.number,
                    autofocus: true,
                    style: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.w700),
                    textAlign: TextAlign.center,
                    decoration: InputDecoration(
                      labelText: 'Systolic',
                      labelStyle: GoogleFonts.poppins(fontSize: 12),
                      filled: true,
                      fillColor: Colors.blue.shade50,
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide.none),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Text('/',
                      style: GoogleFonts.poppins(
                          fontSize: 28, fontWeight: FontWeight.w700)),
                ),
                Expanded(
                  child: TextField(
                    controller: diaC,
                    keyboardType: TextInputType.number,
                    style: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.w700),
                    textAlign: TextAlign.center,
                    decoration: InputDecoration(
                      labelText: 'Diastolic',
                      labelStyle: GoogleFonts.poppins(fontSize: 12),
                      filled: true,
                      fillColor: Colors.blue.shade50,
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide.none),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('mmHg', style: GoogleFonts.poppins(color: Colors.grey)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel', style: GoogleFonts.poppins()),
          ),
          ElevatedButton(
            onPressed: () {
              final sys = int.tryParse(sysC.text);
              final dia = int.tryParse(diaC.text);
              if (sys != null && dia != null) {
                Navigator.pop(ctx, {'systolic': sys, 'diastolic': dia});
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1565C0),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('Save', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );

    if (result != null) {
      await _supabase.addVitalLog(
        type: 'blood_pressure',
        systolic: result['systolic'],
        diastolic: result['diastolic'],
      );
      await _loadData();
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('Well-Being',
            style: GoogleFonts.poppins(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF2E7D32))),
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFF2E7D32),
          unselectedLabelColor: Colors.grey.shade500,
          indicatorColor: const Color(0xFF2E7D32),
          indicatorWeight: 3,
          labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 15),
          unselectedLabelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w500),
          tabs: const [
            Tab(text: '📋 Reports'),
            Tab(text: '💓 Vitals'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _reportsTab(),
                _vitalsTab(),
              ],
            ),
    );
  }

  // ──── REPORTS TAB ──────────────────────────────

  Widget _reportsTab() {
    return Column(
      children: [
        // Add report button
        Padding(
          padding: const EdgeInsets.all(20),
          child: GestureDetector(
            onTap: _captureReport,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 22),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2E7D32), Color(0xFF43A047)],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF2E7D32).withAlpha(40),
                    blurRadius: 15,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 28),
                  const SizedBox(width: 12),
                  Text('Capture New Report',
                      style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: Colors.white)),
                ],
              ),
            ),
          ),
        ),

        // Reports list
        Expanded(
          child: _reports.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.description_outlined,
                          size: 60, color: Colors.grey.shade300),
                      const SizedBox(height: 12),
                      Text('No reports yet',
                          style: GoogleFonts.poppins(
                              fontSize: 17,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey.shade400)),
                      Text('Take a photo of your medical reports',
                          style: GoogleFonts.poppins(
                              fontSize: 13, color: Colors.grey.shade400)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: _reports.length,
                  itemBuilder: (ctx, i) => _reportCard(_reports[i]),
                ),
        ),
      ],
    );
  }

  Widget _reportCard(HealthReport report) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(6),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.horizontal(left: Radius.circular(18)),
            child: Image.network(
              report.imageUrl,
              width: 80,
              height: 80,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(
                width: 80,
                height: 80,
                color: Colors.grey.shade200,
                child: Icon(Icons.broken_image, color: Colors.grey.shade400),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(report.name,
                      style: GoogleFonts.poppins(
                          fontSize: 16, fontWeight: FontWeight.w700)),
                  Text(
                    DateFormat('MMM d, yyyy • h:mm a').format(report.timestamp),
                    style: GoogleFonts.poppins(
                        fontSize: 12, color: Colors.grey.shade500),
                  ),
                ],
              ),
            ),
          ),
          IconButton(
            onPressed: () async {
              await _supabase.deleteHealthReport(report.id);
              await _loadData();
            },
            icon: Icon(Icons.delete_outline, color: Colors.grey.shade400, size: 22),
          ),
        ],
      ),
    );
  }

  // ──── VITALS TAB ───────────────────────────────

  Widget _vitalsTab() {
    final todayBS = _vitals.where((v) => v.type == 'blood_sugar').toList();
    final todayBP = _vitals.where((v) => v.type == 'blood_pressure').toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Quick-add vitals
          Row(
            children: [
              Expanded(
                child: _vitalAddButton(
                  icon: Icons.bloodtype_rounded,
                  label: 'Blood Sugar',
                  color: const Color(0xFFE53935),
                  bgColor: Colors.red.shade50,
                  onTap: _logBloodSugar,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: _vitalAddButton(
                  icon: Icons.monitor_heart_rounded,
                  label: 'Blood Pressure',
                  color: const Color(0xFF1565C0),
                  bgColor: Colors.blue.shade50,
                  onTap: _logBloodPressure,
                ),
              ),
            ],
          ),
          const SizedBox(height: 28),

          // Blood Sugar History
          if (todayBS.isNotEmpty) ...[
            _sectionHeader('🩸 Blood Sugar', const Color(0xFFE53935)),
            const SizedBox(height: 10),
            ...todayBS.map((v) => _vitalCard(v, const Color(0xFFE53935), Colors.red.shade50)),
            const SizedBox(height: 20),
          ],

          // Blood Pressure History
          if (todayBP.isNotEmpty) ...[
            _sectionHeader('💗 Blood Pressure', const Color(0xFF1565C0)),
            const SizedBox(height: 10),
            ...todayBP.map((v) => _vitalCard(v, const Color(0xFF1565C0), Colors.blue.shade50)),
            const SizedBox(height: 20),
          ],

          if (todayBS.isEmpty && todayBP.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.monitor_heart_outlined,
                        size: 60, color: Colors.grey.shade300),
                    const SizedBox(height: 12),
                    Text('No vitals logged yet',
                        style: GoogleFonts.poppins(
                            fontSize: 17,
                            fontWeight: FontWeight.w600,
                            color: Colors.grey.shade400)),
                    Text('Tap above to log your readings',
                        style: GoogleFonts.poppins(
                            fontSize: 13, color: Colors.grey.shade400)),
                  ],
                ),
              ),
            ),

          const SizedBox(height: 60),
        ],
      ),
    );
  }

  Widget _vitalAddButton({
    required IconData icon,
    required String label,
    required Color color,
    required Color bgColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 24),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withAlpha(30)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 36, color: color),
            const SizedBox(height: 8),
            Text(label,
                style: GoogleFonts.poppins(
                    fontSize: 14, fontWeight: FontWeight.w700, color: color)),
            const SizedBox(height: 4),
            Text('Tap to log',
                style: GoogleFonts.poppins(fontSize: 11, color: color.withAlpha(150))),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String text, Color color) {
    return Text(text,
        style: GoogleFonts.poppins(
            fontSize: 17, fontWeight: FontWeight.w700, color: color));
  }

  Widget _vitalCard(VitalLog vital, Color color, Color bgColor) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(6),
              blurRadius: 8,
              offset: const Offset(0, 3)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              vital.type == 'blood_sugar'
                  ? Icons.bloodtype_rounded
                  : Icons.monitor_heart_rounded,
              color: color,
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(vital.displayValue,
                    style: GoogleFonts.poppins(
                        fontSize: 18, fontWeight: FontWeight.w700)),
                Text(
                  DateFormat('MMM d • h:mm a').format(vital.timestamp),
                  style: GoogleFonts.poppins(
                      fontSize: 12, color: Colors.grey.shade500),
                ),
              ],
            ),
          ),
          _vitalIndicator(vital),
        ],
      ),
    );
  }

  Widget _vitalIndicator(VitalLog vital) {
    String label;
    Color color;

    if (vital.type == 'blood_sugar') {
      final v = vital.value ?? 0;
      if (v < 70) {
        label = 'Low'; color = Colors.orange;
      } else if (v <= 140) {
        label = 'Normal'; color = Colors.green;
      } else {
        label = 'High'; color = Colors.red;
      }
    } else {
      final sys = vital.systolic ?? 0;
      if (sys < 90) {
        label = 'Low'; color = Colors.orange;
      } else if (sys <= 130) {
        label = 'Normal'; color = Colors.green;
      } else {
        label = 'High'; color = Colors.red;
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label,
          style: GoogleFonts.poppins(
              fontSize: 12, fontWeight: FontWeight.w700, color: color)),
    );
  }
}
