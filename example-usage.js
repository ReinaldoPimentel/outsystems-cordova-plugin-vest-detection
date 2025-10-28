/**
 * Example usage of the Vest Detection Plugin
 * 
 * This script demonstrates how to use the Cordova Vest Detection Plugin
 * to detect safety vests in images.
 */

// ============================================================================
// 1. BASIC USAGE EXAMPLE
// ============================================================================

function detectVestBasic(base64Image) {
    cordova.plugins.VestDetection.detectVest(
        base64Image,
        function(result) {
            console.log("Detection successful!");
            console.log("Vest detected: " + result.detected);
            console.log("Confidence: " + result.confidence);
            console.log("All results: " + JSON.stringify(result.results));
        },
        function(error) {
            console.error("Detection failed: " + error);
        }
    );
}

// ============================================================================
// 2. PROMISE-BASED USAGE (RECOMMENDED)
// ============================================================================

function detectVestPromise(base64Image) {
    return new Promise(function(resolve, reject) {
        cordova.plugins.VestDetection.detectVest(
            base64Image,
            function(result) {
                resolve(result);
            },
            function(error) {
                reject(new Error(error));
            }
        );
    });
}

// Usage example with async/await
async function detectVestAsync(base64Image) {
    try {
        const result = await detectVestPromise(base64Image);
        
        console.log("Detection result:", result);
        
        if (result.detected) {
            console.log("✅ Vest detected with " + (result.confidence * 100).toFixed(2) + "% confidence");
        } else {
            console.log("❌ No vest detected");
        }
        
        // Display all class predictions
        result.results.forEach(function(prediction) {
            console.log(prediction.label + ": " + (prediction.confidence * 100).toFixed(2) + "%");
        });
        
        return result;
    } catch (error) {
        console.error("Error detecting vest:", error);
        throw error;
    }
}

// ============================================================================
// 3. WITH IMAGE VALIDATION
// ============================================================================

function validateBase64Image(base64String) {
    // Check if the string is not empty
    if (!base64String || typeof base64String !== 'string') {
        return {
            valid: false,
            error: 'Invalid base64 string'
        };
    }
    
    // Check if it's a data URI or just the base64 string
    var cleanedBase64 = base64String;
    if (base64String.startsWith('data:image')) {
        // Extract the actual base64 part
        var parts = base64String.split(',');
        if (parts.length > 1) {
            cleanedBase64 = parts[1];
        }
    }
    
    // Check base64 format (basic validation)
    var base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(cleanedBase64)) {
        return {
            valid: false,
            error: 'Invalid base64 format'
        };
    }
    
    return {
        valid: true,
        cleanedBase64: cleanedBase64
    };
}

function detectVestWithValidation(base64Image) {
    // Validate the image
    var validation = validateBase64Image(base64Image);
    
    if (!validation.valid) {
        console.error("Validation failed:", validation.error);
        return Promise.reject(new Error(validation.error));
    }
    
    // Use the cleaned base64 or original
    var imageToUse = validation.cleanedBase64 || base64Image;
    
    return detectVestPromise(imageToUse);
}

// ============================================================================
// 4. CONVERT FILE TO BASE64
// ============================================================================

/**
 * Convert a File or Blob to base64 string
 */
