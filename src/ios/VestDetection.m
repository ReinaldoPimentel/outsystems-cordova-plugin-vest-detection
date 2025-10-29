#import "VestDetection.h"
#import "TensorFlowLiteHelper.h"

@implementation VestDetection {
    TensorFlowLiteHelper* tfliteHelper;
}

- (void)pluginInitialize {
    tfliteHelper = [[TensorFlowLiteHelper alloc] init];
    [tfliteHelper loadModel];
}

- (void)onAppTerminate {
    if (tfliteHelper) {
        [tfliteHelper close];
    }
}

- (void)detectVest:(CDVInvokedUrlCommand*)command {
    NSString* base64Image = [command.arguments objectAtIndex:0];
    
    // Get threshold if provided, default to 0.75 (75%)
    float threshold = 0.75f;
    if (command.arguments.count > 1 && command.arguments[1] != [NSNull null]) {
        NSNumber* thresholdNumber = command.arguments[1];
        if (thresholdNumber && [thresholdNumber isKindOfClass:[NSNumber class]]) {
            threshold = [thresholdNumber floatValue];
            // Validate threshold range
            if (threshold < 0.0f || threshold > 1.0f) {
                threshold = 0.75f;
            }
        }
    }
    
    // Get debug mode if provided, default to false
    BOOL debugMode = NO;
    if (command.arguments.count > 2 && command.arguments[2] != [NSNull null]) {
        NSNumber* debugNumber = command.arguments[2];
        if (debugNumber && [debugNumber isKindOfClass:[NSNumber class]]) {
            debugMode = [debugNumber boolValue];
        }
    }
    if (debugMode) {
        NSLog(@"VestDetection: Using confidence threshold: %f", threshold);
    }
    
    [self.commandDelegate runInBackground:^{
        @try {
            UIImage* image = [self decodeBase64Image:base64Image];
            if (!image) {
                CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                             messageAsString:@"Failed to decode base64 image"];
                [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
                return;
            }
            
            if (!self->tfliteHelper) {
                CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                             messageAsString:@"Model not initialized"];
                [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
                return;
            }
            
            NSArray* results = [self->tfliteHelper classifyImage:image debugMode:debugMode];
            
            if (!results || results.count < 2) {
                CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                             messageAsString:@"Classification failed"];
                [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
                return;
            }
            
            NSMutableDictionary* resultDict = [NSMutableDictionary dictionary];
            NSMutableArray* resultsArray = [NSMutableArray array];
            
            // Index 1 is vest (after conversion from sigmoid)
            float vestConfidence = [results[1] floatValue];
            if (debugMode) {
                NSLog(@"VestDetection: Vest confidence: %f, threshold: %f", vestConfidence, threshold);
            }
            // Use configurable confidence threshold for vest detection
            BOOL detected = vestConfidence >= threshold;
            if (debugMode) {
                NSLog(@"VestDetection: Detected: %d", detected);
            }
            
            for (int i = 0; i < results.count; i++) {
                NSDictionary* classResult = @{
                    @"label": [self->tfliteHelper getLabel:i],
                    @"confidence": results[i]
                };
                [resultsArray addObject:classResult];
            }
            
            resultDict[@"detected"] = @(detected);
            resultDict[@"confidence"] = @(vestConfidence);
            resultDict[@"results"] = resultsArray;
            
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK
                                                           messageAsDictionary:resultDict];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
            
        } @catch (NSException* exception) {
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                         messageAsString:[NSString stringWithFormat:@"Error during detection: %@", exception.reason]];
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        }
    }];
}

- (UIImage*)decodeBase64Image:(NSString*)base64Image {
    NSString* base64Data = base64Image;
    
    if ([base64Image containsString:@","]) {
        NSRange range = [base64Image rangeOfString:@","];
        base64Data = [base64Image substringFromIndex:range.location + 1];
    }
    
    NSData* imageData = [[NSData alloc] initWithBase64EncodedString:base64Data options:NSDataBase64DecodingIgnoreUnknownCharacters];
    return [UIImage imageWithData:imageData];
}

@end

