#!/usr/bin/env python3
"""
TensorFlow Lite Vest Detection Model Test Bench

This script tests the vest_model.tflite model with various images
to validate the model behavior and preprocessing pipeline.
"""

import numpy as np
import tensorflow as tf
from PIL import Image
import sys
import os

# Model paths (relative to test/ folder, so ../src/models)
MODEL_PATH = "../src/models/vest_model.tflite"
LABELS_PATH = "../src/models/labels.txt"

def load_labels():
    """Load labels from labels.txt"""
    labels = []
    try:
        with open(LABELS_PATH, 'r') as f:
            for line in f:
                label = line.strip()
                if label:
                    labels.append(label)
        print(f"[OK] Loaded {len(labels)} labels: {labels}")
        return labels
    except FileNotFoundError:
        print(f"[ERROR] {LABELS_PATH} not found")
        sys.exit(1)

def load_model():
    """Load TensorFlow Lite model"""
    try:
        interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()
        print(f"[OK] Model loaded from {MODEL_PATH}")
        return interpreter
    except Exception as e:
        print(f"[ERROR] Error loading model: {e}")
        sys.exit(1)

def get_model_info(interpreter):
    """Get model input and output information"""
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    print("\n=== Model Information ===")
    print(f"Input shape: {input_details[0]['shape']}")
    print(f"Input dtype: {input_details[0]['dtype']}")
    print(f"Input name: {input_details[0]['name']}")
    print(f"Output shape: {output_details[0]['shape']}")
    print(f"Output dtype: {output_details[0]['dtype']}")
    print(f"Output name: {output_details[0]['name']}")
    
    return input_details, output_details

def preprocess_image(image_path, target_size=224, normalize_method="127.5"):
    """
    Preprocess image for TensorFlow Lite model
    
    Args:
        image_path: Path to the image file
        target_size: Target image size (224x224)
        normalize_method: Normalization method
            - "127.5": Normalize to [-1, 1] using (pixel - 127.5) / 127.5
            - "255": Normalize to [0, 1] using pixel / 255.0
            - "imagenet": ImageNet normalization (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    
    Returns:
        Preprocessed image as numpy array with shape [1, 224, 224, 3]
    """
    try:
        # Load and resize image
        img = Image.open(image_path).convert('RGB')
        img = img.resize((target_size, target_size), Image.Resampling.LANCZOS)
        img_array = np.array(img, dtype=np.float32)
        
        print(f"\n=== Preprocessing: {image_path} ===")
        print(f"Original image shape: {img_array.shape}")
        print(f"Pixel value range: [{img_array.min()}, {img_array.max()}]")
        
        # Normalize
        if normalize_method == "127.5":
            # Normalize to [-1, 1] using mean=127.5, std=127.5
            img_array = (img_array - 127.5) / 127.5
            print(f"Normalization: (pixel - 127.5) / 127.5 -> range [-1, 1]")
        elif normalize_method == "255":
            # Normalize to [0, 1]
            img_array = img_array / 255.0
            print(f"Normalization: pixel / 255.0 -> range [0, 1]")
        elif normalize_method == "imagenet":
            # ImageNet normalization
            mean = np.array([0.485, 0.456, 0.406])
            std = np.array([0.229, 0.224, 0.225])
            img_array = (img_array / 255.0 - mean) / std
            print(f"Normalization: ImageNet (mean/std)")
        else:
            raise ValueError(f"Unknown normalization method: {normalize_method}")
        
        print(f"Normalized range: [{img_array.min():.3f}, {img_array.max():.3f}]")
        
        # Reshape to batch format [1, 224, 224, 3]
        img_array = np.expand_dims(img_array, axis=0)
        print(f"Final shape: {img_array.shape}")
        
        return img_array
        
    except Exception as e:
        print(f"[ERROR] Error preprocessing image: {e}")
        return None

def run_inference(interpreter, input_data):
    """Run inference on the model"""
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    # Set input tensor
    interpreter.set_tensor(input_details[0]['index'], input_data)
    
    # Run inference
    interpreter.invoke()
    
    # Get output
    output_data = interpreter.get_tensor(output_details[0]['index'])
    
    return output_data

