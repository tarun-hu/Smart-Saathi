import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'login_screen.dart';
import 'senior_screen.dart';
import 'caregiver_screen.dart';
import 'connection_screen.dart';
import '../services/supabase_service.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  Widget? _currentScreen;

  @override
  void initState() {
    super.initState();
    _setupAuthListener();
  }

  void _setupAuthListener() {
    Supabase.instance.client.auth.onAuthStateChange.listen((data) async {
      final session = data.session;
      if (session == null) {
        if (mounted) {
          setState(() {
            _currentScreen = const LoginScreen();
          });
        }
      } else {
        // Fetch role from profiles
        await _fetchRoleAndRoute(session.user.id);
      }
    });
  }

  Future<void> _fetchRoleAndRoute(String userId) async {
    int retries = 0;
    while (retries < 3) {
      try {
        final data = await Supabase.instance.client
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
            
        final role = data['role'] as String;
        
        if (mounted) {
          if (role == 'senior') {
            setState(() => _currentScreen = const SeniorScreen());
          } else {
             final hasConn = await SupabaseService.hasConnections();
             if (mounted) {
                setState(() {
                  _currentScreen = hasConn ? const CaregiverScreen() : const ConnectionScreen();
                });
             }
          }
        }
        return;
      } catch (e) {
        retries++;
        await Future.delayed(const Duration(seconds: 1));
      }
    }
    
    // If we fail after 3 secular retries, show an error screen or log them out
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to load profile role.'), backgroundColor: Colors.red)
      );
      Supabase.instance.client.auth.signOut();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_currentScreen == null) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }
    return _currentScreen!;
  }
}
