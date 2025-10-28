# podspec for Cordova Vest Detection Plugin

Pod::Spec.new do |s|
    s.name         = "VestDetection"
    s.version      = "1.0.0"
    s.summary      = "Cordova plugin for detecting safety vests using TensorFlow Lite"
    
    s.description  = <<-DESC
        A Cordova plugin for detecting safety vests in images using TensorFlow Lite
        running locally on mobile devices without requiring an internet connection.
    DESC
    
    s.homepage     = "https://github.com/yourusername/outsystems-cordova-plugin-vest-detection"
    s.license      = "MIT"
    s.author       = { "Your Name" => "your.email@example.com" }
    
    s.platform     = :ios, "12.0"
    
    s.source       = { :git => "https://github.com/yourusername/outsystems-cordova-plugin-vest-detection.git", :tag => s.version }
    
    s.source_files = "src/ios/*.{h,m}"
    
    s.dependency "TensorFlowLite"
    
end

