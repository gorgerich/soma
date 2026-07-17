import SwiftUI

/// The immersive body scene: front/back renders crossfading with a subtle
/// spatial squeeze, plus the tappable region layer for the visible side.
/// VoiceOver users can also toggle the region through a named action on the
/// scene itself, without needing to find the small on-body target.
struct BodyHeroScene: View {
    let side: BodySide
    let selectedRegion: BodyRegion?
    let onRegionTap: (BodyRegion) -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        GeometryReader { proxy in
            let fitted = BodyCanvas.fittedRect(in: proxy.size)
            ZStack {
                render(.front)
                render(.back)
                ForEach(BodyRegion.allCases.filter { $0.side == side }) { region in
                    LowerBackSelectionGlow(
                        region: region,
                        isSelected: selectedRegion == region,
                        fittedRect: fitted,
                        onTap: { onRegionTap(region) }
                    )
                }
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(side.bodyAccessibilityLabel)
        .accessibilityAction(named: accessibilityToggleName) {
            onRegionTap(.lowerBack)
        }
    }

    private var accessibilityToggleName: String {
        selectedRegion == .lowerBack ? "Deselect lower back" : "Select lower back"
    }

    private func render(_ renderSide: BodySide) -> some View {
        let isVisible = renderSide == side
        return RefinedBodyRender(side: renderSide)
            .opacity(isVisible ? 1 : 0)
            .scaleEffect(x: isVisible || reduceMotion ? 1 : 0.95)
    }
}

#Preview("Back, selected") {
    BodyHeroScene(side: .back, selectedRegion: .lowerBack) { _ in }
        .frame(height: 520)
        .background(BodyAmbientBackground(isRegionSelected: true))
}

#Preview("Front") {
    BodyHeroScene(side: .front, selectedRegion: nil) { _ in }
        .frame(height: 520)
        .background(BodyAmbientBackground(isRegionSelected: false))
}
