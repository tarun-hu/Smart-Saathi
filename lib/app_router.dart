import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/login_screen.dart';
import 'screens/senior/senior_shell.dart';
import 'screens/senior/senior_home_screen.dart';
import 'screens/senior/meds_screen.dart';
import 'screens/senior/health_screen.dart';
import 'screens/senior/family_screen.dart';
import 'screens/senior/profile_screen.dart';
import 'screens/caregiver/caregiver_shell.dart';
import 'screens/caregiver/caregiver_home_screen.dart';
import 'screens/caregiver/caregiver_alerts_screen.dart';
import 'screens/caregiver/caregiver_health_screen.dart';
import 'screens/caregiver/caregiver_meds_screen.dart';
import 'screens/caregiver/caregiver_profile_screen.dart';

/// Cached user role for routing decisions.
final _cachedRoleProvider = StateProvider<String?>((ref) => null);

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) async {
      final isLoggedIn = Supabase.instance.client.auth.currentUser != null;
      final location = state.matchedLocation;

      if (!isLoggedIn && location != '/login') return '/login';
      if (isLoggedIn && location == '/login') {
        // Determine role and redirect accordingly
        final cachedRole = ref.read(_cachedRoleProvider);
        if (cachedRole != null) {
          return cachedRole == 'caregiver' ? '/caregiver/home' : '/senior/home';
        }

        try {
          final uid = Supabase.instance.client.auth.currentUser!.id;
          final profile = await Supabase.instance.client
              .from('profiles')
              .select('role')
              .eq('id', uid)
              .maybeSingle();
          final role = profile?['role'] as String? ?? 'senior';
          ref.read(_cachedRoleProvider.notifier).state = role;
          return role == 'caregiver' ? '/caregiver/home' : '/senior/home';
        } catch (_) {
          return '/senior/home';
        }
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),

      // ── SENIOR ROUTES ──
      ShellRoute(
        builder: (context, state, child) => SeniorShell(child: child),
        routes: [
          GoRoute(
            path: '/senior/home',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: SeniorHomeScreen()),
          ),
          GoRoute(
            path: '/senior/meds',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: MedsScreen()),
          ),
          GoRoute(
            path: '/senior/health',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: HealthScreen()),
          ),
          GoRoute(
            path: '/senior/family',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: FamilyScreen()),
          ),
          GoRoute(
            path: '/senior/profile',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: SeniorProfileScreen()),
          ),
        ],
      ),

      // ── CAREGIVER ROUTES ──
      ShellRoute(
        builder: (context, state, child) => CaregiverShell(child: child),
        routes: [
          GoRoute(
            path: '/caregiver/home',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: CaregiverHomeScreen()),
          ),
          GoRoute(
            path: '/caregiver/alerts',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: CaregiverAlertsScreen()),
          ),
          GoRoute(
            path: '/caregiver/health',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: CaregiverHealthScreen()),
          ),
          GoRoute(
            path: '/caregiver/meds',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: CaregiverMedsScreen()),
          ),
          GoRoute(
            path: '/caregiver/profile',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: CaregiverProfileScreen()),
          ),
        ],
      ),
    ],
  );
});
