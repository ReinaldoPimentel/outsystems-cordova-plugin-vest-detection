# TensorFlow Lite Model Test Bench

This test bench validates the `vest_model.tflite` model before integration into the Android/iOS Cordova plugin.

## Setup

1. Install dependencies:
```bash
cd test
pip install -r requirements_test.txt
```

## Usage

### Basic Usage

Test one or more images (from the `test` directory):
```bash
cd test
python test_model.py ../path/to/image1.jpg ../path/to/image2.jpg
```

### Test Different Normalization Methods

The model might expect different preprocessing. Test different normalization methods:

```bash
# Default: (pixel - 127.5) / 127.5 → range [-1, 1]
python test_model.py ../test_images/vest.jpg

# Normalize to [0, 1]
python test_model.py ../test_images/vest.jpg --normalize 255

# ImageNet normalization
python test_model.py ../test_images/vest.jpg --normalize imagenet
```

## What the Test Does

1. **Loads the model** and displays input/output tensor information
2. **Preprocesses images** with the specified normalization method
3. **Runs inference** and shows raw model output
4. **Interprets results** based on output shape:
   - `[1, 1]`: Single sigmoid output (treats as vest probability)
   - `[1, 2]`: Two-class output (applies softmax if needed)

## Expected Output

The test will show:
- Model input/output tensor shapes and types
- Preprocessing steps and value ranges
- Raw model output
- Interpreted probabilities for each class
- Final prediction

## Troubleshooting

If the model doesn't work correctly:

1. **Check output shape**: The model might output `[1, 1]` (sigmoid) or `[1, 2]` (logits)
2. **Try different normalization**: The model might expect different preprocessing
3. **Validate with known images**: Test with images you know should detect vest/no-vest
4. **Compare output values**: Note the raw values to understand if they're logits or probabilities

## Next Steps

Once the test bench shows correct results:
1. Verify the preprocessing matches what we use in Java/Android
2. Confirm the output interpretation logic matches
3. Use the same normalization method in the Android plugin

