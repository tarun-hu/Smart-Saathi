import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

final voiceServiceProvider = Provider<VoiceService>((ref) {
  return VoiceService();
});

class VoiceService {
  final stt.SpeechToText _speech = stt.SpeechToText();
  final AudioPlayer _audioPlayer = AudioPlayer();

  bool _isListening = false;
  bool get isListening => _isListening;

  Future<bool> initSpeech() async {
    return await _speech.initialize();
  }

  void startListening(Function(String) onResult) {
    if (!_isListening) {
      _speech.listen(
        onResult: (result) {
          onResult(result.recognizedWords);
        },
        localeId: 'hi-IN', // Hindi
      );
      _isListening = true;
    }
  }

  void stopListening() {
    if (_isListening) {
      _speech.stop();
      _isListening = false;
    }
  }

  Future<void> speakHindi(String text) async {
    final apiKey = dotenv.env['GOOGLE_CLOUD_API_KEY'];
    if (apiKey == null || apiKey.isEmpty || apiKey == 'YOUR_GOOGLE_CLOUD_API_KEY') {
      debugPrint("No Google Cloud API key found - TTS Disabled");
      return;
    }

    final url = 'https://texttospeech.googleapis.com/v1/text:synthesize?key=$apiKey';
    
    final response = await http.post(
      Uri.parse(url),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'input': {'text': text},
        'voice': {'languageCode': 'hi-IN', 'name': 'hi-IN-Wavenet-A'},
        'audioConfig': {'audioEncoding': 'MP3'},
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final audioContent = data['audioContent'];
      final bytes = base64Decode(audioContent);
      await _audioPlayer.play(BytesSource(bytes));
    } else {
      debugPrint("TTS Error: \${response.statusCode} - \${response.body}");
    }
  }
}
