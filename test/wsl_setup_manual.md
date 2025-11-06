# WSL GPU Setup - Manual Steps

The automated script requires sudo permissions which can hang in non-interactive mode. 

## Run These Commands in WSL Ubuntu Terminal

Open a WSL Ubuntu terminal (not PowerShell) and run:

```bash
# Navigate to project
cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test

# Step 1: Install pip
sudo apt-get update
sudo apt-get install -y python3-pip

# Step 2: Install TensorFlow with GPU support (this will take a few minutes)
pip3 install --user tensorflow[and-cuda]

# Step 3: Install other dependencies
pip3 install --user -r requirements_test.txt

# Step 4: Verify GPU works
python3 check_gpu.py
```

## From PowerShell (Alternative)

If you prefer, you can run individual commands from PowerShell:

```powershell
# Install pip
wsl --distribution Ubuntu -- sudo apt-get update
wsl --distribution Ubuntu -- sudo apt-get install -y python3-pip

# Install TensorFlow
wsl --distribution Ubuntu -- bash -c "pip3 install --user tensorflow[and-cuda]"

# Install dependencies
wsl --distribution Ubuntu -- bash -c "cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test && pip3 install --user -r requirements_test.txt"

# Test GPU
wsl --distribution Ubuntu -- bash -c "cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test && python3 check_gpu.py"
```

## Expected Result

After installation, `python3 check_gpu.py` should show:
- ✅ `Built with CUDA: True`
- ✅ `GPU devices: [PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')]`

## Then Run Training

```bash
cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test
python3 train_model.py --train_dir ../data/train --val_dir ../data/val --epochs 20
```

