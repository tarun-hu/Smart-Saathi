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
- If they want to open a page (like "show my reports" or "open profile"), use the navigate_to tool.
- If asked about emergencies, TRIGGER THE SOS TOOL IMMEDIATELY or tell them to press the SOS button.
- If they want to log water, use the log_water tool. 1 glass = 250ml.
- If they want to add a medicine, use the add_medication tool. Ask for time if unclear.
- If they say they took their pill, use the mark_medication_taken tool.
- If they share how they feel (happy, sad, sick), use the log_wellbeing tool.
- If they ask for their status, use the get_status tool.
- If user speaks Hindi, reply in Hindi. If English, reply in English.
- Do NOT use markdown, bullet points, or formatting — speak naturally.''';

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

      final messages = [
        {'role': 'system', 'content': fullSystemPrompt},
        ..._conversationHistory,
      ];

      final tools = [
        {
          "type": "function",
          "function": {
            "name": "trigger_sos",
            "description": "Trigger an emergency SOS alert to family members. Use only for emergencies/help.",
          }
        },
        {
          "type": "function",
          "function": {
            "name": "add_medication",
            "description": "Add a new medication reminder.",
            "parameters": {
              "type": "object",
              "properties": {
                "name": {"type": "string", "description": "The name of the medicine"},
                "time": {"type": "string", "description": "The time to take the medicine, e.g., '8:00 AM'"},
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
            "description": "Mark the next pending medication as taken.",
          }
        },
        {
          "type": "function",
          "function": {
            "name": "log_water",
            "description": "Log that the user drank water.",
            "parameters": {
              "type": "object",
              "properties": {
                "amount": {"type": "integer", "description": "Amount in ml. 1 glass = 250."}
              },
              "required": ["amount"]
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "log_wellbeing",
            "description": "Log the user's current mood or wellbeing.",
            "parameters": {
              "type": "object",
              "properties": {
                "mood": {
                  "type": "string",
                  "enum": ["happy", "okay", "sad", "unwell"],
                  "description": "The mood."
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
          }
        },
        {
          "type": "function",
          "function": {
            "name": "navigate_to",
            "description": "Navigate to a specific screen in the app.",
            "parameters": {
              "type": "object",
              "properties": {
                "route": {
                  "type": "string",
                  "enum": ["/reports", "/medications", "/vitals", "/profile", "/water"],
                  "description": "The route to navigate to."
                }
              },
              "required": ["route"]
            }
          }
        }
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
          'tools': tools,
          'tool_choice': 'auto',
          'max_tokens': 150,
          'temperature': 0.7,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final message = data['choices'][0]['message'];
        
        // Check for tool calls
        if (message['tool_calls'] != null && (message['tool_calls'] as List).isNotEmpty) {
          final toolCall = message['tool_calls'][0];
          final function = toolCall['function'];
          final name = function['name'];
          dynamic args;
          if (function['arguments'] is String) {
            try {
              args = jsonDecode(function['arguments']);
            } catch (_) {
              args = {};
            }
          } else {
            args = function['arguments'] ?? {};
          }
          
          // We do not add the raw message with tool_calls to the history 
          // because Groq requires a corresponding 'tool'/'function' response right after it.
          // Since we execute the action locally and speak the result directly, 
          // we should just log the user intent as a system status if needed, 
          // but omitted here to prevent a 400 Bad Request on the next chat turn.
          
          return AIResponse(toolName: name, toolArgs: args);
        }

        // Just regular text response
        final reply = message['content'] as String? ?? '';
        _conversationHistory.add({'role': 'assistant', 'content': reply});
        return AIResponse(text: reply.trim());
      } else {
        debugPrint('Groq API error: ${response.statusCode} ${response.body}');
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
      final response = await http.post(
        Uri.parse('https://api.groq.com/openai/v1/chat/completions'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $_apiKey',
        },
        body: jsonEncode({
          'model': 'llama-3.2-90b-vision-preview',
          'messages': [
            {
              'role': 'user',
              'content': [
                {
                  'type': 'text',
                  'text': 'Analyze this health report carefully. Summarize the key findings and predict the outcome or what it means in 2 short, simple sentences suitable for a senior to understand.'
                },
                {
                  'type': 'image_url',
                  'image_url': {
                    'url': 'data:image/jpeg;base64,$base64Image',
                  }
                }
              ]
            }
          ],
          'max_tokens': 150,
          'temperature': 0.4,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices'][0]['message']['content']?.trim() ?? "Unable to analyze report.";
      }
      return "Failed to analyze report.";
    } catch (e) {
      debugPrint('Vision API error: $e');
      return "Error analyzing report.";
    }
  }
}
