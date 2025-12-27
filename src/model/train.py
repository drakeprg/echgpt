"""
Training script for FungiGPT using Transfer Learning.
Uses MobileNetV2 pretrained on ImageNet for efficient mobile deployment.
"""
import os
import sys
import argparse
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import (
    EarlyStopping, 
    ModelCheckpoint, 
    ReduceLROnPlateau,
    TensorBoard
)

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import (
    IMG_SIZE, BATCH_SIZE, EPOCHS, LEARNING_RATE,
    FINE_TUNE_EPOCHS, FINE_TUNE_LR, VALIDATION_SPLIT,
    CLASS_NAMES, MODEL_SAVE_PATH
)
from preprocess import create_data_generators, remove_corrupted_images


def build_model(num_classes: int, input_shape: tuple = (*IMG_SIZE, 3)) -> Model:
    """
    Build MobileNetV2-based transfer learning model.
    
    Args:
        num_classes: Number of output classes
        input_shape: Input image shape (H, W, C)
    
    Returns:
        Compiled Keras model
    """
    # Load pretrained MobileNetV2 without top layers
    base_model = MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model layers initially
    base_model.trainable = False
    
    # Add custom classification head
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.5)(x)
    x = BatchNormalization()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    return model, base_model


def get_callbacks(model_path: str) -> list:
    """Create training callbacks."""
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    
    callbacks = [
        EarlyStopping(
            monitor='val_accuracy',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        ModelCheckpoint(
            model_path,
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.2,
            patience=5,
            min_lr=1e-7,
            verbose=1
        ),
        TensorBoard(
            log_dir='logs',
            histogram_freq=1
        )
    ]
    return callbacks


def plot_training_history(history, save_path: str = 'training_history.png'):
    """Plot and save training history."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    
    # Accuracy plot
    axes[0].plot(history.history['accuracy'], label='Training')
    axes[0].plot(history.history['val_accuracy'], label='Validation')
    axes[0].set_title('Model Accuracy')
    axes[0].set_xlabel('Epoch')
    axes[0].set_ylabel('Accuracy')
    axes[0].legend()
    axes[0].grid(True)
    
    # Loss plot
    axes[1].plot(history.history['loss'], label='Training')
    axes[1].plot(history.history['val_loss'], label='Validation')
    axes[1].set_title('Model Loss')
    axes[1].set_xlabel('Epoch')
    axes[1].set_ylabel('Loss')
    axes[1].legend()
    axes[1].grid(True)
    
    plt.tight_layout()
    plt.savefig(save_path)
    plt.show()
    print(f"Training history saved to {save_path}")


def validate_dataset(data_dir: str) -> tuple:
    """
    Validate dataset has sufficient data for training.
    
    Returns:
        Tuple of (is_valid, error_message, stats)
    """
    from pathlib import Path
    
    data_path = Path(data_dir)
    
    # Check if directory exists
    if not data_path.exists():
        return False, f"❌ Dataset directory not found: {data_dir}", {}
    
    # Count images per class
    class_counts = {}
    valid_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'}
    
    for class_dir in data_path.iterdir():
        if class_dir.is_dir() and not class_dir.name.startswith('.'):
            count = sum(1 for f in class_dir.iterdir() 
                       if f.is_file() and f.suffix.lower() in valid_extensions)
            if count > 0:
                class_counts[class_dir.name] = count
    
    # Validation checks
    MIN_CLASSES = 2
    MIN_IMAGES_PER_CLASS = 3  # Lowered for small datasets
    MIN_TOTAL_IMAGES = 20
    
    total_images = sum(class_counts.values())
    num_classes = len(class_counts)
    
    errors = []
    
    if num_classes == 0:
        errors.append(f"❌ No training images found in {data_dir}")
        errors.append("   Please upload images organized in class folders:")
        errors.append("   data/training_images/")
        errors.append("   ├── candidiasis/")
        errors.append("   ├── tinea_corporis/")
        errors.append("   ├── tinea_pedis/")
        errors.append("   └── tinea_versicolor/")
    elif num_classes < MIN_CLASSES:
        errors.append(f"❌ Insufficient disease classes: {num_classes} (minimum: {MIN_CLASSES})")
        errors.append(f"   Current classes: {', '.join(class_counts.keys())}")
        errors.append("   Please add images to at least 2 different disease folders")
    
    # Check images per class
    insufficient_classes = {k: v for k, v in class_counts.items() if v < MIN_IMAGES_PER_CLASS}
    if insufficient_classes and num_classes >= MIN_CLASSES:
        errors.append(f"❌ Some classes have too few images (minimum: {MIN_IMAGES_PER_CLASS} per class):")
        for cls, count in insufficient_classes.items():
            errors.append(f"   - {cls}: {count} images (need {MIN_IMAGES_PER_CLASS - count} more)")
    
    # Check total images
    if total_images < MIN_TOTAL_IMAGES and num_classes >= MIN_CLASSES:
        errors.append(f"❌ Insufficient total images: {total_images} (minimum: {MIN_TOTAL_IMAGES})")
        errors.append(f"   Please add {MIN_TOTAL_IMAGES - total_images} more images")
    
    stats = {
        "num_classes": num_classes,
        "total_images": total_images,
        "class_counts": class_counts
    }
    
    if errors:
        error_msg = "\n".join(errors)
        return False, error_msg, stats
    
    return True, None, stats


def train(data_dir: str, output_dir: str = 'models'):
    """
    Train the fungal skin disease classifier.
    
    Args:
        data_dir: Path to dataset directory
        output_dir: Directory to save model
    """
    print("=" * 60)
    print("FungiGPT - Training")
    print("=" * 60)
    
    # Validate dataset first
    print("\n1. Validating dataset...")
    is_valid, error_msg, stats = validate_dataset(data_dir)
    
    if not is_valid:
        print("\n" + "=" * 60)
        print("TRAINING ABORTED - Insufficient Data")
        print("=" * 60)
        print(error_msg)
        print("\n" + "=" * 60)
        raise ValueError(error_msg)
    
    # Show dataset stats
    print(f"   ✓ Found {stats['num_classes']} classes with {stats['total_images']} total images")
    for cls, count in stats['class_counts'].items():
        print(f"     - {cls}: {count} images")
    
    # Clean corrupted images
    print("\n2. Cleaning corrupted images...")
    removed = remove_corrupted_images(data_dir)
    if removed:
        print(f"   Removed {len(removed)} corrupted images")
    else:
        print("   All images valid")
    
    # Create data generators
    print("\n3. Creating data generators...")
    train_gen, val_gen = create_data_generators(data_dir, BATCH_SIZE, VALIDATION_SPLIT)
    print(f"   Training samples: {train_gen.samples}")
    print(f"   Validation samples: {val_gen.samples}")
    print(f"   Classes: {train_gen.class_indices}")
    
    num_classes = len(train_gen.class_indices)
    
    # Build model
    print("\n4. Building model...")
    model, base_model = build_model(num_classes)
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    print(f"   Model parameters: {model.count_params():,}")
    
    # Phase 1: Train classification head
    print("\n5. Phase 1: Training classification head...")
    model_path = os.path.join(output_dir, 'fungal_classifier.keras')
    callbacks = get_callbacks(model_path)
    
    history1 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS,
        callbacks=callbacks,
        verbose=1
    )
    
    # Phase 2: Fine-tune entire model
    print("\n6. Phase 2: Fine-tuning entire model...")
    base_model.trainable = True
    
    # Freeze first N layers (keep early feature extraction frozen)
    for layer in base_model.layers[:100]:
        layer.trainable = False
    
    model.compile(
        optimizer=Adam(learning_rate=FINE_TUNE_LR),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    history2 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=FINE_TUNE_EPOCHS,
        callbacks=callbacks,
        verbose=1
    )
    
    # Combine histories
    combined_history = {
        'accuracy': history1.history['accuracy'] + history2.history['accuracy'],
        'val_accuracy': history1.history['val_accuracy'] + history2.history['val_accuracy'],
        'loss': history1.history['loss'] + history2.history['loss'],
        'val_loss': history1.history['val_loss'] + history2.history['val_loss']
    }
    
    # Create a simple object to hold combined history
    class CombinedHistory:
        def __init__(self, h):
            self.history = h
    
    # Evaluate
    print("\n7. Evaluating model...")
    results = model.evaluate(val_gen)
    print(f"   Validation Loss: {results[0]:.4f}")
    print(f"   Validation Accuracy: {results[1]:.4f}")
    
    # Plot history
    print("\n8. Saving training plots...")
    plot_training_history(CombinedHistory(combined_history), 
                         os.path.join(output_dir, 'training_history.png'))
    
    # Save final model
    print("\n9. Saving final model...")
    model.save(model_path)
    print(f"   Model saved to: {model_path}")
    
    print("\n" + "=" * 60)
    print("Training complete!")
    print("=" * 60)
    
    return model


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train fungal skin disease classifier')
    parser.add_argument('--data_dir', type=str, required=True, help='Path to dataset directory')
    parser.add_argument('--output_dir', type=str, default='models', help='Output directory')
    args = parser.parse_args()
    
    train(args.data_dir, args.output_dir)
