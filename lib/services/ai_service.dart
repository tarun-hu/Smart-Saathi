import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class AIService {
  static final AIService instance = AIService._();
  AIService._();

  final List<Map<String, String>> _conversationHistory = [];
  String? _apiKey;

  // Context about user's current state — updated by the home screen
  String _userContext = '';

  static const String _systemPrompt = '''You are Saathi, a caring and warm AI voice companion for Indian seniors. 
You speak simply, clearly, and with respect. You can understand both Hindi and English.
Keep responses SHORT (2-3 sentences max) because responses are spoken aloud via TTS.
Seniors may speak slowly or repeat themselves — be patient.

You help with:
- Daily health queries (not medical advice, just general wellness tips)
- Reminders and motivation ("Have you taken your medicine?", "Let's drink some water!")
- Friendly conversation to reduce loneliness
- Simple information queries
- Wellbeing check-ins

IMPORTANT RULES:
- Always be encouraging, positive, and caring. Address the user respectfully.
- If asked about emergencies, tell them to say "help" or "SOS" or press the SOS button.
- Never give specific medical prescriptions or diagnoses.
- If someone mentions medication, ask them if they'd like to add a reminder.
- Keep language simple — think of talking to a grandparent.
- If user speaks Hindi, reply in Hindi. If English, reply in English.
- Do NOT use markdown, bullet points, or formatting — speak naturally since this is voice output.''';

  Future<void> initialize() async {
    _apiKey = dotenv.env['GROQ_API_KEY'];
  }

  bool get isConfigured => _apiKey != null && _apiKey!.isNotEmpty;

  void clearHistory() {
    _conversationHistory.clear();
  }

  /// Update context about user's current state for smarter responses
  void updateUserContext({
    int? pendingMeds,
    int? hydrationMl,
    String? mood,
    String? userName,
  }) {
    final parts = <String>[];
    if (userName != null) parts.add('User name: $userName');
    if (pendingMeds != null) parts.add('Pending medications: $pendingMeds');
    if (hydrationMl != null) parts.add('Water intake today: ${hydrationMl}ml / 2000ml');
    if (mood != null) parts.add('Mood today: $mood');
    parts.add('Current time: ${DateTime.now().toString().substring(0, 16)}');
    _userContext = parts.join('. ');
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
      // Build system prompt with user context
      String fullSystemPrompt = _systemPrompt;
      if (_userContext.isNotEmpty) {
        fullSystemPrompt += '\n\nCurrent user context: $_userContext';
      }

      final messages = [
        {'role': 'system', 'content': fullSystemPrompt},
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
          'max_tokens': 200,
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
