# Training a New Vest Detection Model

This guide explains how to train a new vest detection model that will work correctly with the Android/iOS Cordova plugin.

## Prerequisites

1. **Python 3.8+** with TensorFlow 2.x
2. **Training Data**: Organized in folders with vest and no_vest images

## Data Organization

Organize your training data in this structure:

```
data/
├── train/
│   ├── vest/
│   │   ├── image1.jpg
│   │   ├── image2.jpg
│   │   └── ...
│   └── no_vest/
│       ├── image1.jpg
│       ├── image2.jpg
│       └── ...
└── val/  (validation/test set)
    ├── vest/
    │   ├── image1.jpg
    │   └── ...
    └── no_vest/
        ├── image1.jpg
        └── ...
```

## Training

### Basic Training

```bash
cd test
python train_model.py \
    --train_dir ../data/train \
    --val_dir ../data/val \
    --epochs 20 \
    --batch_size 32
```

### With Custom Output Path

```bash
python train_model.py \
    --train_dir ../data/train \
    --val_dir ../data/val \
    --output ../src/models/vest_model.tflite \
    --epochs 30
```

### Verify Model After Training

```bash
python train_model.py \
    --train_dir ../data/train \
    --val_dir ../data/val \
    --test_image test_images/Test1.png
```

## Model Architecture

The training script creates a MobileNetV2-based model:

- **Base**: Pre-trained MobileNetV2 (transfer learning)
- **Input**: 224x224 RGB images
- **Preprocessing**: Normalizes to [-1, 1] using `(pixel - 127.5) / 127.5`
- **Output**: Single sigmoid value [0, 1] where:
  - `0.0` = no_vest
  - `1.0` = vest

This matches exactly what the Android plugin expects!

## Training Parameters

- **Default epochs**: 20 (adjust based on your data size)
- **Batch size**: 32 (adjust based on your GPU/CPU memory)
- **Learning rate**: 0.0001 (Adam optimizer)
- **Early stopping**: Stops if validation accuracy doesn't improve for 5 epochs
- **Data augmentation**: Random rotations, shifts, flips (helps prevent overfitting)

## Output

The script will:
1. Save the best model to `best_vest_model.h5` during training
2. Convert to TensorFlow Lite format
3. Save to `../src/models/vest_model.tflite` (or custom path)

## Testing the New Model

After training, test with the test bench:

```bash
python test_model.py test_images/Test1.png test_images/Test2.png
```

Verify:
- Different images produce different outputs (not all 1.0)
- Vest images give confidence > 0.5
- No-vest images give confidence < 0.5

## Tips for Better Training

1. **Balanced Dataset**: Have roughly equal numbers of vest and no_vest images
2. **Diverse Data**: Include various lighting, angles, backgrounds
3. **Validation Set**: Use 20-30% of data for validation
4. **Monitor Metrics**: Watch for overfitting (training accuracy >> validation accuracy)
5. **More Epochs**: If validation accuracy is still improving, train longer

## Troubleshooting

### Model Always Predicts Same Value

- **Issue**: Model is overfitting or data is unbalanced
- **Solution**: 
  - Add more diverse training data
  - Use data augmentation (already enabled)
  - Check class balance in your dataset

### Low Validation Accuracy

- **Issue**: Model not learning effectively
- **Solution**:
  - Ensure enough training data (at least 100+ images per class)
  - Check data quality and labels
  - Try fine-tuning (unfreeze base model layers)

### Model Too Large

- **Issue**: TFLite model file is too big
- **Solution**:
  - Use a smaller MobileNetV2 alpha (e.g., 0.5 or 0.75)
  - Enable quantization in `convert_to_tflite()` function

