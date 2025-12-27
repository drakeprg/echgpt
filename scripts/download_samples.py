#!/usr/bin/env python3
"""
Download sample fungal skin disease images for training FungiGPT.
Uses publicly available images from DermNet NZ for educational purposes.
"""
import os
import urllib.request
import ssl
from pathlib import Path

# Disable SSL verification for downloading (some sites have cert issues)
ssl._create_default_https_context = ssl._create_unverified_context

BASE_DIR = Path(__file__).parent.parent
TRAINING_DIR = BASE_DIR / "data" / "training_images"

# Sample image URLs from various public sources
# These are placeholder URLs - in production, use proper dataset APIs
SAMPLE_IMAGES = {
    "candidiasis": [
        # Sample candidiasis images (using placeholder approach)
        ("https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Candida_albicans_PHIL_3192_lores.jpg/440px-Candida_albicans_PHIL_3192_lores.jpg", "candida_1.jpg"),
        ("https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Human_tongue_infected_with_oral_candidiasis.jpg/440px-Human_tongue_infected_with_oral_candidiasis.jpg", "candida_2.jpg"),
    ],
    "tinea_corporis": [
        # Sample tinea corporis (ringworm) images
        ("https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Ringworm_on_the_arm%2C_or_%22Tinea_corporis%22_PHIL_2938_lores.jpg/440px-Ringworm_on_the_arm%2C_or_%22Tinea_corporis%22_PHIL_2938_lores.jpg", "tinea_corporis_1.jpg"),
    ],
    "tinea_pedis": [
        # Sample tinea pedis (athlete's foot) images  
        ("https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Athlete%27s_foot_-_tinea_pedis.jpg/440px-Athlete%27s_foot_-_tinea_pedis.jpg", "tinea_pedis_1.jpg"),
    ],
    "tinea_versicolor": [
        # Sample tinea versicolor images
        ("https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tinea_versicolor_1.jpg/440px-Tinea_versicolor_1.jpg", "tinea_versicolor_1.jpg"),
    ]
}

def download_images():
    """Download sample images for each disease class."""
    print("=" * 60)
    print("FungiGPT - Sample Dataset Downloader")
    print("=" * 60)
    print("\nNote: Using publicly available images for educational purposes.")
    print("For production, please use a proper medical dataset from Kaggle.\n")
    
    total_downloaded = 0
    
    for disease_class, images in SAMPLE_IMAGES.items():
        class_dir = TRAINING_DIR / disease_class
        class_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"\n📁 {disease_class}:")
        
        for url, filename in images:
            filepath = class_dir / filename
            
            # Skip if already exists
            if filepath.exists():
                print(f"   ⏭️  {filename} (already exists)")
                continue
            
            try:
                print(f"   ⬇️  Downloading {filename}...", end=" ")
                urllib.request.urlretrieve(url, filepath)
                print("✅")
                total_downloaded += 1
            except Exception as e:
                print(f"❌ Failed: {e}")
    
    print(f"\n{'=' * 60}")
    print(f"Downloaded {total_downloaded} new images")
    
    # Show counts
    print("\n📊 Dataset Summary:")
    for disease_class in SAMPLE_IMAGES.keys():
        class_dir = TRAINING_DIR / disease_class
        if class_dir.exists():
            count = len(list(class_dir.glob("*.*")))
            print(f"   {disease_class}: {count} images")
    
    print("\n⚠️  NOTE: This is a minimal sample dataset.")
    print("For better results, download a full dataset from Kaggle:")
    print("https://www.kaggle.com/datasets/shubhamgoel27/dermnet")
    print("=" * 60)

if __name__ == "__main__":
    download_images()
