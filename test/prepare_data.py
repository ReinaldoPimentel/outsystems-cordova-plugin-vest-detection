#!/usr/bin/env python3
"""
Helper script to organize training data

This script helps organize images into train/val split with vest/no_vest folders
"""

import os
import shutil
import argparse
from pathlib import Path

def organize_data(source_dir, output_dir, train_split=0.8):
    """
    Organize images into train/val structure
    
    Args:
        source_dir: Source directory with images
        output_dir: Output directory for organized data
        train_split: Ratio of data for training (default: 0.8 = 80%)
    """
    import random
    
    # Create directory structure
    train_vest_dir = os.path.join(output_dir, 'train', 'vest')
    train_no_vest_dir = os.path.join(output_dir, 'train', 'no_vest')
    val_vest_dir = os.path.join(output_dir, 'val', 'vest')
    val_no_vest_dir = os.path.join(output_dir, 'val', 'no_vest')
    
    for dir_path in [train_vest_dir, train_no_vest_dir, val_vest_dir, val_no_vest_dir]:
        os.makedirs(dir_path, exist_ok=True)
    
    # Get all image files
    image_extensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']
    
    # Organize from source
    vest_images = []
    no_vest_images = []
    
    # Look for images in source directory or subdirectories
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            if any(file.endswith(ext) for ext in image_extensions):
                filepath = os.path.join(root, file)
                
                # Try to determine class from filename or directory
                filename_lower = file.lower()
                if 'no_vest' in filename_lower or 'no_vest' in root.lower():
                    no_vest_images.append(filepath)
                elif 'vest' in filename_lower or 'vest' in root.lower():
                    vest_images.append(filepath)
    
    print(f"[INFO] Found {len(vest_images)} vest images")
    print(f"[INFO] Found {len(no_vest_images)} no_vest images")
    
    # Shuffle and split
    random.shuffle(vest_images)
    random.shuffle(no_vest_images)
    
    # Split vest images
    train_vest_count = int(len(vest_images) * train_split)
    for i, img_path in enumerate(vest_images):
        filename = os.path.basename(img_path)
        if i < train_vest_count:
            shutil.copy2(img_path, os.path.join(train_vest_dir, filename))
        else:
            shutil.copy2(img_path, os.path.join(val_vest_dir, filename))
    
    # Split no_vest images
    train_no_vest_count = int(len(no_vest_images) * train_split)
    for i, img_path in enumerate(no_vest_images):
        filename = os.path.basename(img_path)
        if i < train_no_vest_count:
            shutil.copy2(img_path, os.path.join(train_no_vest_dir, filename))
        else:
            shutil.copy2(img_path, os.path.join(val_no_vest_dir, filename))
    
    print(f"\n[OK] Data organized:")
    print(f"  Train vest: {train_vest_count} images")
    print(f"  Train no_vest: {train_no_vest_count} images")
    print(f"  Val vest: {len(vest_images) - train_vest_count} images")
    print(f"  Val no_vest: {len(no_vest_images) - train_no_vest_count} images")
    print(f"\n[INFO] Data structure created at: {output_dir}")

def main():
    parser = argparse.ArgumentParser(description='Organize training data')
    parser.add_argument('--source', type=str, required=True,
                        help='Source directory with images')
    parser.add_argument('--output', type=str, required=True,
                        help='Output directory for organized data')
    parser.add_argument('--split', type=float, default=0.8,
                        help='Train/val split ratio (default: 0.8)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.source):
        print(f"[ERROR] Source directory not found: {args.source}")
        return
    
    print(f"[INFO] Organizing data from {args.source} to {args.output}...")
    organize_data(args.source, args.output, args.split)
    print("[OK] Done!")

if __name__ == "__main__":
    main()

