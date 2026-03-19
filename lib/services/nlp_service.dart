import 'package:flutter_riverpod/flutter_riverpod.dart';

final nlpServiceProvider = Provider<NlpService>((ref) {
  return NlpService();
});

class NlpService {
  Future<Map<String, String>> processIntent(String command) async {
    final lower = command.toLowerCase();

    // ── CALL FAMILY ───────────────────────────
    if (lower.contains('call') || lower.contains('phone') || lower.contains('dial')) {
      final words = lower.split(' ');
      String entity = "";
      final idx = words.indexWhere((w) => w == 'call' || w == 'phone' || w == 'dial');
      if (idx != -1 && idx + 1 < words.length) entity = words.sublist(idx + 1).join(' ');
      return {'intent': 'CALL_FAMILY', 'entity': entity, 'response': 'Calling $entity now.'};
    }

    // ── MEDICATION DONE ──────────────────────
    if (_matchAny(lower, ['took', 'done', 'kha li', 'le li', 'li hai'])) {
      if (_matchAny(lower, ['medicine', 'dawai', 'pill', 'insulin', 'tablet', 'goli'])) {
        return {'intent': 'MARK_MEDICATION_DONE', 'response': 'Great! Marking your medicine as taken.'};
      }
    }

    // ── READ MEDICATIONS ─────────────────────
    if (_matchAny(lower, ['what', 'read', 'tell', 'batao', 'bata', 'konsi'])) {
      if (_matchAny(lower, ['medicine', 'dawai', 'meds', 'tablet', 'goli', 'insulin'])) {
        return {'intent': 'READ_MEDICATIONS', 'response': 'Let me check your medications.'};
      }
    }

    // ── ADD MEDICATION ───────────────────────
    if (_matchAny(lower, ['add', 'new', 'jod', 'likho', 'daalo'])) {
      if (_matchAny(lower, ['medicine', 'dawai', 'tablet', 'goli'])) {
        return {'intent': 'ADD_MEDICATION', 'response': 'Tell me the medicine name, dose and time.'};
      }
    }

    // ── GENERAL MEDICATION REMINDER ──────────
    if (_matchAny(lower, ['dawai', 'medicine', 'insulin', 'tablet', 'goli'])) {
      if (_matchAny(lower, ['time', 'kab', 'waqt', 'samay'])) {
        return {'intent': 'MEDICATION_REMINDER', 'response': 'Checking your medicine schedule.'};
      }
    }

    // ── VITALS INPUT (BP) ────────────────────
    if (_matchAny(lower, ['bp', 'blood pressure', 'raktchap'])) {
      final numbers = RegExp(r'\d+').allMatches(lower).map((m) => m.group(0)!).toList();
      if (numbers.isNotEmpty) {
        return {'intent': 'LOG_BP', 'entity': numbers.first, 'response': 'Recorded BP: ${numbers.first}. Stay healthy!'};
      }
      return {'intent': 'CHECK_BP', 'response': 'Please tell me your BP reading.'};
    }

    // ── VITALS INPUT (SUGAR) ─────────────────
    if (_matchAny(lower, ['sugar', 'glucose', 'cheeni', 'diabetes', 'madhumeh'])) {
      final numbers = RegExp(r'\d+').allMatches(lower).map((m) => m.group(0)!).toList();
      if (numbers.isNotEmpty) {
        return {'intent': 'LOG_SUGAR', 'entity': numbers.first, 'response': 'Sugar level ${numbers.first} recorded.'};
      }
      return {'intent': 'CHECK_SUGAR', 'response': 'Please tell me your sugar reading.'};
    }

    // ── VITALS INPUT (TEMPERATURE) ───────────
    if (_matchAny(lower, ['temperature', 'bukhar', 'fever', 'taapman', 'temp'])) {
      final numbers = RegExp(r'\d+\.?\d*').allMatches(lower).map((m) => m.group(0)!).toList();
      if (numbers.isNotEmpty) {
        return {'intent': 'LOG_TEMPERATURE', 'entity': numbers.first, 'response': 'Temperature ${numbers.first}° recorded.'};
      }
      return {'intent': 'CHECK_TEMPERATURE', 'response': 'Please tell me your temperature.'};
    }

    // ── SYMPTOM LOGGING ──────────────────────
    if (_matchAny(lower, ['dard', 'pain', 'ill', 'sick', 'ache', 'dukhna', 'taklif', 'gas', 'pet', 'stomach', 'kamar', 'ghutna'])) {
      return {'intent': 'SYMPTOM_TRIAGE', 'response': 'Symptoms recorded. Please rest, your family has been notified.'};
    }

    // ── EMERGENCY SOS ────────────────────────
    if (_matchAny(lower, ['sos', 'emergency', 'madad', 'help', 'bachao', 'doctor bulao', 'ambulance'])) {
      return {'intent': 'SOS', 'response': 'Emergency alert sent! Help is on the way.'};
    }

    // ── HYDRATION ────────────────────────────
    if (_matchAny(lower, ['paani', 'water', 'glass', 'drank', 'piya', 'pi gaya', 'pi liya'])) {
      return {'intent': 'HYDRATION', 'response': 'One glass of water logged. Keep hydrating!'};
    }

    // ── EMOTIONAL SUPPORT ────────────────────
    if (_matchAny(lower, ['akela', 'lonely', 'baat', 'baat karo', 'sad', 'udaas', 'rona', 'dukhi'])) {
      return {'intent': 'EMOTIONAL_SUPPORT', 'response': 'Main yahan hoon aapke saath. Aap akele nahi hain. 💛'};
    }

    // ── ENTERTAINMENT ────────────────────────
    if (_matchAny(lower, ['gana', 'song', 'music', 'bhajan', 'prayer', 'prarthna'])) {
      return {'intent': 'ENTERTAINMENT', 'response': 'Playing something soothing for you. 🎵'};
    }

    // ── WEATHER ──────────────────────────────
    if (_matchAny(lower, ['mausam', 'weather', 'garmi', 'sardi', 'barish'])) {
      return {'intent': 'WEATHER', 'response': 'The weather is comfortable today. Stay hydrated!'};
    }

    // ── TIME/DATE ────────────────────────────
    if (_matchAny(lower, ['time', 'samay', 'kya baj', 'kitne baje'])) {
      final now = DateTime.now();
      final h = now.hour > 12 ? now.hour - 12 : now.hour;
      final ampm = now.hour >= 12 ? 'PM' : 'AM';
      return {'intent': 'TIME', 'response': 'Abhi $h:${now.minute.toString().padLeft(2, '0')} $ampm hai.'};
    }

    if (_matchAny(lower, ['date', 'tarikh', 'din', 'aaj'])) {
      final now = DateTime.now();
      final days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return {'intent': 'DATE', 'response': 'Aaj ${days[now.weekday - 1]}, ${now.day}/${now.month}/${now.year} hai.'};
    }

    // ── UNKNOWN ──────────────────────────────
    return {'intent': 'UNKNOWN', 'response': 'I heard you. Kripya dobara bolein.'};
  }

  bool _matchAny(String text, List<String> keywords) {
    return keywords.any((k) => text.contains(k));
  }
}
