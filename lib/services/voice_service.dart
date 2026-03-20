import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:shared_preferences/shared_preferences.dart';

class VoiceService extends ChangeNotifier {
  final stt.SpeechToText _speech = stt.SpeechToText();
  final FlutterTts _tts = FlutterTts();

  bool _isInitialized = false;
  bool _isListening = false;
  bool _isSpeaking = false;
  String _lastRecognized = '';
  String _currentLocale = 'en-IN'; // Default English-India

  bool get isListening => _isListening;
  bool get isSpeaking => _isSpeaking;
  String get lastRecognized => _lastRecognized;
  String get currentLocale => _currentLocale;
  bool get isHindi => _currentLocale == 'hi-IN';

  Future<void> initialize() async {
    if (_isInitialized) return;

    _isInitialized = await _speech.initialize(
      onError: (error) {
        debugPrint('Speech error: ${error.errorMsg}');
        _isListening = false;
        notifyListeners();
      },
      onStatus: (status) {
        if (status == 'notListening' || status == 'done') {
          _isListening = false;
          notifyListeners();
        }
      },
    );

    await _tts.setLanguage(_currentLocale);
    await _tts.setSpeechRate(0.45); // Slower for seniors
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);

    _tts.setCompletionHandler(() {
      _isSpeaking = false;
      notifyListeners();
    });

