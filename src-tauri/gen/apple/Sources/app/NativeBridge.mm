#import "NativeBridge.h"

#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>

static NSString *const kIOSThemeHandlerName = @"iOSTheme";

static NSString *ThemeFromTraitCollection(UITraitCollection *traits) {
  if (@available(iOS 12.0, *)) {
    return traits.userInterfaceStyle == UIUserInterfaceStyleDark ? @"dark" : @"light";
  }
  return @"light";
}

static void EvaluateJavaScript(WKWebView *webView, NSString *script) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [webView evaluateJavaScript:script completionHandler:nil];
  });
}

@interface IOSThemeMessageHandler : NSObject <WKScriptMessageHandler>
@property(nonatomic, weak) WKWebView *webView;
@end

@implementation IOSThemeMessageHandler
- (instancetype)initWithWebView:(WKWebView *)webView {
  if (self = [super init]) {
    _webView = webView;
  }
  return self;
}

- (void)userContentController:(WKUserContentController *)userContentController
      didReceiveScriptMessage:(WKScriptMessage *)message {
  if (![message.body isKindOfClass:[NSDictionary class]]) {
    return;
  }

  NSDictionary *body = (NSDictionary *)message.body;
  NSString *theme = body[@"theme"];
  NSString *mode = body[@"mode"];
  if (![theme isKindOfClass:[NSString class]] || ![mode isKindOfClass:[NSString class]]) {
    return;
  }

  [self applyTheme:theme mode:mode];
}

- (void)applyTheme:(NSString *)theme mode:(NSString *)mode {
  BOOL isDark = [theme isEqualToString:@"dark"];
  if ([mode isEqualToString:@"auto"]) {
    if (@available(iOS 12.0, *)) {
      isDark = self.webView.traitCollection.userInterfaceStyle == UIUserInterfaceStyleDark;
    }
  }

  if (@available(iOS 13.0, *)) {
    UIUserInterfaceStyle style =
        isDark ? UIUserInterfaceStyleDark : UIUserInterfaceStyleLight;
    dispatch_async(dispatch_get_main_queue(), ^{
      self.webView.overrideUserInterfaceStyle = style;
      UIViewController *controller = self.webView.window.rootViewController;
      controller.overrideUserInterfaceStyle = style;
      [controller setNeedsStatusBarAppearanceUpdate];
    });
  }
}
@end

@interface IOSNativeBridge : NSObject
@property(nonatomic, weak) WKWebView *webView;
@property(nonatomic, strong) IOSThemeMessageHandler *themeHandler;
@property(nonatomic, copy) NSString *cachedSystemTheme;
@property(nonatomic, assign) CGFloat cachedKeyboardHeight;
@end

@implementation IOSNativeBridge {
  id _appDidBecomeActiveObserver;
  id _orientationObserver;
  id _keyboardWillShowObserver;
  id _keyboardWillHideObserver;
}

+ (instancetype)shared {
  static IOSNativeBridge *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [[IOSNativeBridge alloc] init];
  });
  return sharedInstance;
}

- (void)attachToWebView:(WKWebView *)webView {
  if (self.webView == webView) {
    return;
  }

  WKUserContentController *controller = webView.configuration.userContentController;
  [controller removeScriptMessageHandlerForName:kIOSThemeHandlerName];

  self.webView = webView;
  self.themeHandler = [[IOSThemeMessageHandler alloc] initWithWebView:webView];
  [controller addScriptMessageHandler:self.themeHandler name:kIOSThemeHandlerName];
  [self syncSystemTheme];
  [self syncSafeAreaInsets];
  [self dispatchResumeEvent];
  [self startObservers];
}

- (void)dealloc {
  [self stopObservers];
}

