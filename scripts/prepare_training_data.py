#!/usr/bin/env python3
"""
Prepare training data from DermNet dataset.
Extracts and organizes fungal skin disease images for training.
Limits to 50 images total for quick training/testing.
"""
import os
import shutil
import random
import zipfile
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
DERMNET_ZIP = BASE_DIR / "dermnet.zip"
EXTRACT_DIR = BASE_DIR / "data" / "dermnet_extracted"
TRAINING_DIR = BASE_DIR / "data" / "training_images"

# Number of images per class (total 50 images across 4 classes)
IMAGES_PER_CLASS = 12  # ~48 images total

# Mapping from DermNet folders/patterns to our class names
# The DermNet dataset has a folder: "Tinea Ringworm Candidiasis and other Fungal Infections"
FUNGAL_FOLDER = "Tinea Ringworm Candidiasis and other Fungal Infections"

# Patterns to match for each disease class
# DermNet uses various naming conventions (camelCase, hyphenated, etc.)
CLASS_PATTERNS = {
    "candidiasis": ["candid", "candida", "monialisis", "balanitis", "intertrigo", "perleche", "cheilitis"],
    "tinea_corporis": ["tineacorporis", "tinea-corporis", "ringworm", "kerion", "majocchi", "tineagroin", "tinea-groin"],
    "tinea_pedis": ["tineaped", "tineafeet", "tinea-pedis", "tinea-feet", "athletes-foot"],
    "tinea_versicolor": ["tineaversicolor", "tinea-versicolor", "pityriasis"]
}


def extract_dermnet():
    """Extract the DermNet zip file if not already extracted."""
    if EXTRACT_DIR.exists() and any(EXTRACT_DIR.iterdir()):
        print(f"   ✓ DermNet already extracted to {EXTRACT_DIR}")
        return True
    
    if not DERMNET_ZIP.exists():
        print(f"   ❌ DermNet zip file not found at {DERMNET_ZIP}")
        return False
    
    print(f"   📦 Extracting {DERMNET_ZIP.name}...")
    EXTRACT_DIR.mkdir(parents=True, exist_ok=True)
    
    with zipfile.ZipFile(DERMNET_ZIP, 'r') as zf:
        # Extract only the fungal folder to save time
        members_to_extract = [
            m for m in zf.namelist() 
            if FUNGAL_FOLDER in m and m.endswith(('.jpg', '.jpeg', '.png', '.bmp'))
        ]
        print(f"   📦 Extracting {len(members_to_extract)} fungal images...")
        for member in members_to_extract:
            zf.extract(member, EXTRACT_DIR)
    
    print(f"   ✓ Extraction complete")
    return True


def find_fungal_images():
    """Find all fungal-related images from the extracted dataset."""
    fungal_images = {cls: [] for cls in CLASS_PATTERNS.keys()}
    
    # Look in both train and test directories
    for split in ["train", "test"]:
        fungal_dir = EXTRACT_DIR / split / FUNGAL_FOLDER
        if not fungal_dir.exists():
            continue
        
        for img_file in fungal_dir.iterdir():
            if not img_file.is_file():
                continue
            filename_lower = img_file.name.lower()
            
            # Match to disease class based on filename patterns
            for disease_class, patterns in CLASS_PATTERNS.items():
                if any(pattern in filename_lower for pattern in patterns):
                    fungal_images[disease_class].append(img_file)
                    break
    
    return fungal_images


def prepare_training_data(max_per_class: int = IMAGES_PER_CLASS):
    """
    Prepare training data with limited images per class.
    
    Args:
        max_per_class: Maximum number of images per disease class
    """
    print("=" * 60)
    print("FungiGPT - Training Data Preparation (50 images)")
    print("=" * 60)
    
    # Step 1: Extract if needed
    print("\n1. Extracting DermNet dataset...")
    if not extract_dermnet():
        print("   ❌ Failed to extract dataset")
        return False
    
    # Step 2: Find fungal images
    print("\n2. Finding fungal images...")
    fungal_images = find_fungal_images()
    
    for cls, images in fungal_images.items():
        print(f"   Found {len(images)} images for {cls}")
    
    # Step 3: Create training directories and copy images
    print(f"\n3. Copying {max_per_class} images per class...")
    
    total_copied = 0
    for disease_class, images in fungal_images.items():
        class_dir = TRAINING_DIR / disease_class
        class_dir.mkdir(parents=True, exist_ok=True)
        
        # Clear existing images
        for existing in class_dir.glob("*.*"):
            existing.unlink()
        
        # Randomly select images
        selected = random.sample(images, min(max_per_class, len(images)))
        
        for i, img_path in enumerate(selected, 1):
            dest = class_dir / f"{disease_class}_{i:03d}{img_path.suffix}"
            shutil.copy2(img_path, dest)
            total_copied += 1
        
        print(f"   ✓ {disease_class}: {len(selected)} images copied")
    
    # Step 4: Summary
    print("\n" + "=" * 60)
    print("Preparation Complete!")
    print("=" * 60)
    print(f"\n📊 Training Data Summary:")
    print(f"   Total images: {total_copied}")
    print(f"   Location: {TRAINING_DIR}")
    print("\n   Classes:")
    for disease_class in CLASS_PATTERNS.keys():
        class_dir = TRAINING_DIR / disease_class
        if class_dir.exists():
            count = len(list(class_dir.glob("*.*")))
            print(f"     - {disease_class}: {count} images")
    
    print("\n✅ Ready to train! Run:")
    print(f"   python -m src.model.train --data_dir {TRAINING_DIR}")
    print("=" * 60)
    
    return True


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description='Prepare DermNet training data')
    parser.add_argument('--max_per_class', type=int, default=IMAGES_PER_CLASS,
                        help=f'Max images per class (default: {IMAGES_PER_CLASS})')
    args = parser.parse_args()
    
    prepare_training_data(args.max_per_class)
