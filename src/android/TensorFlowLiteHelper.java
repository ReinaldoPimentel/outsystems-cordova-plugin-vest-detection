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
    private static final float IMAGE_MEAN = 127.5f;
    private static final float IMAGE_STD = 127.5f;

    private Interpreter tflite;
    private List<String> labels;
    private Context context;
    private java.io.FileInputStream modelFileInputStream; // Keep reference to keep mapped buffer valid
    private java.io.File tempModelFile; // Keep reference to delete on close

    public TensorFlowLiteHelper(Context context) {
        this.context = context;
        labels = new ArrayList<>();
    }

    public void loadModel() throws IOException {
        loadModel(false);
    }
    
    public void loadModel(boolean debugMode) throws IOException {
        if (debugMode) {
            android.util.Log.d("TensorFlowLiteHelper", "Loading model...");
        }
        MappedByteBuffer modelBuffer = loadModelFile(debugMode);
        if (modelBuffer == null) {
            android.util.Log.e("TensorFlowLiteHelper", "Model buffer is null!");
            return;
        }
        if (debugMode) {
            android.util.Log.d("TensorFlowLiteHelper", "Model buffer loaded, creating Interpreter...");
        }
        try {
            tflite = new Interpreter(modelBuffer, new Interpreter.Options());
            if (tflite == null) {
                android.util.Log.e("TensorFlowLiteHelper", "Interpreter is null after creation!");
            } else if (debugMode) {
                android.util.Log.d("TensorFlowLiteHelper", "Interpreter created successfully");
            }
        } catch (Exception e) {
            android.util.Log.e("TensorFlowLiteHelper", "Error creating Interpreter: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Failed to create Interpreter", e);
        }
        loadLabels();
        if (debugMode) {
            android.util.Log.d("TensorFlowLiteHelper", "Labels loaded");
        }
    }

    private MappedByteBuffer loadModelFile() throws IOException {
        return loadModelFile(false);
    }
    
    private MappedByteBuffer loadModelFile(boolean debugMode) throws IOException {
        if (debugMode) {
            android.util.Log.d("TensorFlowLiteHelper", "Trying to load model from: " + MODEL_PATH);
        }
        AssetManager assetManager = context.getAssets();
        InputStream inputStream = assetManager.open(MODEL_PATH);
        try {
            int length = inputStream.available();
            if (debugMode) {
                android.util.Log.d("TensorFlowLiteHelper", "Model file size: " + length);
            }
            
            byte[] buffer = new byte[length];
            int totalBytesRead = 0;
            while (totalBytesRead < length) {
                int bytesRead = inputStream.read(buffer, totalBytesRead, length - totalBytesRead);
                if (bytesRead == -1) {
                    break;
                }
                totalBytesRead += bytesRead;
            }
            if (debugMode) {
                android.util.Log.d("TensorFlowLiteHelper", "Read " + totalBytesRead + " bytes");
            }
            
            // Need to create a file and memory-map it
            tempModelFile = new java.io.File(context.getCacheDir(), "model_temp.tflite");
            java.io.FileOutputStream fos = new java.io.FileOutputStream(tempModelFile);
            fos.write(buffer, 0, totalBytesRead); // Only write the bytes we actually read
            fos.flush();
            fos.close();
            
            modelFileInputStream = new java.io.FileInputStream(tempModelFile);
            java.nio.channels.FileChannel fileChannel = modelFileInputStream.getChannel();
            MappedByteBuffer mappedBuffer = fileChannel.map(java.nio.channels.FileChannel.MapMode.READ_ONLY, 0, totalBytesRead);
            
            // Don't close FileInputStream here - the mapped buffer needs the channel to remain open
            // We'll close it in the close() method
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
        return classifyImage(bitmap, false);
    }
    
    public float[][] classifyImage(Bitmap bitmap, boolean debugMode) {
        if (debugMode) {
            android.util.Log.d("TensorFlowLiteHelper", "classifyImage called");
        }
        if (tflite == null) {
            android.util.Log.e("TensorFlowLiteHelper", "Interpreter is null! Model not loaded.");
            if (debugMode) {
                android.util.Log.e("TensorFlowLiteHelper", "Context: " + context);
                android.util.Log.e("TensorFlowLiteHelper", "Labels count: " + labels.size());
            }
            return null;
        }
        if (debugMode) {
            android.util.Log.d("TensorFlowLiteHelper", "Interpreter exists, processing image...");
        }
        Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, INPUT_SIZE, INPUT_SIZE, true);
        
        int[] intValues = new int[INPUT_SIZE * INPUT_SIZE];
        resizedBitmap.getPixels(intValues, 0, resizedBitmap.getWidth(), 0, 0, 
                                resizedBitmap.getWidth(), resizedBitmap.getHeight());
        
        float[][][][] byteBuffer = new float[1][INPUT_SIZE][INPUT_SIZE][3];
        
        for (int i = 0; i < INPUT_SIZE; i++) {
            for (int j = 0; j < INPUT_SIZE; j++) {
                int pixel = intValues[i * INPUT_SIZE + j];
                byteBuffer[0][i][j][0] = (((pixel >> 16) & 0xFF) - IMAGE_MEAN) / IMAGE_STD;
                byteBuffer[0][i][j][1] = (((pixel >> 8) & 0xFF) - IMAGE_MEAN) / IMAGE_STD;
                byteBuffer[0][i][j][2] = (((pixel) & 0xFF) - IMAGE_MEAN) / IMAGE_STD;
            }
        }
        
        // Output shape is [1, 1] (sigmoid output)
        float[][] output = new float[1][1];
        tflite.run(byteBuffer, output);
        
        // The model outputs sigmoid: 1.0 = vest detected, 0.0 = no vest
        float rawModelOutput = output[0][0];
        if (debugMode) {
            android.util.Log.d("TensorFlowLiteHelper", "Raw model output (sigmoid): " + rawModelOutput);
        }
        
        // Convert to [1, 2] format for compatibility
        float[][] results = new float[1][2];
        results[0][0] = 1.0f - rawModelOutput; // no_vest probability
        results[0][1] = rawModelOutput; // vest probability
        
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
        // Close the FileInputStream to release the mapped buffer
        if (modelFileInputStream != null) {
            try {
                modelFileInputStream.close();
                modelFileInputStream = null;
            } catch (IOException e) {
                // Ignore
            }
        }
        // Delete the temporary file
        if (tempModelFile != null && tempModelFile.exists()) {
            tempModelFile.delete();
            tempModelFile = null;
        }
    }
}

