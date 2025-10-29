#!/usr/bin/env python3
"""
Train Vest Detection Model for TensorFlow Lite

This script trains a binary classification model (vest/no_vest) and exports it
to TensorFlow Lite format with the same preprocessing used in the Android plugin.
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from PIL import Image
import argparse

def create_model(input_shape=(224, 224, 3)):
    """
    Create a MobileNetV2-based binary classification model
    
    This uses a pre-trained MobileNetV2 backbone for transfer learning,
    which is efficient for mobile deployment.
    """
    # Load MobileNetV2 as base model
    base_model = keras.applications.MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet',
        alpha=1.0  # Width multiplier (1.0 = full width, smaller = faster)
    )
    
    # Freeze base model initially for transfer learning
    base_model.trainable = False
    
    # Build the classification head
    inputs = keras.Input(shape=input_shape)
    
    # Note: Preprocessing is handled in ImageDataGenerator (rescaling to [0,1])
    # The Lambda layer normalization will be applied at inference time
    # For now, we'll handle normalization in the data generator
    
    # Base model (expects input in [0, 1] range from ImageDataGenerator)
    x = base_model(inputs, training=False)
    
    # Global average pooling
    x = layers.GlobalAveragePooling2D()(x)
    
    # Dropout for regularization
    x = layers.Dropout(0.2)(x)
    
    # Binary classification layer (sigmoid output: 0 = no_vest, 1 = vest)
    outputs = layers.Dense(1, activation='sigmoid')(x)
    
    model = keras.Model(inputs, outputs)
    
    return model

def create_data_generators(train_dir, val_dir, batch_size=32, target_size=(224, 224), validation_split=0.2):
    """
    Create data generators for training and validation
    
    Args:
        train_dir: Directory with train/vest and train/no_vest subdirectories
        val_dir: Directory with val/vest and val/no_vest subdirectories (or train_dir if auto-splitting)
        batch_size: Batch size for training
        target_size: Target image size (224x224)
        validation_split: Fraction of data to use for validation (if auto-splitting)
    """
    # Check if we need to auto-split
    import glob
    val_vest_files = glob.glob(os.path.join(val_dir, 'vest', '*.jpg')) + \
                     glob.glob(os.path.join(val_dir, 'vest', '*.jpeg')) + \
                     glob.glob(os.path.join(val_dir, 'vest', '*.png'))
    val_no_vest_files = glob.glob(os.path.join(val_dir, 'no_vest', '*.jpg')) + \
                        glob.glob(os.path.join(val_dir, 'no_vest', '*.jpeg')) + \
                        glob.glob(os.path.join(val_dir, 'no_vest', '*.png'))
    
    use_validation_split = len(val_vest_files) == 0 or len(val_no_vest_files) == 0
    
    # Data augmentation for training (helps prevent overfitting)
    # Note: We normalize in the generator, then apply [-1, 1] normalization after loading
    # This matches Android preprocessing: (pixel - 127.5) / 127.5
    train_datagen = ImageDataGenerator(
        preprocessing_function=lambda img: (img - 127.5) / 127.5,  # Normalize to [-1, 1] like Android
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        zoom_range=0.2,
        fill_mode='nearest',
        validation_split=validation_split if use_validation_split else 0.0  # Auto-split if no val data
    )
    
    # No augmentation for validation
    val_datagen = ImageDataGenerator(
        preprocessing_function=lambda img: (img - 127.5) / 127.5,  # Normalize to [-1, 1] like Android
        validation_split=validation_split if use_validation_split else 0.0
    )
    
    if use_validation_split:
        # Use train_dir for both, but split it
        print(f"[INFO] Auto-splitting data: {100*(1-validation_split):.0f}% train, {100*validation_split:.0f}% val")
        train_generator = train_datagen.flow_from_directory(
            train_dir,
            target_size=target_size,
            batch_size=batch_size,
            class_mode='binary',
            shuffle=True,
            subset='training'
        )
        
        val_generator = val_datagen.flow_from_directory(
            train_dir,
            target_size=target_size,
            batch_size=batch_size,
            class_mode='binary',
            shuffle=False,
            subset='validation'
        )
    else:
        # Use separate train and val directories
        train_generator = train_datagen.flow_from_directory(
            train_dir,
            target_size=target_size,
            batch_size=batch_size,
            class_mode='binary',
            shuffle=True
        )
        
        val_generator = val_datagen.flow_from_directory(
            val_dir,
            target_size=target_size,
            batch_size=batch_size,
            class_mode='binary',
            shuffle=False
        )
    
    return train_generator, val_generator

def train_model(model, train_generator, val_generator, epochs=20, steps_per_epoch=None, validation_steps=None):
    """
    Train the model with callbacks for best checkpoint and early stopping
    """
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.0001),
        loss='binary_crossentropy',
        metrics=['accuracy', 'precision', 'recall']
    )
    
    # Callbacks
    callbacks = []
    
    # Save best model (only if we have validation data)
    if validation_steps and validation_steps > 0:
        callbacks.append(
            keras.callbacks.ModelCheckpoint(
                'best_vest_model.h5',
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            )
        )
        callbacks.append(
            keras.callbacks.EarlyStopping(
                monitor='val_accuracy',
                patience=5,
                restore_best_weights=True,
                verbose=1
            )
        )
        callbacks.append(
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=3,
                verbose=1
            )
        )
    else:
        # Without validation, save model periodically
        callbacks.append(
            keras.callbacks.ModelCheckpoint(
                'best_vest_model.h5',
                monitor='loss',
                save_best_only=True,
                verbose=1
            )
        )
    
    # Train
    # Only include validation if we have validation data
    validation_data = val_generator if validation_steps and val_generator.samples > 0 else None
    
    history = model.fit(
        train_generator,
        epochs=epochs,
        steps_per_epoch=steps_per_epoch,
        validation_data=validation_data,
        validation_steps=validation_steps if validation_data else None,
        callbacks=callbacks,  # Callbacks are already configured based on validation data availability
        verbose=1
    )
    
    return history, model

def convert_to_tflite(model_path, output_path='vest_model.tflite'):
    """
    Convert Keras model to TensorFlow Lite format
    
    Args:
        model_path: Path to saved Keras model (.h5)
        output_path: Output path for .tflite file
    """
    print(f"\n[INFO] Converting {model_path} to TensorFlow Lite...")
    
    # Load the saved model
    # Enable unsafe deserialization for Lambda layers if needed
    try:
        model = keras.models.load_model(model_path, safe_mode=False)
    except ValueError as e:
        if "Lambda" in str(e) or "unsafe" in str(e):
            print("[WARNING] Lambda layer detected, using unsafe deserialization...")
            keras.config.enable_unsafe_deserialization()
            model = keras.models.load_model(model_path, safe_mode=False)
        else:
            raise
    
    # Create converter
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Optimize for size and speed (optional)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    
    # Convert
    tflite_model = converter.convert()
    
    # Save
    with open(output_path, 'wb') as f:
        f.write(tflite_model)
    
    print(f"[OK] TensorFlow Lite model saved to {output_path}")
    print(f"[INFO] Model size: {len(tflite_model) / (1024*1024):.2f} MB")
    
    return output_path

def verify_tflite_model(tflite_path, test_image_path):
    """
    Verify the TFLite model works correctly with a test image
    """
    print(f"\n[INFO] Verifying TFLite model with {test_image_path}...")
    
    # Load TFLite model
    interpreter = tf.lite.Interpreter(model_path=tflite_path)
    interpreter.allocate_tensors()
    
    # Get input/output details
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    print(f"[INFO] Input shape: {input_details[0]['shape']}")
    print(f"[INFO] Output shape: {output_details[0]['shape']}")
    
    # Load and preprocess test image
    img = Image.open(test_image_path).convert('RGB')
    img = img.resize((224, 224), Image.Resampling.LANCZOS)
    img_array = np.array(img, dtype=np.float32)
    
    # Normalize to [-1, 1] (same as Android preprocessing)
    img_array = (img_array - 127.5) / 127.5
    img_array = np.expand_dims(img_array, axis=0)
    
    # Run inference
    interpreter.set_tensor(input_details[0]['index'], img_array)
    interpreter.invoke()
    
    output = interpreter.get_tensor(output_details[0]['index'])
    
    print(f"[INFO] Output: {output}")
    print(f"[INFO] Prediction: {'vest' if output[0][0] > 0.5 else 'no_vest'} (confidence: {output[0][0]:.2%})")
    
    return output

def check_gpu():
    """Check and display GPU availability"""
    print("\n=== GPU Detection ===")
    gpus = tf.config.list_physical_devices('GPU')
    cpus = tf.config.list_physical_devices('CPU')
    
    if gpus:
        print(f"[OK] Found {len(gpus)} GPU(s):")
        for i, gpu in enumerate(gpus):
            print(f"  GPU {i}: {gpu.name}")
            try:
                tf.config.experimental.set_memory_growth(gpus[i], True)
                print(f"    Memory growth enabled")
            except RuntimeError as e:
                print(f"    Note: {e}")
        print(f"[INFO] Training will use GPU(s) - much faster!")
        return True
    else:
        print(f"[INFO] No GPU found, using CPU")
        print(f"[INFO] Training will be slower but will still work")
        if cpus:
            print(f"Found {len(cpus)} CPU(s)")
        return False

def main():
    parser = argparse.ArgumentParser(description='Train vest detection model for TensorFlow Lite')
    parser.add_argument('--train_dir', type=str, required=True,
                        help='Directory with train/vest and train/no_vest subdirectories')
    parser.add_argument('--val_dir', type=str, required=True,
                        help='Directory with val/vest and val/no_vest subdirectories')
    parser.add_argument('--epochs', type=int, default=20,
                        help='Number of training epochs (default: 20)')
    parser.add_argument('--batch_size', type=int, default=32,
                        help='Batch size (default: 32, increase if using GPU)')
    parser.add_argument('--output', type=str, default='../src/models/vest_model.tflite',
                        help='Output path for TFLite model (default: ../src/models/vest_model.tflite)')
    parser.add_argument('--test_image', type=str, default=None,
                        help='Test image path to verify model after conversion')
    parser.add_argument('--cpu_only', action='store_true',
                        help='Force CPU usage (ignore GPU)')
    
    args = parser.parse_args()
    
    print("="*60)
    print("Vest Detection Model Training")
    print("="*60)
    
    # Check GPU availability
    if args.cpu_only:
        print("\n[INFO] CPU-only mode requested")
        os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
        check_gpu()
    else:
        has_gpu = check_gpu()
        if has_gpu:
            # Increase batch size if GPU available (utilizes GPU better)
            if args.batch_size == 32:
                suggested_batch_size = 64
                print(f"\n[INFO] Suggestion: Consider using --batch_size {suggested_batch_size} for better GPU utilization")
    
    # Check directories exist
    if not os.path.exists(args.train_dir):
        print(f"[ERROR] Training directory not found: {args.train_dir}")
        return
    
    # Check if validation directory has images
    import glob
    val_vest_count = len(glob.glob(os.path.join(args.val_dir, 'vest', '*.*'))) + \
                     len(glob.glob(os.path.join(args.val_dir, 'vest', '*.jpg'))) + \
                     len(glob.glob(os.path.join(args.val_dir, 'vest', '*.jpeg'))) + \
                     len(glob.glob(os.path.join(args.val_dir, 'vest', '*.png')))
    val_no_vest_count = len(glob.glob(os.path.join(args.val_dir, 'no_vest', '*.*'))) + \
                        len(glob.glob(os.path.join(args.val_dir, 'no_vest', '*.jpg'))) + \
                        len(glob.glob(os.path.join(args.val_dir, 'no_vest', '*.jpeg'))) + \
                        len(glob.glob(os.path.join(args.val_dir, 'no_vest', '*.png')))
    
    if val_vest_count == 0 or val_no_vest_count == 0:
        print(f"\n[WARNING] Validation directory is empty or has insufficient data!")
        print(f"[INFO] Will split training data automatically (80% train, 20% val)")
        print(f"[INFO] To use separate validation set, add images to: {args.val_dir}")
        
        # Auto-split: we'll use validation_split parameter in flow_from_directory
        auto_split_validation = True
        val_dir_for_split = args.train_dir  # Use train dir but split it
    else:
        auto_split_validation = False
        val_dir_for_split = args.val_dir
    
    # Create model
    print("\n[INFO] Creating model...")
    model = create_model()
    print(f"[OK] Model created")
    model.summary()
    
    # Create data generators
    print(f"\n[INFO] Creating data generators...")
    train_generator, val_generator = create_data_generators(
        args.train_dir,
        val_dir_for_split if 'val_dir_for_split' in locals() else args.val_dir,
        batch_size=args.batch_size,
        validation_split=0.2 if 'auto_split_validation' in locals() and auto_split_validation else 0.0
    )
    
    print(f"[OK] Training samples: {train_generator.samples}")
    print(f"[OK] Validation samples: {val_generator.samples}")
    print(f"[OK] Class indices: {train_generator.class_indices}")
    
    # Calculate steps - ensure at least 1 step even with small datasets
    steps_per_epoch = max(1, train_generator.samples // args.batch_size)
    validation_steps = max(1, val_generator.samples // args.batch_size) if val_generator.samples > 0 else None
    
    print(f"\n[INFO] Steps per epoch: {steps_per_epoch}")
    if validation_steps:
        print(f"[INFO] Validation steps: {validation_steps}")
    else:
        print(f"[INFO] No validation data - training without validation")
    
    # Train model
    print(f"\n[INFO] Starting training...")
    history, model = train_model(
        model,
        train_generator,
        val_generator,
        epochs=args.epochs,
        steps_per_epoch=steps_per_epoch,
        validation_steps=validation_steps
    )
    
    # Evaluate final model (if validation data exists)
    if val_generator.samples > 0 and validation_steps:
        print(f"\n[INFO] Evaluating model...")
        val_loss, val_accuracy, val_precision, val_recall = model.evaluate(
            val_generator,
            steps=validation_steps,
            verbose=1
        )
        
        print(f"\n[INFO] Final Validation Metrics:")
        print(f"  Accuracy: {val_accuracy:.2%}")
        print(f"  Precision: {val_precision:.2%}")
        print(f"  Recall: {val_recall:.2%}")
    else:
        print(f"\n[INFO] No validation data - skipping evaluation")
    
    # Convert to TFLite - save model in a way that avoids Lambda layer issues
    print(f"\n[INFO] Saving final model...")
    try:
        # Save the current model (which has no Lambda layer)
        final_model_path = 'final_vest_model.keras'
        model.save(final_model_path)
        print(f"[OK] Model saved to {final_model_path}")
        
        # Convert to TFLite directly from the in-memory model
        print(f"[INFO] Converting to TensorFlow Lite...")
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        tflite_model = converter.convert()
        
        with open(args.output, 'wb') as f:
            f.write(tflite_model)
        
        print(f"[OK] TensorFlow Lite model saved to {args.output}")
        print(f"[INFO] Model size: {len(tflite_model) / (1024*1024):.2f} MB")
        
        # Verify if test image provided
        if args.test_image and os.path.exists(args.test_image):
            verify_tflite_model(args.output, args.test_image)
            
    except Exception as e:
        print(f"[ERROR] Error converting model: {e}")
        print(f"[INFO] Trying to load from best_vest_model.h5 instead...")
        if os.path.exists('best_vest_model.h5'):
            try:
                convert_to_tflite('best_vest_model.h5', args.output)
            except Exception as e2:
                print(f"[ERROR] Could not convert from saved file: {e2}")
                print(f"[INFO] Model training completed but conversion failed. Model is still in memory.")
    
    print("\n[OK] Training complete!")
    print(f"[INFO] Model saved to: {args.output}")
    print(f"\n[INFO] Next steps:")
    print(f"  1. Test the model with: python test_model.py <image_path>")
    print(f"  2. Replace ../src/models/vest_model.tflite if satisfied")
    print(f"  3. Rebuild your Android app")

if __name__ == "__main__":
    main()

