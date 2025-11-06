# Abstract: Mobile Safety Vest Detection Using TensorFlow Lite in OutSystems

## Overview

This project presents the development of a mobile safety vest detection system implemented as a Cordova plugin for OutSystems applications. The solution employs a deep learning model based on MobileNetV2 architecture, optimized for on-device inference using TensorFlow Lite, enabling real-time vest detection without requiring internet connectivity.

## Model Architecture and Training Approach

### Model Selection: MobileNetV2

The project utilizes **MobileNetV2** as the base architecture for binary classification (vest/no_vest detection). MobileNetV2 was selected after considering the specific requirements of mobile, offline, real-time vest detection:

#### Primary Requirements
1. **On-Device Execution**: The plugin must run entirely on mobile devices without cloud connectivity, requiring efficient inference
2. **Real-Time Performance**: Detection must occur quickly enough for practical use in field applications
3. **Model Size Constraints**: The model must be small enough to bundle with the mobile app without excessive download times or storage requirements
4. **Battery Efficiency**: Mobile inference should minimize battery consumption
5. **TensorFlow Lite Compatibility**: Must convert seamlessly to TensorFlow Lite format for mobile deployment

#### Why MobileNetV2 Over Alternatives

**vs. MobileNetV1**: 
- MobileNetV2 introduces inverted residual blocks with linear bottlenecks, achieving better accuracy with fewer parameters
- More efficient feature extraction with the same computational budget

**vs. MobileNetV3**:
- **Selection Note**: MobileNetV2 was chosen as the initial architecture based on established mobile deployment practices. According to official benchmarks, MobileNetV2 (1.0) achieves ~71.8% top-1 accuracy on ImageNet, while MobileNetV3-Small (1.0) achieves 68.1% [^1][^2]. However, MobileNetV3-Small offers faster inference (15.8ms vs ~20ms on Pixel 1 CPU) and lower computational cost (66M vs ~300M MACs) [^2]. No systematic comparison was conducted during this project.
- MobileNetV2 was selected as a proven, well-documented architecture with stable TensorFlow Lite conversion
- MobileNetV3 introduces Neural Architecture Search (NAS) optimizations and squeeze-and-excite blocks that provide efficiency improvements but may require more careful fine-tuning
- The choice reflects a pragmatic approach: prioritizing accuracy for binary classification while ensuring reliable deployment, with the understanding that future iterations could benchmark MobileNetV3-Small (for speed) or MobileNetV3-Large (75.6% accuracy, for higher accuracy) [^2]
- Given the binary classification nature of the task (vest/no-vest), MobileNetV2's higher ImageNet accuracy transfer was considered preferable, prioritizing classification accuracy over marginal speed gains

**vs. MobileNetV4/V5**:
- **MobileNetV4**: Released in April 2024 (arXiv:2404.10518), MobileNetV4 was available during the project's development phase [^3]. MobileNetV4 introduces new architectural innovations including Universal Inverted Bottleneck (UIB) blocks and Mobile MQA attention mechanisms [^3]. However, MobileNetV2 was selected for this project based on the following considerations:
  - **Established Architecture**: MobileNetV2, released in 2018, has been widely adopted and extensively documented in production environments [^1]
  - **TensorFlow Lite Compatibility**: The project uses TensorFlow Lite 2.17.0, selected for the following reasons:
    - **MABS 11.1 Compatibility Requirement**: The plugin was developed for use with OutSystems Mobile Apps Build Service (MABS) version 11.1. TensorFlow Lite 2.17.0 was selected to ensure compatibility with the MABS 11.1 build environment and Cordova plugin integration requirements for this project
    - **Cordova Plugin Integration**: As a Cordova plugin for OutSystems applications, the TensorFlow Lite version must be compatible with Cordova's dependency management system and the MABS build process
    - **Version Alignment**: TensorFlow 2.17.1 was used for model training, and TensorFlow Lite 2.17.0 provides version compatibility for seamless model conversion
    - **MobileNetV2 Support**: MobileNetV2 has well-established conversion workflows and compatibility with TensorFlow Lite 2.17.0, ensuring reliable model deployment
    - **Production Deployment**: This version was selected to meet the project's specific requirements for production OutSystems mobile application deployment through MABS 11.1
  - **Development Priority**: Given the project timeline and the need for reliable deployment, the established stability and known characteristics of MobileNetV2 were prioritized over evaluating newer architectures
  - **Binary Classification Sufficiency**: For the vest/no-vest binary classification task, MobileNetV2's ImageNet transfer learning capabilities were deemed sufficient without requiring the additional complexity of evaluating newer architectures
