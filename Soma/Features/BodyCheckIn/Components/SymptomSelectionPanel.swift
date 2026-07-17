import SwiftUI

/// The organic lower surface of the scene. Its crest sweeps asymmetrically —
/// low on the left, rising to a peak right of center near the selection point —
/// and lifts slightly when a region is chosen. The floating orientation
/// control rests half-sunk into the crest.
struct SymptomSelectionPanel: View {
    let selectedRegion: BodyRegion?
    @Binding var side: BodySide
    let onDescribe: () -> Void
    let onContinue: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: SpacingTokens.l) {
            summary
            SomaPrimaryAction(title: "Continue", action: onContinue)
                .disabled(selectedRegion == nil)
                .accessibilityHint(
                    selectedRegion == nil
                        ? "Select an area of the body first."
                        : "Opens region details."
                )
        }
        .padding(.horizontal, SpacingTokens.screenMargin + SpacingTokens.xs)
        .padding(.top, selectedRegion == nil ? 66 : 74)
        .padding(.bottom, SpacingTokens.l)
        .frame(maxWidth: .infinity)
        .background {
            PanelCrestShape(lift: selectedRegion == nil ? 0 : 1)
                .fill(SomaColors.panel)
                .shadow(color: SomaColors.ink.opacity(0.14), radius: 24, y: -10)
                .ignoresSafeArea(edges: .bottom)
        }
        .overlay(alignment: .top) {
            BodyOrientationControl(selection: $side)
                .offset(y: -25)
        }
    }

    @ViewBuilder
    private var summary: some View {
        HStack(alignment: .top, spacing: SpacingTokens.m) {
            if let selectedRegion {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Selected area".uppercased())
                        .font(SomaTypography.eyebrow)
                        .tracking(1.4)
                        .foregroundStyle(SomaColors.accentCoral)
                    Text(selectedRegion.displayName)
                        .font(SomaTypography.panelTitle)
                        .foregroundStyle(SomaColors.ink)
                    Text("Tap the body to change.")
                        .font(SomaTypography.hint)
                        .foregroundStyle(SomaColors.inkSecondary)
                }
                .transition(.opacity.combined(with: .move(edge: .bottom)))
            } else {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Choose an area")
                        .font(SomaTypography.panelTitle)
                        .foregroundStyle(SomaColors.inkSecondary)
                    Text("Nothing selected yet.")
                        .font(SomaTypography.hint)
                        .foregroundStyle(SomaColors.inkSecondary.opacity(0.8))
                }
                .transition(.opacity)
            }
            Spacer(minLength: 0)
            Button("Describe instead", action: onDescribe)
                .font(SomaTypography.support)
                .foregroundStyle(SomaColors.action.opacity(0.85))
                .frame(minHeight: SpacingTokens.minTapTarget)
        }
        .accessibilityElement(children: .contain)
    }
}

/// Asymmetric organic crest: starts low on the left, dips, then rises to a
/// peak right of center — pointing toward the lower-back selection zone —
/// before easing down to the right edge. `lift` (0…1) raises the whole crest
/// and is animatable so the surface morphs rather than jumps.
struct PanelCrestShape: Shape {
    var lift: CGFloat

    var animatableData: CGFloat {
        get { lift }
        set { lift = newValue }
    }

    func path(in rect: CGRect) -> Path {
        let leftY = rect.minY + 52 - 12 * lift
        let dipY = rect.minY + 60 - 14 * lift
        let crestY = rect.minY + 4 - 3 * lift
        let rightY = rect.minY + 24 - 8 * lift

        var path = Path()
        path.move(to: CGPoint(x: rect.minX, y: leftY))
        path.addCurve(
            to: CGPoint(x: rect.minX + rect.width * 0.62, y: crestY),
            control1: CGPoint(x: rect.minX + rect.width * 0.2, y: dipY),
            control2: CGPoint(x: rect.minX + rect.width * 0.42, y: crestY + 4)
        )
        path.addCurve(
            to: CGPoint(x: rect.maxX, y: rightY),
            control1: CGPoint(x: rect.minX + rect.width * 0.8, y: crestY - 2),
            control2: CGPoint(x: rect.minX + rect.width * 0.92, y: rightY - 10)
        )
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.closeSubpath()
        return path
    }
}

#Preview("Idle and selected") {
    struct Host: View {
        @State private var side: BodySide = .back
        var body: some View {
            VStack(spacing: SpacingTokens.xxl) {
                Spacer()
                SymptomSelectionPanel(selectedRegion: nil, side: $side, onDescribe: {}, onContinue: {})
                SymptomSelectionPanel(selectedRegion: .lowerBack, side: $side, onDescribe: {}, onContinue: {})
            }
            .background(SomaColors.canvas)
        }
    }
    return Host()
}
