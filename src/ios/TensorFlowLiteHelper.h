#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface TensorFlowLiteHelper : NSObject

- (void)loadModel;
- (NSArray*)classifyImage:(UIImage*)image;
- (NSArray*)classifyImage:(UIImage*)image debugMode:(BOOL)debugMode;
- (NSString*)getLabel:(int)index;
- (void)close;

@end