- **MobileNetV5**: MobileNetV5 was announced by Google in June 2025 as the primary vision encoder for the Gemma 3n multimodal AI model [^4]. However, MobileNetV5 is not available as a standalone model for general use outside of its integration within the Gemma 3n framework. As with MobileNetV4, MobileNetV5 was not evaluated for this project, which selected MobileNetV2 for the reasons outlined above (established stability, MABS 11.1 compatibility, and proven production deployment). Future work could evaluate MobileNetV4 or MobileNetV5 (if it becomes available as a standalone model) for potential improvements, but such evaluation would require addressing the same stability and compatibility considerations that led to selecting MobileNetV2 for this project.

[^1]: Sandler, M., Howard, A., Zhu, M., Zhmoginov, A., & Chen, L. C. (2018). MobileNetV2: Inverted Residuals and Linear Bottlenecks. *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*. arXiv:1801.04381
[^2]: Howard, A., Sandler, M., Chu, G., Chen, L. C., Chen, B., Tan, M., ... & Adam, H. (2019). Searching for MobileNetV3. *Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)*. arXiv:1905.02244
[^3]: Howard, A., Zhmoginov, A., Chen, L. C., Sandler, M., & Zhu, M. (2024). MobileNetV4: Universal Models for the Mobile Ecosystem. arXiv:2404.10518
[^4]: Google DeepMind. (2025). Gemma 3n: A Mobile-Focused Multimodal AI Model. Retrieved from https://deepmind.google/en/models/gemma/gemma-3n/

**vs. ResNet/VGG/DenseNet**:
- Traditional architectures are too large and slow for mobile deployment
- Much higher memory and computational requirements
- Not designed for mobile/embedded inference

**vs. EfficientNet**:
- While EfficientNet offers better accuracy, it requires more computational resources
- MobileNetV2 provides sufficient accuracy for binary classification while being more resource-efficient
- Better suited for real-time inference on mid-range mobile devices

#### Technical Advantages of MobileNetV2

1. **Inverted Residual Blocks**: The architecture uses inverted residuals with linear bottlenecks, which:
   - Expand feature dimensions in the bottleneck (more efficient)
   - Use depthwise separable convolutions (faster than standard convolutions)
   - Provide better gradient flow during training

2. **Transfer Learning Efficiency**: 
   - Pre-trained on ImageNet with 3.5M parameters
   - Excellent feature extraction capabilities for transfer learning
   - Requires minimal fine-tuning for binary classification tasks

3. **Mobile-Optimized Design**:
   - Default input size of 224×224 pixels (matches common mobile camera resolutions)
   - Configurable width multiplier (alpha parameter) allows trading accuracy for speed
   - Model size typically under 10MB when converted to TensorFlow Lite

4. **TensorFlow Lite Optimization**:
   - Native support in TensorFlow/Keras applications
   - Excellent quantization support for further size reduction
   - Optimized operators in TensorFlow Lite runtime

5. **Practical Performance**:
   - Inference time: ~50-100ms on modern smartphones (sufficient for real-time use)
   - Memory footprint: ~50-100MB during inference
   - Battery impact: Minimal due to efficient operations

The code comment explicitly states: *"efficient for mobile deployment"* (see `train_model.py:22-23`), confirming that mobile deployment constraints were the primary driver for this architectural choice.

### Model Architecture Details

The model architecture consists of:
- **Base Model**: Pre-trained MobileNetV2 (ImageNet weights) with frozen layers for transfer learning
- **Input**: 224×224 RGB images normalized to [-1, 1] range using `(pixel - 127.5) / 127.5`
- **Feature Extraction**: Global Average Pooling layer to reduce spatial dimensions
- **Regularization**: Dropout layer (0.2) to prevent overfitting
- **Classification Head**: Dense layer with sigmoid activation for binary classification
- **Output**: Single probability score [0, 1] where values > 0.5 indicate vest detection

### Training Methodology

The training pipeline implements several best practices:

1. **Data Augmentation**: Random rotations (20°), shifts, horizontal flips, and zoom to increase dataset diversity and prevent overfitting
2. **Transfer Learning**: Initial training with frozen MobileNetV2 base layers, allowing the classification head to learn vest-specific features
3. **Optimization**: Adam optimizer with learning rate 0.0001, binary cross-entropy loss, and monitoring of accuracy, precision, and recall
4. **Training Callbacks**:
   - Model checkpointing to save best validation model
   - Early stopping (patience=5) to prevent overfitting
   - Learning rate reduction on plateau for fine-tuning
5. **Model Conversion**: Conversion to TensorFlow Lite format with default optimizations for size and speed

