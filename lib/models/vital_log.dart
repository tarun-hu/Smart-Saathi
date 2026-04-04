class VitalLog {
  final String id;
  final String userId;
  final String type; // 'blood_sugar' or 'blood_pressure'
  final double? value; // for blood sugar (mg/dL)
  final int? systolic; // for blood pressure
  final int? diastolic; // for blood pressure
  final DateTime timestamp;

  VitalLog({
    required this.id,
    required this.userId,
    required this.type,
    this.value,
    this.systolic,
    this.diastolic,
    required this.timestamp,
  });

  factory VitalLog.fromJson(
    Map<String, dynamic> json, {
    bool treatAsLegacyWallClock = false,
  }) {
    return VitalLog(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      type: json['type'] as String,
      value: (json['value'] as num?)?.toDouble(),
      systolic: json['systolic'] as int?,
      diastolic: json['diastolic'] as int?,
      timestamp: _parseTimestamp(
        json['timestamp'] as String,
        treatAsLegacyWallClock: treatAsLegacyWallClock,
      ),
    );
  }

  static DateTime _parseTimestamp(
    String rawTimestamp, {
    bool treatAsLegacyWallClock = false,
  }) {
    final parsed = DateTime.parse(rawTimestamp);
    final parsedUtc = parsed.toUtc();

    if (treatAsLegacyWallClock) {
      // Older vitals were written with local wall-clock time but without a
      // timezone offset. Rebuild that wall-clock time in the device timezone.
      return DateTime(
        parsedUtc.year,
        parsedUtc.month,
        parsedUtc.day,
        parsedUtc.hour,
        parsedUtc.minute,
        parsedUtc.second,
        parsedUtc.millisecond,
        parsedUtc.microsecond,
      );
    }

    return parsed.isUtc ? parsed.toLocal() : parsed;
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'type': type,
      'value': value,
      'systolic': systolic,
      'diastolic': diastolic,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  String get displayValue {
    if (type == 'blood_sugar') {
      return '${value?.toStringAsFixed(0)} mg/dL';
    } else {
      return '$systolic/$diastolic mmHg';
    }
  }
}
