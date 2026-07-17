import Foundation

/// The visible orientation of the body illustration.
enum BodySide: String, Identifiable, CaseIterable {
    case front
    case back

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .front: "Front"
        case .back: "Back"
        }
    }

    /// Label for the segmented control.
    var accessibilityLabel: String {
        switch self {
        case .front: "Front view"
        case .back: "Back view"
        }
    }

    /// Label for the body illustration itself.
    var bodyAccessibilityLabel: String {
        switch self {
        case .front: "Front of body"
        case .back: "Back of body"
        }
    }
}