- (void)startObservers {
  [self stopObservers];

  NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
  __weak typeof(self) weakSelf = self;
  _appDidBecomeActiveObserver = [center
      addObserverForName:UIApplicationDidBecomeActiveNotification
                  object:nil
                   queue:[NSOperationQueue mainQueue]
              usingBlock:^(NSNotification *_Nonnull note) {
                [weakSelf syncSystemTheme];
                [weakSelf syncSafeAreaInsets];
                [weakSelf dispatchResumeEvent];
              }];

  [[UIDevice currentDevice] beginGeneratingDeviceOrientationNotifications];
  _orientationObserver = [center
      addObserverForName:UIDeviceOrientationDidChangeNotification
                  object:nil
                   queue:[NSOperationQueue mainQueue]
              usingBlock:^(NSNotification *_Nonnull note) {
                [weakSelf syncSafeAreaInsets];
              }];

  // 键盘显示监听
  _keyboardWillShowObserver = [center
      addObserverForName:UIKeyboardWillShowNotification
                  object:nil
                   queue:[NSOperationQueue mainQueue]
              usingBlock:^(NSNotification *_Nonnull note) {
                CGRect frame = [note.userInfo[UIKeyboardFrameEndUserInfoKey] CGRectValue];
                [weakSelf notifyKeyboardHeight:frame.size.height];
              }];

  // 键盘隐藏监听
  _keyboardWillHideObserver = [center
      addObserverForName:UIKeyboardWillHideNotification
                  object:nil
                   queue:[NSOperationQueue mainQueue]
              usingBlock:^(NSNotification *_Nonnull note) {
                [weakSelf notifyKeyboardHeight:0];
              }];
}

- (void)stopObservers {
  NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
  if (_appDidBecomeActiveObserver) {
    [center removeObserver:_appDidBecomeActiveObserver];
    _appDidBecomeActiveObserver = nil;
  }

  if (_orientationObserver) {
    [center removeObserver:_orientationObserver];
    _orientationObserver = nil;
    [[UIDevice currentDevice] endGeneratingDeviceOrientationNotifications];
  }

  if (_keyboardWillShowObserver) {
    [center removeObserver:_keyboardWillShowObserver];
    _keyboardWillShowObserver = nil;
  }

  if (_keyboardWillHideObserver) {
    [center removeObserver:_keyboardWillHideObserver];
    _keyboardWillHideObserver = nil;
  }
}

- (void)dispatchResumeEvent {
  if (!self.webView) {
    return;
  }
  NSString *script = @"window.dispatchEvent(new CustomEvent('app-resume'));";
  EvaluateJavaScript(self.webView, script);
}

- (void)syncSystemTheme {
  if (!self.webView) {
    return;
  }

  NSString *currentTheme = ThemeFromTraitCollection(self.webView.traitCollection);
  if ([self.cachedSystemTheme isEqualToString:currentTheme]) {
    return;
  }
  self.cachedSystemTheme = currentTheme;

  NSString *script = [NSString
      stringWithFormat:@"(function(){window.__IOS_SYSTEM_THEME__='%@';if(window.__FORCE_THEME_CHECK__){window.__FORCE_THEME_CHECK__();}})();",
                       currentTheme];
  EvaluateJavaScript(self.webView, script);
}

- (void)syncSafeAreaInsets {
  if (!self.webView) {
    return;
  }

  UIEdgeInsets insets = UIEdgeInsetsZero;
  if (@available(iOS 11.0, *)) {
    insets = self.webView.safeAreaInsets;
  }
  CGFloat top = insets.top;
  CGFloat bottom = MAX(insets.bottom, 20.0);
  CGFloat left = insets.left;
  CGFloat right = insets.right;

  NSString *script = [NSString stringWithFormat:
                                     @"(function(){var doc=document.documentElement;"
                                     "doc.style.setProperty('--sat','%.2fpx');"
                                     "doc.style.setProperty('--sab','%.2fpx');"
                                     "doc.style.setProperty('--sal','%.2fpx');"
                                     "doc.style.setProperty('--sar','%.2fpx');})();",
                                     top, bottom, left, right];
  EvaluateJavaScript(self.webView, script);
}

- (void)notifyKeyboardHeight:(CGFloat)height {
  if (!self.webView) {
    return;
  }
  if (height == self.cachedKeyboardHeight) {
    return;
  }
  self.cachedKeyboardHeight = height;

  NSString *script = [NSString stringWithFormat:
                                     @"(function(){"
                                     "document.documentElement.style.setProperty('--skb','%.0fpx');"
                                     "window.__KEYBOARD_HEIGHT__=%.0f;"
                                     "if(window.__ON_KEYBOARD_CHANGE__){window.__ON_KEYBOARD_CHANGE__(%.0f);}"
                                     "})();",
                                     height, height, height];
  EvaluateJavaScript(self.webView, script);
}
@end

void ios_configure_native_bridge(void *webview_ptr) {
  if (webview_ptr == NULL) {
    return;
  }
  WKWebView *webView = (__bridge WKWebView *)webview_ptr;
  [[IOSNativeBridge shared] attachToWebView:webView];
}