def interpret_results(output, labels):
    """
    Interpret model output
    
    The model might output:
    - Shape [1, 1]: Single sigmoid output (vest probability)
    - Shape [1, 2]: Two logits (no_vest, vest)
    """
    print(f"\n=== Model Output ===")
    print(f"Output shape: {output.shape}")
    print(f"Output values (raw): {output}")
    print(f"Output values (full precision): {output.astype(np.float64)}")
    print(f"Output dtype: {output.dtype}")
    
    if output.shape == (1, 1):
        # Single sigmoid output
        vest_prob = output[0][0]
        no_vest_prob = 1.0 - vest_prob
        
        print(f"\n=== Interpretation (Sigmoid Output) ===")
        print(f"Raw output: {vest_prob}")
        print(f"Raw output (full precision): {vest_prob:.15f}")
        print(f"no_vest probability: {no_vest_prob:.15f}")
        print(f"vest probability: {vest_prob:.15f}")
        print(f"Prediction: {labels[1] if vest_prob > 0.5 else labels[0]} (confidence: {max(vest_prob, no_vest_prob):.2%})")
        
        return {
            "detected": vest_prob > 0.5,
            "confidence": float(vest_prob),
            "results": [
                {"label": labels[0], "confidence": float(no_vest_prob)},
                {"label": labels[1], "confidence": float(vest_prob)}
            ]
        }
    
    elif output.shape == (1, 2):
        # Two class logits
        print(f"\n=== Interpretation (Logits Output) ===")
        
        # Apply softmax if needed (check if values look like logits or probabilities)
        if np.any(output < 0) or np.any(output > 1):
            # Looks like logits, apply softmax
            exp_output = np.exp(output - np.max(output))
            probs = exp_output / np.sum(exp_output)
            print("Applied softmax to logits")
        else:
            probs = output
        
        no_vest_prob = probs[0][0]
        vest_prob = probs[0][1]
        
        print(f"no_vest probability: {no_vest_prob:.6f}")
        print(f"vest probability: {vest_prob:.6f}")
        print(f"Prediction: {labels[1] if vest_prob > no_vest_prob else labels[0]} (confidence: {max(vest_prob, no_vest_prob):.2%})")
        
        return {
            "detected": vest_prob > no_vest_prob,
            "confidence": float(vest_prob),
            "results": [
                {"label": labels[0], "confidence": float(no_vest_prob)},
                {"label": labels[1], "confidence": float(vest_prob)}
            ]
        }
    else:
        print(f"[ERROR] Unexpected output shape: {output.shape}")
        return None

def test_image(interpreter, image_path, normalize_method="127.5"):
    """Test a single image"""
    print(f"\n{'='*60}")
    print(f"Testing: {image_path}")
    print('='*60)
    
    if not os.path.exists(image_path):
        print(f"[ERROR] Image not found: {image_path}")
        return None
    
    # Preprocess
    input_data = preprocess_image(image_path, normalize_method=normalize_method)
    if input_data is None:
        return None
    
    # Run inference
    output = run_inference(interpreter, input_data)
    
    # Interpret results
    labels = load_labels()
    result = interpret_results(output, labels)
    
    return result

def main():
    """Main test function"""
    print("="*60)
    print("TensorFlow Lite Vest Detection Model Test Bench")
    print("="*60)
    
    # Load model
    interpreter = load_model()
    input_details, output_details = get_model_info(interpreter)
    
    # Load labels
    labels = load_labels()
    
    # Test with command line arguments (image paths)
    if len(sys.argv) < 2:
        print("\n" + "="*60)
        print("Usage: python test_model.py <image1> [image2] ... [--normalize METHOD]")
        print("\nNormalize methods:")
        print("  127.5   - (pixel - 127.5) / 127.5 -> [-1, 1] (default)")
        print("  255     - pixel / 255.0 -> [0, 1]")
        print("  imagenet - ImageNet normalization")
        print("\nExample:")
        print("  python test_model.py test_images/vest.jpg test_images/no_vest.jpg")
        print("  python test_model.py test_images/vest.jpg --normalize 255")
        print("="*60)
        sys.exit(0)
    
    # Parse arguments
    image_paths = []
    normalize_method = "127.5"
    
    i = 1
    while i < len(sys.argv):
        if sys.argv[i] == "--normalize" and i + 1 < len(sys.argv):
            normalize_method = sys.argv[i + 1]
            i += 2
        else:
            image_paths.append(sys.argv[i])
            i += 1
    
    if not image_paths:
        print("[ERROR] No images provided")
        sys.exit(1)
    
    print(f"\nUsing normalization method: {normalize_method}")
    print(f"Testing {len(image_paths)} image(s)\n")
    
    # Test each image
    results = []
    for image_path in image_paths:
        result = test_image(interpreter, image_path, normalize_method=normalize_method)
        if result:
            results.append((image_path, result))
    
    # Summary
    print(f"\n{'='*60}")
    print("Test Summary")
    print('='*60)
    for image_path, result in results:
        print(f"\n{image_path}:")
        print(f"  Detected: {result['detected']}")
        print(f"  Confidence: {result['confidence']:.2%}")
        print(f"  no_vest: {result['results'][0]['confidence']:.2%}")
        print(f"  vest: {result['results'][1]['confidence']:.2%}")

if __name__ == "__main__":
    main()

