import 'package:flutter_test/flutter_test.dart';
import 'package:smart_saathi_app/main.dart';

void main() {
  testWidgets('SmartSaathi app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const SmartSaathiApp());
    // App should build without errors
    expect(find.text('SmartSaathi'), findsAny);
  });
}
