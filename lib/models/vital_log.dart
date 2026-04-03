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

  factory VitalLog.fromJson(Map<String, dynamic> json) {
    return VitalLog(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      type: json['type'] as String,
      value: (json['value'] as num?)?.toDouble(),
      systolic: json['systolic'] as int?,
      diastolic: json['diastolic'] as int?,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
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
