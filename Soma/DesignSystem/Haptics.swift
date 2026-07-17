import UIKit

/// Thin wrapper around UIKit feedback generators so views stay declarative
/// and the view model stays free of UIKit for testability.
enum Haptics {
    static func lightImpact() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    static func selection() {
        UISelectionFeedbackGenerator().selectionChanged()
    }
}
