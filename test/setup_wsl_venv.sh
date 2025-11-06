#!/bin/bash
# WSL2 GPU Setup Script using Virtual Environment
# Run this script inside WSL Ubuntu

set -e  # Exit on error

echo "============================================================"
echo "WSL2 GPU Setup for TensorFlow Training (Virtual Environment)"
echo "============================================================"

# Navigate to project directory
PROJECT_DIR="/mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test"
cd "$PROJECT_DIR" || exit 1

echo ""
echo "[1/6] Installing python3-venv..."
sudo apt-get update -qq
sudo apt-get install -y python3-venv python3-pip

echo ""
echo "[2/6] Creating virtual environment..."
python3 -m venv venv_gpu

echo ""
echo "[3/6] Activating virtual environment..."
source venv_gpu/bin/activate

echo ""
echo "[4/6] Upgrading pip..."
pip install --upgrade pip

echo ""
echo "[5/6] Installing TensorFlow with GPU support..."
pip install tensorflow[and-cuda]

echo ""
echo "[6/6] Installing other dependencies..."
pip install -r requirements_test.txt

echo ""
echo "[7/7] Verifying GPU setup..."
python -c "
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
echo "To activate the virtual environment in the future, run:"
echo "  source venv_gpu/bin/activate"
echo ""
echo "Then you can run:"
echo "  python check_gpu.py"
echo "  python train_model.py --train_dir ../data/train --val_dir ../data/val --epochs 20"
echo ""

