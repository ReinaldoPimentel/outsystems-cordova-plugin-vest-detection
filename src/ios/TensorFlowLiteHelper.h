#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface TensorFlowLiteHelper : NSObject

- (void)loadModel;
- (NSArray*)classifyImage:(UIImage*)image;
- (NSString*)getLabel:(int)index;
- (void)close;

@end

