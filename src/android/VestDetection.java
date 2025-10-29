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

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        android.util.Log.d("VestDetection", "execute called with action: " + action);
        if (ACTION_DETECT_VEST.equals(action)) {
            String base64Image = args.getString(0);
            android.util.Log.d("VestDetection", "Calling detectVest with image length: " + (base64Image != null ? base64Image.length() : 0));
            this.detectVest(base64Image, callbackContext);
            return true;
        }
        android.util.Log.w("VestDetection", "Unknown action: " + action);
        return false;
    }

    @Override
    public void pluginInitialize() {
        super.pluginInitialize();
        android.util.Log.d("VestDetection", "===== PLUGIN INITIALIZE CALLED =====");
        try {
            android.util.Log.d("VestDetection", "Initializing plugin");
            tfliteHelper = new TensorFlowLiteHelper(cordova.getActivity());
            tfliteHelper.loadModel();
            android.util.Log.d("VestDetection", "Model loaded successfully");
        } catch (Exception e) {
            android.util.Log.e("VestDetection", "Error initializing: " + e.getMessage());
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

    private void detectVest(String base64Image, final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                try {
                    android.util.Log.d("VestDetection", "Starting detection with: " + base64Image);
                    Bitmap bitmap = decodeBase64Image(base64Image);
                    if (bitmap == null) {
                        android.util.Log.e("VestDetection", "Failed to decode base64 image");
                        callbackContext.error("Failed to decode base64 image");
                        return;
                    }
                    android.util.Log.d("VestDetection", "Image decoded successfully");

                    if (tfliteHelper == null) {
                        android.util.Log.e("VestDetection", "tfliteHelper is null!");
                        callbackContext.error("Model not initialized");
                        return;
                    }
                    
                    float[][] results = tfliteHelper.classifyImage(bitmap);
                    if (results == null) {
                        android.util.Log.e("VestDetection", "Classification returned null");
                        callbackContext.error("Classification failed");
                        return;
                    }
                    
                    android.util.Log.d("VestDetection", "Raw results: [" + results[0][0] + ", " + results[0][1] + "]");
                    
                    JSONObject result = new JSONObject();
                    JSONArray resultsArray = new JSONArray();
                    
                    int vestIndex = 1;
                    float vestConfidence = results[0][vestIndex];
                    android.util.Log.d("VestDetection", "Vest confidence: " + vestConfidence);
                    boolean detected = vestConfidence > 0.5f;
                    android.util.Log.d("VestDetection", "Detected: " + detected);
                    
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
                    callbackContext.error("Error during detection: " + e.getMessage());
                    e.printStackTrace();
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

