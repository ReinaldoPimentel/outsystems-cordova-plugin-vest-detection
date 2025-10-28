package com.outsystems.cordova.plugins.vestdetection;

import android.content.Context;
import android.content.res.AssetManager;
import android.graphics.Bitmap;

import org.tensorflow.lite.Interpreter;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.channels.FileChannel;
import java.nio.MappedByteBuffer;
import java.util.ArrayList;
import java.util.List;

public class TensorFlowLiteHelper {
    private static final String MODEL_PATH = "vest_model.tflite";
    private static final String LABEL_PATH = "labels.txt";
    private static final int INPUT_SIZE = 224;
    private static final int IMAGE_MEAN = 128;
    private static final float IMAGE_STD = 128.0f;

    private Interpreter tflite;
    private List<String> labels;
    private Context context;

    public TensorFlowLiteHelper(Context context) {
        this.context = context;
        labels = new ArrayList<>();
    }

    public void loadModel() throws IOException {
        android.util.Log.d("TensorFlowLiteHelper", "Loading model...");
        MappedByteBuffer modelBuffer = loadModelFile();
        if (modelBuffer == null) {
            android.util.Log.e("TensorFlowLiteHelper", "Model buffer is null!");
            return;
        }
        android.util.Log.d("TensorFlowLiteHelper", "Model buffer loaded, creating Interpreter...");
        try {
            tflite = new Interpreter(modelBuffer, new Interpreter.Options());
            if (tflite == null) {
                android.util.Log.e("TensorFlowLiteHelper", "Interpreter is null after creation!");
            } else {
                android.util.Log.d("TensorFlowLiteHelper", "Interpreter created successfully");
            }
        } catch (Exception e) {
            android.util.Log.e("TensorFlowLiteHelper", "Error creating Interpreter: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Failed to create Interpreter", e);
        }
        loadLabels();
        android.util.Log.d("TensorFlowLiteHelper", "Labels loaded");
    }

    private MappedByteBuffer loadModelFile() throws IOException {
        android.util.Log.d("TensorFlowLiteHelper", "Trying to load model from: " + MODEL_PATH);
        AssetManager assetManager = context.getAssets();
        InputStream inputStream = assetManager.open(MODEL_PATH);
        try {
            int length = inputStream.available();
            android.util.Log.d("TensorFlowLiteHelper", "Model file size: " + length);
            
            byte[] buffer = new byte[length];
            int totalBytesRead = 0;
            while (totalBytesRead < length) {
                int bytesRead = inputStream.read(buffer, totalBytesRead, length - totalBytesRead);
                if (bytesRead == -1) {
                    break;
                }
                totalBytesRead += bytesRead;
            }
            
            android.util.Log.d("TensorFlowLiteHelper", "Read " + totalBytesRead + " bytes");
            
            // Need to create a file and memory-map it
            java.io.File cacheFile = new java.io.File(context.getCacheDir(), "model_temp.tflite");
            java.io.FileOutputStream fos = new java.io.FileOutputStream(cacheFile);
            fos.write(buffer);
            fos.close();
            
            java.io.FileInputStream fis = new java.io.FileInputStream(cacheFile);
            java.nio.channels.FileChannel fileChannel = fis.getChannel();
            MappedByteBuffer mappedBuffer = fileChannel.map(java.nio.channels.FileChannel.MapMode.READ_ONLY, 0, cacheFile.length());
            
            fis.close();
            return mappedBuffer;
        } finally {
            inputStream.close();
        }
    }

    private void loadLabels() throws IOException {
        AssetManager assetManager = context.getAssets();
        BufferedReader reader = new BufferedReader(
            new InputStreamReader(assetManager.open(LABEL_PATH))
        );
        String line;
        while ((line = reader.readLine()) != null) {
            if (!line.trim().isEmpty()) {
                labels.add(line.trim());
            }
        }
        reader.close();
    }

    public float[][] classifyImage(Bitmap bitmap) {
        android.util.Log.d("TensorFlowLiteHelper", "classifyImage called");
        if (tflite == null) {
            android.util.Log.e("TensorFlowLiteHelper", "Interpreter is null! Model not loaded.");
            android.util.Log.e("TensorFlowLiteHelper", "Context: " + context);
            android.util.Log.e("TensorFlowLiteHelper", "Labels count: " + labels.size());
            return null;
        }
        android.util.Log.d("TensorFlowLiteHelper", "Interpreter exists, processing image...");
        Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, INPUT_SIZE, INPUT_SIZE, true);
        
        int[] intValues = new int[INPUT_SIZE * INPUT_SIZE];
        resizedBitmap.getPixels(intValues, 0, resizedBitmap.getWidth(), 0, 0, 
                                resizedBitmap.getWidth(), resizedBitmap.getHeight());
        
        float[][][][] byteBuffer = new float[1][INPUT_SIZE][INPUT_SIZE][3];
        
        for (int i = 0; i < INPUT_SIZE; i++) {
            for (int j = 0; j < INPUT_SIZE; j++) {
                int pixel = intValues[i * INPUT_SIZE + j];
                byteBuffer[0][i][j][0] = ((pixel >> 16) & 0xFF - IMAGE_MEAN) / IMAGE_STD;
                byteBuffer[0][i][j][1] = ((pixel >> 8) & 0xFF - IMAGE_MEAN) / IMAGE_STD;
                byteBuffer[0][i][j][2] = ((pixel) & 0xFF - IMAGE_MEAN) / IMAGE_STD;
            }
        }
        
        // Output shape is [1, 1] (sigmoid output)
        float[][] output = new float[1][1];
        tflite.run(byteBuffer, output);
        android.util.Log.d("TensorFlowLiteHelper", "Inference result: " + output[0][0]);
        
        // Convert to [1, 2] format for compatibility
        float[][] results = new float[1][2];
        float vestScore = output[0][0];
        results[0][0] = 1.0f - vestScore; // no_vest probability
        results[0][1] = vestScore; // vest probability
        
        return results;
    }

    public String getLabel(int index) {
        if (index >= 0 && index < labels.size()) {
            return labels.get(index);
        }
        return "unknown";
    }

    public void close() {
        if (tflite != null) {
            tflite.close();
            tflite = null;
        }
    }
}

