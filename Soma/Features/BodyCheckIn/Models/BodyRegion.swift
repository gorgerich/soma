import Foundation

/// A selectable area of the body. Only the lower back is implemented in this
/// iteration; new regions extend this enum and declare which side they live on.
enum BodyRegion: String, Identifiable, CaseIterable, Hashable {
    case lowerBack

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .lowerBack: "Lower back"
        }
    }

    /// The side of the body on which this region is visible and tappable.
    var side: BodySide {
        switch self {
        case .lowerBack: .back
        }
    }
}
