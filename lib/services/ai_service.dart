import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class AIService {
  static final AIService instance = AIService._();
  AIService._();

  final List<Map<String, String>> _conversationHistory = [];
  String? _apiKey;

  static const String _systemPrompt = '''You are Saathi, a caring and warm AI companion for Indian seniors. 
You speak simply, clearly, and with respect. You can understand both Hindi and English.
Keep responses SHORT (1-3 sentences max). Seniors may speak slowly or repeat themselves — be patient.
You help with:
- Daily health queries (not medical advice, just general wellness)
- Reminders and motivation
- Friendly conversation to reduce loneliness
- Simple information queries
Always be encouraging, positive, and caring. Address the user respectfully.
If asked about emergencies, remind them to press the SOS button.
Never give specific medical prescriptions or diagnoses.''';

  Future<void> initialize() async {
    _apiKey = dotenv.env['GROQ_API_KEY'];
  }

  bool get isConfigured => _apiKey != null && _apiKey!.isNotEmpty;

  void clearHistory() {
    _conversationHistory.clear();
  }

  Future<String> chat(String userMessage) async {
    if (!isConfigured) {
      return 'AI assistant is not configured. Please add your Groq API key.';
    }

    // Add user message to history
    _conversationHistory.add({'role': 'user', 'content': userMessage});

    // Keep only last 10 messages for context
    if (_conversationHistory.length > 10) {
      _conversationHistory.removeRange(0, _conversationHistory.length - 10);
    }

    try {
      final messages = [
        {'role': 'system', 'content': _systemPrompt},
        ..._conversationHistory,
      ];

      final response = await http.post(
        Uri.parse('https://api.groq.com/openai/v1/chat/completions'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_apiKey',
        },
        body: jsonEncode({
          'model': 'llama-3.3-70b-versatile',
          'messages': messages,
          'max_tokens': 150,
          'temperature': 0.7,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final reply =
            data['choices'][0]['message']['content'] as String? ?? '';
        _conversationHistory.add({'role': 'assistant', 'content': reply});
        return reply.trim();
      } else {
        debugPrint('Groq API error: ${response.statusCode} ${response.body}');
        return 'Sorry, I could not process that. Please try again.';
      }
    } catch (e) {
      debugPrint('AI Service error: $e');
      return 'I am having trouble connecting. Please check your internet.';
    }
  }
}
