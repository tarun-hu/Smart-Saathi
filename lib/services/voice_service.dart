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
  bool _isWakeWordMode = false;
  String _lastRecognized = '';
  String _currentLocale = 'en-IN';

  bool get isListening => _isListening;
  bool get isSpeaking => _isSpeaking;
  bool get isWakeWordMode => _isWakeWordMode;
  String get lastRecognized => _lastRecognized;
  String get currentLocale => _currentLocale;
  bool get isHindi => _currentLocale == 'hi-IN';
  bool get isInitialized => _isInitialized;

  Function(String)? _onWakeWordDetected;

  Future<void> initialize() async {
    if (_isInitialized) return;

    _isInitialized = await _speech.initialize(
      onError: (error) {
        debugPrint('Speech error: ${error.errorMsg}');
        _isListening = false;
        notifyListeners();
        // Auto-restart wake word listening after error
        if (_isWakeWordMode) {
          Future.delayed(const Duration(seconds: 1), () {
            _startWakeWordListeningInternal();
          });
        }
      },
      onStatus: (status) {
        if (status == 'notListening' || status == 'done') {
          _isListening = false;
          notifyListeners();
          // Auto-restart wake word mode if active
          if (_isWakeWordMode && !_isSpeaking) {
            Future.delayed(const Duration(milliseconds: 500), () {
              _startWakeWordListeningInternal();
            });
          }
        }
      },
    );

    await _tts.setLanguage(_currentLocale);
    await _tts.setSpeechRate(0.45);
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);

    _tts.setCompletionHandler(() {
      _isSpeaking = false;
      notifyListeners();
      // Resume wake word listening after speaking
      if (_isWakeWordMode) {
        Future.delayed(const Duration(milliseconds: 500), () {
          _startWakeWordListeningInternal();
        });
      }
    });

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

  // ──── REGULAR LISTENING ────────────────────────

  void startListening(Function(String) onResult, {Function(String)? onPartial}) {
    if (!_isInitialized || _isListening) return;

    // Temporarily disable wake word mode during active listening
    final wasWakeMode = _isWakeWordMode;
    _isWakeWordMode = false;

    _speech.listen(
      onResult: (result) {
        _lastRecognized = result.recognizedWords;
        notifyListeners();
        if (result.finalResult) {
          onResult(result.recognizedWords);
          // Restore wake word mode
          if (wasWakeMode) {
            _isWakeWordMode = true;
          }
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

  // ──── WAKE WORD DETECTION ──────────────────────

  void startWakeWordListening(Function(String) onWakeWordDetected) {
    _isWakeWordMode = true;
    _onWakeWordDetected = onWakeWordDetected;
    _startWakeWordListeningInternal();
  }

  void stopWakeWordListening() {
    _isWakeWordMode = false;
    _onWakeWordDetected = null;
    if (_isListening) {
      _speech.stop();
      _isListening = false;
    }
    notifyListeners();
  }

  void _startWakeWordListeningInternal() {
    if (!_isInitialized || !_isWakeWordMode || _isListening || _isSpeaking) return;

    _speech.listen(
      onResult: (result) {
        final text = result.recognizedWords.toLowerCase().trim();
        _lastRecognized = text;
        notifyListeners();

        if (result.finalResult) {
          // Check for wake word
          if (_containsWakeWord(text)) {
            // Extract the command after the wake word
            String command = _extractCommand(text);
            _onWakeWordDetected?.call(command);
          }
        }
      },
      localeId: _currentLocale,
      listenFor: const Duration(seconds: 10),
      listenOptions: stt.SpeechListenOptions(
        listenMode: stt.ListenMode.dictation,
        cancelOnError: false,
        partialResults: true,
      ),
    );
    _isListening = true;
    notifyListeners();
  }

  bool _containsWakeWord(String text) {
    final wakeWords = [
      'hey saathi', 'he saathi', 'hey sathi', 'he sathi',
      'a saathi', 'saathi', 'sathi',
      'हे साथी', 'ऐ साथी', 'साथी',
    ];
    return wakeWords.any((w) => text.contains(w));
  }

  String _extractCommand(String text) {
    final wakeWords = [
      'hey saathi', 'he saathi', 'hey sathi', 'he sathi',
      'a saathi', 'हे साथी', 'ऐ साथी',
    ];
    String command = text;
    for (final w in wakeWords) {
      command = command.replaceFirst(w, '').trim();
    }
    return command;
  }

  // ──── TTS ──────────────────────────────────────

  Future<void> speak(String text) async {
    if (text.isEmpty) return;
    // Stop listening while speaking
    if (_isListening) {
      _speech.stop();
      _isListening = false;
    }
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
    final data = <String, String>{};

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

    if (text.contains('daily') || text.contains('roz') || text.contains('everyday')) {
      data['frequency'] = 'daily';
    } else if (text.contains('weekly') || text.contains('hafta')) {
      data['frequency'] = 'weekly';
    } else if (text.contains('twice')) {
      data['frequency'] = 'twice daily';
    } else {
      data['frequency'] = 'daily';
    }

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

    final mlRegex = RegExp(r'(\d+)\s*(?:ml|mL|milliliter)', caseSensitive: false);
    final mlMatch = mlRegex.firstMatch(text);
    if (mlMatch != null) {
      data['amount'] = mlMatch.group(1)!;
    }

    final glassRegex = RegExp(r'(\d+)\s*glass', caseSensitive: false);
    final glassMatch = glassRegex.firstMatch(text);
    if (glassMatch != null) {
      final glasses = int.tryParse(glassMatch.group(1)!) ?? 1;
      data['amount'] = (glasses * 250).toString();
    }

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
