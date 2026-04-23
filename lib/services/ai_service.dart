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
  String _preferredLocale = 'en-IN'; // mirrors VoiceService.currentLocale

  // Context about user's current state — updated by the home screen
  String _userContext = '';

  static const String _systemPrompt = '''You are Saathi, a caring and warm AI voice companion for Indian seniors.
You speak simply, clearly, and with respect. You understand both Hindi and English.
Responses are spoken aloud via TTS — keep them CONCISE but COMPLETE (2-3 sentences max).
Seniors may speak slowly or repeat themselves — be patient and encouraging.

You help with:
- Daily health queries (general wellness tips, NOT medical advice)
- Medication tracking and reminders
- Hydration and mood logging
- Vitals tracking (blood sugar and blood pressure)
- Friendly conversation to reduce loneliness
- Navigation within the app

CRITICAL RULES:
- ALWAYS prefer a TOOL CALL when the user's intent matches one. Never give a text response when a tool should be called.
- If they want to OPEN a page (medications, reports, profile, hospitals) → use navigate_to tool.
- If they say they are in EMERGENCY, DANGER, or NEED HELP → use trigger_sos tool IMMEDIATELY.
- If they want to LOG WATER or say they drank water → use log_water tool. 1 glass = 250ml.
- If they want to ADD A MEDICINE → use add_medication tool. If time is unclear, assume 8:00 AM.
- If they say they TOOK their pill or medicine → use mark_medication_taken tool.
- If they share how they FEEL (happy, sad, sick, tired) → use log_wellbeing tool.
- If they ask for THEIR STATUS, SUMMARY, or "how am I doing" → use get_status tool.
- If they mention a BLOOD SUGAR, GLUCOSE, SUGAR LEVEL reading (e.g. "my sugar is 140", "glucose 160", "चीनी 130 है") → use log_vital tool with vital_type=blood_sugar.
- If they mention a BLOOD PRESSURE or BP reading (e.g. "BP 120 over 80", "pressure 130/90", "बीपी 120/80 है") → use log_vital tool with vital_type=blood_pressure. Extract the two numbers as systolic and diastolic.
- For general health questions (not app actions), give a warm 1-2 sentence answer with their context.
- Do NOT use markdown, bullet points, or symbols — speak naturally like a caring friend.
- When answering about their medications, water, mood, or vitals, USE the context provided below.''';

  Future<void> initialize() async {
    _apiKey = dotenv.env['COHERE_API_KEY'];
  }

  bool get isConfigured => _apiKey != null && _apiKey!.isNotEmpty;

  /// Call this whenever the user changes language in the app settings.
  /// Locale should be 'en-IN' or 'hi-IN' (mirrors VoiceService.currentLocale).
  void setPreferredLocale(String locale) {
    _preferredLocale = locale;
  }

  void clearHistory() {
    _conversationHistory.clear();
  }

  /// Update context about user's current state for smarter responses
  void updateUserContext({
    int? pendingMeds,
    int? hydrationMl,
    String? mood,
    String? userName,
    List<String>? pendingMedNames,
    int? takenMeds,
    // Vitals context
    double? lastBloodSugar,
    int? lastSystolic,
    int? lastDiastolic,
  }) {
    final parts = <String>[];
    if (userName != null) parts.add('User name: $userName');
    if (pendingMeds != null) {
      parts.add('Pending medications today: $pendingMeds');
    }
    if (pendingMedNames != null && pendingMedNames.isNotEmpty) {
      parts.add('Pending med names: ${pendingMedNames.join(', ')}');
    }
    if (takenMeds != null) parts.add('Medications taken today: $takenMeds');
    if (hydrationMl != null) {
      final pct = ((hydrationMl / 2000) * 100).clamp(0, 100).round();
      parts.add('Water intake today: ${hydrationMl}ml of 2000ml goal ($pct%)');
    }
    if (mood != null) parts.add('Mood today: $mood');
    if (lastBloodSugar != null) {
      parts.add('Last blood sugar reading: ${lastBloodSugar.toStringAsFixed(0)} mg/dL');
    }
    if (lastSystolic != null && lastDiastolic != null) {
      parts.add('Last blood pressure reading: $lastSystolic/$lastDiastolic mmHg');
    }
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
      // Build system prompt with user context + HARD language enforcement
      // Language is always driven by the app setting, NOT by what language
      // the STT heard — this prevents the model from switching to Hindi when
      // the user's speech was mis-classified or ambiguously transcribed.
      final langRule = _preferredLocale == 'hi-IN'
          ? 'LANGUAGE RULE: You MUST always reply in Hindi (Devanagari script). Never reply in English, regardless of what language the user appears to speak.'
          : 'LANGUAGE RULE: You MUST always reply in English. Never reply in Hindi or any other language, regardless of what language the user appears to speak.';
      String fullSystemPrompt = _systemPrompt + '\n\n$langRule';
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
        },
        {
          "type": "function",
          "function": {
            "name": "log_vital",
            "description": "Log a health vital reading. Use when user mentions their blood sugar, glucose, sugar level, blood pressure, or BP reading with a numeric value.",
            "parameters": {
              "type": "object",
              "properties": {
                "vital_type": {
                  "type": "string",
                  "enum": ["blood_sugar", "blood_pressure"],
                  "description": "Type of vital: blood_sugar (glucose, sugar, शुगर) or blood_pressure (BP, ब्लड प्रेशर)"
                },
                "blood_sugar_value": {
                  "type": "number",
                  "description": "Blood sugar / glucose reading in mg/dL. Only for vital_type=blood_sugar."
                },
                "systolic": {
                  "type": "integer",
                  "description": "Systolic (top/higher) blood pressure value in mmHg. Only for vital_type=blood_pressure."
                },
                "diastolic": {
                  "type": "integer",
                  "description": "Diastolic (bottom/lower) blood pressure value in mmHg. Only for vital_type=blood_pressure."
                }
              },
              "required": ["vital_type"]
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
          'max_tokens': 300,
          'temperature': 0.5,
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
