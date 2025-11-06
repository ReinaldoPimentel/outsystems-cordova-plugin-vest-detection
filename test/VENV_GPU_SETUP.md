# venv_gpu Folder Setup Guide

## Overview

The `venv_gpu` folder contains a Python virtual environment configured for TensorFlow GPU training. This folder is **NOT tracked by Git** due to its large size (28,000+ files) and Windows path length limitations. This document explains how to recreate this environment.

## Why venv_gpu is Ignored

- **Size**: Contains 28,445+ files from TensorFlow and dependencies
- **Path Length**: Windows has a 260-character path limit, and deep TensorFlow paths exceed this
- **Platform-Specific**: Virtual environments are platform-specific and shouldn't be version controlled
- **Regenerable**: Can be recreated from requirements files

## Current Configuration

Based on the existing `venv_gpu/pyvenv.cfg`:
- **Python Version**: 3.12.3
- **Platform**: Linux (WSL2) - `/usr/bin/python3.12`
- **System Packages**: Excluded (`include-system-site-packages = false`)
- **Location**: `test/venv_gpu/`

## Required Dependencies

### Core Dependencies (from `requirements_test.txt`)

```
numpy>=1.21.0
tensorflow>=2.10.0
Pillow>=9.0.0
```

### TensorFlow GPU Support

The environment includes TensorFlow with CUDA support. Based on the setup scripts, it uses:
- **TensorFlow**: Version 2.17.1 (or latest with `tensorflow[and-cuda]`)
- **CUDA**: Version 12.x (compatible with TensorFlow 2.17+)
- **cuDNN**: Version 9.x (required for TensorFlow 2.17+)

## Setup Instructions

### Option 1: WSL2 Setup (Recommended - Original Method)

This is the method used to create the original `venv_gpu` folder. It works best for GPU support on Windows.

#### Prerequisites
1. **WSL2** installed and configured
2. **NVIDIA GPU drivers** installed in Windows
3. **CUDA Toolkit** installed in WSL2 (if needed)
4. **Ubuntu** distribution in WSL2

#### Steps

1. **Open WSL2 Ubuntu terminal**

2. **Navigate to the test directory**:
   ```bash
   cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test
   ```
   (Adjust the path if your username is different)

3. **Run the setup script**:
   ```bash
   bash setup_wsl_venv.sh
   ```

   Or manually:
   ```bash
   # Install python3-venv if not already installed
   sudo apt-get update
   sudo apt-get install -y python3-venv python3-pip

   # Create virtual environment
   python3 -m venv venv_gpu

   # Activate virtual environment
   source venv_gpu/bin/activate

   # Upgrade pip
   pip install --upgrade pip

   # Install TensorFlow with GPU support
   pip install tensorflow[and-cuda]

   # Install other dependencies
   pip install -r requirements_test.txt
   ```

4. **Verify GPU setup**:
   ```bash
   python check_gpu.py
   ```

### Option 2: Windows Native Setup

If you prefer to work directly in Windows (without WSL2):

#### Prerequisites
1. **Python 3.12.x** installed from python.org
2. **NVIDIA GPU** with drivers installed
3. **CUDA Toolkit 12.x** (optional, for GPU support)
4. **cuDNN 9.x** (optional, for GPU support)

#### Steps

1. **Open PowerShell or Command Prompt**

2. **Navigate to the test directory**:
   ```powershell
   cd C:\Users\reina\Documents\AFCode\outsystems-cordova-plugin-vest-detection\test
   ```

3. **Create virtual environment**:
   ```powershell
   python -m venv venv_gpu
   ```

4. **Activate virtual environment**:
   ```powershell
   # PowerShell
   .\venv_gpu\Scripts\Activate.ps1

   # Command Prompt
   venv_gpu\Scripts\activate.bat
   ```

5. **Upgrade pip**:
   ```powershell
   python -m pip install --upgrade pip
   ```

6. **Install TensorFlow**:
   ```powershell
   # For GPU support (requires CUDA/cuDNN)
   pip install tensorflow[and-cuda]

   # OR for CPU-only (simpler, but slower)
   pip install tensorflow
   ```

7. **Install other dependencies**:
   ```powershell
   pip install -r requirements_test.txt
   ```

8. **Verify setup**:
   ```powershell
   python check_gpu.py
   ```

### Option 3: Using setup_gpu_tensorflow.py

You can also use the interactive setup script:

```bash
python setup_gpu_tensorflow.py
```

This script will:
- Detect your CUDA version
- Offer installation options
- Guide you through the setup process

## Verification

After setup, verify the environment works:

