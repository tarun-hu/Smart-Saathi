import 'package:flutter_riverpod/flutter_riverpod.dart';

final nlpServiceProvider = Provider<NlpService>((ref) {
  return NlpService();
});

class NlpService {
  Future<Map<String, String>> processIntent(String command) async {
    final lower = command.toLowerCase();
    
    // Simple heuristic-based NLP imitating Edge Functions
    if (lower.contains('dawai') || lower.contains('medicine') || lower.contains('insulin')) {
      return {
        'intent': 'MEDICATION_REMINDER',
        'response': 'Aapki dawai ka time ho gaya hai. Metformin 500mg le lijiye.',
      };
    } else if (lower.contains('dard') || lower.contains('pain') || lower.contains('sugar') || lower.contains('bp')) {
      return {
        'intent': 'SYMPTOM_TRIAGE',
        'response': 'Kripya aaram karein. Aapke symptoms record ho gaye hain, family ko bata diya gaya hai.',
      };
    } else if (lower.contains('doctor') || lower.contains('madad')) {
      return {
        'intent': 'SOS',
        'response': 'Emergency alert bhej diya gaya hai. Koi aapki madad ke liye aa raha hai.',
      };
    } else if (lower.contains('paani') || lower.contains('water') || lower.contains('glass')) {
      return {
        'intent': 'HYDRATION',
        'response': 'Maine ek glass paani add kar diya hai. Good job!',
      };
    } else if (lower.contains('akela') || lower.contains('lonely') || lower.contains('baat') || lower.contains('gana')) {
      return {
        'intent': 'EMOTIONAL_SUPPORT',
        'response': 'Main yahan hoon aapke saath. Aap bilkul akele nahi hain.',
      };
    } else {
      return {
        'intent': 'UNKNOWN',
        'response': 'Mujhe samajh nahi aaya. Kripya dobara bolein.',
      };
    }
  }
}
