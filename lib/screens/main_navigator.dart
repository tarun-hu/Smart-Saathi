import 'package:flutter/material.dart';
import 'senior_home_screen.dart';
import 'caregiver_dashboard_screen.dart';
import 'profile_screen.dart';

class MainNavigator extends StatefulWidget {
  final String role;
  const MainNavigator({super.key, required this.role});

  @override
  State<MainNavigator> createState() => _MainNavigatorState();
}

class _MainNavigatorState extends State<MainNavigator> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final isSenior = widget.role == 'senior';

    final seniorScreens = [
      const SeniorHomeScreen(),
      const Scaffold(body: Center(child: Text("My Day"))),
      const Scaffold(body: Center(child: Text("Family"))),
    ];

    final caregiverScreens = [
      const CaregiverDashboardScreen(),
      const Scaffold(body: Center(child: Text("Health"))),
      const Scaffold(body: Center(child: Text("History"))),
      const ProfileScreen(),
    ];

    final screens = isSenior ? seniorScreens : caregiverScreens;

    return Scaffold(
      body: screens[_currentIndex],
      floatingActionButton: !isSenior ? FloatingActionButton(
        onPressed: () {},
        backgroundColor: const Color(0xFF1976D2),
        elevation: 4,
        child: const Icon(Icons.add, color: Colors.white, size: 35),
      ) : null,
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: isSenior ? _buildSeniorNav() : _buildCaregiverNav(),
    );
  }

  Widget _buildSeniorNav() {
    return BottomNavigationBar(
      currentIndex: _currentIndex,
      onTap: (i) => setState(() => _currentIndex = i),
      selectedItemColor: const Color(0xFF1976D2),
      unselectedItemColor: Colors.grey,
      showUnselectedLabels: true,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: 'HOME'),
        BottomNavigationBarItem(icon: Icon(Icons.calendar_month), label: 'MY DAY'),
        BottomNavigationBarItem(icon: Icon(Icons.people), label: 'FAMILY'),
      ],
    );
  }

  Widget _buildCaregiverNav() {
    return BottomAppBar(
      shape: const CircularNotchedRectangle(),
      notchMargin: 8.0,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _navItem(0, Icons.grid_view, 'Home'),
          _navItem(1, Icons.show_chart, 'Health'),
          const SizedBox(width: 40), // Space for FAB
          _navItem(2, Icons.map, 'History'),
          _navItem(3, Icons.settings, 'Profile'),
        ],
      ),
    );
  }

  Widget _navItem(int index, IconData icon, String label) {
    final isSelected = _currentIndex == index;
    final color = isSelected ? const Color(0xFF1976D2) : Colors.grey;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color),
          Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
        ],
      ),
    );
  }
}

