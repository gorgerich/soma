import SwiftUI

/// Editorial type system: native serif (New York) for display moments,
/// SF Pro for interface labels. Everything maps to Dynamic Type styles.
enum SomaTypography {
    /// Screen headline — editorial serif.
    static let display = Font.system(.largeTitle, design: .serif).weight(.semibold)
    /// Small serif wordmark in the top chrome.
    static let wordmark = Font.system(.headline, design: .serif).weight(.semibold)
    /// Panel title for the selected region — serif to echo the headline.
    static let panelTitle = Font.system(.title2, design: .serif).weight(.semibold)
    /// Supporting copy under the headline.
    static let support = Font.subheadline
    /// Small uppercase eyebrow labels (apply tracking at the call site).
    static let eyebrow = Font.caption.weight(.semibold)
    /// Compact interactive labels (orientation control, text actions).
    static let control = Font.subheadline.weight(.semibold)
    /// Primary action label.
    static let button = Font.headline
    /// Small secondary hints.
    static let hint = Font.footnote
}
