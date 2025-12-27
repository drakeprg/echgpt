# Configuration for FungiGPT

# Image settings
IMG_SIZE = (224, 224)  # MobileNetV2 default input size
BATCH_SIZE = 16
CHANNELS = 3

# Training settings
EPOCHS = 50
LEARNING_RATE = 0.001
FINE_TUNE_EPOCHS = 20
FINE_TUNE_LR = 0.0001

# Data split
VALIDATION_SPLIT = 0.2
TEST_SPLIT = 0.1

# Class labels
CLASS_NAMES = [
    'candidiasis',
    'tinea_corporis', 
    'tinea_pedis',
    'tinea_versicolor'
]

# Disease information for UI
DISEASE_INFO = {
    'candidiasis': {
        'name': 'Candidiasis',
        'description': 'A fungal infection caused by Candida yeast, commonly affecting moist areas of the skin.',
        'symptoms': ['Red, itchy rash', 'Skin irritation', 'White patches', 'Scaling or cracking'],
        'treatment': 'Antifungal creams or oral medications. Keep affected area clean and dry.',
        'severity': 'mild_to_moderate'
    },
    'tinea_corporis': {
        'name': 'Tinea Corporis (Ringworm)',
        'description': 'A fungal infection of the body skin, characterized by circular, ring-shaped rashes.',
        'symptoms': ['Ring-shaped rash', 'Red, scaly border', 'Clear center', 'Itching'],
        'treatment': 'Topical antifungal creams. Severe cases may require oral antifungal medication.',
        'severity': 'mild_to_moderate'
    },
    'tinea_pedis': {
        'name': 'Tinea Pedis (Athlete\'s Foot)',
        'description': 'A fungal infection affecting the feet, especially between the toes.',
        'symptoms': ['Itching and burning', 'Cracked, peeling skin', 'Blisters', 'Dry, scaly skin'],
        'treatment': 'Antifungal powders, sprays, or creams. Keep feet dry and wear breathable footwear.',
        'severity': 'mild'
    },
    'tinea_versicolor': {
        'name': 'Tinea Versicolor',
        'description': 'A fungal infection causing discolored patches of skin, usually on the trunk.',
        'symptoms': ['Discolored skin patches', 'Mild itching', 'Scaling', 'Patches that tan unevenly'],
        'treatment': 'Antifungal shampoos, creams, or oral medications. May recur in warm weather.',
        'severity': 'mild'
    }
}

# Model paths
MODEL_SAVE_PATH = 'models/fungal_classifier.keras'
TFLITE_MODEL_PATH = 'models/fungal_classifier.tflite'
TFLITE_QUANT_PATH = 'models/fungal_classifier_quant.tflite'
