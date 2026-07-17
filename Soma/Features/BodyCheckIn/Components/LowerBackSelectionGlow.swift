import SwiftUI

/// The tappable region layer. Unselected it shows a quiet luminous marker;
/// selected it becomes a localised coral-to-lavender glow with a refined
/// contour ring and a single restrained pulse. This marks the place the user
/// chose — it must never read as inflammation, a heat map, or a scan.
struct LowerBackSelectionGlow: View {
    let region: BodyRegion
    let isSelected: Bool
    let fittedRect: CGRect
    let onTap: () -> Void

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var pulseCount = 0

    var body: some View {
        let rect = BodyCanvas.convert(region.canvasRect, to: fittedRect)

        Button(action: onTap) {
            ZStack {
                if isSelected {
                    // Diffuse luminous field.
                    Ellipse()
                        .fill(
                            RadialGradient(
                                colors: [
                                    SomaColors.accentCoral.opacity(0.5),
                                    SomaColors.accentLavender.opacity(0.3),
                                    .clear,
                                ],
                                center: .center,
                                startRadius: 0,
                                endRadius: rect.width * 1.3
                            )
                        )
                        .frame(width: rect.width * 2.6, height: rect.height * 2.9)
                        .blur(radius: 6)
                        .transition(glowTransition)

                    // Refined contour ring.
                    Ellipse()
                        .strokeBorder(
                            LinearGradient(
                                colors: [Color.white.opacity(0.9), SomaColors.accentLavender.opacity(0.7)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1.5
                        )
                        .frame(width: rect.width * 1.5, height: rect.height * 1.65)
                        .transition(glowTransition)

                    // Core marking the chosen spot.
                    Ellipse()
                        .fill(
                            LinearGradient(
                                colors: [
                                    SomaColors.accentCoral.opacity(0.55),
                                    SomaColors.accentLavender.opacity(0.5),
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .overlay(Ellipse().strokeBorder(Color.white.opacity(0.7), lineWidth: 1))
                        .frame(width: rect.width, height: rect.height)
                        .phaseAnimator([1.0, 1.05, 1.0], trigger: pulseCount) { view, scale in
                            view.scaleEffect(scale)
                        } animation: { _ in
                            .easeInOut(duration: 0.13)
                        }
                        .transition(coreTransition)
                } else {
                    // Quiet discoverable marker.
                    Ellipse()
                        .strokeBorder(SomaColors.accentLavender.opacity(0.5), lineWidth: 1.2)
                        .frame(width: rect.width * 0.9, height: rect.height)
                    Circle()
                        .fill(Color.white.opacity(0.9))
                        .frame(width: 7, height: 7)
                        .shadow(color: SomaColors.accentCoral.opacity(0.6), radius: 5)
                }
            }
            .frame(
                width: max(rect.width, SpacingTokens.minTapTarget),
                height: max(rect.height, SpacingTokens.minTapTarget)
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .position(x: rect.midX, y: rect.midY)
        .onChange(of: isSelected) { _, nowSelected in
            if nowSelected && !reduceMotion {
                pulseCount += 1
            }
        }
        .accessibilityLabel(region.displayName)
        .accessibilityValue(isSelected ? "Selected" : "Not selected")
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityHint(isSelected ? "Double tap to deselect this area." : "Double tap to select this area.")
    }

    private var glowTransition: AnyTransition {
        reduceMotion ? .opacity : .scale(scale: 0.75).combined(with: .opacity)
    }

    private var coreTransition: AnyTransition {
        reduceMotion ? .opacity : .scale(scale: 0.88).combined(with: .opacity)
    }
}