function fileToBase64(file) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        
        reader.onload = function(event) {
            var base64String = event.target.result;
            resolve(base64String);
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Convert a file input element to base64 and detect vest
 */
async function detectVestFromFileInput(fileInput) {
    var file = fileInput.files[0];
    
    if (!file) {
        throw new Error("No file selected");
    }
    
    // Convert to base64
    var base64Image = await fileToBase64(file);
    
    // Detect vest
    var result = await detectVestPromise(base64Image);
    
    return result;
}

// ============================================================================
// 5. COMPLETE INTEGRATION EXAMPLE
// ============================================================================

// Example: Detect vest from camera or gallery in a mobile app
function handleImageFromCamera(base64Image) {
    console.log("Processing image from camera...");
    
    return detectVestPromise(base64Image)
        .then(function(result) {
            // Handle successful detection
            displayResults(result);
            
            // Perform actions based on result
            if (result.detected) {
                handleVestDetected(result);
            } else {
                handleNoVestDetected(result);
            }
            
            return result;
        })
        .catch(function(error) {
            console.error("Detection error:", error);
            showErrorToUser("Failed to detect vest: " + error.message);
            throw error;
        });
}

function displayResults(result) {
    // Create a formatted result string
    var resultString = "Detection Results:\n\n";
    resultString += "Status: " + (result.detected ? "Vest Detected ✓" : "No Vest Detected") + "\n";
    resultString += "Confidence: " + (result.confidence * 100).toFixed(2) + "%\n\n";
    resultString += "All Predictions:\n";
    
    result.results.forEach(function(prediction) {
        var percentage = (prediction.confidence * 100).toFixed(2);
        resultString += "- " + prediction.label + ": " + percentage + "%\n";
    });
    
    console.log(resultString);
    // You could display this in the UI:
    // document.getElementById('results').textContent = resultString;
}

function handleVestDetected(result) {
    console.log("✅ Vest detected! Confidence: " + result.confidence);
    // Show success message to user
    // Example: showNotification("Vest detected with " + (result.confidence * 100) + "% confidence");
}

function handleNoVestDetected(result) {
    console.log("❌ No vest detected");
    // Show warning to user
    // Example: showNotification("Warning: No safety vest detected");
}

function showErrorToUser(message) {
    console.error(message);
    // Example: showNotification(message);
}

// ============================================================================
// 6. EXPECTED OUTPUT STRUCTURE
// ============================================================================

/**
 * Expected output format from the plugin:
 * 
 * {
 *     "detected": true,                    // Boolean: true if vest confidence > 0.5
 *     "confidence": 0.95,                  // Float: Confidence score of the vest class (0-1)
 *     "results": [                         // Array: All class predictions
 *         {
 *             "label": "no_vest",          // String: Class label
 *             "confidence": 0.05           // Float: Confidence score for this class
 *         },
 *         {
 *             "label": "vest",
 *             "confidence": 0.95
 *         }
 *     ]
 * }
 */

// ============================================================================
// 7. USAGE EXAMPLES
// ============================================================================

// Example 1: Using with an existing base64 image
var imageBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAA...";
detectVestAsync(imageBase64);

// Example 2: Using with file input
// In your HTML: <input type="file" id="imageInput" accept="image/*" />
document.getElementById('imageInput').addEventListener('change', async function(event) {
    try {
        var result = await detectVestFromFileInput(event.target);
        displayResults(result);
    } catch (error) {
        console.error("Error:", error);
    }
});

// Example 3: Using with camera (OutSystems/Cordova)
// After capturing image with camera plugin, you'll get a base64 string
function onCameraSuccess(imageData) {
    handleImageFromCamera(imageData);
}

function onCameraError(error) {
    console.error("Camera error:", error);
}

// ============================================================================
// 8. UTILITY FUNCTIONS
// ============================================================================

/**
 * Format confidence as percentage
 */
function formatConfidence(confidence) {
    return (confidence * 100).toFixed(2) + "%";
}

/**
 * Get the top prediction from results
 */
function getTopPrediction(results) {
    if (!results || results.length === 0) {
        return null;
    }
    
    // Sort by confidence descending
    var sorted = results.sort(function(a, b) {
        return b.confidence - a.confidence;
    });
    
    return sorted[0];
}

/**
 * Check if detection is reliable (confidence above threshold)
 */
function isReliable(result, threshold) {
    threshold = threshold || 0.7; // Default 70% threshold
    return result.confidence >= threshold;
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        detectVestBasic: detectVestBasic,
        detectVestPromise: detectVestPromise,
        detectVestAsync: detectVestAsync,
        detectVestWithValidation: detectVestWithValidation,
        fileToBase64: fileToBase64,
        detectVestFromFileInput: detectVestFromFileInput,
        handleImageFromCamera: handleImageFromCamera,
        displayResults: displayResults,
        formatConfidence: formatConfidence,
        getTopPrediction: getTopPrediction,
        isReliable: isReliable
    };
}

