import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'package:fl_chart/fl_chart.dart';
import 'dart:convert';
import '../services/supabase_service.dart';
import '../services/ai_service.dart';
import '../models/health_report.dart';
import '../models/vital_log.dart';

enum VitalViewMode { log, graph }

enum VitalTimeRange { today, week, month, threeMonths }

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
  bool _isLoading = true;

  // ── Vitals Dashboard State ──────────────────────
  VitalViewMode _viewMode = VitalViewMode.log;

  int? _touchedBsIndex;
  int? _touchedBpIndex;

  // ── Time Range Filter State ────────────────────
  VitalTimeRange _timeRange = VitalTimeRange.today;
  List<VitalLog> _rangeVitals = [];
  bool _isRangeLoading = false;
  bool _rangeHasError = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final reports = await _supabase.getHealthReports();
      if (mounted) {
        setState(() {
          _reports = reports;
          _isLoading = false;
        });
      }
      // Load range vitals (primary)
      await _loadVitalsForRange();
    } catch (e) {

      if (mounted) setState(() => _isLoading = false);
    }
  }

  // Compute the [from, to) window for the selected range
  (DateTime, DateTime) _rangeWindow() {
    final now = DateTime.now();
    final startOfToday = DateTime(now.year, now.month, now.day);
    final startOfTomorrow = DateTime(now.year, now.month, now.day + 1);
    switch (_timeRange) {
      case VitalTimeRange.today:
        return (startOfToday, startOfTomorrow);
      case VitalTimeRange.week:
        return (startOfTomorrow.subtract(const Duration(days: 7)), startOfTomorrow);
      case VitalTimeRange.month:
        return (DateTime(now.year, now.month - 1, now.day + 1), startOfTomorrow);
      case VitalTimeRange.threeMonths:
        return (DateTime(now.year, now.month - 3, now.day + 1), startOfTomorrow);
    }
  }

  Future<void> _loadVitalsForRange() async {
    if (!mounted) return;
    setState(() {
      _isRangeLoading = true;
      _rangeHasError = false;
    });
    try {
      final (from, to) = _rangeWindow();
      final vitals = await _supabase.getVitalLogsForRange(from, to);
      if (mounted) {
        setState(() {
          _rangeVitals = vitals;
          _isRangeLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isRangeLoading = false;
          _rangeHasError = true;
        });
      }
    }
  }

  /// Downsample a list of vitals to one representative log per calendar day.
  /// For blood_sugar: averages the [value] field.
  /// For blood_pressure: averages systolic and diastolic separately.
  List<VitalLog> _aggregateToDailyAverages(List<VitalLog> logs) {
    final Map<String, List<VitalLog>> byDay = {};
    for (final log in logs) {
      final key =
          '${log.timestamp.year}-${log.timestamp.month.toString().padLeft(2, '0')}-${log.timestamp.day.toString().padLeft(2, '0')}';
      byDay.putIfAbsent(key, () => []).add(log);
    }
    final result = <VitalLog>[];
    for (final entry in byDay.entries.toList()..sort((a, b) => a.key.compareTo(b.key))) {
      final dayLogs = entry.value;
      final first = dayLogs.first;
      if (first.type == 'blood_sugar') {
        final avg = dayLogs.map((l) => l.value ?? 0.0).reduce((a, b) => a + b) / dayLogs.length;
        result.add(VitalLog(
          id: first.id,
          userId: first.userId,
          type: first.type,
          value: avg,
          timestamp: DateTime(first.timestamp.year, first.timestamp.month, first.timestamp.day, 12),
        ));
      } else {
        final avgSys =
            dayLogs.map((l) => l.systolic ?? 0).reduce((a, b) => a + b) ~/ dayLogs.length;
        final avgDia =
            dayLogs.map((l) => l.diastolic ?? 0).reduce((a, b) => a + b) ~/ dayLogs.length;
        result.add(VitalLog(
          id: first.id,
          userId: first.userId,
          type: first.type,
          systolic: avgSys,
          diastolic: avgDia,
          timestamp: DateTime(first.timestamp.year, first.timestamp.month, first.timestamp.day, 12),
        ));
      }
    }
    return result;
  }

  // ──── HEALTH REPORTS ───────────────────────────

  Future<void> _captureReport() async {
    final picker = ImagePicker();
    final source = await showModalBottomSheet<String>(
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
            const SizedBox(height: 6),
            Text('You can add multiple pages to a single report',
                style: GoogleFonts.poppins(fontSize: 13, color: Colors.grey.shade500)),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _sourceButton(
                    icon: Icons.camera_alt_rounded,
                    label: 'Camera',
                    subtitle: 'Take photo',
                    onTap: () => Navigator.pop(ctx, 'camera'),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: _sourceButton(
                    icon: Icons.photo_library_rounded,
                    label: 'Gallery',
                    subtitle: 'Select multiple',
                    onTap: () => Navigator.pop(ctx, 'gallery'),
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

    List<XFile> images = [];

    if (source == 'camera') {
      // Camera: take one photo, but offer to add more
      final image = await picker.pickImage(source: ImageSource.camera, imageQuality: 80);
      if (image == null) return;
      images.add(image);

      // Ask if user wants to add more pages
      if (mounted) {
        bool addMore = true;
        while (addMore && mounted) {
          addMore = await _askAddMorePage(images.length);
          if (addMore) {
            final nextImage = await picker.pickImage(
              source: ImageSource.camera, imageQuality: 80,
            );
            if (nextImage != null) {
              images.add(nextImage);
            } else {
              addMore = false;
            }
          }
        }
      }
    } else {
      // Gallery: pick multiple images at once
      final picked = await picker.pickMultiImage(imageQuality: 80);
      if (picked.isEmpty) return;
      images = picked;
    }

    if (images.isEmpty || !mounted) return;

    // Ask for report name
    final nameC = TextEditingController();
    final reportName = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Name this report',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${images.length} page${images.length > 1 ? "s" : ""} selected',
              style: GoogleFonts.poppins(fontSize: 13, color: Colors.grey.shade500),
            ),
            const SizedBox(height: 12),
            TextField(
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
          ],
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
      final files = images.map((x) => File(x.path)).toList();
      final imageUrls = await _supabase.uploadReportImages(files);
      
      String? summary;
      try {
        final bytes = await files.first.readAsBytes();
        final base64Image = base64Encode(bytes);
        summary = await AIService.instance.generateReportSummary(base64Image);
      } catch (e) {
        debugPrint('Failed to generate summary: $e');
      }

      await _supabase.addHealthReportMulti(reportName, imageUrls, aiSummary: summary);
      await _loadData();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Report "$reportName" saved with ${imageUrls.length} page${imageUrls.length > 1 ? "s" : ""} ✅'),
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

  Future<bool> _askAddMorePage(int currentCount) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Add more pages?',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
        content: Text('$currentCount page${currentCount > 1 ? "s" : ""} captured. Add another page to this report?',
            style: GoogleFonts.poppins(fontSize: 14)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text("No, that's all", style: GoogleFonts.poppins()),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2E7D32),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('📸 Add page', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  void _viewReport(HealthReport report) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ReportViewerScreen(report: report),
      ),
    );
  }

  Widget _sourceButton({
    required IconData icon,
    required String label,
    String? subtitle,
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
            if (subtitle != null) ...[
              const SizedBox(height: 2),
              Text(subtitle,
                  style: GoogleFonts.poppins(
                      fontSize: 11, color: const Color(0xFF2E7D32).withAlpha(150))),
            ],
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
      // Refresh range views
      await _loadVitalsForRange();
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
      // Refresh range views
      await _loadVitalsForRange();
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
    return GestureDetector(
      onTap: () => _viewReport(report),
      child: Container(
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
            // Thumbnail with page count badge
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.horizontal(left: Radius.circular(18)),
                  child: Image.network(
                    report.thumbnailUrl,
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
                if (report.pageCount > 1)
                  Positioned(
                    top: 4,
                    right: 4,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1A237E),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${report.pageCount} pg',
                        style: GoogleFonts.poppins(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: Colors.white),
                      ),
                    ),
                  ),
              ],
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
                    if (report.pageCount > 1)
                      Text(
                        '${report.pageCount} pages',
                        style: GoogleFonts.poppins(
                            fontSize: 11,
                            color: const Color(0xFF1A237E),
                            fontWeight: FontWeight.w600),
                      ),
                  ],
                ),
              ),
            ),
            // View button
            Container(
              margin: const EdgeInsets.only(right: 8),
              child: Icon(Icons.visibility_rounded,
                  size: 22, color: const Color(0xFF2E7D32)),
            ),
            // Delete button
            IconButton(
              onPressed: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16)),
                    title: Text('Delete report?',
                        style: GoogleFonts.poppins(fontWeight: FontWeight.w700)),
                    content: Text('Are you sure you want to delete "${report.name}"?',
                        style: GoogleFonts.poppins()),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(ctx, false),
                        child: Text('Cancel', style: GoogleFonts.poppins()),
                      ),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(ctx, true),
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red, foregroundColor: Colors.white),
                        child: Text('Delete', style: GoogleFonts.poppins()),
                      ),
                    ],
                  ),
                );
                if (confirm == true) {
                  await _supabase.deleteHealthReport(report.id);
                  await _loadData();
                }
              },
              icon: Icon(Icons.delete_outline, color: Colors.grey.shade400, size: 22),
            ),
          ],
        ),
      ),
    );
  }

  // ──── VITALS TAB ───────────────────────────────

  Widget _vitalsTab() {
    // In range mode, use _rangeVitals; always separate by type
    final rangeBs = _rangeVitals.where((v) => v.type == 'blood_sugar').toList();
    final rangeBp = _rangeVitals.where((v) => v.type == 'blood_pressure').toList();

    // For graph view: downsample only for month/3month ranges (not today or week)
    final shouldAggregate = _timeRange == VitalTimeRange.month ||
        _timeRange == VitalTimeRange.threeMonths;
    final graphBs = shouldAggregate ? _aggregateToDailyAverages(rangeBs) : rangeBs;
    final graphBp = shouldAggregate ? _aggregateToDailyAverages(rangeBp) : rangeBp;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 80),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Quick-add buttons ──
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
          const SizedBox(height: 20),

          // ── Time Range Filter Dropdown (global) ──
          _buildTimeRangeFilter(),
          const SizedBox(height: 16),

          // ── Segmented Control ──
          _buildSegmentedControl(),
          const SizedBox(height: 16),

          // ── Range header (replaces date navigator) ──
          _buildRangeHeader(),
          const SizedBox(height: 20),

          // ── Conditional Body ──
          if (_viewMode == VitalViewMode.log)
            _buildRangeLogView(rangeBs, rangeBp)
          else
            _buildRangeGraphView(graphBs, graphBp),
        ],
      ),
    );
  }

  bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;

  // ── Segmented Control ────────────────────────────

  Widget _buildSegmentedControl() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          _segmentPill(
            icon: Icons.list_alt_rounded,
            label: 'Records',
            active: _viewMode == VitalViewMode.log,
            onTap: () => setState(() => _viewMode = VitalViewMode.log),
          ),
          _segmentPill(
            icon: Icons.show_chart_rounded,
            label: 'Trends',
            active: _viewMode == VitalViewMode.graph,
            onTap: () => setState(() => _viewMode = VitalViewMode.graph),
          ),
        ],
      ),
    );
  }

  Widget _segmentPill({
    required IconData icon,
    required String label,
    required bool active,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            gradient: active
                ? const LinearGradient(
                    colors: [Color(0xFF2E7D32), Color(0xFF43A047)],
                  )
                : null,
            borderRadius: BorderRadius.circular(12),
            boxShadow: active
                ? [
                    BoxShadow(
                      color: const Color(0xFF2E7D32).withAlpha(50),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 18,
                color: active ? Colors.white : Colors.grey.shade500,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: GoogleFonts.poppins(
                  fontSize: 14,
                  fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                  color: active ? Colors.white : Colors.grey.shade500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Time Range Filter Dropdown ───────────────────

  static const _rangeLabels = {
    VitalTimeRange.today: 'Today',
    VitalTimeRange.week: 'Past 7 Days',
    VitalTimeRange.month: 'Past 1 Month',
    VitalTimeRange.threeMonths: 'Past 3 Months',
  };

  Widget _buildTimeRangeFilter() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(Icons.date_range_rounded,
              size: 20, color: const Color(0xFF2E7D32)),
          const SizedBox(width: 10),
          Text(
            'Time Range',
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF1A237E),
            ),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF2E7D32).withAlpha(12),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF2E7D32).withAlpha(40)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<VitalTimeRange>(
                value: _timeRange,
                isDense: true,
                icon: const Icon(Icons.keyboard_arrow_down_rounded,
                    color: Color(0xFF2E7D32), size: 20),
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF2E7D32),
                ),
                onChanged: (val) {
                  if (val == null || val == _timeRange) return;
                  setState(() => _timeRange = val);
                  _loadVitalsForRange();
                },
                items: VitalTimeRange.values
                    .map((r) => DropdownMenuItem(
                          value: r,
                          child: Text(_rangeLabels[r]!),
                        ))
                    .toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Range Summary Header ─────────────────────────

  Widget _buildRangeHeader() {
    final (from, to) = _rangeWindow();
    // "to" is actually the first instant of tomorrow; show yesterday's date
    final displayTo = to.subtract(const Duration(days: 1));
    final fromLabel = DateFormat('MMM d').format(from);
    final toLabel = DateFormat('MMM d, yyyy').format(displayTo);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF2E7D32).withAlpha(10),
            const Color(0xFF1565C0).withAlpha(8),
          ],
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF2E7D32).withAlpha(25)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: const Color(0xFF2E7D32).withAlpha(18),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.timeline_rounded,
                size: 16, color: Color(0xFF2E7D32)),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _rangeLabels[_timeRange]!,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF1A237E),
                ),
              ),
              Text(
                '$fromLabel – $toLabel',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  color: Colors.grey.shade500,
                ),
              ),
            ],
          ),
          const Spacer(),
          if (_isRangeLoading)
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Color(0xFF2E7D32),
              ),
            )
          else
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFF2E7D32).withAlpha(15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '${_rangeVitals.length} readings',
                style: GoogleFonts.poppins(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF2E7D32),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ── Skeleton Shimmer ─────────────────────────────

  Widget _buildChartSkeleton() {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.4, end: 1.0),
      duration: const Duration(milliseconds: 900),
      curve: Curves.easeInOut,
      builder: (_, opacity, _) => Opacity(
        opacity: opacity,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title placeholder
            Container(
              width: 120,
              height: 14,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(6),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              width: 80,
              height: 10,
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 16),
            // Chart area placeholder
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Container(
                height: 160,
                color: Colors.grey.shade100,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: List.generate(
                    10,
                    (i) => Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 3),
                        child: FractionallySizedBox(
                          heightFactor: 0.3 + ((i * 0.07) % 0.6),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.grey.shade200,
                              borderRadius: const BorderRadius.vertical(
                                  top: Radius.circular(4)),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Range-Aware Graph View (with skeleton + error boundary) ──

  Widget _buildRangeGraphView(List<VitalLog> bs, List<VitalLog> bp) {
    final isAggregated = _timeRange == VitalTimeRange.month ||
        _timeRange == VitalTimeRange.threeMonths;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Blood Sugar Chart Card
        _buildRangeChartCard(
          title: '🩸 Blood Sugar',
          subtitle: 'mg/dL — Normal: 70–140${isAggregated ? ' · Daily averages' : ''}',
          color: const Color(0xFFE53935),
          isLoading: _isRangeLoading,
          hasError: _rangeHasError,
          isEmpty: bs.isEmpty,
          onRetry: _loadVitalsForRange,
          child: _buildBloodSugarChart(bs),
        ),
        const SizedBox(height: 20),
        // Blood Pressure Chart Card
        _buildRangeChartCard(
          title: '💗 Blood Pressure',
          subtitle: 'mmHg — Normal: 90–130 systolic${isAggregated ? ' · Daily averages' : ''}',
          color: const Color(0xFF1565C0),
          isLoading: _isRangeLoading,
          hasError: _rangeHasError,
          isEmpty: bp.isEmpty,
          onRetry: _loadVitalsForRange,
          child: _buildBloodPressureChart(bp),
        ),
      ],
    );
  }

  Widget _buildRangeChartCard({
    required String title,
    required String subtitle,
    required Color color,
    required bool isLoading,
    required bool hasError,
    required bool isEmpty,
    required VoidCallback onRetry,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(7),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isLoading) ...[
            Text(title,
                style: GoogleFonts.poppins(
                    fontSize: 16, fontWeight: FontWeight.w700, color: color)),
            Text(subtitle,
                style: GoogleFonts.poppins(
                    fontSize: 11, color: Colors.grey.shade500)),
            const SizedBox(height: 16),
          ],
          // Loading skeleton
          if (isLoading)
            _buildChartSkeleton()
          // Error boundary — chart failure doesn't crash the tab
          else if (hasError)
            _buildChartErrorState(onRetry)
          // Empty state specific to this range
          else if (isEmpty)
            _buildRangeEmptyState()
          // The actual chart
          else
            child,
        ],
      ),
    );
  }

  Widget _buildChartErrorState(VoidCallback onRetry) {
    return SizedBox(
      height: 160,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.warning_amber_rounded, size: 36, color: Colors.orange.shade400),
            const SizedBox(height: 8),
            Text(
              'Unable to load chart data',
              style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey.shade700),
            ),
            Text(
              'One or more readings may be malformed.',
              style: GoogleFonts.poppins(
                  fontSize: 11, color: Colors.grey.shade400),
            ),
            const SizedBox(height: 10),
            TextButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: Text('Retry', style: GoogleFonts.poppins(fontSize: 13)),
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xFF2E7D32),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRangeEmptyState() {
    final label = _rangeLabels[_timeRange]!.toLowerCase();
    return SizedBox(
      height: 160,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.show_chart_rounded, size: 42, color: Colors.grey.shade200),
            const SizedBox(height: 10),
            Text(
              'No data recorded',
              style: GoogleFonts.poppins(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey.shade500),
            ),
            Text(
              'in the $label',
              style: GoogleFonts.poppins(
                  fontSize: 12, color: Colors.grey.shade400),
            ),
          ],
        ),
      ),
    );
  }

  // ── Range-Aware Log View (separated BS and BP sections) ──

  Widget _buildRangeLogView(List<VitalLog> bs, List<VitalLog> bp) {
    if (_isRangeLoading) {
      return _buildLogSkeleton();
    }
    if (bs.isEmpty && bp.isEmpty) {
      return _buildRangeVitalsEmptyState();
    }

    final isToday = _timeRange == VitalTimeRange.today;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Blood Sugar Section ──
        _buildTypeHeader('🩸 Blood Sugar', const Color(0xFFE53935), bs.length),
        const SizedBox(height: 10),
        if (bs.isEmpty)
          _buildTypeEmptyState('blood sugar', const Color(0xFFE53935))
        else if (isToday)
          // Today: flat list sorted newest first (with time shown on card)
          Column(
            children: (List<VitalLog>.from(bs)..sort((a, b) => b.timestamp.compareTo(a.timestamp)))
                .map((v) => _vitalCard(v, const Color(0xFFE53935), Colors.red.shade50))
                .toList(),
          )
        else
          // Ranges: grouped by date within BS section
          _buildTypeDateGroups(bs, const Color(0xFFE53935), Colors.red.shade50),

        const SizedBox(height: 28),

        // ── Blood Pressure Section ──
        _buildTypeHeader('💗 Blood Pressure', const Color(0xFF1565C0), bp.length),
        const SizedBox(height: 10),
        if (bp.isEmpty)
          _buildTypeEmptyState('blood pressure', const Color(0xFF1565C0))
        else if (isToday)
          Column(
            children: (List<VitalLog>.from(bp)..sort((a, b) => b.timestamp.compareTo(a.timestamp)))
                .map((v) => _vitalCard(v, const Color(0xFF1565C0), Colors.blue.shade50))
                .toList(),
          )
        else
          _buildTypeDateGroups(bp, const Color(0xFF1565C0), Colors.blue.shade50),
      ],
    );
  }

  /// Section header with pill showing reading count
  Widget _buildTypeHeader(String title, Color color, int count) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 20,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 10),
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: color.withAlpha(15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            '$count',
            style: GoogleFonts.poppins(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ),
      ],
    );
  }

  /// Empty placeholder for a specific vital type
  Widget _buildTypeEmptyState(String typeName, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: color.withAlpha(6),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withAlpha(20)),
      ),
      child: Text(
        'No $typeName readings in this period',
        style: GoogleFonts.poppins(fontSize: 13, color: color.withAlpha(140)),
      ),
    );
  }

  /// Date-grouped list for a single vital type (used in week/month/3month modes)
  Widget _buildTypeDateGroups(List<VitalLog> vitals, Color color, Color bgColor) {
    final sorted = List<VitalLog>.from(vitals)
      ..sort((a, b) => b.timestamp.compareTo(a.timestamp));

    final Map<String, List<VitalLog>> grouped = {};
    for (final log in sorted) {
      final key = DateFormat('yyyy-MM-dd').format(log.timestamp);
      grouped.putIfAbsent(key, () => []).add(log);
    }
    final sortedKeys = grouped.keys.toList()..sort((a, b) => b.compareTo(a));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final dateKey in sortedKeys) ...[
          _buildDateGroupHeader(dateKey),
          const SizedBox(height: 6),
          for (final vital in grouped[dateKey]!)
            _vitalCard(vital, color, bgColor),
          const SizedBox(height: 10),
        ],
      ],
    );
  }

  Widget _buildDateGroupHeader(String dateKey) {
    final date = DateTime.parse(dateKey);
    final now = DateTime.now();
    final isToday = _isSameDay(date, now);
    final isYesterday = _isSameDay(date, now.subtract(const Duration(days: 1)));

    String label;
    if (isToday) {
      label = 'Today · ${DateFormat('MMM d').format(date)}';
    } else if (isYesterday) {
      label = 'Yesterday · ${DateFormat('MMM d').format(date)}';
    } else {
      label = DateFormat('EEEE · MMM d').format(date);
    }

    return Row(
      children: [
        Container(
          width: 4,
          height: 16,
          decoration: BoxDecoration(
            color: const Color(0xFF2E7D32),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF1A237E),
          ),
        ),
      ],
    );
  }

  Widget _buildLogSkeleton() {
    return Column(
      children: List.generate(
        4,
        (_) => Container(
          margin: const EdgeInsets.only(bottom: 10),
          height: 68,
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(16),
          ),
          child: TweenAnimationBuilder<double>(
            tween: Tween(begin: 0.5, end: 1.0),
            duration: const Duration(milliseconds: 800),
            curve: Curves.easeInOut,
            builder: (_, opacity, child) => Opacity(opacity: opacity, child: child),
            child: Row(
              children: [
                const SizedBox(width: 12),
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                        width: 100, height: 12,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(4),
                        )),
                    const SizedBox(height: 6),
                    Container(
                        width: 60, height: 10,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(4),
                        )),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRangeVitalsEmptyState() {
    final label = _rangeLabels[_timeRange]!.toLowerCase();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48),
      child: Column(
        children: [
          Container(
            width: 90,
            height: 90,
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.monitor_heart_outlined,
                size: 48, color: Colors.grey.shade300),
          ),
          const SizedBox(height: 16),
          Text(
            'No vitals recorded',
            style: GoogleFonts.poppins(
                fontSize: 17,
                fontWeight: FontWeight.w600,
                color: Colors.grey.shade500),
          ),
          const SizedBox(height: 4),
          Text(
            'No readings found in the $label.\nTap a button above to log your first reading.',
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
                fontSize: 13, color: Colors.grey.shade400),
          ),
        ],
      ),
    );
  }


  // ── Blood Sugar Line Chart ───────────────────────

  Widget _buildBloodSugarChart(List<VitalLog> bs) {
    final spots = bs.asMap().entries.map((e) {
      return FlSpot(e.key.toDouble(), e.value.value ?? 0);
    }).toList();

    double minY = 50, maxY = 220;
    if (bs.isNotEmpty) {
      final values = bs.map((v) => v.value ?? 0).toList();
      final dataMin = values.reduce((a, b) => a < b ? a : b);
      final dataMax = values.reduce((a, b) => a > b ? a : b);
      minY = (dataMin - 20).clamp(0, 50);
      maxY = (dataMax + 30).clamp(150, 280);
    }

    return Column(
      children: [
        AspectRatio(
          aspectRatio: 1.7,
          child: LineChart(
            LineChartData(
              minY: minY,
              maxY: maxY,
              clipData: const FlClipData.all(),
              gridData: FlGridData(
                show: true,
                drawVerticalLine: false,
                horizontalInterval: 30,
                getDrawingHorizontalLine: (_) => FlLine(
                  color: Colors.grey.shade100,
                  strokeWidth: 1,
                ),
              ),
              borderData: FlBorderData(show: false),
              titlesData: FlTitlesData(
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 40,
                    interval: 30,
                    getTitlesWidget: (v, _) => Text(
                      v.toInt().toString(),
                      style: GoogleFonts.poppins(
                          fontSize: 10, color: Colors.grey.shade400),
                    ),
                  ),
                ),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 28,
                    getTitlesWidget: (v, _) {
                      final idx = v.toInt();
                      if (idx < 0 || idx >= bs.length) return const SizedBox.shrink();
                      final ts = bs[idx].timestamp;
                      // Skip interval & format depend on range
                      final int skipInterval;
                      final DateFormat fmt;
                      switch (_timeRange) {
                        case VitalTimeRange.today:
                          skipInterval = 2;
                          fmt = DateFormat('h:mm a');
                        case VitalTimeRange.week:
                          skipInterval = 1;
                          fmt = DateFormat('MMM d');
                        case VitalTimeRange.month:
                          skipInterval = 4;
                          fmt = DateFormat('MMM d');
                        case VitalTimeRange.threeMonths:
                          skipInterval = 7;
                          fmt = DateFormat('MMM');
                      }
                      if (idx % skipInterval != 0 && idx != bs.length - 1) {
                        return const SizedBox.shrink();
                      }
                      return Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          fmt.format(ts),
                          style: GoogleFonts.poppins(
                              fontSize: 9, color: Colors.grey.shade400),
                        ),
                      );
                    },
                  ),
                ),
                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              ),
              // Target-range overlay as extra lines
              extraLinesData: ExtraLinesData(
                horizontalLines: [
                  HorizontalLine(
                    y: 70,
                    color: Colors.orange.withAlpha(120),
                    strokeWidth: 1.5,
                    dashArray: [6, 4],
                    label: HorizontalLineLabel(
                      show: true,
                      alignment: Alignment.topRight,
                      padding: const EdgeInsets.only(right: 6, bottom: 2),
                      style: GoogleFonts.poppins(
                          fontSize: 9,
                          color: Colors.orange,
                          fontWeight: FontWeight.w600),
                      labelResolver: (_) => 'Low 70',
                    ),
                  ),
                  HorizontalLine(
                    y: 140,
                    color: Colors.red.withAlpha(120),
                    strokeWidth: 1.5,
                    dashArray: [6, 4],
                    label: HorizontalLineLabel(
                      show: true,
                      alignment: Alignment.topRight,
                      padding: const EdgeInsets.only(right: 6, bottom: 2),
                      style: GoogleFonts.poppins(
                          fontSize: 9,
                          color: Colors.red,
                          fontWeight: FontWeight.w600),
                      labelResolver: (_) => 'High 140',
                    ),
                  ),
                ],
              ),
              lineTouchData: LineTouchData(
                touchTooltipData: LineTouchTooltipData(
                  getTooltipColor: (_) => const Color(0xFF1A237E),
                  getTooltipItems: (spots) => spots.map((s) {
                    final idx = s.x.toInt();
                    final entry = idx < bs.length ? bs[idx] : null;
                    final time = entry != null
                        ? DateFormat('h:mm a').format(entry.timestamp)
                        : '';
                    return LineTooltipItem(
                      '${s.y.toStringAsFixed(0)} mg/dL\n$time',
                      GoogleFonts.poppins(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600),
                    );
                  }).toList(),
                ),
                touchCallback: (event, response) {
                  setState(() {
                    _touchedBsIndex =
                        response?.lineBarSpots?.first.x.toInt();
                  });
                },
              ),
              lineBarsData: [
                LineChartBarData(
                  spots: spots,
                  isCurved: true,
                  curveSmoothness: 0.35,
                  color: const Color(0xFFE53935),
                  barWidth: 2.5,
                  isStrokeCapRound: true,
                  dotData: FlDotData(
                    show: true,
                    getDotPainter: (spot, p, bd, index) {
                      final isTouched = index == _touchedBsIndex;
                      return FlDotCirclePainter(
                        radius: isTouched ? 6 : 4,
                        color: const Color(0xFFE53935),
                        strokeWidth: 2,
                        strokeColor: Colors.white,
                      );
                    },
                  ),
                  belowBarData: BarAreaData(
                    show: true,
                    color: const Color(0xFFE53935).withAlpha(20),
                  ),
                ),
              ],
            ),
          ),
        ),
        // Legend
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _legendDot(const Color(0xFFE53935)),
            const SizedBox(width: 6),
            Text('Blood Sugar',
                style: GoogleFonts.poppins(
                    fontSize: 11, color: Colors.grey.shade600)),
            const SizedBox(width: 16),
            _legendDash(Colors.orange),
            const SizedBox(width: 6),
            Text('Low (70)',
                style: GoogleFonts.poppins(
                    fontSize: 11, color: Colors.grey.shade600)),
            const SizedBox(width: 16),
            _legendDash(Colors.red),
            const SizedBox(width: 6),
            Text('High (140)',
                style: GoogleFonts.poppins(
                    fontSize: 11, color: Colors.grey.shade600)),
          ],
        ),
      ],
    );
  }

  // ── Blood Pressure Dual-Line Chart ───────────────

  Widget _buildBloodPressureChart(List<VitalLog> bp) {
    final sysSpots = bp.asMap().entries.map((e) {
      return FlSpot(e.key.toDouble(), (e.value.systolic ?? 0).toDouble());
    }).toList();
    final diaSpots = bp.asMap().entries.map((e) {
      return FlSpot(e.key.toDouble(), (e.value.diastolic ?? 0).toDouble());
    }).toList();

    double minY = 40, maxY = 200;
    if (bp.isNotEmpty) {
      final allVals = bp.expand((v) => [
            (v.systolic ?? 0).toDouble(),
            (v.diastolic ?? 0).toDouble()
          ]).toList();
      final dataMin = allVals.reduce((a, b) => a < b ? a : b);
      final dataMax = allVals.reduce((a, b) => a > b ? a : b);
      minY = (dataMin - 15).clamp(0, 50);
      maxY = (dataMax + 20).clamp(100, 220);
    }

    return Column(
      children: [
        AspectRatio(
          aspectRatio: 1.7,
          child: LineChart(
            LineChartData(
              minY: minY,
              maxY: maxY,
              clipData: const FlClipData.all(),
              gridData: FlGridData(
                show: true,
                drawVerticalLine: false,
                horizontalInterval: 20,
                getDrawingHorizontalLine: (_) => FlLine(
                  color: Colors.grey.shade100,
                  strokeWidth: 1,
                ),
              ),
              borderData: FlBorderData(show: false),
              titlesData: FlTitlesData(
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 40,
                    interval: 20,
                    getTitlesWidget: (v, _) => Text(
                      v.toInt().toString(),
                      style: GoogleFonts.poppins(
                          fontSize: 10, color: Colors.grey.shade400),
                    ),
                  ),
                ),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 28,
                    getTitlesWidget: (v, _) {
                      final idx = v.toInt();
                      if (idx < 0 || idx >= bp.length) return const SizedBox.shrink();
                      final ts = bp[idx].timestamp;
                      final int skipInterval;
                      final DateFormat fmt;
                      switch (_timeRange) {
                        case VitalTimeRange.today:
                          skipInterval = 2;
                          fmt = DateFormat('h:mm a');
                        case VitalTimeRange.week:
                          skipInterval = 1;
                          fmt = DateFormat('MMM d');
                        case VitalTimeRange.month:
                          skipInterval = 4;
                          fmt = DateFormat('MMM d');
                        case VitalTimeRange.threeMonths:
                          skipInterval = 7;
                          fmt = DateFormat('MMM');
                      }
                      if (idx % skipInterval != 0 && idx != bp.length - 1) {
                        return const SizedBox.shrink();
                      }
                      return Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          fmt.format(ts),
                          style: GoogleFonts.poppins(
                              fontSize: 9, color: Colors.grey.shade400),
                        ),
                      );
                    },
                  ),
                ),
                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              ),
              extraLinesData: ExtraLinesData(
                horizontalLines: [
                  HorizontalLine(
                    y: 90,
                    color: Colors.orange.withAlpha(120),
                    strokeWidth: 1.5,
                    dashArray: [6, 4],
                    label: HorizontalLineLabel(
                      show: true,
                      alignment: Alignment.topRight,
                      padding: const EdgeInsets.only(right: 6, bottom: 2),
                      style: GoogleFonts.poppins(
                          fontSize: 9,
                          color: Colors.orange,
                          fontWeight: FontWeight.w600),
                      labelResolver: (_) => 'Low 90',
                    ),
                  ),
                  HorizontalLine(
                    y: 130,
                    color: Colors.red.withAlpha(120),
                    strokeWidth: 1.5,
                    dashArray: [6, 4],
                    label: HorizontalLineLabel(
                      show: true,
                      alignment: Alignment.topRight,
                      padding: const EdgeInsets.only(right: 6, bottom: 2),
                      style: GoogleFonts.poppins(
                          fontSize: 9,
                          color: Colors.red,
                          fontWeight: FontWeight.w600),
                      labelResolver: (_) => 'High 130',
                    ),
                  ),
                ],
              ),
              lineTouchData: LineTouchData(
                touchTooltipData: LineTouchTooltipData(
                  getTooltipColor: (_) => const Color(0xFF1A237E),
                  getTooltipItems: (touchedSpots) {
                    if (touchedSpots.isEmpty) return [];
                    final idx = touchedSpots.first.x.toInt();
                    final entry = idx < bp.length ? bp[idx] : null;
                    final time = entry != null
                        ? DateFormat('h:mm a').format(entry.timestamp)
                        : '';
                    final items = <LineTooltipItem?>[];
                    for (int i = 0; i < touchedSpots.length; i++) {
                      final s = touchedSpots[i];
                      final isFirst = i == 0;
                      items.add(LineTooltipItem(
                        isFirst
                            ? '${entry?.systolic ?? s.y.toInt()}/${entry?.diastolic ?? 0} mmHg\n$time'
                            : '',
                        GoogleFonts.poppins(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600),
                      ));
                    }
                    return items;
                  },
                ),
                touchCallback: (event, response) {
                  setState(() {
                    _touchedBpIndex =
                        response?.lineBarSpots?.first.x.toInt();
                  });
                },
              ),
              lineBarsData: [
                // Systolic
                LineChartBarData(
                  spots: sysSpots,
                  isCurved: true,
                  curveSmoothness: 0.35,
                  color: const Color(0xFFE53935),
                  barWidth: 2.5,
                  isStrokeCapRound: true,
                  dotData: FlDotData(
                    show: true,
                    getDotPainter: (spot, p, bd, index) {
                      final isTouched = index == _touchedBpIndex;
                      return FlDotCirclePainter(
                        radius: isTouched ? 6 : 4,
                        color: const Color(0xFFE53935),
                        strokeWidth: 2,
                        strokeColor: Colors.white,
                      );
                    },
                  ),
                  belowBarData: BarAreaData(
                    show: true,
                    color: const Color(0xFFE53935).withAlpha(12),
                  ),
                ),
                // Diastolic
                LineChartBarData(
                  spots: diaSpots,
                  isCurved: true,
                  curveSmoothness: 0.35,
                  color: const Color(0xFF1565C0),
                  barWidth: 2.5,
                  isStrokeCapRound: true,
                  dotData: FlDotData(
                    show: true,
                    getDotPainter: (spot, p, bd, index) {
                      final isTouched = index == _touchedBpIndex;
                      return FlDotCirclePainter(
                        radius: isTouched ? 6 : 4,
                        color: const Color(0xFF1565C0),
                        strokeWidth: 2,
                        strokeColor: Colors.white,
                      );
                    },
                  ),
                  belowBarData: BarAreaData(
                    show: true,
                    color: const Color(0xFF1565C0).withAlpha(12),
                  ),
                ),
              ],
            ),
          ),
        ),
        // Legend
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _legendDot(const Color(0xFFE53935)),
            const SizedBox(width: 6),
            Text('Systolic',
                style: GoogleFonts.poppins(
                    fontSize: 11, color: Colors.grey.shade600)),
            const SizedBox(width: 20),
            _legendDot(const Color(0xFF1565C0)),
            const SizedBox(width: 6),
            Text('Diastolic',
                style: GoogleFonts.poppins(
                    fontSize: 11, color: Colors.grey.shade600)),
          ],
        ),
      ],
    );
  }

  // ── Shared helper widgets ────────────────────────

  Widget _legendDot(Color color) => Container(
        width: 10,
        height: 10,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      );

  Widget _legendDash(Color color) => Container(
        width: 16,
        height: 2,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(1),
        ),
      );

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
                  DateFormat('h:mm a').format(vital.timestamp),
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

