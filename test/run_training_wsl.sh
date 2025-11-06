#!/bin/bash
# Script to run training in WSL with virtual environment

PROJECT_DIR="/mnt/c/Users/reina/Documents/AFCode/outsystems-cordova-plugin-vest-detection/test"
cd "$PROJECT_DIR" || exit 1

# Activate virtual environment
source venv_gpu/bin/activate

# Run training
python train_model.py --train_dir ../data/train --val_dir ../data/val --epochs 20 "$@"

