import 'dart:io';
import 'package:flutter/services.dart';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;

/// TensorFlow Lite classifier for fungal skin diseases
class ClassifierService {
  static const String _modelPath = 'assets/models/fungal_classifier.tflite';
  static const String _labelsPath = 'assets/models/labels.txt';
  static const int _inputSize = 224;
  
  Interpreter? _interpreter;
  List<String> _labels = [];
  bool _isInitialized = false;

  /// Initialize the classifier
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // Load model
      _interpreter = await Interpreter.fromAsset(_modelPath);
      
      // Load labels
      final labelsData = await rootBundle.loadString(_labelsPath);
      _labels = labelsData.split('\n')
          .map((l) => l.trim())
          .where((l) => l.isNotEmpty)
          .toList();
      
      _isInitialized = true;
      print('Classifier initialized with ${_labels.length} classes');
    } catch (e) {
      print('Failed to initialize classifier: $e');
      rethrow;
    }
  }

  /// Classify an image file
  Future<List<ClassificationResult>> classify(File imageFile) async {
    if (!_isInitialized) {
      await initialize();
    }

    // Load and preprocess image
    final imageBytes = await imageFile.readAsBytes();
    final image = img.decodeImage(imageBytes);
    
    if (image == null) {
      throw Exception('Failed to decode image');
    }

    // Resize to model input size
    final resizedImage = img.copyResize(
      image,
      width: _inputSize,
      height: _inputSize,
    );

    // Convert to input tensor
    final input = _imageToInput(resizedImage);
    
    // Prepare output tensor
    final output = List.filled(_labels.length, 0.0).reshape([1, _labels.length]);

    // Run inference
    _interpreter!.run(input, output);

    // Process results
    final results = <ClassificationResult>[];
    for (int i = 0; i < _labels.length; i++) {
      results.add(ClassificationResult(
        label: _labels[i],
        confidence: output[0][i],
      ));
    }

    // Sort by confidence
    results.sort((a, b) => b.confidence.compareTo(a.confidence));
    
    return results;
  }

  /// Convert image to model input format
  List<List<List<List<double>>>> _imageToInput(img.Image image) {
    final input = List.generate(
      1,
      (_) => List.generate(
        _inputSize,
        (_) => List.generate(
          _inputSize,
          (_) => List.filled(3, 0.0),
        ),
      ),
    );

    for (int y = 0; y < _inputSize; y++) {
      for (int x = 0; x < _inputSize; x++) {
        final pixel = image.getPixel(x, y);
        // MobileNetV2 preprocessing: scale to [-1, 1]
        input[0][y][x][0] = (pixel.r / 127.5) - 1.0;
        input[0][y][x][1] = (pixel.g / 127.5) - 1.0;
        input[0][y][x][2] = (pixel.b / 127.5) - 1.0;
      }
    }

    return input;
  }

  /// Dispose resources
  void dispose() {
    _interpreter?.close();
    _isInitialized = false;
  }
  
  List<String> get labels => _labels;
  bool get isInitialized => _isInitialized;
}

/// Classification result with label and confidence
class ClassificationResult {
  final String label;
  final double confidence;

  ClassificationResult({
    required this.label,
    required this.confidence,
  });

  String get confidencePercent => '${(confidence * 100).toStringAsFixed(1)}%';

  @override
  String toString() => '$label: $confidencePercent';
}
