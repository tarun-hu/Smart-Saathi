import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:smart_saathi_app/main.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    SharedPreferences.setMockInitialValues({});
    await Supabase.initialize(
      url: 'https://example.supabase.co',
      anonKey: 'test-anon-key',
    );
  });

  testWidgets('SmartSaathi app shows the login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const SmartSaathiApp());
    await tester.pump();

    expect(find.text('SmartSaathi'), findsOneWidget);
    expect(find.text('Your Voice-First Care Companion'), findsOneWidget);
  });
}
