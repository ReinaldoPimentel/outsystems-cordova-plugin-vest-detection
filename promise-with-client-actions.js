/**
 * PROMISE WITH CLIENT ACTIONS - OutSystems Context
 * 
 * How to execute your own client actions with Promises
 */

// ============================================================================
// OPTION 1: DO YOUR CLIENT ACTION INSIDE THE SUCCESS CALLBACK
// ============================================================================

function detectVestPromise(base64Image, myClientAction) {
    return new Promise(function(resolve, reject) {
        cordova.plugins.VestDetection.detectVest(
            base64Image,
            function(result) {
                // DO YOUR CLIENT ACTION HERE (before resolve)
                console.log("Processing result...");
                
                // Example: Update UI
                UpdateUI(result);
                
                // Example: Call another service
                myClientAction(result);
                
                // Example: Do any additional processing
                var processedResult = {
                    detected: result.detected,
                    confidence: result.confidence,
                    timestamp: new Date()
                };
                
                // THEN resolve with the result (or processed result)
                resolve(processedResult);
                
                // ❌ DON'T put code here - it will run but won't affect the promise
                console.log("This won't be part of the promise chain");
            },
            function(error) {
                reject(new Error(error));
            }
        );
    });
}

// Usage:
detectVestPromise(base64Image, MyClientAction)
    .then(function(result) {
        // This receives the processed result
        console.log("Final result:", result);
    });

// ============================================================================
// OPTION 2: CHAIN WITH .then() AFTER THE PROMISE (RECOMMENDED FOR OUTSYSTEMS)
// ============================================================================

function detectVestSimplePromise(base64Image) {
    return new Promise(function(resolve, reject) {
        cordova.plugins.VestDetection.detectVest(
            base64Image,
            resolve,  // Just resolve with the raw result
            reject
        );
    });
}

// Then do your client action in the .then() chain:
detectVestSimplePromise(base64Image)
    .then(function(result) {
        // Your client actions go here
        console.log("Step 1: Got result from plugin");
        
        // Call your OutSystems client action
        MyClientAction(result);
        
        // Update UI
        UpdateUI(result);
        
        // Maybe call another client action
        if (result.detected) {
            OnVestDetected(result);
        } else {
            OnNoVestDetected(result);
        }
        
        // Return the result for the next .then() if needed
        return result;
    })
    .then(function(result) {
        // This runs after the previous .then()
        console.log("Step 2: Doing additional processing");
        LogToServer(result);
    })
    .catch(function(error) {
        // Any errors from above will be caught here
        console.error("Error:", error);
        ShowErrorToUser(error);
    });

// ============================================================================
// OPTION 3: USING ASYNC/AWAIT (CLEANEST FOR OUTSYSTEMS)
// ============================================================================

async function detectVestWithClientActions(base64Image) {
    try {
        // 1. Get the result from the plugin
        var result = await detectVestSimplePromise(base64Image);
        
        // 2. NOW you can run your client actions
        console.log("Got result:", result);
        
        // Call your OutSystems client actions
        MyClientAction(result);
        UpdateUI(result);
        
        if (result.detected) {
            OnVestDetected(result);
        } else {
            OnNoVestDetected(result);
        }
        
        // 3. Return the final result if needed
        return result;
        
    } catch (error) {
        // Handle errors
        console.error("Detection failed:", error);
        ShowErrorToUser(error);
    }
}

// Usage:
detectVestWithClientActions(base64Image)
    .then(function(result) {
        console.log("All done!");
    });

// ============================================================================
// OPTION 4: DIRECT CALLBACK APPROACH (SIMPLEST)
// ============================================================================

function detectVestWithCallback(base64Image) {
    cordova.plugins.VestDetection.detectVest(
        base64Image,
        function(result) {
            // Do all your client actions directly here
            console.log("Success!", result);
            
            // Your client actions:
            MyClientAction(result);
            UpdateUI(result);
            
            if (result.detected) {
                OnVestDetected(result);
            } else {
                OnNoVestDetected(result);
            }
            
            // You can still do additional processing
            ProcessResult(result);
        },
        function(error) {
            console.error("Error:", error);
            ShowErrorToUser(error);
        }
    );
}

// ============================================================================
// OUTSYSTEMS-SPECIFIC EXAMPLES
// ============================================================================

/**
 * Example 1: OutSystems with Server Action Call
 */
