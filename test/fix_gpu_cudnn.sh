#!/bin/bash
# Fix GPU cuDNN issues by trying TensorFlow 2.15

set -e

echo "============================================================"
echo "Attempting to fix GPU cuDNN issues"
echo "============================================================"

cd /mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test
source venv_gpu/bin/activate

echo ""
echo "Current TensorFlow version:"
python -c "import tensorflow as tf; print(tf.__version__)"

echo ""
echo "[1/3] Uninstalling TensorFlow 2.20..."
pip uninstall -y tensorflow tensorflow-cuda

echo ""
echo "[2/3] Installing TensorFlow 2.15.0 (better WSL2 compatibility)..."
pip install tensorflow==2.15.0

echo ""
echo "[3/3] Testing GPU again..."
python test_gpu_cudnn.py

echo ""
echo "============================================================"
echo "If convolution tests pass, try training again!"
echo "============================================================"

