var exec = require('cordova/exec');

module.exports = {
    /**
     * Detect a vest in an image
     * @param {string} base64Image - Base64 encoded image string (with or without data URI prefix)
     * @param {function} successCallback - Success callback with detection results
     * @param {function} errorCallback - Error callback
     */
    detectVest: function(base64Image, successCallback, errorCallback) {
        console.log('[VestDetection.js] detectVest called');
        console.log('[VestDetection.js] Arguments:', arguments);
        
        if (typeof base64Image !== 'string' || !base64Image) {
            console.log('[VestDetection.js] Invalid image - calling error callback');
            if (errorCallback) {
                errorCallback('Invalid base64 image provided');
            }
            return;
        }

        console.log('[VestDetection.js] About to call exec');
        try {
            exec(
                function(result) {
                    console.log('[VestDetection.js] Success from native:', result);
                    if (successCallback) successCallback(result);
                },
                function(error) {
                    console.log('[VestDetection.js] Error from native:', error);
                    if (errorCallback) errorCallback(error);
                },
                'VestDetection',
                'detectVest',
                [base64Image]
            );
            console.log('[VestDetection.js] exec call completed');
        } catch(e) {
            console.log('[VestDetection.js] EXCEPTION in exec:', e);
            if (errorCallback) errorCallback('Exception: ' + e.message);
        }
    }
};
