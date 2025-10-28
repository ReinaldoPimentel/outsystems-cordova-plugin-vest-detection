/**
 * ERROR STRUCTURE - Vest Detection Plugin
 * 
 * What error messages look like when the plugin fails
 */

// ============================================================================
// ERROR STRUCTURE
// ============================================================================

/**
 * The plugin returns errors as SIMPLE STRINGS, not objects.
 * 
 * Error format: string (error message)
 * 
 * Examples:
 * - "Failed to decode base64 image"
 * - "Error during detection: ..."
 * - "Invalid base64 image provided"
 */

// ============================================================================
// POSSIBLE ERROR MESSAGES
// ============================================================================

// Error 1: Invalid input (from JavaScript wrapper)
var error1 = "Invalid base64 image provided";

// Error 2: Image decode failure (from Android/iOS native code)
var error2 = "Failed to decode base64 image";

// Error 3: Detection process error (from Android/iOS native code)
var error3 = "Error during detection: Model not initialized";

// Error 4: Exception during processing
var error4 = "Error during detection: NullPointerException at ...";

// Error 5: Model loading error (during plugin initialization)
var error5 = "Error during detection: IOException while loading model";

// Error 6: TensorFlow error
var error6 = "Error during detection: TensorFlow Lite error";

// ============================================================================
// HOW ERRORS ARE RETURNED
// ============================================================================

// Method 1: Callback-based
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        console.log("Success:", result);
    },
    function(error) {
        // error is a STRING, not an object
        console.error("Error type:", typeof error);    // "string"
        console.error("Error:", error);                // "Failed to decode base64 image"
        console.error("Error length:", error.length);  // 28 (example)
    }
);

// Method 2: Promise-based
function detectVestPromise(base64Image) {
    return new Promise(function(resolve, reject) {
        cordova.plugins.VestDetection.detectVest(
            base64Image,
            function(result) {
                resolve(result);
            },
            function(error) {
                // Convert string error to Error object
                reject(new Error(error));
            }
        );
    });
}

// Method 3: With async/await
async function detectVestAsync(base64Image) {
    try {
        var result = await detectVestPromise(base64Image);
        return result;
    } catch (error) {
        // error is an Error object (from reject(new Error(...)))
        console.error("Error message:", error.message);  // "Failed to decode base64 image"
        console.error("Error name:", error.name);        // "Error"
        throw error;
    }
}

// ============================================================================
// ERROR HANDLING EXAMPLES
// ============================================================================

// Example 1: Simple Error Handling
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        console.log("Success:", result);
    },
    function(error) {
        alert("Error: " + error);
    }
);

// Example 2: Detailed Error Handling
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        console.log("Detection successful:", result);
    },
    function(error) {
        console.error("=== ERROR DETECTED ===");
        console.error("Error message:", error);
        console.error("Error type:", typeof error);
        
        // Handle different error types
        if (error.includes("decode")) {
            console.error("Image decoding failed");
            alert("Invalid image format. Please try a different image.");
        } else if (error.includes("Model")) {
            console.error("Model initialization failed");
            alert("Detection model not available. Please restart the app.");
        } else if (error.includes("Invalid")) {
            console.error("Invalid input");
            alert("Please provide a valid base64 image string.");
        } else {
            console.error("Unknown error");
            alert("An error occurred: " + error);
        }
    }
);

// Example 3: Error Handling with UI Updates
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        updateUIWithResult(result);
    },
    function(error) {
        // Hide loading spinner
        document.getElementById('loading-spinner').style.display = 'none';
        
        // Show error message
        document.getElementById('error-message').textContent = error;
        document.getElementById('error-message').style.display = 'block';
        
        // Enable retry button
        document.getElementById('retry-button').disabled = false;
        
        // Log error for debugging
        console.error("Detection error:", error);
    }
);

// Example 4: Error Handling with OutSystems
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        handleSuccess(result);
    },
    function(error) {
        // Hide loading indicator
        BlockWidget.HideLoading();
        
        // Show error message
        Notification.Error('Detection failed: ' + error);
        
        // Update error label
        Label.setText('ErrorLabel', error);
        
        // Enable retry
        Button.setEnabled('RetryButton', true);
        
        // Log to console
        console.error("Detection error:", error);
    }
);

// ============================================================================
// ERROR CATEGORIES AND HANDLING
// ============================================================================

/**
 * ERROR CATEGORIES:
 * 
 * 1. INPUT ERRORS:
 *    - "Invalid base64 image provided"
 *    - "Failed to decode base64 image"
 * 
 * 2. MODEL ERRORS:
 *    - "Error during detection: Model not initialized"
 *    - "Error during detection: Model file not found"
 * 
 * 3. PROCESSING ERRORS:
 *    - "Error during detection: TensorFlow Lite error"
 *    - "Error during detection: NullPointerException"
 * 
 * 4. MEMORY ERRORS:
 *    - "Error during detection: OutOfMemoryError"
 * 
 * 5. SYSTEM ERRORS:
 *    - "Error during detection: IOException"
 *    - "Error during detection: FileNotFoundException"
 */

function categorizeError(errorString) {
    var error = errorString.toLowerCase();
    
    if (error.includes('invalid') || error.includes('decode')) {
        return {
            category: 'INPUT_ERROR',
            severity: 'LOW',
            userMessage: 'Please check your image and try again.',
            retryable: true
        };
    }
    
    if (error.includes('model')) {
        return {
            category: 'MODEL_ERROR',
            severity: 'HIGH',
            userMessage: 'Detection model unavailable. Please restart the app.',
            retryable: true
        };
    }
    
    if (error.includes('memory')) {
        return {
            category: 'MEMORY_ERROR',
            severity: 'MEDIUM',
            userMessage: 'Image too large. Please try a smaller image.',
            retryable: true
        };
    }
    
    if (error.includes('exception') || error.includes('null')) {
        return {
            category: 'PROCESSING_ERROR',
            severity: 'HIGH',
            userMessage: 'Detection failed. Please try again.',
            retryable: true
        };
    }
    
    return {
        category: 'UNKNOWN_ERROR',
        severity: 'MEDIUM',
        userMessage: 'An error occurred. Please try again.',
        retryable: true
    };
}

