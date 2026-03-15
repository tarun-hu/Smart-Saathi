import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:smart_saathi_app/screens/auth_gate.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'https://rdelkouuzjngdrnwlbwi.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZWxrb3V1empuZ2RybndsYndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MzEzODYsImV4cCI6MjA4ODAwNzM4Nn0.-kPHHweUW9Eq6ws1LYUTK5qHLjHgOycurTXNVObLzkc',
  );

  runApp(const SmartSaathiApp());
}

class SmartSaathiApp extends StatelessWidget {
  const SmartSaathiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartSaathi',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1975d2),
          surface: const Color(0xFFf6f7f8),
        ),
        useMaterial3: true,
        fontFamily: 'Lexend',
      ),
      home: const AuthGate(),
      debugShowCheckedModeBanner: false,
    );
  }
}
