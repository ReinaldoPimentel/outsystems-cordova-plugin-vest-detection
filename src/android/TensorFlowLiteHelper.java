package com.outsystems.cordova.plugins.vestdetection;

import android.content.Context;
import android.content.res.AssetManager;
import android.graphics.Bitmap;

import org.tensorflow.lite.Interpreter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.ByteBuffer;
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
            tflite = new Interpreter(modelBuffer);
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
        InputStream inputStream = null;
        try {
            inputStream = assetManager.open(MODEL_PATH);
            int length = inputStream.available();
            android.util.Log.d("TensorFlowLiteHelper", "Model file size: " + length);
            
            byte[] buffer = new byte[length];
            inputStream.read(buffer);
            inputStream.close();
            
            return ByteBuffer.wrap(buffer).asReadOnlyBuffer();
        } catch (Exception e) {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException ignored) {}
            }
            android.util.Log.e("TensorFlowLiteHelper", "Error loading model: " + e.getMessage());
            throw new IOException("Failed to load model", e);
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
        
        float[][] results = new float[1][labels.size()];
        tflite.run(byteBuffer, results);
        
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

