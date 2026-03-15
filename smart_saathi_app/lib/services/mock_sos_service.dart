import 'dart:async';

class SOSAlert {
  final double latitude;
  final double longitude;
  final String message;
  final DateTime timestamp;

  SOSAlert({
    required this.latitude,
    required this.longitude,
    required this.message,
    required this.timestamp,
  });
}

class MockSOSService {
  static final MockSOSService _instance = MockSOSService._internal();

  factory MockSOSService() {
    return _instance;
  }

  MockSOSService._internal();

  final _sosController = StreamController<SOSAlert>.broadcast();

  SOSAlert? latestAlert;

  Stream<SOSAlert> get sosStream => _sosController.stream;

  void triggerSOS(SOSAlert alert) {
    latestAlert = alert;
    _sosController.add(alert);
  }
  
  void dispose() {
    _sosController.close();
  }
}
