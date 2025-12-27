"""
Image preprocessing utilities for training and inference.
"""
import os
from PIL import Image
import numpy as np
import tensorflow as tf
from config import IMG_SIZE


def is_valid_image(filepath: str) -> bool:
    """Check if a file is a valid image."""
    try:
        img = Image.open(filepath)
        img.verify()
        return True
    except Exception:
        return False


def remove_corrupted_images(root_path: str) -> list:
    """
    Walk through dataset directory and remove corrupted images.
    Returns list of removed file paths.
    """
    removed_files = []
    for subdir, dirs, files in os.walk(root_path):
        for file in files:
            filepath = os.path.join(subdir, file)
            if not is_valid_image(filepath):
                removed_files.append(filepath)
                os.remove(filepath)
    return removed_files


def preprocess_image(image_path: str, target_size: tuple = IMG_SIZE) -> np.ndarray:
    """
    Load and preprocess a single image for inference.
    
    Args:
        image_path: Path to the image file
        target_size: Target size (height, width)
    
    Returns:
        Preprocessed image array with batch dimension
    """
    img = tf.keras.preprocessing.image.load_img(image_path, target_size=target_size)
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    # MobileNetV2 preprocessing: scale to [-1, 1]
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def preprocess_image_bytes(image_bytes: bytes, target_size: tuple = IMG_SIZE) -> np.ndarray:
    """
    Preprocess image from bytes (for API/mobile use).
    
    Args:
        image_bytes: Raw image bytes
        target_size: Target size (height, width)
    
    Returns:
        Preprocessed image array with batch dimension
    """
    img = tf.io.decode_image(image_bytes, channels=3)
    img = tf.image.resize(img, target_size)
    img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
    img = tf.expand_dims(img, axis=0)
    return img.numpy()


def create_data_generators(data_dir: str, batch_size: int, validation_split: float = 0.2):
    """
    Create training and validation data generators with augmentation.
    
    Args:
        data_dir: Path to dataset directory
        batch_size: Batch size for training
        validation_split: Fraction for validation
    
    Returns:
        Tuple of (train_generator, validation_generator)
    """
    # Data augmentation for training
    train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
        preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        vertical_flip=True,
        fill_mode='nearest',
        validation_split=validation_split
    )
    
    # No augmentation for validation
    val_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
        preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input,
        validation_split=validation_split
    )
    
    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=IMG_SIZE,
        batch_size=batch_size,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )
    
    val_generator = val_datagen.flow_from_directory(
        data_dir,
        target_size=IMG_SIZE,
        batch_size=batch_size,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    return train_generator, val_generator
