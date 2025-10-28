package com.outsystems.cordova.plugins.vestdetection;

import android.content.Context;
import android.content.res.AssetManager;
import android.graphics.Bitmap;

import org.tensorflow.lite.Interpreter;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.channels.FileChannel.MapMode;
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
        MappedByteBuffer modelBuffer = loadModelFile();
        tflite = new Interpreter(modelBuffer);
        loadLabels();
    }

    private MappedByteBuffer loadModelFile() throws IOException {
        AssetManager assetManager = context.getAssets();
        FileInputStream inputStream = (FileInputStream) assetManager.open(MODEL_PATH);
        FileChannel fileChannel = inputStream.getChannel();
        long startOffset = 0;
        long declaredLength = fileChannel.size();
        return fileChannel.map(MapMode.READ_ONLY, startOffset, declaredLength);
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

