# Training Data Directory

This directory contains your training and validation images for the vest detection model.

## 📋 Labeling Guide

**READ THIS FIRST**: Before adding images, check [`LABELING_GUIDE.md`](LABELING_GUIDE.md) to understand:
- What counts as "vest" vs "no_vest"
- How to handle edge cases
- What visual features to look for
- Quality requirements for images

## Structure

```
data/
├── train/
│   ├── vest/          ← Put training images WITH vests here
│   └── no_vest/       ← Put training images WITHOUT vests here
└── val/
    ├── vest/          ← Put validation images WITH vests here
    └── no_vest/       ← Put validation images WITHOUT vests here
```

## Quick Start

1. **Add your training images**:
   - Images with vests → `train/vest/`
   - Images without vests → `train/no_vest/`

2. **Add your validation images** (20-30% of total):
   - Images with vests → `val/vest/`
   - Images without vests → `val/no_vest/`

3. **Recommended dataset size**:
   - Minimum: 50-100 images per class per set (train + val)
   - Better: 200+ images per class per set
   - Balanced: Roughly equal numbers of vest and no_vest images

4. **Run training** (after populating folders):
   ```bash
   cd test
   python train_model.py \
       --train_dir ../data/train \
       --val_dir ../data/val \
       --epochs 20
   ```

## Tips

- **Diversity**: Include various lighting conditions, angles, backgrounds
- **Quality**: Clear images where vests are visible (or clearly absent)
- **Balance**: Try to have roughly equal numbers of vest and no_vest images
- **Validation split**: Use 20-30% of your images for validation, rest for training

## Supported Image Formats

- `.jpg` / `.jpeg`
- `.png`
- Case-insensitive (`.JPG`, `.PNG` also work)

## Current Status

Check folder contents:
```bash
# Count images in each folder
find data/train/vest -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | wc -l
find data/train/no_vest -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | wc -l
find data/val/vest -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | wc -l
find data/val/no_vest -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | wc -l
```

