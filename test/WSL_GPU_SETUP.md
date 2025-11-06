# WSL2 GPU Setup for TensorFlow Training

## Current Status

✅ **WSL2 Ubuntu**: Installed and running  
✅ **GPU Access**: NVIDIA drivers working (nvidia-smi shows GPU)  
✅ **Python 3.12.3**: Available in WSL  
❌ **TensorFlow**: Not yet installed in WSL

## Why WSL2 Works

WSL2 with Ubuntu allows you to use TensorFlow with **full GPU support** including:
- TensorFlow 2.20.0 with CUDA support
- Python 3.12 or 3.13 (both supported on Linux)
- Native GPU acceleration

## Quick Setup (Run in WSL Ubuntu)

Open WSL Ubuntu terminal and run these commands:

```bash
# 1. Navigate to your project
cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test

# 2. Install pip (if not already installed)
sudo apt-get update
sudo apt-get install -y python3-pip

# 3. Install TensorFlow with GPU support
pip3 install --user tensorflow[and-cuda]

# 4. Install other dependencies
pip3 install --user -r requirements_test.txt

# 5. Verify GPU detection
python3 check_gpu.py
```

## Alternative: Use pip without --user (if you have permissions)

If you want to install system-wide:
```bash
sudo pip3 install tensorflow[and-cuda]
sudo pip3 install -r requirements_test.txt
```

## Running Training from WSL

Once set up, you can run training from WSL:

```bash
cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test
python3 train_model.py --train_dir ../data/train --val_dir ../data/val --epochs 20
```

## From Windows PowerShell

You can also run commands from Windows PowerShell:

```powershell
wsl --distribution Ubuntu -- bash -c "cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test && python3 train_model.py --train_dir ../data/train --val_dir ../data/val --epochs 20"
```

## Verification

After setup, test GPU with:
```bash
python3 -c "import tensorflow as tf; print('TF:', tf.__version__); print('CUDA:', tf.test.is_built_with_cuda()); print('GPU:', tf.config.list_physical_devices('GPU'))"
```

Expected output:
- `TF: 2.20.0`
- `CUDA: True` ✅
- `GPU: [PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')]` ✅

## Troubleshooting

### CUDA not found in WSL
- Make sure NVIDIA drivers are installed in Windows (you have them ✅)
- Restart WSL: `wsl --shutdown` then restart

### Permission errors
- Use `--user` flag with pip3
- Or use `sudo` if you're comfortable with it

### Import errors
- Make sure you're using `python3` not `python`
- Check installation: `python3 -m pip list | grep tensorflow`

