# WSL GPU Setup - Fixed for Modern Ubuntu

The error you saw is because modern Ubuntu (22.04+) has an "externally-managed-environment" that prevents system-wide pip installs. We need to use a virtual environment.

## Solution: Use Virtual Environment

Run this in WSL Ubuntu terminal:

```bash
cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test

# Run the fixed setup script
bash setup_wsl_venv.sh
```

Or manually:

```bash
cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test

# Install venv support
sudo apt-get update
sudo apt-get install -y python3-venv python3-pip

# Create virtual environment
python3 -m venv venv_gpu

# Activate it
source venv_gpu/bin/activate

# Install TensorFlow with GPU
pip install tensorflow[and-cuda]

# Install dependencies
pip install -r requirements_test.txt

# Test GPU
python check_gpu.py
```

## Running Training

After setup, activate the virtual environment and run:

```bash
cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test
source venv_gpu/bin/activate
python train_model.py --train_dir ../data/train --val_dir ../data/val --epochs 20
```

Or use the convenience script:

```bash
bash run_training_wsl.sh
```

## From PowerShell

You can also run from PowerShell:

```powershell
wsl --distribution Ubuntu -- bash -c "cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test && bash setup_wsl_venv.sh"
```

Then to run training:

```powershell
wsl --distribution Ubuntu -- bash -c "cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test && source venv_gpu/bin/activate && python train_model.py --train_dir ../data/train --val_dir ../data/val --epochs 20"
```

