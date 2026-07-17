import Foundation
import Observation

/// State for the Body Check-In screen.
///
/// Side-switching decision: a selection made on the back is *preserved* when
/// the user flips to the front — it is hidden and not tappable there, but the
/// summary and Continue stay consistent, and flipping back restores the
/// visible highlight.
@MainActor
@Observable
final class BodyCheckInViewModel {
    private(set) var selectedRegion: BodyRegion?
    private(set) var side: BodySide = .back

    var canContinue: Bool {
        selectedRegion != nil
    }

    var summaryTitle: String {
        if let selectedRegion {
            "\(selectedRegion.displayName) selected"
        } else {
            "No area selected"
        }
    }

    /// Regions that are visible and tappable on the current side.
    var activeRegions: [BodyRegion] {
        BodyRegion.allCases.filter { $0.side == side }
    }

    /// Whether the current selection should be shown as a highlight.
    var isSelectionVisible: Bool {
        guard let selectedRegion else { return false }
        return selectedRegion.side == side
    }

    /// Toggles the given region and returns `true` if it is now selected.
    @discardableResult
    func toggle(_ region: BodyRegion) -> Bool {
        if selectedRegion == region {
            selectedRegion = nil
            return false
        }
        selectedRegion = region
        return true
    }

    func select(side: BodySide) {
        self.side = side
    }
}