async function detectAndSaveToServer(base64Image) {
    try {
        // Detect vest
        var detectionResult = await detectVestSimplePromise(base64Image);
        
        // Prepare data for server
        var serverData = {
            imageBase64: base64Image,
            detected: detectionResult.detected,
            confidence: detectionResult.confidence,
            timestamp: new Date().toISOString()
        };
        
        // Call OutSystems server action
        var serverResponse = await AjaxExecuteServerAction('SaveDetectionResult', serverData);
        
        // Update UI with response
        UpdateUI(serverResponse);
        
        return detectionResult;
        
    } catch (error) {
        console.error("Error:", error);
        ShowError(error);
    }
}

/**
 * Example 2: OutSystems with Form Updates
 */
async function detectAndUpdateForm(base64Image) {
    try {
        // 1. Show loading state
        Form.setValidation('IsProcessing', true);
        BlockWidget.ShowLoading();
        
        // 2. Detect vest
        var result = await detectVestSimplePromise(base64Image);
        
        // 3. Update form fields with results
        Form.setValue('IsVestDetected', result.detected);
        Form.setValue('Confidence', result.confidence);
        
        // 4. Update labels based on result
        if (result.detected) {
            Label.setClass('ResultLabel', 'success');
            Label.setText('ResultLabel', 'Vest Detected!');
        } else {
            Label.setClass('ResultLabel', 'warning');
            Label.setText('ResultLabel', 'No Vest Detected');
        }
        
        // 5. Hide loading
        Form.setValidation('IsProcessing', false);
        BlockWidget.HideLoading();
        
        // 6. Save to local storage if needed
        LocalStorage.setItem('lastDetection', JSON.stringify(result));
        
        return result;
        
    } catch (error) {
        Form.setValidation('IsProcessing', false);
        BlockWidget.HideLoading();
        Notification.Error('Detection failed: ' + error.message);
    }
}

/**
 * Example 3: OutSystems with Multiple Client Actions
 */
function detectWithMultipleActions(base64Image) {
    cordova.plugins.VestDetection.detectVest(
        base64Image,
        function(result) {
            // Run multiple client actions in sequence or parallel
            
            // Update UI immediately
            UpdateDetectionUI(result);
            
            // Log to console
            ConsoleLog('Detection Result: ' + JSON.stringify(result));
            
            // Conditional client actions
            if (result.detected) {
                OnVestDetected(result);           // Client action 1
                PlaySuccessSound();               // Client action 2
                TriggerVibration();               // Client action 3
            } else {
                OnNoVestDetected(result);         // Client action 1
                PlayWarningSound();               // Client action 2
                ShowWarningNotification();        // Client action 3
            }
            
            // Always run these
            SaveToHistory(result);
            UpdateStatistics(result);
        },
        function(error) {
            HandleDetectionError(error);
        }
    );
}

// ============================================================================
// SUMMARY FOR OUTSYSTEMS
// ============================================================================

/**
 * ✅ CORRECT WAYS to add client actions:
 * 
 * 1. Inside the success callback (before resolve):
 *    function(result) {
 *        MyClientAction(result);
 *        resolve(result);
 *    }
 * 
 * 2. In a .then() chain after the promise:
 *    detectVestPromise(base64Image)
 *        .then(function(result) {
 *            MyClientAction(result);
 *        });
 * 
 * 3. After await with async/await:
 *    var result = await detectVestPromise(base64Image);
 *    MyClientAction(result);
 * 
 * ❌ DON'T put code after resolve():
 *    resolve(result);
 *    MyClientAction(result);  // This runs, but isn't part of the promise chain
 */

// ============================================================================
// FULL OUTSYSTEMS EXAMPLE
// ============================================================================

async function CompleteDetectionFlow(base64Image) {
    try {
        // Step 1: Detect vest using plugin
        var detectionResult = await detectVestSimplePromise(base64Image);
        
        // Step 2: Run your OutSystems client actions
        UpdateDetectionLabel(detectionResult.detected);
        UpdateConfidenceBar(detectionResult.confidence);
        
        // Step 3: Conditional logic
        if (detectionResult.detected) {
            NavigateToSuccessScreen();
        } else {
            ShowRetakeButton();
        }
        
        // Step 4: Call server action
        var serverResult = await AjaxExecuteServerAction(
            'SaveDetection', 
            {
                detected: detectionResult.detected,
                confidence: detectionResult.confidence,
                image: base64Image
            }
        );
        
        // Step 5: Final UI update
        ShowServerResponse(serverResult);
        
        return detectionResult;
        
    } catch (error) {
        // Error handling
        ShowErrorNotification('Detection failed');
        LogError(error);
    }
}

