# Cordova Vest Detection Plugin

A Cordova plugin for detecting safety vests in images using TensorFlow Lite, running locally on mobile devices without requiring an internet connection.

## Features

- Local TensorFlow Lite model execution
- No internet connection required
- Android and iOS support
- Simple JavaScript API
- Returns detailed confidence scores for all classes

## Installation

### From NPM (when published)

```bash
cordova plugin add cordova-plugin-vest-detection
```

### From Git Repository

```bash
cordova plugin add https://github.com/ReinaldoPimentel/outsystems-cordova-plugin-vest-detection
```

### From Local Directory

```bash
cordova plugin add /path/to/plugin
```

## Usage

### Basic Example

```javascript
var base64Image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAA...";

// Using default threshold (0.75 = 75%)
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        console.log("Vest detected: " + result.detected);
        console.log("Confidence: " + result.confidence);
        console.log("All results: " + JSON.stringify(result.results));
    },
    function(error) {
        console.error("Error: " + error);
    }
);
```

### With Custom Threshold

```javascript
// Using custom threshold (0.90 = 90%)
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        console.log("Vest detected: " + result.detected);
        console.log("Confidence: " + result.confidence);
    },
    function(error) {
        console.error("Error: " + error);
    },
    0.90  // 90% confidence threshold
);
```

### With Debug Mode Enabled

```javascript
// Enable debug logging (use sparingly to prevent log accumulation)
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        console.log("Vest detected: " + result.detected);
        console.log("Confidence: " + result.confidence);
    },
    function(error) {
        console.error("Error: " + error);
    },
    0.75,  // threshold (optional, defaults to 0.75)
    true   // isDebugMode (optional, defaults to false)
);
```

### Result Format

The success callback receives a JSON object with the following structure:

```json
{
    "detected": true,
    "confidence": 0.95,
    "results": [
        {
            "label": "no_vest",
            "confidence": 0.05
        },
        {
            "label": "vest",
            "confidence": 0.95
        }
    ]
}
```

- `detected`: Boolean indicating if vest confidence >= threshold (default: 0.75 = 75%)
- `confidence`: Confidence score of the vest class (0.0 to 1.0)
- `results`: Array of all class predictions with labels and confidence scores

## Permissions

No special permissions are required since the plugin accepts base64 encoded images as input.

## Requirements

### Android

- Cordova 9.0+
- Android SDK 21+
- TensorFlow Lite 2.14.0

### iOS

- Cordova 9.0+
- iOS 12.0+
- TensorFlow Lite (via CocoaPods)

## Model Information

The plugin includes a pre-trained TensorFlow Lite model for vest detection:

- **Input**: 224x224 RGB images
- **Classes**: `no_vest`, `vest`
- **Model file**: `vest_model.tflite`
- **Labels file**: `labels.txt`

## Supported Image Formats

- JPEG (base64 encoded)
- PNG (base64 encoded)
- Accepts full data URIs (e.g., `data:image/jpeg;base64,...`) or just the base64 string

## API

### detectVest(base64Image, successCallback, errorCallback, threshold, isDebugMode)

Detects a vest in the specified image.

**Parameters:**

- `base64Image` (String): Base64 encoded image string
  - Example: `"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAA..."`
  - Example: `"/9j/4AAQSkZJRgABAQAAA..."` (without data URI prefix)

- `successCallback` (Function): Callback function with detection results

- `errorCallback` (Function): Callback function with error message

- `threshold` (Number, optional): Confidence threshold for vest detection (0.0 to 1.0)
  - Default: `0.75` (75%)
  - Only vest confidence scores >= threshold will be considered detected
  - Example: `0.90` for 90% confidence threshold

- `isDebugMode` (Boolean, optional): Enable debug logging
  - Default: `false` (logs disabled to save memory)
  - When `true`, enables detailed console/logcat logging for debugging
  - **Important**: Disable in production to prevent log accumulation and memory issues

**Returns:**

- Success: Object with detection results (see Result Format above)
- Error: Error message string

**Example:**

```javascript
// Default threshold (75%), no debug logs
cordova.plugins.VestDetection.detectVest(base64Image, onSuccess, onError);

// Custom threshold (90%), no debug logs
cordova.plugins.VestDetection.detectVest(base64Image, onSuccess, onError, 0.90);

// Default threshold with debug logging enabled
cordova.plugins.VestDetection.detectVest(base64Image, onSuccess, onError, 0.75, true);

// Custom threshold with debug logging enabled
cordova.plugins.VestDetection.detectVest(base64Image, onSuccess, onError, 0.90, true);
```

## Building

### Android

The TensorFlow Lite dependency is automatically included via Gradle.

### iOS

The TensorFlow Lite dependency is managed via CocoaPods. The plugin will automatically configure this when added to your project.

## Troubleshooting

### Image not loading

- Ensure the base64 string is valid and properly encoded
- Check that the image format is supported (JPEG or PNG)
- Verify the base64 string is complete and not truncated

### Model not found

- Ensure the model files are properly copied to the app bundle
- Try removing and re-adding the plugin
- Check that the model files exist in `src/models/`

### Low accuracy

- Ensure images are clear and well-lit
- Vest should be visible and not heavily occluded
- Use images similar to the training data (224x224 recommended)

### Memory issues

- **Disable debug mode in production**: Set `isDebugMode` to `false` (default) to prevent log accumulation
- Debug logs can fill up log buffers and device memory if enabled continuously
- Only enable debug mode (`isDebugMode: true`) when actively debugging issues

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For issues and questions, please use the [GitHub issue tracker](https://github.com/ReinaldoPimentel/outsystems-cordova-plugin-vest-detection/issues).

