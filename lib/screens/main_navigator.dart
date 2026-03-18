import 'package:flutter/material.dart';
import 'senior_home_screen.dart';
import 'caregiver_dashboard_screen.dart';

class MainNavigator extends StatefulWidget {
  final String role;
  const MainNavigator({super.key, required this.role});

  @override
  State<MainNavigator> createState() => _MainNavigatorState();
}

class _MainNavigatorState extends State<MainNavigator> {
  @override
  Widget build(BuildContext context) {
    if (widget.role == 'senior') {
      return const SeniorHomeScreen();
    } else {
      return const CaregiverDashboardScreen();
    }
  }
}

