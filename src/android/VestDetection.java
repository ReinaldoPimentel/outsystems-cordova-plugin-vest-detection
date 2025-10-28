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
        if (ACTION_DETECT_VEST.equals(action)) {
            String base64Image = args.getString(0);
            this.detectVest(base64Image, callbackContext);
            return true;
        }
        return false;
    }

    @Override
    public void pluginInitialize() {
        super.pluginInitialize();
        try {
            tfliteHelper = new TensorFlowLiteHelper(cordova.getActivity());
            tfliteHelper.loadModel();
        } catch (IOException e) {
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
                    Bitmap bitmap = decodeBase64Image(base64Image);
                    if (bitmap == null) {
                        callbackContext.error("Failed to decode base64 image");
                        return;
                    }

                    float[][] results = tfliteHelper.classifyImage(bitmap);
                    
                    JSONObject result = new JSONObject();
                    JSONArray resultsArray = new JSONArray();
                    
                    int vestIndex = 1;
                    float vestConfidence = results[0][vestIndex];
                    boolean detected = vestConfidence > 0.5f;
                    
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

