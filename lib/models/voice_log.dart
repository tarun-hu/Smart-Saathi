class VoiceLog {
  final String id;
  final String userId;
  final String command;
  final String intent;
  final String response;
  final DateTime timestamp;

  VoiceLog({
    required this.id,
    required this.userId,
    required this.command,
    required this.intent,
    required this.response,
    required this.timestamp,
  });

  factory VoiceLog.fromJson(Map<String, dynamic> json) {
    return VoiceLog(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      command: json['command'] as String,
      intent: json['intent'] as String,
      response: json['response'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'command': command,
      'intent': intent,
      'response': response,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
