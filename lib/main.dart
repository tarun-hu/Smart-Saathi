import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'app_router.dart';
import 'services/notification_service.dart';

@pragma('vm:entry-point')
void notificationTapBackground(NotificationResponse notificationResponse) async {
  debugPrint('notificationTapBackground: ${notificationResponse.payload}');
  if (notificationResponse.payload != null && notificationResponse.payload!.startsWith('medication:')) {
    final parts = notificationResponse.payload!.split(':');
    if (parts.length > 2) {
      final medName = parts[2];
      FlutterTts tts = FlutterTts();
      await tts.setLanguage('en-IN');
      await tts.speak('Saathi reminder: Please take your medicine, $medName');
    }
  }
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");

  tz.initializeTimeZones();
  try {
    tz.setLocalLocation(tz.getLocation('Asia/Kolkata'));
  } catch (e) {
    debugPrint('Timezone initialization error: $e');
  }

  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL'] ?? '',
    anonKey: dotenv.env['SUPABASE_ANON_KEY'] ?? '',
  );

  await NotificationService().initialize();

  runApp(const SmartSaathiApp());
}

class SmartSaathiApp extends StatelessWidget {
  const SmartSaathiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'SmartSaathi',
      debugShowCheckedModeBanner: false,
      routerConfig: appRouter,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1A237E),
          primary: const Color(0xFF1A237E),
          secondary: const Color(0xFFFF6F00),
          surface: const Color(0xFFF5F5FA),
          error: const Color(0xFFD32F2F),
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF5F5FA),
        textTheme: GoogleFonts.poppinsTextTheme(
          const TextTheme(
            displayLarge: TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.w800,
                color: Color(0xFF1A1A2E)),
            displayMedium: TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1A1A2E)),
            headlineLarge: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A1A2E)),
            headlineMedium: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A1A2E)),
            titleLarge: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1A1A2E)),
            titleMedium: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1A1A2E)),
            bodyLarge: TextStyle(fontSize: 20, color: Color(0xFF333333)),
            bodyMedium: TextStyle(fontSize: 18, color: Color(0xFF555555)),
            labelLarge: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(double.infinity, 58),
            textStyle: GoogleFonts.poppins(
                fontSize: 18, fontWeight: FontWeight.w700),
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18)),
            elevation: 4,
          ),
        ),
        cardTheme: CardThemeData(
          elevation: 2,
          margin: const EdgeInsets.symmetric(vertical: 8),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20)),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          labelStyle: const TextStyle(fontSize: 18),
        ),
      ),
    );
  }
}
