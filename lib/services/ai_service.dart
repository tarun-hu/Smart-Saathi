import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class AIResponse {
  final String? text;
  final String? toolName;
  final Map<String, dynamic>? toolArgs;

  AIResponse({this.text, this.toolName, this.toolArgs});

  bool get isToolCall => toolName != null;
}

class AIService {
  static final AIService instance = AIService._();
  AIService._();

  final List<Map<String, dynamic>> _conversationHistory = [];
  String? _apiKey;

  // Context about user's current state — updated by the home screen
  String _userContext = '';

  static const String _systemPrompt = '''You are Saathi, a caring and warm AI voice companion for Indian seniors. 
You speak simply, clearly, and with respect. You can understand both Hindi and English.
Keep responses SHORT (1-2 sentences max) because responses are spoken aloud via TTS.
Seniors may speak slowly or repeat themselves — be patient.

You help with:
- Daily health queries (not medical advice, just general wellness tips)
- Reminders and motivation
- Friendly conversation to reduce loneliness
- Navigation within the app

IMPORTANT RULES:
- Always be encouraging, positive, and caring.
- If they want to open a page (like "show my reports", "open medications", "health reports"), use the navigate_to tool.
- If asked about emergencies or help, TRIGGER THE SOS TOOL IMMEDIATELY.
- If they want to log water or say they drank water, use the log_water tool. 1 glass = 250ml.
- If they want to add a medicine, use the add_medication tool. Ask for time if unclear.
- If they say they took their pill, use the mark_medication_taken tool.
- If they share how they feel (happy, sad, sick), use the log_wellbeing tool.
- If they ask for their status or summary, use the get_status tool.
- If user speaks Hindi, reply in Hindi. If English, reply in English.
- Do NOT use markdown, bullet points, or formatting — speak naturally.
- ALWAYS prefer using a tool when the user's intent matches one. Do not just give a text response when a tool should be called.''';

  Future<void> initialize() async {
    _apiKey = dotenv.env['COHERE_API_KEY'];
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

  Future<AIResponse> chat(String userMessage) async {
    if (!isConfigured) {
      return AIResponse(text: 'AI assistant is not configured. Please add your API key.');
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

      // Build messages array for Cohere v2 API
      final messages = <Map<String, dynamic>>[
        {'role': 'system', 'content': fullSystemPrompt},
        ..._conversationHistory,
      ];

      final tools = [
        {
          "type": "function",
          "function": {
            "name": "trigger_sos",
            "description": "Trigger an emergency SOS alert to family members. Use for emergencies, help, danger, falling, or any urgent situation.",
            "parameters": {
              "type": "object",
              "properties": {},
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "add_medication",
            "description": "Add a new medication reminder for the user.",
            "parameters": {
              "type": "object",
              "properties": {
                "name": {"type": "string", "description": "The name of the medicine e.g. Paracetamol, Metformin"},
                "time": {"type": "string", "description": "The time to take the medicine in format like '8:00 AM' or '9:30 PM'"},
                "frequency": {"type": "string", "description": "How often to take it, e.g., 'daily', 'twice daily'"}
              },
              "required": ["name", "time", "frequency"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "mark_medication_taken",
            "description": "Mark the next pending medication as taken. Use when user says they took their medicine or pill.",
            "parameters": {
              "type": "object",
              "properties": {},
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "log_water",
            "description": "Log water intake for the user. Use when user says they drank water, had a glass of water, etc.",
            "parameters": {
              "type": "object",
              "properties": {
                "glasses": {"type": "integer", "description": "Number of glasses of water. 1 glass = 250ml. Default is 1."}
              },
              "required": ["glasses"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "log_wellbeing",
            "description": "Log the user's current mood or wellbeing status.",
            "parameters": {
              "type": "object",
              "properties": {
                "mood": {
                  "type": "string",
                  "enum": ["happy", "okay", "sad", "unwell"],
                  "description": "The mood of the user."
                }
              },
              "required": ["mood"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "get_status",
            "description": "Get the current daily summary of pending medications, hydration, and mood to read out loud.",
            "parameters": {
              "type": "object",
              "properties": {},
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "navigate_to",
            "description": "Navigate to a specific screen in the app. Use when user wants to see medications, reports, profile, health data, or nearby hospitals.",
            "parameters": {
              "type": "object",
              "properties": {
                "route": {
                  "type": "string",
                  "enum": ["/home", "/meds", "/wellbeing", "/facilities", "/profile"],
                  "description": "The route to navigate to. /meds=medications, /wellbeing=reports & vitals, /facilities=nearby hospitals, /profile=user profile"
                }
              },
              "required": ["route"]
            }
          }
        }
      ];

      // Cohere v2 API endpoint
      final response = await http.post(
        Uri.parse('https://api.cohere.com/v2/chat'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_apiKey',
        },
        body: jsonEncode({
          'model': 'command-r-08-2024',
          'messages': messages,
          'tools': tools,
          'max_tokens': 200,
          'temperature': 0.6,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final finishReason = data['finish_reason'] as String? ?? '';
        final message = data['message'] as Map<String, dynamic>? ?? {};

        // Check for tool calls (finish_reason == 'TOOL_CALL' in Cohere v2)
        if (finishReason.toUpperCase() == 'TOOL_CALL' &&
            message['tool_calls'] != null &&
            (message['tool_calls'] as List).isNotEmpty) {
          final toolCall = (message['tool_calls'] as List)[0];
          final function = toolCall['function'] as Map<String, dynamic>;
          final name = function['name'] as String;
          Map<String, dynamic> args;
          if (function['arguments'] is String) {
            try {
              args = Map<String, dynamic>.from(jsonDecode(function['arguments']));
            } catch (_) {
              args = {};
            }
          } else {
            args = Map<String, dynamic>.from(function['arguments'] ?? {});
          }

          return AIResponse(toolName: name, toolArgs: args);
        }

        // Regular text response — Cohere v2 returns content as a list
        String reply = '';
        final content = message['content'];
        if (content is List && content.isNotEmpty) {
          // content: [{ "type": "text", "text": "..." }]
          reply = (content[0]['text'] as String?) ?? '';
        } else if (content is String) {
          reply = content;
        }

        _conversationHistory.add({'role': 'assistant', 'content': reply});
        return AIResponse(text: reply.trim());
      } else {
        debugPrint('AI API error: ${response.statusCode} ${response.body}');
        return AIResponse(text: 'Sorry, I could not process that. Please try again.');
      }
    } catch (e) {
      debugPrint('AI Service error: $e');
      return AIResponse(text: 'I am having trouble connecting. Please check your internet.');
    }
  }

  Future<String> generateReportSummary(String base64Image) async {
    if (!isConfigured) return "AI not configured.";
    try {
      // Vision / report summary not supported in free tier – return placeholder
      return 'Report summary not available in free mode.';
    } catch (e) {
      debugPrint('Report summary error: $e');
      return 'Failed to generate report summary.';
    }
  }
}
