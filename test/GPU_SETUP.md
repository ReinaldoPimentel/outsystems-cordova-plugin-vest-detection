# GPU Setup for TensorFlow on Windows

Your GTX 1080Ti is detected by nvidia-smi but TensorFlow isn't using it.

## The Issue

TensorFlow 2.20.0 on Windows may not have CUDA support compiled in by default. Your GPU is working (nvidia-smi shows it), but TensorFlow needs CUDA libraries.

## Solutions

### Option 1: Use TensorFlow 2.15 (Recommended for Windows)

TensorFlow 2.15 has better Windows CUDA support:

```bash
pip uninstall tensorflow tensorflow-and-cuda
pip install tensorflow==2.15.0
```

This version works well with CUDA 11.x/12.x on Windows.

### Option 2: Install CUDA Toolkit

If you want to use TensorFlow 2.20.0:

1. **Download CUDA Toolkit 12.x** from NVIDIA
2. **Install cuDNN** (copy DLLs to CUDA directory)
3. **Set environment variables**:
   ```powershell
   $env:CUDA_PATH = "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.x"
   $env:PATH = "$env:CUDA_PATH\bin;$env:PATH"
   ```

### Option 3: Use WSL2 (Linux on Windows)

If you have WSL2, TensorFlow GPU support works better there:
- Install NVIDIA drivers in Windows
- Install CUDA in WSL2
- Run training in WSL2

## Quick Test

After setup, test GPU detection:
```python
import tensorflow as tf
print("GPU devices:", tf.config.list_physical_devices('GPU'))
print("CUDA available:", tf.test.is_built_with_cuda())
```

## For Now

Training will continue on CPU - it will work, just slower. With your 1080Ti, GPU training would be **10-20x faster**, but CPU training is fine for small datasets (40 images).

## Current Training

Training is running with the fixed model architecture (no Lambda layer). Once complete, the model will be converted to TensorFlow Lite and saved to `../src/models/vest_model.tflite`.

