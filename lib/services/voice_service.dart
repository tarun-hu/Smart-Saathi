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
  Timer? _restartTimer;

  bool get isListening => _isListening;
  bool get isSpeaking => _isSpeaking;
  bool get isWakeWordMode => _isWakeWordMode;
  bool get isProcessing => _isProcessing;
  String get lastRecognized => _lastRecognized;
  String get currentLocale => _currentLocale;
  bool get isHindi => _currentLocale == 'hi-IN';
  bool get isInitialized => _isInitialized;

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

        if (_isWakeWordMode && !_isProcessing) {
          _scheduleWakeWordRestart(delay);
        }
      },
      onStatus: (status) {
        debugPrint('Speech status: $status');
        if (status == 'notListening' || status == 'done') {
          _isListening = false;
          notifyListeners();
          // Auto-restart wake word mode if active and not processing
          if (_isWakeWordMode && !_isProcessing) {
            _scheduleWakeWordRestart(
              Duration(milliseconds: 500 + (_wakeWordRetryCount * 200)),
            );
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
      // Listening should already be handling itself now that we removed the speak lock
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
    _cancelRestartTimer();

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
      pauseFor: const Duration(seconds: 2),
      listenOptions: stt.SpeechListenOptions(
        listenMode: stt.ListenMode.search,
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

  // ──── PROCESSING STATE ─────────────────────────
  // Call this before processing a command to prevent wake word from restarting

  void setProcessing(bool value) {
    _isProcessing = value;
    notifyListeners();
  }

  // ──── WAKE WORD DETECTION ──────────────────────

  void startWakeWordListening(Function(String) onWakeWordDetected) {
    _isWakeWordMode = true;
    _onWakeWordDetected = onWakeWordDetected;
    _wakeWordRetryCount = 0;
    _startWakeWordListeningInternal();
  }

  void stopWakeWordListening() {
    _isWakeWordMode = false;
    _onWakeWordDetected = null;
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

  void _startWakeWordListeningInternal() {
    // Note: removed _isSpeaking check to allow "barge-in" interruptions
    if (!_isInitialized || !_isWakeWordMode || _isListening || _isProcessing) {
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
        listenFor: const Duration(minutes: 10),
        pauseFor: const Duration(minutes: 10),
        listenOptions: stt.SpeechListenOptions(
          listenMode: stt.ListenMode.dictation,
          cancelOnError: false,
          partialResults: true,
        ),
      );
      _isListening = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Wake word listen error: $e');
      _wakeWordRetryCount++;
      // Cap retry delay at 5 seconds
      if (_wakeWordRetryCount > 5) _wakeWordRetryCount = 5;
      if (_isWakeWordMode && !_isProcessing) {
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
    if (!_isWakeWordMode) {
      _cancelRestartTimer();
      if (_isListening) {
        _speech.stop();
        _isListening = false;
      }
    } else {
      if (!_isListening && !_isProcessing) {
        _startWakeWordListeningInternal();
      }
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

  @override
  void dispose() {
    _cancelRestartTimer();
    _speech.stop();
    _tts.stop();
    super.dispose();
  }
}
