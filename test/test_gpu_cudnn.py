#!/usr/bin/env python3
"""
Test GPU and cuDNN functionality
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Reduce logging
os.environ['TF_FORCE_GPU_ALLOW_GROWTH'] = '1'

import tensorflow as tf

print("TensorFlow version:", tf.__version__)
print("Built with CUDA:", tf.test.is_built_with_cuda())

# Configure GPU
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    print(f"\nFound {len(gpus)} GPU(s)")
    for gpu in gpus:
        print(f"  {gpu.name}")
        tf.config.experimental.set_memory_growth(gpu, True)
    
    # Test 1: Simple operations
    print("\n=== Test 1: Simple GPU Operations ===")
    try:
        with tf.device('/GPU:0'):
            a = tf.random.normal([100, 100])
            b = tf.matmul(a, a)
            result = b.numpy()
        print("✅ Simple GPU operations: PASSED")
    except Exception as e:
        print(f"❌ Simple GPU operations: FAILED - {e}")
    
    # Test 2: Convolution (what's failing in training)
    print("\n=== Test 2: Convolution Operations ===")
    try:
        with tf.device('/GPU:0'):
            # Simple 2D convolution
            input_data = tf.random.normal([1, 224, 224, 3])
            filters = tf.random.normal([3, 3, 3, 32])
            conv = tf.nn.conv2d(input_data, filters, strides=[1, 2, 2, 1], padding='SAME')
            result = conv.numpy()
        print("✅ Convolution operations: PASSED")
    except Exception as e:
        print(f"❌ Convolution operations: FAILED - {e}")
        print(f"   Error type: {type(e).__name__}")
    
    # Test 3: Try with deterministic cuDNN
    print("\n=== Test 3: Deterministic cuDNN ===")
    try:
        os.environ['TF_CUDNN_DETERMINISTIC'] = '1'
        with tf.device('/GPU:0'):
            input_data = tf.random.normal([8, 224, 224, 3])
            filters = tf.random.normal([3, 3, 3, 32])
            conv = tf.nn.conv2d(input_data, filters, strides=[1, 2, 2, 1], padding='SAME')
            result = conv.numpy()
        print("✅ Deterministic cuDNN: PASSED")
    except Exception as e:
        print(f"❌ Deterministic cuDNN: FAILED - {e}")
    
    # Test 4: Small batch size
    print("\n=== Test 4: Small Batch Size ===")
    try:
        with tf.device('/GPU:0'):
            input_data = tf.random.normal([1, 224, 224, 3])
            filters = tf.random.normal([3, 3, 3, 32])
            conv = tf.nn.conv2d(input_data, filters, strides=[1, 2, 2, 1], padding='SAME')
            result = conv.numpy()
        print("✅ Small batch: PASSED")
    except Exception as e:
        print(f"❌ Small batch: FAILED - {e}")
else:
    print("\n❌ No GPU found")

