import 'dart:convert';
import 'package:http/http.dart' as http;
import 'dart:io';

void main() async {
  final envFile = File('.env');
  final lines = await envFile.readAsLines();
  String? apiKey;
  for (final line in lines) {
    if (line.startsWith('GROQ_API_KEY=')) {
      apiKey = line.split('=')[1].trim();
      break;
    }
  }

  if (apiKey == null) return;

  final systemPrompt = '''You are Saathi...''';

  final messages = [
    {'role': 'system', 'content': systemPrompt},
    {'role': 'user', 'content': 'Please log that I drank a glass of water'},
    {
      "role": "assistant",
      "tool_calls": [
        {
          "id": "rjzy07dce",
          "type": "function",
          "function": {
            "name": "log_water",
            "arguments": "{\"amount\":250}"
          }
        }
      ]
    },
    {'role': 'user', 'content': 'Thanks saathi'}
  ];

  final response = await http.post(
    Uri.parse('https://api.groq.com/openai/v1/chat/completions'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: jsonEncode({
      'model': 'llama-3.3-70b-versatile',
      'messages': messages,
      'max_tokens': 150,
      'temperature': 0.7,
    }),
  );

  print('Status code: ' + response.statusCode.toString());
  print('Response body: ' + response.body);
}
