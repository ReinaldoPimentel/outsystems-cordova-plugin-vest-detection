package com.outsystems.cordova.plugins.vestdetection;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Base64;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class VestDetection extends CordovaPlugin {

    private static final String ACTION_DETECT_VEST = "detectVest";
    private TensorFlowLiteHelper tfliteHelper;
    
    // Helper methods for conditional logging
    private void logE(String tag, String msg) {
        // Always log errors even in production
        android.util.Log.e(tag, msg);
    }
    
    private void logW(String tag, String msg) {
        // Always log warnings even in production
        android.util.Log.w(tag, msg);
    }
    
    private void logD(String tag, String msg, boolean debugMode) {
        if (debugMode) {
            android.util.Log.d(tag, msg);
        }
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (ACTION_DETECT_VEST.equals(action)) {
            String base64Image = args.getString(0);
            // Get threshold if provided, default to 0.75 (75%)
            double threshold = 0.75;
            if (args.length() > 1 && !args.isNull(1)) {
                try {
                    threshold = args.getDouble(1);
                    // Validate threshold range
                    if (threshold < 0.0 || threshold > 1.0) {
                        logW("VestDetection", "Invalid threshold " + threshold + ", using default 0.75");
                        threshold = 0.75;
                    }
                } catch (JSONException e) {
                    logW("VestDetection", "Failed to parse threshold, using default 0.75");
                    threshold = 0.75;
                }
            }
            // Get debug mode if provided, default to false
            boolean debugMode = false;
            if (args.length() > 2 && !args.isNull(2)) {
                try {
                    debugMode = args.getBoolean(2);
                } catch (JSONException e) {
                    debugMode = false;
                }
            }
            logD("VestDetection", "Calling detectVest with image length: " + (base64Image != null ? base64Image.length() : 0) + ", threshold: " + threshold, debugMode);
            this.detectVest(base64Image, (float)threshold, debugMode, callbackContext);
            return true;
        }
        logW("VestDetection", "Unknown action: " + action);
        return false;
    }

    @Override
    public void pluginInitialize() {
        super.pluginInitialize();
        try {
            tfliteHelper = new TensorFlowLiteHelper(cordova.getActivity());
            tfliteHelper.loadModel(false); // Disable debug logging during initialization
        } catch (Exception e) {
            logE("VestDetection", "Error initializing: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        if (tfliteHelper != null) {
            tfliteHelper.close();
        }
        super.onDestroy();
    }

    private void detectVest(String base64Image, final float threshold, final boolean debugMode, final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                try {
                    logD("VestDetection", "Starting detection", debugMode);
                    Bitmap bitmap = decodeBase64Image(base64Image);
                    if (bitmap == null) {
                        logE("VestDetection", "Failed to decode base64 image");
                        callbackContext.error("Failed to decode base64 image");
                        return;
                    }
                    logD("VestDetection", "Image decoded successfully", debugMode);

                    if (tfliteHelper == null) {
                        logE("VestDetection", "tfliteHelper is null!");
                        callbackContext.error("Model not initialized");
                        return;
                    }
                    
                    float[][] results = tfliteHelper.classifyImage(bitmap, debugMode);
                    if (results == null) {
                        logE("VestDetection", "Classification returned null");
                        callbackContext.error("Classification failed");
                        return;
                    }
                    
                    logD("VestDetection", "Raw results: [" + results[0][0] + ", " + results[0][1] + "]", debugMode);
                    
                    JSONObject result = new JSONObject();
                    JSONArray resultsArray = new JSONArray();
                    
                    int vestIndex = 1;
                    float vestConfidence = results[0][vestIndex];
                    logD("VestDetection", "Vest confidence: " + vestConfidence + ", threshold: " + threshold, debugMode);
                    // Use configurable confidence threshold for vest detection
                    boolean detected = vestConfidence >= threshold;
                    logD("VestDetection", "Detected: " + detected, debugMode);
                    
                    for (int i = 0; i < results[0].length; i++) {
                        JSONObject classResult = new JSONObject();
                        classResult.put("label", tfliteHelper.getLabel(i));
                        classResult.put("confidence", results[0][i]);
                        resultsArray.put(classResult);
                    }
                    
                    result.put("detected", detected);
                    result.put("confidence", vestConfidence);
                    result.put("results", resultsArray);
                    
                    callbackContext.success(result);
                    
                } catch (Exception e) {
                    logE("VestDetection", "Error during detection: " + e.getMessage());
                    callbackContext.error("Error during detection: " + e.getMessage());
                    if (debugMode) {
                        e.printStackTrace();
                    }
                }
            }
        });
    }

    private Bitmap decodeBase64Image(String base64Image) {
        try {
            String base64Data = base64Image;
            if (base64Image.contains(",")) {
                base64Data = base64Image.substring(base64Image.indexOf(",") + 1);
            }
            
            byte[] decodedBytes = Base64.decode(base64Data, Base64.DEFAULT);
            return BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}

