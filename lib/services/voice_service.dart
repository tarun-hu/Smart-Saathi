import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:permission_handler/permission_handler.dart';

class VoiceService extends ChangeNotifier {
  static final VoiceService instance = VoiceService._();
  VoiceService._();

  final stt.SpeechToText _speech = stt.SpeechToText();
  final FlutterTts _tts = FlutterTts();

  bool _isInitialized = false;
  bool _isListening = false;
  bool _isSpeaking = false;
  bool _isWakeWordMode = false;
  bool _isProcessing = false;
  String _lastRecognized = '';
  String _currentLocale = 'en-IN';
  int _wakeWordRetryCount = 0;
  int _wakeWordShortSessionCount = 0;
  Timer? _restartTimer;
  bool _resumeWakeWordAfterSpeech = false;
  DateTime? _wakeWordSessionStartedAt;

  bool get isListening => _isListening;
  bool get isSpeaking => _isSpeaking;
  bool get isWakeWordMode => _isWakeWordMode;
  bool get isProcessing => _isProcessing;
  String get lastRecognized => _lastRecognized;
  String get currentLocale => _currentLocale;
  bool get isHindi => _currentLocale == 'hi-IN';
  bool get isInitialized => _isInitialized;
  bool get supportsWakeWordMode =>
      !kIsWeb &&
      (defaultTargetPlatform == TargetPlatform.android ||
          defaultTargetPlatform == TargetPlatform.iOS);

  Function(String)? _onWakeWordDetected;

  Future<void> initialize() async {
    if (_isInitialized) return;

    var status = await Permission.microphone.status;
    if (!status.isGranted) {
      status = await Permission.microphone.request();
      if (!status.isGranted) {
        debugPrint('Microphone permission denied');
        return;
      }
    }

    _isInitialized = await _speech.initialize(
      onError: (error) {
        debugPrint('Speech error: ${error.errorMsg}');
        _isListening = false;
        notifyListeners();

        // Handle "busy" error by waiting longer
        final delay = error.errorMsg.contains('busy')
            ? Duration(seconds: 2 + _wakeWordRetryCount)
            : Duration(seconds: 1);

        if (_isWakeWordMode && !_isProcessing && !_isSpeaking) {
          _scheduleWakeWordRestart(delay);
        }
      },
      onStatus: (status) {
        debugPrint('Speech status: $status');
        if (status == 'listening') {
          _wakeWordSessionStartedAt = DateTime.now();
          _isListening = true;
          notifyListeners();
          return;
        }

        if (status == 'done') {
          _isListening = false;
          notifyListeners();
          return;
        }

        if (status == 'notListening') {
          _isListening = false;
          notifyListeners();
          _handleWakeWordSessionEnded();
        }
      },
    );

    await _tts.setLanguage(_currentLocale);
    await _tts.setSpeechRate(0.45);
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);
    await _tts.awaitSpeakCompletion(true);

