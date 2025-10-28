/**
 * PROMISE EXPLANATION
 * 
 * Understanding how resolve and reject work in Promises
 */

// ============================================================================
// BASIC CONCEPT
// ============================================================================

/**
 * You are NOT providing resolve and reject - the Promise constructor is!
 * 
 * When you create a new Promise, you pass it ONE function (called the "executor")
 * The Promise constructor calls your executor function and GIVES IT these two functions:
 * - resolve: a function to call when the operation succeeds
 * - reject: a function to call when the operation fails
 */

// ============================================================================
// EXAMPLE 1: Simple Promise Explanation
// ============================================================================

function makeAPromise() {
    // This is what YOU provide - just one function
    return new Promise(function(resolve, reject) {
        //                           ↑        ↑
        // These are PROVIDED BY the Promise constructor, not by you!
        
        // Now you use them to control when the promise succeeds or fails
        
        // Example: Simulate a success
        setTimeout(function() {
            var success = true; // Simulate your operation
            
            if (success) {
                // Call resolve to make the promise succeed
                resolve("Operation completed!");
            } else {
                // Call reject to make the promise fail
                reject("Something went wrong");
            }
        }, 1000);
    });
}

// How to use it:
makeAPromise()
    .then(function(result) {
        // This runs when resolve() was called
        console.log("Success:", result);
    })
    .catch(function(error) {
        // This runs when reject() was called
        console.log("Error:", error);
    });

// ============================================================================
// EXAMPLE 2: Step by Step - Creating a Promise
// ============================================================================

/**
 * Step 1: You call new Promise()
 */
var myPromise = new Promise(function(/* resolve, reject */) {
    // Step 2: Promise constructor automatically creates resolve and reject functions
    // Step 3: Promise passes these functions to your executor function as parameters
    
    console.log("Promise executor is running");
    
    // You can name these parameters anything you want!
    // You could name them "success" and "failure" if you prefer
});

/**
 * The above code is equivalent to:
 */

var myPromise2 = new Promise(function(success, failure) {
    // success and failure are just aliases - they do the same thing as resolve/reject
    console.log("Promise executor is running");
});

// ============================================================================
// EXAMPLE 3: Converting Your Plugin to Promise (Your Original Question)
// ============================================================================

function detectVestPromise(base64Image) {
    // Step 1: Create a new Promise
    return new Promise(function(resolve, reject) {
        //                               ↑        ↑
        // These are GIVEN TO YOU by the Promise constructor
        // You don't create them, you just RECEIVE them
        
        // Step 2: Call your existing callback-based function
        cordova.plugins.VestDetection.detectVest(
            base64Image,
            
            // Step 3: In the success callback, call resolve()
            function(result) {
                // When the plugin succeeds, call resolve with the result
                resolve(result);  // This makes the promise succeed with this result
            },
            
            // Step 4: In the error callback, call reject()
            function(error) {
                // When the plugin fails, call reject with the error
                reject(new Error(error));  // This makes the promise fail with this error
            }
        );
    });
}

// ============================================================================
// EXAMPLE 4: Visual Breakdown of What Happens
// ============================================================================

function detectVestPromiseVisual(base64Image) {
    
    // ┌─────────────────────────────────────────────────────┐
    // │ YOU create a new Promise                            │
    // │ You give it a function (executor)                   │
    // └─────────────────────────────────────────────────────┘
    return new Promise(function(resolve, reject) {
        
        // ┌─────────────────────────────────────────────────┐
        // │ The Promise constructor:                        │
        // │ 1. Creates resolve() function                   │
        // │ 2. Creates reject() function                    │
        // │ 3. Calls your executor function                 │
        // │ 4. Passes resolve and reject as parameters      │
        // └─────────────────────────────────────────────────┘
        
        console.log("Resolve is a function:", typeof resolve); // "function"
        console.log("Reject is a function:", typeof reject);   // "function"
        
        // NOW you have these functions to use inside your executor
        // You call them to tell the Promise what happened
        
        // Use the existing callback-based API
        cordova.plugins.VestDetection.detectVest(
            base64Image,
            
            // When it succeeds, tell the Promise it succeeded
            function(result) {
                // You CALL resolve() and pass it the result
                resolve(result);
                //          ↑
                // This signals the Promise to go to .then()
            },
            
            // When it fails, tell the Promise it failed
            function(error) {
                // You CALL reject() and pass it the error
                reject(new Error(error));
                //           ↑
                // This signals the Promise to go to .catch()
            }
        );
    });
}

