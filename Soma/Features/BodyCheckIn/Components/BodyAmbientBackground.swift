import SwiftUI

/// Full-bleed atmospheric backdrop: warm pearl base with three static,
/// blurred light fields that support the figure — rose behind the torso,
/// coral warmth near the selection zone, lavender settling toward the panel.
/// When a region is selected the coral field breathes up slightly (one
/// animated value change, no perpetual animation).
struct BodyAmbientBackground: View {
    var isRegionSelected: Bool

    var body: some View {
        ZStack {
            SomaColors.canvas

            RadialGradient(
                colors: [SomaColors.atmosphereRose.opacity(0.85), .clear],
                center: UnitPoint(x: 0.5, y: 0.3),
                startRadius: 0,
                endRadius: 340
            )

            RadialGradient(
                colors: [SomaColors.atmosphereCoral.opacity(isRegionSelected ? 0.55 : 0.35), .clear],
                center: UnitPoint(x: 0.52, y: 0.52),
                startRadius: 0,
                endRadius: 260
            )

            RadialGradient(
                colors: [SomaColors.atmosphereLavender.opacity(0.7), .clear],
                center: UnitPoint(x: 0.3, y: 0.85),
                startRadius: 0,
                endRadius: 320
            )
        }
        .accessibilityHidden(true)
    }
}

#Preview("Ambient") {
    BodyAmbientBackground(isRegionSelected: true)
        .ignoresSafeArea()
}