// ──── FULL-SCREEN REPORT VIEWER ──────────────────

class ReportViewerScreen extends StatefulWidget {
  final HealthReport report;
  const ReportViewerScreen({super.key, required this.report});

  @override
  State<ReportViewerScreen> createState() => _ReportViewerScreenState();
}

class _ReportViewerScreenState extends State<ReportViewerScreen> {
  late PageController _pageController;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final report = widget.report;
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(report.name,
                style: GoogleFonts.poppins(
                    fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
            if (report.pageCount > 1)
              Text(
                'Page ${_currentPage + 1} of ${report.pageCount}',
                style: GoogleFonts.poppins(fontSize: 12, color: Colors.white70),
              ),
          ],
        ),
        actions: [
          if (report.pageCount > 1)
            Container(
              margin: const EdgeInsets.only(right: 16),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(20),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text(
                  '${_currentPage + 1} / ${report.pageCount}',
                  style: GoogleFonts.poppins(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Colors.white),
                ),
              ),
            ),
        ],
      ),
      body: report.imageUrls.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.broken_image_rounded, size: 60, color: Colors.grey.shade600),
                  const SizedBox(height: 12),
                  Text('No images available',
                      style: GoogleFonts.poppins(color: Colors.grey.shade500)),
                ],
              ),
            )
          : Stack(
              children: [
                // Page viewer
                PageView.builder(
                  controller: _pageController,
                  itemCount: report.imageUrls.length,
                  onPageChanged: (page) {
                    setState(() => _currentPage = page);
                  },
                  itemBuilder: (context, index) {
                    return InteractiveViewer(
                      minScale: 0.5,
                      maxScale: 4.0,
                      child: Center(
                        child: Image.network(
                          report.imageUrls[index],
                          fit: BoxFit.contain,
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  CircularProgressIndicator(
                                    value: loadingProgress.expectedTotalBytes != null
                                        ? loadingProgress.cumulativeBytesLoaded /
                                            loadingProgress.expectedTotalBytes!
                                        : null,
                                    color: Colors.white,
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    'Loading page ${index + 1}...',
                                    style: GoogleFonts.poppins(
                                        color: Colors.white70, fontSize: 13),
                                  ),
                                ],
                              ),
                            );
                          },
                          errorBuilder: (context, error, stackTrace) => Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.broken_image_rounded,
                                    size: 60, color: Colors.grey.shade600),
                                const SizedBox(height: 12),
                                Text('Failed to load image',
                                    style: GoogleFonts.poppins(color: Colors.grey.shade500)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),

                // Page indicator dots (for multi-page reports)
                if (report.pageCount > 1)
                  Positioned(
                    bottom: 24,
                    left: 0,
                    right: 0,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        report.pageCount,
                        (i) => Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: i == _currentPage ? 24 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: i == _currentPage
                                ? Colors.white
                                : Colors.white.withAlpha(80),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ),
                    ),
                  ),

                // Swipe hint for multi-page
                if (report.pageCount > 1 && _currentPage == 0)
                  Positioned(
                    bottom: (report.aiSummary != null && report.aiSummary!.isNotEmpty) ? 160 : 60,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(25),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '← Swipe to see more pages →',
                          style: GoogleFonts.poppins(
                              fontSize: 12, color: Colors.white70),
                        ),
                      ),
                    ),
                  ),

                // AI Summary Overlay
                if (report.aiSummary != null && report.aiSummary!.isNotEmpty)
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: const BoxDecoration(
                        color: Color(0xFF1E1E1E),
                        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.auto_awesome, color: Colors.yellow, size: 20),
                              const SizedBox(width: 8),
                              Text('AI Summary', style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(report.aiSummary!, style: GoogleFonts.poppins(color: Colors.white70, fontSize: 14)),
                          const SizedBox(height: 16), // Padding for swipe indicator 
                        ],
                      ),
                    ),
                  ),
              ],
            ),
    );
  }
}
