import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/supabase_service.dart';

class CaregiverDashboardScreen extends ConsumerWidget {
  const CaregiverDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final healthLogsAsync = ref.watch(healthLogsStreamProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF6F8FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Color(0xFF1976D2), size: 30),
          onPressed: () {},
        ),
        title: const Text('SmartSaathi Dashboard', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 18)),
        centerTitle: true,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              backgroundColor: Colors.grey.shade200,
              child: Stack(
                children: [
                  const Icon(Icons.notifications, color: Colors.black87),
                  Positioned(
                    right: 4,
                    top: 6,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1976D2),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                      elevation: 5,
                      shadowColor: Colors.blue.withAlpha(50),
                    ),
                    icon: const Icon(Icons.call),
                    label: const Text("Call Senior", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    onPressed: () {},
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF1976D2),
                      backgroundColor: Colors.white,
                      side: const BorderSide(color: Color(0xFF1976D2), width: 2),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                    ),
                    icon: const Icon(Icons.chat_bubble),
                    label: const Text("Message", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    onPressed: () {},
                  ),
                ),
              ],
            ),
            const SizedBox(height: 30),

            // Location
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Current Location", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F2633))),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: const Color(0xFFE8F5E9), borderRadius: BorderRadius.circular(20)),
                  child: const Text("Live Now", style: TextStyle(color: Color(0xFF2E7D32), fontWeight: FontWeight.bold, fontSize: 12)),
                )
              ],
            ),
            const SizedBox(height: 12),
            Container(
              height: 180,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                boxShadow: [BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 10, spreadRadius: 2)],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Stack(
                  children: [
                    const GoogleMap(
                      initialCameraPosition: CameraPosition(
                        target: LatLng(28.6139, 77.2090), // New Delhi
                        zoom: 13,
                      ),
                      zoomControlsEnabled: false,
                    ),
                    Center(child: Icon(Icons.location_on, size: 50, color: Color(0xFF1976D2))),
                    Positioned(
                      top: 15,
                      left: 0,
                      right: 0,
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withAlpha(20), blurRadius: 5)]),
                          child: const Text("Mr. Gupta is Home", style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 30),

            // Health Logs
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Realtime Health Logs", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F2633))),
                TextButton(onPressed: () {}, child: const Text("View History", style: TextStyle(color: Color(0xFF1976D2), fontWeight: FontWeight.bold))),
              ],
            ),
            const SizedBox(height: 4),
            
            healthLogsAsync.when(
              data: (logs) {
                if (logs.isEmpty) {
                  // Fallback to mockup data if DB is empty
                  return Column(
                    children: [
                      _buildLogCard("Metformin (500mg)", "Taken", "08:30 AM", Icons.medication, const Color(0xFF2E7D32), const Color(0xFFE8F5E9), true),
                      const SizedBox(height: 12),
                      _buildLogCard("Multivitamin", "Missed - Alert Sent", "12:00 PM", Icons.medical_services, const Color(0xFFD32F2F), const Color(0xFFFFEBEE), false),
                      const SizedBox(height: 12),
                      _buildLogCard("Blood Pressure", "Next Scheduled", "08:00 PM", Icons.alarm, const Color(0xFF1976D2), const Color(0xFFE3F2FD), false, isInfo: true),
                    ],
                  );
                }
                
                return Column(
                  children: logs.take(3).map((log) {
                    final isSOS = log.symptoms?.contains("SOS") ?? false;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: _buildLogCard(
                        isSOS ? "Emergency SOS" : "Health Update", 
                        log.symptoms ?? "Health metrics logged", 
                        "Just Now", 
                        isSOS ? Icons.emergency : Icons.medical_services, 
                        isSOS ? const Color(0xFFD32F2F) : const Color(0xFF1976D2), 
                        isSOS ? const Color(0xFFFFEBEE) : const Color(0xFFE3F2FD), 
                        !isSOS,
                        isInfo: !isSOS,
                      ),
                    );
                  }).toList(),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Text('Error loading logs: $err'),
            ),

            const SizedBox(height: 30),

            // Urgent Alerts
            const Text("Urgent Alerts", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F2633))),
            const SizedBox(height: 12),
            _buildAlertCard("SOS Button Pressed", "Triggered from Senior App • 2 mins ago", Icons.emergency, const Color(0xFFD32F2F), const Color(0xFFFFF0F0)),
            const SizedBox(height: 12),
            _buildAlertCard("Low Battery Alert", "Device at 15% • 15 mins ago", Icons.battery_alert, const Color(0xFFF57F17), const Color(0xFFFFFDE7)),
            
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildLogCard(String title, String status, String time, IconData icon, Color mainColor, Color bgColor, bool completed, {bool isInfo = false}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: completed ? Colors.green : (isInfo ? Colors.blue.shade200 : Colors.red.shade200), width: 2),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: bgColor,
            child: Icon(icon, color: mainColor, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 4),
                Text(status, style: TextStyle(color: mainColor, fontWeight: completed ? FontWeight.normal : FontWeight.bold, fontStyle: completed ? FontStyle.normal : FontStyle.italic, fontSize: 13)),
              ],
            ),
          ),
          Text(time, style: const TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildAlertCard(String title, String subtitle, IconData icon, Color mainColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        children: [
          Icon(icon, color: mainColor, size: 30),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: mainColor.withAlpha(200))),
                const SizedBox(height: 4),
                Text(subtitle, style: TextStyle(color: mainColor.withAlpha(180), fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
