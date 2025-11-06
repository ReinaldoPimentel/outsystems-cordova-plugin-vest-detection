# WSL GPU cuDNN Issue

## Problem
Training with GPU in WSL is encountering `CUDNN_STATUS_EXECUTION_FAILED` errors. This appears to be a compatibility issue between cuDNN 9.14 and WSL2 GPU passthrough.

## Workarounds Attempted
- Different batch sizes (16, 32, 64)
- XLA flags for algorithm fallback
- Disabling XLA

## Potential Solutions

### Option 1: Force CPU (for now)
To see training work, you can force CPU:
```bash
CUDA_VISIBLE_DEVICES=-1 python train_model.py --train_dir ../data/train --val_dir ../data/val --epochs 20
```

### Option 2: Check GPU Memory/Processes
Make sure GPU isn't locked by other processes:
```bash
nvidia-smi
```

### Option 3: Try Older TensorFlow Version
TensorFlow 2.15 might work better:
```bash
pip install tensorflow==2.15.0
```

### Option 4: Update WSL/NVIDIA Drivers
- Update WSL2: `wsl --update`
- Ensure latest NVIDIA drivers in Windows

### Option 5: Use Native Windows (CPU)
Since we confirmed TensorFlow 2.20 on Windows Python 3.13 is CPU-only anyway, you could just train on CPU from Windows PowerShell.

