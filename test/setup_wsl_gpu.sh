#!/bin/bash
# WSL2 GPU Setup Script for TensorFlow
# Run this script inside WSL Ubuntu

set -e  # Exit on error

echo "============================================================"
echo "WSL2 GPU Setup for TensorFlow Training"
echo "============================================================"

# Navigate to project directory
PROJECT_DIR="/mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test"
cd "$PROJECT_DIR" || exit 1

echo ""
echo "[1/5] Installing pip..."
sudo apt-get update -qq
sudo apt-get install -y python3-pip python3-venv

echo ""
echo "[2/5] Checking Python version..."
python3 --version

echo ""
echo "[3/5] Installing TensorFlow with GPU support..."
pip3 install --user tensorflow[and-cuda]

echo ""
echo "[4/5] Installing other dependencies..."
pip3 install --user -r requirements_test.txt

echo ""
echo "[5/5] Verifying GPU setup..."
python3 -c "
import tensorflow as tf
print('TensorFlow version:', tf.__version__)
print('Built with CUDA:', tf.test.is_built_with_cuda())
gpus = tf.config.list_physical_devices('GPU')
print('GPU devices:', gpus)
if gpus:
    print('✅ GPU is available and ready!')
else:
    print('❌ GPU not detected')
"

echo ""
echo "============================================================"
echo "Setup complete!"
echo "============================================================"
echo ""
echo "To test GPU detection, run:"
echo "  python3 check_gpu.py"
echo ""
echo "To run training, use:"
echo "  python3 train_model.py --train_dir ../data/train --val_dir ../data/val --epochs 20"
echo ""

