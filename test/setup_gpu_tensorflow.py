#!/usr/bin/env python3
"""
Setup TensorFlow with GPU Support for Windows

This script helps install TensorFlow with CUDA support on Windows.
"""

import subprocess
import sys

def check_cuda_version():
    """Check CUDA version from nvidia-smi"""
    try:
        result = subprocess.run(['nvidia-smi'], capture_output=True, text=True)
        for line in result.stdout.split('\n'):
            if 'CUDA Version:' in line:
                # Extract version (e.g., "12.7" from "CUDA Version: 12.7")
                parts = line.split('CUDA Version:')
                if len(parts) > 1:
                    version = parts[1].strip().split()[0]
                    return version
    except:
        pass
    return None

def main():
    print("="*60)
    print("TensorFlow GPU Setup for Windows")
    print("="*60)
    
    cuda_version = check_cuda_version()
    if cuda_version:
        print(f"\n[INFO] Detected CUDA version: {cuda_version}")
    else:
        print("\n[WARNING] Could not detect CUDA version from nvidia-smi")
        print("[INFO] Assuming CUDA 12.x is available")
    
    print("\n[INFO] Current TensorFlow installation: CPU-only")
    print("[INFO] Need to install TensorFlow with CUDA support")
    
    print("\n" + "="*60)
    print("Installation Options")
    print("="*60)
    
    print("\nOption 1: TensorFlow 2.20.0 with CUDA (Recommended)")
    print("  Command: pip install tensorflow[and-cuda]")
    print("  - Latest version with CUDA support")
    print("  - Requires CUDA 12.x and cuDNN 9.x")
    
    print("\nOption 2: TensorFlow 2.15.0 (More stable on Windows)")
    print("  Command: pip install tensorflow==2.15.0")
    print("  - Better Windows compatibility")
    print("  - Requires CUDA 11.x or 12.x")
    print("  - More tested on Windows")
    
    print("\n" + "="*60)
    print("What you need:")
    print("="*60)
    print("1. CUDA Toolkit 12.x (from NVIDIA website)")
    print("2. cuDNN 9.x (from NVIDIA developer website)")
    print("3. TensorFlow with CUDA support")
    
    print("\n[INFO] After installation, run: python check_gpu.py")
    print("\nWould you like to:")
    print("  [1] Install tensorflow[and-cuda] (TensorFlow 2.20.0)")
    print("  [2] Install tensorflow==2.15.0")
    print("  [3] Just show instructions (no installation)")
    
    choice = input("\nEnter choice (1/2/3): ").strip()
    
    if choice == "1":
        print("\n[INFO] Installing tensorflow[and-cuda]...")
        subprocess.run([sys.executable, "-m", "pip", "uninstall", "-y", "tensorflow"])
        subprocess.run([sys.executable, "-m", "pip", "install", "tensorflow[and-cuda]"])
        print("\n[OK] Installation complete!")
        print("[INFO] Run 'python check_gpu.py' to verify GPU support")
        
    elif choice == "2":
        print("\n[INFO] Installing tensorflow==2.15.0...")
        subprocess.run([sys.executable, "-m", "pip", "uninstall", "-y", "tensorflow"])
        subprocess.run([sys.executable, "-m", "pip", "install", "tensorflow==2.15.0"])
        print("\n[OK] Installation complete!")
        print("[INFO] Run 'python check_gpu.py' to verify GPU support")
        
    elif choice == "3":
        print("\n[INFO] Manual installation instructions:")
        print("\nFor TensorFlow 2.20.0 with CUDA:")
        print("  pip uninstall tensorflow")
        print("  pip install tensorflow[and-cuda]")
        print("\nFor TensorFlow 2.15.0 (more stable):")
        print("  pip uninstall tensorflow")
        print("  pip install tensorflow==2.15.0")
        
    else:
        print("\n[INFO] Invalid choice. No changes made.")

if __name__ == "__main__":
    main()

