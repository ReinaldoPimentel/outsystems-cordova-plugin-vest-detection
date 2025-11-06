# GPU cuDNN Workaround for WSL2

## Problem Identified

✅ **GPU works**: Simple operations (matrix multiply) work fine  
❌ **cuDNN convolutions fail**: All cuDNN convolution algorithms fail with `CUDNN_STATUS_EXECUTION_FAILED`

This is a known compatibility issue between:
- TensorFlow 2.20.0
- cuDNN 9.14
- WSL2 GPU passthrough
- GTX 1080 Ti (Compute Capability 6.1)

## Solutions to Try

### Option 1: Use TensorFlow 2.16 or 2.17 (May have better compatibility)

```bash
cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test
source venv_gpu/bin/activate
pip uninstall tensorflow
pip install tensorflow==2.16.2  # or 2.17.1
python test_gpu_cudnn.py
```

### Option 2: Modify Training Script to Use CPU for Convolutions

We can modify `train_model.py` to fallback to CPU for convolution layers if GPU fails, but this defeats the purpose.

### Option 3: Try Different CUDA/cuDNN Versions in WSL

The issue might be resolved with:
- CUDA 11.8 + cuDNN 8.9 (instead of CUDA 12.7 + cuDNN 9.14)
- This requires installing CUDA toolkit in WSL (not just drivers)

### Option 4: Use Native Linux (Not WSL)

Install Linux on a dual-boot or VM with direct GPU access - would likely work better.

### Option 5: Try PyTorch Instead

PyTorch often has better WSL2 GPU compatibility:
```bash
pip install torch torchvision
# Rewrite training script for PyTorch
```

### Option 6: Wait for TensorFlow/CUDA Updates

This is a known issue that may be fixed in future TensorFlow releases.

## Recommended Next Steps

1. **Try TensorFlow 2.16 or 2.17** (quick test)
2. **If that doesn't work, install CUDA 11.8 in WSL** (more involved)
3. **For immediate 200-image training, consider CPU** (will work, just slower)
4. **Long-term: Consider PyTorch or native Linux** (best GPU compatibility)

