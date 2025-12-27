"""
Export trained Keras model to TensorFlow Lite format for mobile deployment.
"""
import os
import argparse
import numpy as np
import tensorflow as tf
from config import TFLITE_MODEL_PATH, TFLITE_QUANT_PATH, CLASS_NAMES


def convert_to_tflite(keras_model_path: str, output_path: str, quantize: bool = False):
    """
    Convert Keras model to TensorFlow Lite format.
    
    Args:
        keras_model_path: Path to saved Keras model
        output_path: Output path for TFLite model
        quantize: Whether to apply int8 quantization
    """
    print(f"Loading model from {keras_model_path}...")
    model = tf.keras.models.load_model(keras_model_path)
    
    # Create converter
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    if quantize:
        print("Applying int8 quantization...")
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_types = [tf.int8]
        # For full integer quantization, you would need representative dataset
        # converter.representative_dataset = representative_data_gen
    else:
        print("Using float16 optimization...")
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        converter.target_spec.supported_types = [tf.float16]
    
    print("Converting model...")
    tflite_model = converter.convert()
    
    # Save model
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(tflite_model)
    
    # Get model size
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Model saved to: {output_path}")
    print(f"Model size: {size_mb:.2f} MB")
    
    return output_path


def create_labels_file(output_dir: str):
    """Create labels.txt file for TFLite model metadata."""
    labels_path = os.path.join(output_dir, 'labels.txt')
    with open(labels_path, 'w') as f:
        for class_name in CLASS_NAMES:
            f.write(f"{class_name}\n")
    print(f"Labels file saved to: {labels_path}")
    return labels_path


def verify_tflite_model(tflite_path: str, test_image_path: str = None):
    """
    Verify TFLite model works correctly.
    
    Args:
        tflite_path: Path to TFLite model
        test_image_path: Optional path to test image
    """
    print(f"\nVerifying TFLite model: {tflite_path}")
    
    # Load interpreter
    interpreter = tf.lite.Interpreter(model_path=tflite_path)
    interpreter.allocate_tensors()
    
    # Get input/output details
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    print(f"Input shape: {input_details[0]['shape']}")
    print(f"Input dtype: {input_details[0]['dtype']}")
    print(f"Output shape: {output_details[0]['shape']}")
    print(f"Output dtype: {output_details[0]['dtype']}")
    
    # Test with random input
    input_shape = input_details[0]['shape']
    test_input = np.random.randn(*input_shape).astype(np.float32)
    
    interpreter.set_tensor(input_details[0]['index'], test_input)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]['index'])
    
    print(f"Test output shape: {output.shape}")
    print(f"Test output (softmax): {output[0]}")
    print(f"Sum of probabilities: {np.sum(output[0]):.4f} (should be ~1.0)")
    
    if test_image_path and os.path.exists(test_image_path):
        print(f"\nTesting with real image: {test_image_path}")
        from preprocess import preprocess_image
        img = preprocess_image(test_image_path)
        
        interpreter.set_tensor(input_details[0]['index'], img.astype(np.float32))
        interpreter.invoke()
        output = interpreter.get_tensor(output_details[0]['index'])
        
        predicted_class = CLASS_NAMES[np.argmax(output[0])]
        confidence = np.max(output[0]) * 100
        print(f"Prediction: {predicted_class} ({confidence:.1f}%)")
    
    print("\n✓ TFLite model verification passed!")


def export_all(keras_model_path: str, output_dir: str = 'models'):
    """
    Export model to both float16 and quantized TFLite formats.
    """
    print("=" * 60)
    print("TensorFlow Lite Model Export")
    print("=" * 60)
    
    # Float16 model (recommended for mobile)
    float16_path = os.path.join(output_dir, 'fungal_classifier.tflite')
    convert_to_tflite(keras_model_path, float16_path, quantize=False)
    
    print("\n" + "-" * 40 + "\n")
    
    # Quantized model (smaller size)
    quant_path = os.path.join(output_dir, 'fungal_classifier_quant.tflite')
    convert_to_tflite(keras_model_path, quant_path, quantize=True)
    
    print("\n" + "-" * 40 + "\n")
    
    # Create labels file
    create_labels_file(output_dir)
    
    print("\n" + "-" * 40 + "\n")
    
    # Verify models
    verify_tflite_model(float16_path)
    
    print("\n" + "=" * 60)
    print("Export complete!")
    print("=" * 60)
    print(f"\nFiles ready for mobile integration:")
    print(f"  - {float16_path}")
    print(f"  - {quant_path}")
    print(f"  - {os.path.join(output_dir, 'labels.txt')}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Export Keras model to TFLite')
    parser.add_argument('--model', type=str, required=True, help='Path to Keras model')
    parser.add_argument('--output_dir', type=str, default='models', help='Output directory')
    parser.add_argument('--test_image', type=str, help='Optional test image path')
    args = parser.parse_args()
    
    export_all(args.model, args.output_dir)
