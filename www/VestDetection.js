var exec = require('cordova/exec');

module.exports = {
    /**
     * Detect a vest in an image
     * @param {string} base64Image - Base64 encoded image string (with or without data URI prefix)
     * @param {function} successCallback - Success callback with detection results
     * @param {function} errorCallback - Error callback
     * @param {number} [threshold=0.75] - Confidence threshold (0.0 to 1.0) for vest detection. Default is 0.75 (75%)
     * @param {boolean} [isDebugMode=false] - Enable debug logging. Default is false (logs disabled to save memory)
     */
    detectVest: function(base64Image, successCallback, errorCallback, threshold, isDebugMode) {
        // Default debug mode to false to prevent log accumulation
        var debugMode = false;
        if (typeof isDebugMode === 'boolean') {
            debugMode = isDebugMode;
        }
        
        if (debugMode) {
            console.log('[VestDetection.js] detectVest called');
            console.log('[VestDetection.js] Arguments:', arguments);
        }
        
        if (typeof base64Image !== 'string' || !base64Image) {
            if (debugMode) {
                console.log('[VestDetection.js] Invalid image - calling error callback');
            }
            if (errorCallback) {
                errorCallback('Invalid base64 image provided');
            }
            return;
        }

        // Default threshold to 0.75 (75%) if not provided or invalid
        var confidenceThreshold = 0.75;
        if (typeof threshold === 'number' && threshold >= 0 && threshold <= 1) {
            confidenceThreshold = threshold;
        } else if (threshold !== undefined && threshold !== null) {
            if (debugMode) {
                console.log('[VestDetection.js] Invalid threshold, using default 0.75');
            }
        }
        if (debugMode) {
            console.log('[VestDetection.js] Using confidence threshold:', confidenceThreshold);
        }

        if (debugMode) {
            console.log('[VestDetection.js] About to call exec');
        }
        try {
            exec(
                function(result) {
                    if (debugMode) {
                        console.log('[VestDetection.js] Success from native:', result);
                    }
                    if (successCallback) successCallback(result);
                },
                function(error) {
                    if (debugMode) {
                        console.log('[VestDetection.js] Error from native:', error);
                    }
                    if (errorCallback) errorCallback(error);
                },
                'VestDetection',
                'detectVest',
                [base64Image, confidenceThreshold, debugMode]
            );
            if (debugMode) {
                console.log('[VestDetection.js] exec call completed');
            }
        } catch(e) {
            if (debugMode) {
                console.log('[VestDetection.js] EXCEPTION in exec:', e);
            }
            if (errorCallback) errorCallback('Exception: ' + e.message);
        }
    }
};