// Usage:
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        handleSuccess(result);
    },
    function(error) {
        var errorInfo = categorizeError(error);
        
        console.error("Error category:", errorInfo.category);
        console.error("Error severity:", errorInfo.severity);
        
        Notification.Show(errorInfo.userMessage, errorInfo.severity);
        
        if (errorInfo.retryable) {
            Button.setEnabled('RetryButton', true);
        }
    }
);

// ============================================================================
// ERROR HANDLING WITH PROMISES
// ============================================================================

// Simple promise wrapper
function detectVestPromise(base64Image) {
    return new Promise(function(resolve, reject) {
        cordova.plugins.VestDetection.detectVest(
            base64Image,
            resolve,
            function(error) {
                reject(new Error(error));
            }
        );
    });
}

// Usage with comprehensive error handling
async function detectWithBetterErrorHandling(base64Image) {
    try {
        var result = await detectVestPromise(base64Image);
        return result;
        
    } catch (error) {
        // error is now an Error object
        var errorMessage = error.message;
        
        console.error("Caught error:", error);
        console.error("Error message:", errorMessage);
        
        // Handle different error types
        if (errorMessage.includes("decode")) {
            throw new Error("IMAGE_DECODE_ERROR: Invalid image format");
        } else if (errorMessage.includes("Model")) {
            throw new Error("MODEL_ERROR: Detection model unavailable");
        } else {
            throw error; // Re-throw original error
        }
    }
}

// ============================================================================
// ERROR LOGGING
// ============================================================================

function logError(error, context) {
    var logEntry = {
        timestamp: new Date().toISOString(),
        error: error,
        context: context,
        userAgent: navigator.userAgent,
        platform: device.platform
    };
    
    console.error("Error Log:", JSON.stringify(logEntry, null, 2));
    
    // Send to server if needed
    if (typeof AjaxExecuteServerAction === 'function') {
        AjaxExecuteServerAction('LogError', logEntry);
    }
}

// Usage:
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        logSuccess(result);
    },
    function(error) {
        logError(error, {
            operation: 'detectVest',
            imageSize: base64Image.length,
            base64Prefix: base64Image.substring(0, 50)
        });
        
        Notification.Error('Detection failed');
    }
);

// ============================================================================
// ERROR RECOVERY STRATEGIES
// ============================================================================

var retryCount = 0;
var maxRetries = 3;

function detectWithRetry(base64Image) {
    return new Promise(function(resolve, reject) {
        function attemptDetection() {
            cordova.plugins.VestDetection.detectVest(
                base64Image,
                function(result) {
                    retryCount = 0; // Reset on success
                    resolve(result);
                },
                function(error) {
                    retryCount++;
                    
                    if (retryCount < maxRetries && error.includes("Model")) {
                        console.warn("Retrying... attempt " + retryCount + "/" + maxRetries);
                        setTimeout(attemptDetection, 1000); // Retry after 1 second
                    } else {
                        retryCount = 0;
                        reject(new Error(error));
                    }
                }
            );
        }
        
        attemptDetection();
    });
}

// Usage:
detectWithRetry(base64Image)
    .then(function(result) {
        console.log("Success after retries:", result);
    })
    .catch(function(error) {
        console.error("Failed after retries:", error);
    });

// ============================================================================
// COMPREHENSIVE ERROR HANDLER
// ============================================================================

function handleDetectionError(error) {
    // Log the error
    console.error("Detection Error:", error);
    
    // Categorize the error
    var errorInfo = categorizeError(error);
    
    // Update UI
    BlockWidget.HideLoading();
    Label.setText('ErrorLabel', errorInfo.userMessage);
    Label.setClass('ErrorLabel', 'error');
    
    // Show notification
    Notification.Show(errorInfo.userMessage, errorInfo.severity);
    
    // Enable retry if applicable
    if (errorInfo.retryable) {
        Button.setEnabled('RetryButton', true);
    }
    
    // Log to server
    logError(error, {
        category: errorInfo.category,
        severity: errorInfo.severity
    });
}

// Complete usage:
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        handleDetectionSuccess(result);
    },
    function(error) {
        handleDetectionError(error);
    }
);

// ============================================================================
// SUMMARY
// ============================================================================

/**
 * ERROR STRUCTURE SUMMARY:
 * 
 * Format: STRING (simple error message)
 * 
 * Examples:
 * - "Invalid base64 image provided"
 * - "Failed to decode base64 image"
 * - "Error during detection: [specific error]"
 * 
 * HOW TO HANDLE:
 * 
 * 1. Direct callback:
 *    errorCallback(error)  // error is a string
 * 
 * 2. With Promise (converts to Error object):
 *    reject(new Error(error))  // Creates Error object
 *    catch(err => err.message) // Access string message
 * 
 * 3. Error properties:
 *    - No properties (it's just a string)
 *    - Use .includes() or .indexOf() to check content
 *    - Use categorizeError() for better handling
 * 
 * COMMON ERRORS:
 * - Input validation errors
 * - Image decode failures
 * - Model initialization errors
 * - TensorFlow processing errors
 * - Memory errors
 */

