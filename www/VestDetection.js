var exec = require('cordova/exec');

var VestDetection = {
    /**
     * Detect a vest in an image
     * @param {string} base64Image - Base64 encoded image string (with or without data URI prefix)
     * @param {function} successCallback - Success callback with detection results
     * @param {function} errorCallback - Error callback
     */
    detectVest: function(base64Image, successCallback, errorCallback) {
        if (typeof base64Image !== 'string' || !base64Image) {
            errorCallback('Invalid base64 image provided');
            return;
        }

        exec(
            successCallback,
            errorCallback,
            'VestDetection',
            'detectVest',
            [base64Image]
        );
    }
};

module.exports = VestDetection;