    _tts.setStartHandler(() {
      _isSpeaking = true;
      notifyListeners();
    });
    _tts.setCompletionHandler(() {
      _finishSpeaking();
    });
    _tts.setCancelHandler(() {
      _finishSpeaking();
    });
    _tts.setErrorHandler((message) {
      debugPrint('TTS error: $message');
      _finishSpeaking();
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

    // Pause wake word mode during active listening
    final wasWakeMode = _isWakeWordMode;
    if (wasWakeMode) {
      _isWakeWordMode = false;
    }
    _cancelRestartTimer();

    _speech.listen(
      onResult: (result) {
        _lastRecognized = result.recognizedWords;
        notifyListeners();
        if (result.finalResult && result.recognizedWords.trim().isNotEmpty) {
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
      pauseFor: const Duration(seconds: 3),
      listenOptions: stt.SpeechListenOptions(
        listenMode: stt.ListenMode.dictation,
        cancelOnError: false,
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

  // ──── PROCESSING STATE ─────────────────────────
  // Call this before processing a command to prevent wake word from restarting

  void setProcessing(bool value) {
    _isProcessing = value;
    notifyListeners();
  }

  // ──── WAKE WORD DETECTION ──────────────────────

  void startWakeWordListening(Function(String) onWakeWordDetected) {
    _onWakeWordDetected = onWakeWordDetected;
    _wakeWordRetryCount = 0;
    _wakeWordShortSessionCount = 0;
    _wakeWordSessionStartedAt = null;
    _cancelRestartTimer();

    if (!supportsWakeWordMode) {
      _isWakeWordMode = false;
      debugPrint('Wake word mode is unavailable on this platform. Use tap to speak.');
      notifyListeners();
      return;
    }

    _isWakeWordMode = true;
    _startWakeWordListeningInternal();
  }

  void stopWakeWordListening() {
    _isWakeWordMode = false;
    _onWakeWordDetected = null;
    _wakeWordShortSessionCount = 0;
    _wakeWordSessionStartedAt = null;
    _cancelRestartTimer();
    if (_isListening) {
      _speech.stop();
      _isListening = false;
    }
    notifyListeners();
  }

  void _cancelRestartTimer() {
    _restartTimer?.cancel();
    _restartTimer = null;
  }

  void _scheduleWakeWordRestart(Duration delay) {
    _cancelRestartTimer();
    _restartTimer = Timer(delay, () {
      _startWakeWordListeningInternal();
    });
  }

  void _handleWakeWordSessionEnded() {
    if (!_isWakeWordMode || !_isInitialized || _isProcessing || _isSpeaking) {
      _wakeWordSessionStartedAt = null;
      return;
    }

    final sessionStartedAt = _wakeWordSessionStartedAt;
    _wakeWordSessionStartedAt = null;

    final endedTooQuickly = sessionStartedAt != null &&
        DateTime.now().difference(sessionStartedAt) <
            const Duration(milliseconds: 1200);

    if (endedTooQuickly) {
      _wakeWordShortSessionCount++;
    } else {
      _wakeWordShortSessionCount = 0;
    }

    if (_wakeWordShortSessionCount >= 3) {
      debugPrint(
        'Wake word listening is unstable on this device. Falling back to tap-to-speak.',
      );
      _isWakeWordMode = false;
      _wakeWordRetryCount = 0;
      notifyListeners();
      return;
    }

    final restartDelay = endedTooQuickly
        ? Duration(milliseconds: 1200 + (_wakeWordShortSessionCount * 400))
        : const Duration(milliseconds: 350);

    _scheduleWakeWordRestart(restartDelay);
  }

  void _startWakeWordListeningInternal() {
    if (!_isInitialized ||
        !supportsWakeWordMode ||
        !_isWakeWordMode ||
        _isListening ||
        _isProcessing ||
        _isSpeaking) {
      return;
    }

    try {
      _speech.listen(
        onResult: (result) {
          final text = result.recognizedWords.toLowerCase().trim();
          _lastRecognized = text;
          notifyListeners();

          if (result.finalResult) {
            // Reset retry count on successful listen
            _wakeWordRetryCount = 0;

            // Check for wake word
            if (_containsWakeWord(text)) {
              if (_isSpeaking) {
                _tts.stop();
                _isSpeaking = false;
                notifyListeners();
              }
              // Extract the command after the wake word
              String command = _extractCommand(text);
              _onWakeWordDetected?.call(command);
            }
          } else {
             // Optional: Early barge-in on partial hits for higher responsiveness
             if (_containsWakeWord(text) && _isSpeaking) {
               _tts.stop();
               _isSpeaking = false;
               notifyListeners();
             }
          }
        },
        localeId: _currentLocale,
        listenFor: const Duration(seconds: 6),
        pauseFor: const Duration(seconds: 2),
        listenOptions: stt.SpeechListenOptions(
          listenMode: stt.ListenMode.search,
          cancelOnError: false,
          partialResults: true,
        ),
      );
      _wakeWordSessionStartedAt = DateTime.now();
      _isListening = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Wake word listen error: $e');
      _wakeWordRetryCount++;
      // Cap retry delay at 5 seconds
      if (_wakeWordRetryCount > 5) _wakeWordRetryCount = 5;
      if (_isWakeWordMode && !_isProcessing && !_isSpeaking) {
        _scheduleWakeWordRestart(
          Duration(seconds: 1 + _wakeWordRetryCount),
        );
      }
    }
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
    _resumeWakeWordAfterSpeech = _isWakeWordMode && !_isProcessing;
    _cancelRestartTimer();
    _isSpeaking = true;
    notifyListeners();

    if (_isListening) {
      await _speech.stop();
      _isListening = false;
      notifyListeners();
    }

    try {
      await _tts.speak(text);
    } catch (e) {
      debugPrint('TTS speak error: $e');
      _finishSpeaking();
      rethrow;
    }
  }

  Future<void> stop() async {
    _resumeWakeWordAfterSpeech = false;
    await _tts.stop();
    _isSpeaking = false;
    notifyListeners();
  }

  void _finishSpeaking() {
    final shouldResumeWakeWord = _resumeWakeWordAfterSpeech;
    _resumeWakeWordAfterSpeech = false;

    if (_isSpeaking) {
      _isSpeaking = false;
      notifyListeners();
    }

    if (shouldResumeWakeWord &&
        _isWakeWordMode &&
        !_isProcessing &&
        !_isListening) {
      _startWakeWordListeningInternal();
    }
  }

  @override
  void dispose() {
    _cancelRestartTimer();
    _speech.stop();
    _tts.stop();
    super.dispose();
  }
}
