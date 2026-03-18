import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F7F8),
      appBar: AppBar(
        title: const Text('Dashboard', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Location Map
            const Text("Location", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Container(
              height: 200,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: const GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: LatLng(28.2483, 77.0699), // Sohna Haryana
                    zoom: 14,
                  ),
                  myLocationEnabled: true,
                  zoomControlsEnabled: false,
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Urgent Alerts
            const Text("Urgent Alerts", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.red)),
            const SizedBox(height: 10),
            Card(
              color: Colors.red.shade50,
              child: const ListTile(
                leading: Icon(Icons.warning, color: Colors.red, size: 40),
                title: Text("Low Battery Alert", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                subtitle: Text("Device battery at 15%. Please charge soon."),
              ),
            ),
            const SizedBox(height: 20),

            // Health Logs
            const Text("Today's Health Logs", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            _buildLogCard("Metformin 500mg", "10:00 AM", true),
            _buildLogCard("Multivitamin", "12:00 PM", true),
            _buildLogCard("BP Check", "8:00 PM", false),

            const SizedBox(height: 30),
            // Call/Message Sensors (Mock UI)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildActionSensor(Icons.call, "Call", Colors.green),
                _buildActionSensor(Icons.message, "Message", Colors.blue),
                _buildActionSensor(Icons.sos, "SOS", Colors.red),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildLogCard(String title, String time, bool completed) {
    return Card(
      child: ListTile(
        leading: Icon(
          completed ? Icons.check_circle : Icons.radio_button_unchecked,
          color: completed ? Colors.green : Colors.grey,
          size: 30,
        ),
        title: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        trailing: Text(time, style: const TextStyle(fontSize: 16)),
      ),
    );
  }

  Widget _buildActionSensor(IconData icon, String label, Color color) {
    return Column(
      children: [
        CircleAvatar(
          radius: 35,
          backgroundColor: color.withAlpha(51),
          child: Icon(icon, color: color, size: 35),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
