/**
 * RESULT STRUCTURE - Vest Detection Plugin
 * 
 * What the result object looks like when returned from the plugin
 */

// ============================================================================
// RESULT STRUCTURE (from the README)
// ============================================================================

/**
 * The plugin returns a JavaScript object with this structure:
 */

var exampleResult = {
    "detected": true,                    // Boolean: true if vest confidence > 0.5
    "confidence": 0.95,                  // Float: Confidence score of the vest class (0-1)
    "results": [                         // Array: All class predictions
        {
            "label": "no_vest",          // String: Class label
            "confidence": 0.05           // Float: Confidence score for this class
        },
        {
            "label": "vest",
            "confidence": 0.95
        }
    ]
};

// ============================================================================
// REAL EXAMPLES
// ============================================================================

// Example 1: Vest Detected (High Confidence)
var result1 = {
    detected: true,
    confidence: 0.95,
    results: [
        {
            label: "no_vest",
            confidence: 0.05
        },
        {
            label: "vest",
            confidence: 0.95
        }
    ]
};

// Example 2: Vest Detected (Low Confidence)
var result2 = {
    detected: true,
    confidence: 0.65,
    results: [
        {
            label: "no_vest",
            confidence: 0.35
        },
        {
            label: "vest",
            confidence: 0.65
        }
    ]
};

// Example 3: No Vest Detected
var result3 = {
    detected: false,
    confidence: 0.15,
    results: [
        {
            label: "no_vest",
            confidence: 0.85
        },
        {
            label: "vest",
            confidence: 0.15
        }
    ]
};

// Example 4: Edge Case (Exactly 50%)
var result4 = {
    detected: true,                      // Note: 0.5 is considered detected (>= 0.5)
    confidence: 0.5,
    results: [
        {
            label: "no_vest",
            confidence: 0.5
        },
        {
            label: "vest",
            confidence: 0.5
        }
    ]
};

// ============================================================================
// HOW TO ACCESS THE RESULT PROPERTIES
// ============================================================================

function handleResult(result) {
    // Access the main properties
    console.log("Vest detected:", result.detected);           // true or false
    console.log("Confidence:", result.confidence);            // 0.0 to 1.0
    console.log("All results:", result.results);              // Array of predictions
    
    // Access confidence as percentage
    var percentage = result.confidence * 100;
    console.log("Confidence: " + percentage.toFixed(2) + "%");
    
    // Access individual class predictions
    result.results.forEach(function(prediction) {
        console.log(prediction.label + ": " + (prediction.confidence * 100) + "%");
    });
    
    // Find the highest confidence prediction
    var topPrediction = result.results.sort(function(a, b) {
        return b.confidence - a.confidence;
    })[0];
    
    console.log("Top prediction:", topPrediction.label, topPrediction.confidence);
}

// ============================================================================
// PRACTICAL USAGE EXAMPLES
// ============================================================================

// Example 1: Simple Check
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        if (result.detected) {
            console.log("✅ Vest found with " + (result.confidence * 100) + "% confidence");
        } else {
            console.log("❌ No vest detected");
        }
    },
    function(error) {
        console.error("Error:", error);
    }
);

// Example 2: Detailed Results
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        console.log("=== Detection Results ===");
        console.log("Status:", result.detected ? "VEST DETECTED" : "NO VEST");
        console.log("Vest Confidence:", result.confidence);
        console.log("");
        console.log("All Predictions:");
        
        result.results.forEach(function(prediction) {
            var percent = (prediction.confidence * 100).toFixed(2);
            var bar = "█".repeat(Math.floor(prediction.confidence * 20));
            console.log(`  ${prediction.label}: ${percent}% ${bar}`);
        });
    },
    function(error) {
        console.error("Error:", error);
    }
);

// Example 3: With UI Updates
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        // Update UI elements
        document.getElementById('status').textContent = 
            result.detected ? 'Vest Detected ✓' : 'No Vest Detected ✗';
        
        document.getElementById('confidence').textContent = 
            'Confidence: ' + (result.confidence * 100).toFixed(1) + '%';
        
        document.getElementById('confidence').style.width = 
            (result.confidence * 100) + '%';
        
        document.getElementById('confidence').className = 
            result.confidence > 0.7 ? 'high-confidence' : 'low-confidence';
        
        // Update detailed results table
        var resultsTable = document.getElementById('results-table');
        resultsTable.innerHTML = '';
        
        result.results.forEach(function(prediction) {
            var row = document.createElement('tr');
            row.innerHTML = `
                <td>${prediction.label}</td>
                <td>${(prediction.confidence * 100).toFixed(2)}%</td>
            `;
            resultsTable.appendChild(row);
        });
    },
    function(error) {
        document.getElementById('status').textContent = 'Error: ' + error;
    }
);