    // Load user language preference
    final prefs = await SharedPreferences.getInstance();
    _currentLocale = prefs.getString('language') ?? 'en-IN';
    await _tts.setLanguage(_currentLocale);
  }

  Future<void> setLanguage(String locale) async {
    _currentLocale = locale;
    await _tts.setLanguage(locale);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language', locale);
    notifyListeners();
  }

  Future<void> toggleLanguage() async {
    final newLocale = _currentLocale == 'en-IN' ? 'hi-IN' : 'en-IN';
    await setLanguage(newLocale);
  }

  void startListening(Function(String) onResult, {Function(String)? onPartial}) {
    if (!_isInitialized || _isListening) return;

    _speech.listen(
      onResult: (result) {
        _lastRecognized = result.recognizedWords;
        notifyListeners();
        if (result.finalResult) {
          onResult(result.recognizedWords);
        } else {
          onPartial?.call(result.recognizedWords);
        }
      },
      localeId: _currentLocale,
      listenFor: const Duration(seconds: 30),
      listenOptions: stt.SpeechListenOptions(
        listenMode: stt.ListenMode.dictation,
        cancelOnError: true,
        partialResults: true,
      ),
    );
    _isListening = true;
    notifyListeners();
  }

  void stopListening() {
    if (_isListening) {
      _speech.stop();
      _isListening = false;
      notifyListeners();
    }
  }

  Future<void> speak(String text) async {
    if (text.isEmpty) return;
    _isSpeaking = true;
    notifyListeners();
    await _tts.speak(text);
  }

  Future<void> stop() async {
    await _tts.stop();
    _isSpeaking = false;
    notifyListeners();
  }

  // ──── VOICE COMMAND PARSER ─────────────────────

  VoiceCommand parseCommand(String text) {
    final lower = text.toLowerCase().trim();

    // Emergency / SOS
    if (_matchesAny(lower, [
      'emergency', 'help', 'sos', 'bachao', 'madad',
      'help me', 'please help', 'emergency help',
    ])) {
      return VoiceCommand(type: CommandType.sos);
    }

    // Medication reminders
    if (_matchesAny(lower, ['remind', 'medicine', 'tablet', 'dawai', 'goli', 'medication', 'dawa'])) {
      return _parseMedicationCommand(lower);
    }

    // Mark medication as taken
    if (_matchesAny(lower, ['taken', 'le liya', 'kha liya', 'done', 'took'])) {
      return VoiceCommand(type: CommandType.medTaken);
    }

    // Hydration
    if (_matchesAny(lower, ['water', 'paani', 'pani', 'drank', 'glass', 'drink', 'hydration'])) {
      return _parseHydrationCommand(lower);
    }

    // Wellbeing check
    if (_matchesAny(lower, ['how am i', 'kaisa', 'feeling', 'mood', 'tabiyat', 'health'])) {
      return VoiceCommand(type: CommandType.wellbeingCheck);
    }

    // Mood reports
    if (_matchesAny(lower, ['happy', 'good', 'fine', 'great', 'accha', 'theek', 'okay', 'ok'])) {
      return VoiceCommand(type: CommandType.wellbeingLog, data: {'mood': 'happy'});
    }
    if (_matchesAny(lower, ['sad', 'upset', 'dukhi', 'not good', 'not well', 'bura'])) {
      return VoiceCommand(type: CommandType.wellbeingLog, data: {'mood': 'sad'});
    }
    if (_matchesAny(lower, ['unwell', 'sick', 'bimar', 'pain', 'dard', 'hurt'])) {
      return VoiceCommand(type: CommandType.wellbeingLog, data: {'mood': 'unwell'});
    }

    // Status / Summary
    if (_matchesAny(lower, ['status', 'summary', 'report', 'kya haal', 'din kaisa'])) {
      return VoiceCommand(type: CommandType.status);
    }

    return VoiceCommand(type: CommandType.unknown, data: {'text': text});
  }

  VoiceCommand _parseMedicationCommand(String text) {
    // Try to extract: medicine name, time, frequency
    // Pattern: "remind [name] at [time] [frequency]" or "remind [name] [time]"
    final data = <String, String>{};

    // Extract time patterns like "8 AM", "10:30 PM", "morning", "evening"
    final timeRegex = RegExp(r'(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))', caseSensitive: false);
    final timeMatch = timeRegex.firstMatch(text);
    if (timeMatch != null) {
      data['time'] = timeMatch.group(0)!.trim();
    } else if (text.contains('morning') || text.contains('subah')) {
      data['time'] = '8:00 AM';
    } else if (text.contains('afternoon') || text.contains('dopahar')) {
      data['time'] = '2:00 PM';
    } else if (text.contains('evening') || text.contains('shaam')) {
      data['time'] = '6:00 PM';
    } else if (text.contains('night') || text.contains('raat')) {
      data['time'] = '10:00 PM';
    }

    // Extract frequency
    if (text.contains('daily') || text.contains('roz') || text.contains('everyday')) {
      data['frequency'] = 'daily';
    } else if (text.contains('weekly') || text.contains('hafta')) {
      data['frequency'] = 'weekly';
    } else if (text.contains('twice')) {
      data['frequency'] = 'twice daily';
    } else {
      data['frequency'] = 'daily';
    }

    // Extract medicine name: take everything between "remind" and "at"/"daily"/time
    String medName = text;
    for (final word in ['remind', 'medicine', 'tablet', 'dawai', 'goli', 'medication', 'add', 'set', 'reminder for']) {
      medName = medName.replaceAll(word, '');
    }
    medName = medName.replaceAll(timeRegex, '');
    for (final word in ['at', 'daily', 'weekly', 'roz', 'morning', 'evening', 'night', 'afternoon', 'subah', 'shaam', 'raat', 'dopahar', 'twice']) {
      medName = medName.replaceAll(word, '');
    }
    data['name'] = medName.trim();

    return VoiceCommand(type: CommandType.medAdd, data: data);
  }

  VoiceCommand _parseHydrationCommand(String text) {
    final data = <String, String>{};

    // Extract amount in ml
    final mlRegex = RegExp(r'(\d+)\s*(?:ml|mL|milliliter)', caseSensitive: false);
    final mlMatch = mlRegex.firstMatch(text);
    if (mlMatch != null) {
      data['amount'] = mlMatch.group(1)!;
    }

    // Extract glasses
    final glassRegex = RegExp(r'(\d+)\s*glass', caseSensitive: false);
    final glassMatch = glassRegex.firstMatch(text);
    if (glassMatch != null) {
      final glasses = int.tryParse(glassMatch.group(1)!) ?? 1;
      data['amount'] = (glasses * 250).toString();
    }

    // Default to 250ml (1 glass)
    if (!data.containsKey('amount')) {
      data['amount'] = '250';
    }

    return VoiceCommand(type: CommandType.hydration, data: data);
  }

  bool _matchesAny(String text, List<String> keywords) {
    return keywords.any((k) => text.contains(k));
  }

  @override
  void dispose() {
    _speech.stop();
    _tts.stop();
    super.dispose();
  }
}

enum CommandType {
  sos,
  medAdd,
  medTaken,
  hydration,
  wellbeingCheck,
  wellbeingLog,
  status,
  unknown,
}

class VoiceCommand {
  final CommandType type;
  final Map<String, String>? data;

  VoiceCommand({required this.type, this.data});
}