// ============================================================================
// EXAMPLE 5: Manual Example Without Real API
// ============================================================================

function fakeNetworkRequest(url) {
    return new Promise(function(resolve, reject) {
        console.log("Starting fake request to", url);
        
        // Simulate an async operation
        setTimeout(function() {
            var success = Math.random() > 0.3; // 70% chance of success
            
            if (success) {
                var data = { url: url, status: "ok" };
                resolve(data);  // Succeed with data
                console.log("Called resolve() with:", data);
            } else {
                reject("Network error");  // Fail with error
                console.log("Called reject() with error");
            }
        }, 1000);
    });
}

// Using it:
fakeNetworkRequest("https://example.com")
    .then(function(data) {
        // This runs because resolve() was called
        console.log("Got data:", data);
    })
    .catch(function(error) {
        // This runs because reject() was called
        console.log("Got error:", error);
    });

// ============================================================================
// EXAMPLE 6: Comparison - Without Promise (Callbacks Only)
// ============================================================================

// The OLD WAY (what your plugin does now)
function detectVestOld(base64Image, onSuccess, onError) {
    cordova.plugins.VestDetection.detectVest(
        base64Image,
        onSuccess,  // Call this when done
        onError     // Call this when error
    );
}

// Usage - callback hell:
detectVestOld(base64Image, 
    function(result) {
        console.log("Got result:", result);
        
        // What if you need to do another operation here?
        // It gets nested deeper and deeper... ⬇️
        
        detectVestOld(anotherImage,
            function(result2) {
                console.log("Got second result:", result2);
                
                detectVestOld(yetAnotherImage,
                    function(result3) {
                        console.log("Got third result:", result3);
                        // This is callback hell!
                    },
                    function(error) {
                        console.error("Third failed:", error);
                    }
                );
            },
            function(error) {
                console.error("Second failed:", error);
            }
        );
    },
    function(error) {
        console.error("First failed:", error);
    }
);

// ============================================================================
// EXAMPLE 7: The NEW WAY (with Promises)
// ============================================================================

function detectVestNew(base64Image) {
    return new Promise(function(resolve, reject) {
        // You receive resolve and reject - just call them at the right time
        cordova.plugins.VestDetection.detectVest(
            base64Image,
            resolve,  // On success, call resolve (which you received as a parameter)
            reject    // On error, call reject (which you received as a parameter)
        );
    });
}

// Usage - clean and flat:
detectVestNew(base64Image)
    .then(function(result) {
        console.log("Got result:", result);
        return detectVestNew(anotherImage);  // Return another promise
    })
    .then(function(result2) {
        console.log("Got second result:", result2);
        return detectVestNew(yetAnotherImage);
    })
    .then(function(result3) {
        console.log("Got third result:", result3);
    })
    .catch(function(error) {
        console.error("Any step failed:", error);
    });

// ============================================================================
// SIMPLE SUMMARY
// ============================================================================

/**
 * Q: Are resolve and reject input parameters that I provide?
 * A: NO! They are FUNCTIONS provided TO YOU by the Promise constructor.
 * 
 * What you DO:
 * 1. Create a new Promise
 * 2. Pass it a function
 * 3. Inside that function, you RECEIVE resolve and reject as parameters
 * 4. You CALL resolve() when your operation succeeds
 * 5. You CALL reject() when your operation fails
 * 
 * Think of it like this:
 * - Promise constructor: "Here are two functions (resolve and reject) - call 
 *   them to tell me when you're done and whether it worked or not"
 * - You: "OK, I'll call resolve() when it succeeds and reject() when it fails"
 */

// ============================================================================
// YOUR ORIGINAL FUNCTION EXPLAINED LINE BY LINE
// ============================================================================

function detectVestPromise(base64Image) {
    // 1. Create a new Promise object
    return new Promise(function(resolve, reject) {
        // 2. You receive resolve and reject functions as parameters
        //    (These were created by the Promise constructor)
        
        // 3. Call the existing plugin
        cordova.plugins.VestDetection.detectVest(
            base64Image,
            
            // 4. Success handler - when this runs, call resolve()
            function(result) {
                resolve(result);  
                // ↑ Call resolve to tell the Promise: "I'm done, here's the result"
            },
            
            // 5. Error handler - when this runs, call reject()
            function(error) {
                reject(new Error(error));  
                // ↑ Call reject to tell the Promise: "Something went wrong, here's the error"
            }
        );
    });
}

