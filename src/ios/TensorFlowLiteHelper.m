#import "TensorFlowLiteHelper.h"
#import <TensorFlowLite/TensorFlowLite.h>

@implementation TensorFlowLiteHelper {
    TFLInterpreter* interpreter;
    NSArray* labels;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        labels = [self loadLabels];
    }
    return self;
}

- (NSArray*)loadLabels {
    NSString* labelsPath = [[NSBundle mainBundle] pathForResource:@"labels" ofType:@"txt"];
    if (!labelsPath) {
        return @[@"no_vest", @"vest"];
    }
    
    NSString* contents = [NSString stringWithContentsOfFile:labelsPath encoding:NSUTF8StringEncoding error:nil];
    if (!contents) {
        return @[@"no_vest", @"vest"];
    }
    
    NSArray* lines = [contents componentsSeparatedByString:@"\n"];
    NSMutableArray* loadedLabels = [NSMutableArray array];
    
    for (NSString* line in lines) {
        NSString* trimmed = [line stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
        if (trimmed.length > 0) {
            [loadedLabels addObject:trimmed];
        }
    }
    
    return loadedLabels.count > 0 ? loadedLabels : @[@"no_vest", @"vest"];
}

- (void)loadModel {
    NSString* modelPath = [[NSBundle mainBundle] pathForResource:@"vest_model" ofType:@"tflite"];
    
    NSError* error;
    interpreter = [[TFLInterpreter alloc] initWithModelPath:modelPath error:&error];
    
    if (error) {
        NSLog(@"Error loading model: %@", error.localizedDescription);
        return;
    }
    
    [interpreter allocateTensorsWithError:&error];
    if (error) {
        NSLog(@"Error allocating tensors: %@", error.localizedDescription);
    }
}

- (NSArray*)classifyImage:(UIImage*)image {
    if (!interpreter) {
        return @[@0.0, @0.0];
    }
    
    const int INPUT_SIZE = 224;
    image = [self resizeImage:image toSize:CGSizeMake(INPUT_SIZE, INPUT_SIZE)];
    
    NSMutableData* inputData = [NSMutableData dataWithLength:INPUT_SIZE * INPUT_SIZE * 3 * sizeof(float)];
    float* bytes = (float*)[inputData mutableBytes];
    
    CGImageRef cgImage = [image CGImage];
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    NSUInteger bytesPerPixel = 4;
    NSUInteger bytesPerRow = bytesPerPixel * INPUT_SIZE;
    NSUInteger bitsPerComponent = 8;
    
    unsigned char* rawData = (unsigned char*)malloc(INPUT_SIZE * INPUT_SIZE * bytesPerPixel);
    CGContextRef context = CGBitmapContextCreate(rawData, INPUT_SIZE, INPUT_SIZE, bitsPerComponent, bytesPerRow, colorSpace,
                                                 kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
    CGColorSpaceRelease(colorSpace);
    CGContextDrawImage(context, CGRectMake(0, 0, INPUT_SIZE, INPUT_SIZE), cgImage);
    CGContextRelease(context);
    
    const int IMAGE_MEAN = 128;
    const float IMAGE_STD = 128.0f;
    
    for (int i = 0; i < INPUT_SIZE * INPUT_SIZE; i++) {
        bytes[i * 3 + 0] = (rawData[i * 4 + 0] - IMAGE_MEAN) / IMAGE_STD;
        bytes[i * 3 + 1] = (rawData[i * 4 + 1] - IMAGE_MEAN) / IMAGE_STD;
        bytes[i * 3 + 2] = (rawData[i * 4 + 2] - IMAGE_MEAN) / IMAGE_STD;
    }
    
    free(rawData);
    
    TFLTensor* inputTensor = [interpreter inputTensorAtIndex:0 error:nil];
    [inputTensor copyData:inputData error:nil];
    
    BOOL success = [interpreter invokeWithError:nil];
    if (!success) {
        return @[@0.0, @0.0];
    }
    
    TFLTensor* outputTensor = [interpreter outputTensorAtIndex:0 error:nil];
    NSData* outputData = [outputTensor dataWithError:nil];
    
    float* outputBytes = (float*)[outputData bytes];
    NSMutableArray* results = [NSMutableArray array];
    
    for (int i = 0; i < labels.count; i++) {
        [results addObject:@(outputBytes[i])];
    }
    
    return results;
}

- (NSString*)getLabel:(int)index {
    if (index >= 0 && index < labels.count) {
        return labels[index];
    }
    return @"unknown";
}

- (UIImage*)resizeImage:(UIImage*)image toSize:(CGSize)size {
    UIGraphicsBeginImageContextWithOptions(size, NO, image.scale);
    [image drawInRect:CGRectMake(0, 0, size.width, size.height)];
    UIImage* resizedImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return resizedImage;
}

- (void)close {
    interpreter = nil;
}

@end

