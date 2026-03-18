import 'package:flutter_riverpod/flutter_riverpod.dart';

final nlpServiceProvider = Provider<NlpService>((ref) {
  return NlpService();
});

class NlpService {
  Future<Map<String, String>> processIntent(String command) async {
    final lower = command.toLowerCase();
    
    // CALL FAMILY INTENT
    if (lower.contains('call') || lower.contains('phone') || lower.contains('dial')) {
      final words = lower.split(' ');
      String entity = "";
      if (words.length > 1) {
         final idx = words.indexWhere((w) => w == 'call' || w == 'phone' || w == 'dial');
         if (idx != -1 && idx + 1 < words.length) entity = words[idx + 1];
      }
      return {
        'intent': 'CALL_FAMILY',
        'entity': entity,
        'response': 'I am calling $entity now.',
      };
    }
    
    // MEDICATION COMPLETION INTENT
    if (lower.contains('took') || lower.contains('done') || lower.contains('kha li')) {
       if (lower.contains('medicine') || lower.contains('dawai') || lower.contains('pill')) {
         return {
           'intent': 'MARK_MEDICATION_DONE',
           'response': 'Great! I have marked your medicine as taken.',
         };
       }
    }

    // READ MEDICATIONS INTENT
    if (lower.contains('what') || lower.contains('read') || lower.contains('tell')) {
       if (lower.contains('medicine') || lower.contains('dawai') || lower.contains('meds')) {
          return {
            'intent': 'READ_MEDICATIONS',
            'response': 'Let me check your upcoming tasks.',
          };
       }
    }

    // GENERAL MEDICATION REMINDER
    if (lower.contains('dawai') || lower.contains('medicine') || lower.contains('insulin')) {
      return {
        'intent': 'MEDICATION_REMINDER',
        'response': 'Aapki dawai ka time ho gaya hai. Check your upcoming tasks.',
      };
    } 
    
    // SYMPTOM LOGGING
    else if (lower.contains('dard') || lower.contains('pain') || lower.contains('sugar') || lower.contains('bp') || lower.contains('ill')) {
      return {
        'intent': 'SYMPTOM_TRIAGE',
        'response': 'I have recorded your symptoms. Please rest, I have alerted your family.',
      };
    } 
    
    // EMERGENCY SOS
    else if (lower.contains('doctor') || lower.contains('madad') || lower.contains('help') || lower.contains('emergency')) {
      return {
        'intent': 'SOS',
        'response': 'Emergency alert sent. Help is on the way.',
      };
    } 
    
    // HYDRATION
    else if (lower.contains('paani') || lower.contains('water') || lower.contains('glass') || lower.contains('drank')) {
      return {
        'intent': 'HYDRATION',
        'response': 'I logged one glass of water. Good job staying hydrated!',
      };
    } 
    
    // EMOTIONAL SUPPORT
    else if (lower.contains('akela') || lower.contains('lonely') || lower.contains('baat') || lower.contains('gana')) {
      return {
        'intent': 'EMOTIONAL_SUPPORT',
        'response': 'Main yahan hoon aapke saath. Aap bilkul akele nahi hain.',
      };
    } 
    
    // UNKNOWN
    else {
      return {
        'intent': 'UNKNOWN',
        'response': 'I am sorry, I did not understand that. Kripya dobara bolein.',
      };
    }
  }
}
