import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/signup_screen.dart';
import 'screens/nominee_setup_screen.dart';
import 'screens/app_shell.dart';
import 'screens/home_screen.dart';
import 'screens/medications_screen.dart';
import 'screens/nearby_facilities_screen.dart';
import 'screens/wellbeing_screen.dart';
import 'screens/profile_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/login',
  redirect: (context, state) async {
    final isLoggedIn = Supabase.instance.client.auth.currentUser != null;
    final location = state.matchedLocation;

    // Not logged in → go to login (but allow signup)
    if (!isLoggedIn && location != '/login') return '/login';

    // Logged in and on login page → go to home
    if (isLoggedIn && location == '/login') return '/home';

    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const SignupScreen(),
    ),
    GoRoute(
      path: '/nominees',
      builder: (context, state) => const NomineeSetupScreen(),
    ),

    // ── MAIN APP (with bottom nav shell) ──
    ShellRoute(
      builder: (context, state, child) => AppShell(child: child),
      routes: [
        GoRoute(
          path: '/home',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: HomeScreen()),
        ),
        GoRoute(
          path: '/meds',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: MedicationsScreen()),
        ),
        GoRoute(
          path: '/facilities',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: NearbyFacilitiesScreen()),
        ),
        GoRoute(
          path: '/wellbeing',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: WellbeingScreen()),
        ),
        GoRoute(
          path: '/profile',
          pageBuilder: (context, state) =>
              const NoTransitionPage(child: ProfileScreen()),
        ),
      ],
    ),
  ],
);
