# FungiGPT

A cross-platform application for identifying common fungal skin diseases using machine learning.

## Features

- 📷 **Camera Capture**: Take photos of skin conditions directly
- 🖼️ **Gallery Selection**: Choose existing photos for analysis
- 🔒 **Offline-First**: AI runs on-device (TFLite on mobile, TensorFlow.js on web)
- 📱 **Cross-Platform**: Works on iOS, Android, and Web
- 🎨 **iOS-Native Feel**: Sleek UI with iOS blue theme, haptics, and smooth animations
- 📚 **Educational**: Learn about each condition with detailed information

## Supported Conditions

1. **Candidiasis** - Yeast infection of the skin
2. **Tinea Corporis** - Ringworm of the body
3. **Tinea Pedis** - Athlete's foot
4. **Tinea Versicolor** - Discolored skin patches

## Project Structure

```
echgpt/
├── src/
│   ├── model/
│   │   ├── config.py          # Configuration settings
│   │   ├── preprocess.py      # Image preprocessing
│   │   ├── train.py           # Training script with MobileNetV2
│   │   └── export_tflite.py   # TFLite conversion
│   └── admin/
│       ├── main.py            # FastAPI admin backend
│       └── auth.py            # Authentication middleware
├── mobile/                    # React Native Expo app
│   ├── app/                   # Expo Router pages
│   ├── components/            # UI components (iOS-style)
│   ├── services/              # ML classifier service
│   └── stores/                # Zustand state management
├── mobile_flutter_backup/     # Old Flutter app (archived)
├── data/
│   ├── disease_info.json      # Disease information
│   └── training_images/       # Training dataset
├── models/                    # Trained models
└── requirements.txt           # Python dependencies
```

## Quick Start

### 1. Train the Model

```bash
# Install dependencies
pip install -r requirements.txt

# Train model
python src/model/train.py --data_dir data/training_images

# Export to TFLite
python src/model/export_tflite.py --model models/fungal_classifier.keras
```

### 2. Run the Mobile App

```bash
cd mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Mobile Framework** | React Native + Expo |
| **UI Styling** | NativeWind (TailwindCSS) |
| **Navigation** | Expo Router |
| **State** | Zustand |
| **ML (Web)** | TensorFlow.js |
| **ML (Native)** | TFLite |
| **Backend** | FastAPI (Python) |

## Admin Dashboard

The admin backend provides a web interface for:
- 📤 **Upload Training Images** - Add new images with disease labels
- 🖼️ **Manage Training Data** - View, organize, delete training images
- 📋 **Edit Disease Info** - Update symptoms, treatment info
- 🧠 **Trigger Training** - Start model training with one click

### Run Admin Dashboard
```bash
pip install -r requirements.txt
python src/admin/main.py
# Open http://localhost:8000 in browser
```

## Disclaimer

⚠️ **This app is for educational purposes only.** It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for skin conditions.

## License

MIT License
