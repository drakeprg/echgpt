import 'dart:convert';
import 'package:flutter/services.dart';

/// Disease information model
class DiseaseInfo {
  final String id;
  final String name;
  final String description;
  final List<String> symptoms;
  final List<String> causes;
  final List<String> treatment;
  final List<String> whenToSeeDoctor;
  final String severity;
  final String color;

  DiseaseInfo({
    required this.id,
    required this.name,
    required this.description,
    required this.symptoms,
    required this.causes,
    required this.treatment,
    required this.whenToSeeDoctor,
    required this.severity,
    required this.color,
  });

  factory DiseaseInfo.fromJson(String id, Map<String, dynamic> json) {
    return DiseaseInfo(
      id: id,
      name: json['name'] ?? id,
      description: json['description'] ?? '',
      symptoms: List<String>.from(json['symptoms'] ?? []),
      causes: List<String>.from(json['causes'] ?? []),
      treatment: List<String>.from(json['treatment'] ?? []),
      whenToSeeDoctor: List<String>.from(json['whenToSeeDoctor'] ?? []),
      severity: json['severity'] ?? 'unknown',
      color: json['color'] ?? '#808080',
    );
  }
}

/// Service to load disease information
class DiseaseInfoService {
  static const String _dataPath = 'assets/data/disease_info.json';
  
  Map<String, DiseaseInfo> _diseases = {};
  bool _isLoaded = false;

  Future<void> load() async {
    if (_isLoaded) return;
    
    try {
      final jsonString = await rootBundle.loadString(_dataPath);
      final Map<String, dynamic> jsonData = json.decode(jsonString);
      
      jsonData.forEach((key, value) {
        _diseases[key] = DiseaseInfo.fromJson(key, value);
      });
      
      _isLoaded = true;
    } catch (e) {
      print('Failed to load disease info: $e');
    }
  }

  DiseaseInfo? getInfo(String diseaseId) {
    return _diseases[diseaseId];
  }

  List<DiseaseInfo> get allDiseases => _diseases.values.toList();
}