// Example 4: With OutSystems
async function detectAndDisplayResult(base64Image) {
    try {
        var result = await detectVestPromise(base64Image);
        
        // Access result properties
        var isDetected = result.detected;           // true/false
        var confidence = result.confidence;         // 0.0 - 1.0
        var allResults = result.results;            // Array
        
        // Update OutSystems form
        Form.setValue('IsVestDetected', isDetected);
        Form.setValue('Confidence', confidence);
        
        // Update label text
        if (isDetected) {
            Label.setText('StatusLabel', 'Vest Detected');
            Label.setClass('StatusLabel', 'success');
        } else {
            Label.setText('StatusLabel', 'No Vest Detected');
            Label.setClass('StatusLabel', 'warning');
        }
        
        // Loop through all results if needed
        result.results.forEach(function(prediction) {
            console.log(prediction.label + ": " + prediction.confidence);
        });
        
        return result;
        
    } catch (error) {
        console.error("Error:", error);
    }
}

// ============================================================================
// JSON STRING EXAMPLES (for debugging)
// ============================================================================

// Example JSON strings you might see in console:

var jsonExample1 = `{
    "detected": true,
    "confidence": 0.95,
    "results": [
        {"label": "no_vest", "confidence": 0.05},
        {"label": "vest", "confidence": 0.95}
    ]
}`;

var jsonExample2 = `{
    "detected": false,
    "confidence": 0.15,
    "results": [
        {"label": "no_vest", "confidence": 0.85},
        {"label": "vest", "confidence": 0.15}
    ]
}`;

// ============================================================================
// TYPE CHECKING AND VALIDATION
// ============================================================================

function validateResult(result) {
    // Check if result is an object
    if (typeof result !== 'object' || result === null) {
        console.error("Result is not an object");
        return false;
    }
    
    // Check if required properties exist
    if (typeof result.detected !== 'boolean') {
        console.error("Result.detected is not a boolean");
        return false;
    }
    
    if (typeof result.confidence !== 'number') {
        console.error("Result.confidence is not a number");
        return false;
    }
    
    if (!Array.isArray(result.results)) {
        console.error("Result.results is not an array");
        return false;
    }
    
    // Check confidence range
    if (result.confidence < 0 || result.confidence > 1) {
        console.error("Result.confidence is out of range (0-1)");
        return false;
    }
    
    // Check results array structure
    if (result.results.length !== 2) {
        console.warn("Expected 2 results, got " + result.results.length);
    }
    
    result.results.forEach(function(prediction, index) {
        if (typeof prediction.label !== 'string') {
            console.error("Result.results[" + index + "].label is not a string");
        }
        if (typeof prediction.confidence !== 'number') {
            console.error("Result.results[" + index + "].confidence is not a number");
        }
    });
    
    return true;
}

// Usage with validation
cordova.plugins.VestDetection.detectVest(
    base64Image,
    function(result) {
        if (validateResult(result)) {
            console.log("Valid result received:", result);
            handleResult(result);
        } else {
            console.error("Invalid result structure");
        }
    },
    function(error) {
        console.error("Error:", error);
    }
);

// ============================================================================
// VISUAL RESULT EXAMPLES
// ============================================================================

/**
 * VISUAL REPRESENTATION:
 * 
 * ┌─────────────────────────────────────────────────────────┐
 * │ result                                                   │
 * │ {                                                        │
 * │   detected: true,              ← Boolean                │
 * │   confidence: 0.95,            ← Number (0-1)          │
 * │   results: [                   ← Array                 │
 * │     {                                                  │
 * │       label: "no_vest",         ← String              │
 * │       confidence: 0.05          ← Number (0-1)        │
 * │     },                                                 │
 * │     {                                                  │
 * │       label: "vest",            ← String              │
 * │       confidence: 0.95          ← Number (0-1)        │
 * │     }                                                  │
 * │   ]                                                    │
 * │ }                                                      │
 * └─────────────────────────────────────────────────────────┘
 */

// ============================================================================
// SUMMARY
// ============================================================================

/**
 * RESULT STRUCTURE SUMMARY:
 * 
 * result = {
 *     detected: boolean,      // true if vest detected (confidence > 0.5)
 *     confidence: number,     // vest detection confidence (0.0 - 1.0)
 *     results: array          // array of {label: string, confidence: number}
 * }
 * 
 * TYPICAL VALUES:
 * - detected: true or false
 * - confidence: 0.0 to 1.0
 * - results.length: 2 (for no_vest and vest)
 * 
 * HOW TO USE:
 * GREAT:
 * - result.detected (simple check)
 * - result.confidence (percentage: result.confidence * 100)
 * - result.results (all predictions)
 * 
 * Data types:
 * - detected: boolean
 * - confidence: float (0-1)
 * - results: Array of objects
 *   - Each object has: label (string) and confidence (float 0-1)
 */

