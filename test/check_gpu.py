#!/usr/bin/env python3
"""
Quick GPU Detection Test for TensorFlow

This script checks if TensorFlow can detect and use your GPU
after installing NVIDIA CUDA drivers.
"""

import tensorflow as tf
import sys

def check_gpu():
    """Check GPU availability and configuration"""
    print("="*60)
    print("TensorFlow GPU Detection Test")
    print("="*60)
    
    # Check TensorFlow version
    print(f"\n[INFO] TensorFlow version: {tf.__version__}")
    
    # Check if TensorFlow was built with CUDA support
    print(f"\n[INFO] Built with CUDA: {tf.test.is_built_with_cuda()}")
    
    # Check for GPU devices
    print("\n[INFO] Checking for GPU devices...")
    gpus = tf.config.list_physical_devices('GPU')
    cpus = tf.config.list_physical_devices('CPU')
    
    if gpus:
        print(f"\n[OK] Found {len(gpus)} GPU device(s):")
        for i, gpu in enumerate(gpus):
            print(f"  GPU {i}: {gpu.name}")
            print(f"    Type: {gpu.device_type}")
            
            # Try to get GPU details
            try:
                # Enable memory growth to avoid allocating all GPU memory
                tf.config.experimental.set_memory_growth(gpus[i], True)
                print(f"    Memory growth: Enabled")
            except RuntimeError as e:
                print(f"    Note: {e}")
            
            # Get GPU name and memory info
            try:
                # List logical devices (after memory growth config)
                logical_gpus = tf.config.list_logical_devices('GPU')
                if logical_gpus:
                    print(f"    Logical GPU: {logical_gpus[i].name}")
            except:
                pass
    
    else:
        print("\n[WARNING] No GPU devices found!")
        print("\nPossible reasons:")
        print("  1. CUDA Toolkit not installed or not in PATH")
        print("  2. cuDNN not installed")
        print("  3. TensorFlow version doesn't support your CUDA version")
        print("  4. GPU drivers not properly installed")
        
        print("\n[INFO] Checking CUDA libraries...")
        try:
            # Try to get CUDA version from TensorFlow
            cuda_version = tf.sysconfig.get_build_info()['cuda_version']
            cudnn_version = tf.sysconfig.get_build_info()['cudnn_version']
            print(f"  CUDA version TensorFlow was built with: {cuda_version}")
            print(f"  cuDNN version TensorFlow was built with: {cudnn_version}")
        except:
            print("  Could not detect CUDA/cuDNN versions")
    
    if cpus:
        print(f"\n[INFO] Found {len(cpus)} CPU device(s)")
    
    # Test GPU computation if available
    if gpus:
        print("\n" + "="*60)
        print("GPU Computation Test")
        print("="*60)
        
        try:
            # Simple computation test
            print("\n[INFO] Running simple computation test on GPU...")
            with tf.device('/GPU:0'):
                a = tf.constant([[1.0, 2.0], [3.0, 4.0]])
                b = tf.constant([[1.0, 1.0], [0.0, 1.0]])
                c = tf.matmul(a, b)
            
            print(f"[OK] Computation completed successfully!")
            print(f"[INFO] Result: {c.numpy()}")
            print(f"[OK] GPU is working and can be used for training!")
            return True
            
        except Exception as e:
            print(f"[ERROR] GPU computation failed: {e}")
            print("[INFO] GPU detected but cannot be used")
            return False
    else:
        print("\n[INFO] Training will use CPU (slower)")
        return False

if __name__ == "__main__":
    try:
        gpu_available = check_gpu()
        
        print("\n" + "="*60)
        print("Summary")
        print("="*60)
        if gpu_available:
            print("[OK] GPU is available and ready for training!")
            print("[INFO] You can now run training with GPU acceleration")
            print("[INFO] Training will be significantly faster (10-20x)")
            sys.exit(0)
        else:
            print("[WARNING] GPU is not available")
            print("[INFO] Training will use CPU (slower but will work)")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n[ERROR] Error during GPU check: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

