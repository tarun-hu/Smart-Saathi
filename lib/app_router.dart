import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'screens/login_screen.dart';
import 'screens/app_shell.dart';
import 'screens/senior_home_screen.dart';
import 'screens/meds_screen.dart';
import 'screens/health_screen.dart';
import 'screens/family_screen.dart';
import 'screens/profile_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggedIn = Supabase.instance.client.auth.currentUser != null;
      final isAtLogin = state.matchedLocation == '/login';

      if (!isLoggedIn && !isAtLogin) return '/login';
      if (isLoggedIn && isAtLogin) return '/home';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: '/home',
            pageBuilder: (context, state) => const NoTransitionPage(child: SeniorHomeScreen()),
          ),
          GoRoute(
            path: '/meds',
            pageBuilder: (context, state) => const NoTransitionPage(child: MedsScreen()),
          ),
          GoRoute(
            path: '/health',
            pageBuilder: (context, state) => const NoTransitionPage(child: HealthScreen()),
          ),
          GoRoute(
            path: '/family',
            pageBuilder: (context, state) => const NoTransitionPage(child: FamilyScreen()),
          ),
          GoRoute(
            path: '/profile',
            pageBuilder: (context, state) => const NoTransitionPage(child: ProfileScreen()),
          ),
        ],
      ),
    ],
  );
});