### Training Data Organization

The dataset is organized into:
- **Training Set**: `data/train/vest/` and `data/train/no_vest/` directories
- **Validation Set**: `data/val/vest/` and `data/val/no_vest/` directories
- **Labeling Guidelines**: Comprehensive documentation for consistent image labeling, focusing on safety vest characteristics (bright colors, reflective strips, torso coverage)

## Cordova Plugin Implementation

### Plugin Architecture

The plugin is implemented as a cross-platform Cordova plugin supporting both Android and iOS platforms:

**Android Implementation**:
- Native Java implementation using TensorFlow Lite 2.17.0
- Model and labels bundled as assets in the application
- Background thread execution for inference to prevent UI blocking
- Base64 image decoding and preprocessing aligned with training pipeline

**iOS Implementation**:
- Native Objective-C implementation using TensorFlow Lite via CocoaPods
- Consistent preprocessing pipeline matching Android implementation
- Background execution for optimal performance

### Plugin Features

1. **Local Inference**: All processing occurs on-device, ensuring:
   - Privacy: Images never leave the device
   - Offline Operation: No internet connection required
   - Low Latency: Direct hardware access for fast inference

2. **Flexible API**: JavaScript interface supporting:
   - Configurable confidence threshold (default: 0.75 or 75%)
   - Optional debug mode for development and troubleshooting
   - Detailed result structure with confidence scores for all classes

3. **Result Structure**: Returns JSON object containing:
   - `detected`: Boolean indicating if vest confidence exceeds threshold
   - `confidence`: Vest class confidence score (0.0 to 1.0)
   - `results`: Array of all class predictions with labels and confidence scores

## OutSystems Integration

### Integration Patterns

The plugin is designed for seamless integration with OutSystems mobile applications, supporting multiple integration patterns:

1. **Callback-Based Integration**: Direct callback functions for simple use cases
   ```javascript
   cordova.plugins.VestDetection.detectVest(base64Image, onSuccess, onError);
   ```

2. **Promise-Based Integration**: Wrapped in Promises for modern asynchronous code patterns
   ```javascript
   detectVestPromise(base64Image).then(result => { /* handle result */ });
   ```

3. **Async/Await Integration**: Clean async/await syntax for complex workflows
   ```javascript
   const result = await detectVestPromise(base64Image);
   // Execute OutSystems client actions
   ```

### OutSystems-Specific Features

The plugin provides comprehensive examples and utilities for:

- **Client Actions Integration**: Patterns for executing OutSystems client actions with detection results
- **Form Updates**: Methods for updating OutSystems form fields with detection results
- **Server Actions**: Integration patterns for sending detection results to OutSystems server actions
- **UI Updates**: Examples for updating OutSystems UI components based on detection results
- **Error Handling**: Robust error handling patterns compatible with OutSystems error management

### Use Cases

The plugin enables various safety compliance scenarios in OutSystems applications:

1. **Workplace Safety**: Verify workers are wearing safety vests before entering restricted areas
2. **Compliance Checking**: Automated checking of safety equipment in construction or industrial settings
3. **Access Control**: Gate access systems requiring vest detection
4. **Audit Logging**: Automated logging of safety compliance with timestamps and confidence scores

## Technical Specifications

- **Platform Support**: Android (SDK 21+) and iOS (12.0+)
- **TensorFlow Lite Version**: 2.17.0
- **Model Format**: TensorFlow Lite (.tflite)
- **Model Size**: Optimized for mobile deployment (typically < 10MB)
- **Inference Time**: Real-time performance on modern mobile devices
- **Image Formats**: JPEG and PNG (base64 encoded)
- **Input Resolution**: 224×224 pixels (automatically resized)

## Key Contributions

1. **Mobile-First Architecture**: Complete on-device inference solution eliminating cloud dependency
2. **Production-Ready Plugin**: Fully functional Cordova plugin with comprehensive error handling and cross-platform support
3. **OutSystems Integration**: Tailored integration patterns and examples for OutSystems development workflows
4. **Training Pipeline**: Reproducible training pipeline with data augmentation, transfer learning, and model optimization
5. **Documentation**: Comprehensive documentation including training guides, labeling instructions, and integration examples

## Conclusion

This project demonstrates a complete end-to-end solution for mobile safety vest detection, from model training to production deployment in OutSystems applications. The use of MobileNetV2 with TensorFlow Lite enables efficient, privacy-preserving, and offline-capable detection that integrates seamlessly with OutSystems mobile development workflows. The solution addresses real-world requirements for workplace safety compliance while maintaining the flexibility and performance needed for mobile applications.

