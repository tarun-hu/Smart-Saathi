import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:go_router/go_router.dart';

class AppShell extends StatelessWidget {
  final Widget child;
  const AppShell({super.key, required this.child});

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/meds')) return 1;
    if (location.startsWith('/facilities')) return 2;
    if (location.startsWith('/wellbeing')) return 3;
    if (location.startsWith('/profile')) return 4;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final idx = _currentIndex(context);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(15),
              blurRadius: 20,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _navItem(context, 0, idx, Icons.home_rounded, 'Home', '/home'),
                _navItem(context, 1, idx, Icons.medication_rounded, 'Meds', '/meds'),
                _navItem(context, 2, idx, Icons.local_hospital_rounded, 'Nearby', '/facilities'),
                _navItem(context, 3, idx, Icons.health_and_safety_rounded, 'Health', '/wellbeing'),
                _navItem(context, 4, idx, Icons.person_rounded, 'Profile', '/profile'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(BuildContext context, int index, int currentIndex,
      IconData icon, String label, String route) {
    final isActive = index == currentIndex;
    return GestureDetector(
      onTap: () {
        if (!isActive) context.go(route);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: EdgeInsets.symmetric(
          horizontal: isActive ? 16 : 12,
          vertical: 10,
        ),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF1A237E).withAlpha(20) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 28,
              color: isActive ? const Color(0xFF1A237E) : Colors.grey.shade500,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive ? const Color(0xFF1A237E) : Colors.grey.shade500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
