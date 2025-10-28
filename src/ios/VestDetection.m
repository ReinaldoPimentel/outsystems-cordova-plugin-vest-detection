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
    
    [self.commandDelegate runInBackground:^{
        @try {
            UIImage* image = [self decodeBase64Image:base64Image];
            if (!image) {
                CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                             messageAsString:@"Failed to decode base64 image"];
                [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
                return;
            }
            
            NSArray* results = [self->tfliteHelper classifyImage:image];
            
            NSMutableDictionary* resultDict = [NSMutableDictionary dictionary];
            NSMutableArray* resultsArray = [NSMutableArray array];
            
            float vestConfidence = [results[1] floatValue];
            BOOL detected = vestConfidence > 0.5f;
            
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