1. **Activate the virtual environment**:
   - WSL2: `source venv_gpu/bin/activate`
   - Windows: `venv_gpu\Scripts\Activate.ps1`

2. **Check GPU availability**:
   ```bash
   python check_gpu.py
   ```

3. **Test TensorFlow import**:
   ```python
   python -c "import tensorflow as tf; print('TensorFlow version:', tf.__version__)"
   ```

## Expected Folder Structure

After setup, `venv_gpu/` should contain:

```
venv_gpu/
├── bin/                    # Executables (Linux/WSL) or Scripts/ (Windows)
│   ├── activate            # Activation script
│   ├── python              # Python interpreter
│   ├── pip                 # Package installer
│   └── tensorboard         # TensorBoard (if installed)
├── lib/                    # Installed packages
│   └── python3.12/
│       └── site-packages/   # All Python packages
│           ├── tensorflow/  # TensorFlow library
│           ├── numpy/       # NumPy library
│           ├── Pillow/     # PIL library
│           └── ...         # Other dependencies
├── include/                # Header files
├── pyvenv.cfg             # Virtual environment config
└── lib64 -> lib/          # Symlink (Linux only)
```

## Usage

### Activating the Environment

**WSL2/Linux**:
```bash
source venv_gpu/bin/activate
```

**Windows PowerShell**:
```powershell
.\venv_gpu\Scripts\Activate.ps1
```

**Windows Command Prompt**:
```cmd
venv_gpu\Scripts\activate.bat
```

### Running Training Scripts

Once activated, you can run:

```bash
# Check GPU availability
python check_gpu.py

# Train the model
python train_model.py --train_dir ../data/train --val_dir ../data/val --epochs 20

# Test the model
python test_model.py --model_path best_vest_model.h5 --test_dir test_images/
```

### Deactivating

When done, deactivate the environment:
```bash
deactivate
```

## Troubleshooting

### GPU Not Detected

1. **Check NVIDIA drivers**:
   ```bash
   nvidia-smi
   ```

2. **Verify CUDA installation**:
   ```bash
   nvcc --version
   ```

3. **Check TensorFlow CUDA support**:
   ```python
   import tensorflow as tf
   print(tf.test.is_built_with_cuda())
   ```

4. **See GPU_SETUP.md** for detailed troubleshooting

### Path Length Issues on Windows

If you encounter path length errors:
1. Enable long path support in Windows (Group Policy or registry)
2. Use WSL2 instead (recommended)
3. Move the project to a shorter path (e.g., `C:\dev\project`)

### Import Errors

If you get import errors after setup:
1. Ensure the virtual environment is activated
2. Reinstall dependencies: `pip install -r requirements_test.txt`
3. Check Python version: `python --version` (should be 3.12.x)

### Permission Errors (WSL2)

If you get permission errors in WSL2:
```bash
sudo chown -R $USER:$USER venv_gpu/
```

## Updating Dependencies

To update the environment:

1. **Activate the environment**

2. **Update pip**:
   ```bash
   pip install --upgrade pip
   ```

3. **Update packages**:
   ```bash
   pip install --upgrade tensorflow numpy Pillow
   ```

4. **Or reinstall from requirements**:
   ```bash
   pip install -r requirements_test.txt --upgrade
   ```

## Recreating from Scratch

If you need to completely recreate the environment:

1. **Delete the old environment**:
   ```bash
   # WSL2/Linux
   rm -rf venv_gpu/

   # Windows
   rmdir /s venv_gpu
   ```

2. **Follow the setup instructions above**

## Notes

- The virtual environment is **platform-specific**. A WSL2 environment won't work in Windows PowerShell and vice versa.
- The environment size is approximately **2-3 GB** after installation.
- GPU support requires NVIDIA GPU with compatible drivers and CUDA/cuDNN.
- CPU-only training will work but will be significantly slower (10-20x).

## Related Files

- `requirements_test.txt` - Python package dependencies
- `setup_wsl_venv.sh` - Automated WSL2 setup script
- `setup_gpu_tensorflow.py` - Interactive GPU setup script
- `check_gpu.py` - GPU detection and verification script
- `train_model.py` - Model training script
- `GPU_SETUP.md` - Additional GPU setup documentation

## Summary

The `venv_gpu` folder is a standard Python virtual environment containing:
- **Python 3.12.3**
- **TensorFlow 2.17.1** (or latest) with GPU support
- **NumPy >= 1.21.0**
- **Pillow >= 9.0.0**
- All transitive dependencies

It can be recreated at any time using the instructions above. The folder is excluded from Git to avoid sync issues and because virtual environments should not be version controlled.

