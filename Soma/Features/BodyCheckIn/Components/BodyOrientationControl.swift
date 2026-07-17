import SwiftUI

/// Compact floating capsule for choosing the visible side of the body.
/// Designed to sit half-sunk into the crest of the selection panel, like an
/// instrument resting on the surface, rather than a full-width form control.
struct BodyOrientationControl: View {
    @Binding var selection: BodySide

    @Namespace private var pillNamespace
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        HStack(spacing: 2) {
            ForEach(BodySide.allCases) { side in
                segment(for: side)
            }
        }
        .padding(3)
        .background {
            Capsule()
                .fill(.ultraThinMaterial)
                .overlay(Capsule().strokeBorder(Color.white.opacity(0.6), lineWidth: 1))
                .shadow(color: SomaColors.ink.opacity(0.12), radius: 14, y: 6)
        }
        .accessibilityElement(children: .contain)
    }

    private func segment(for side: BodySide) -> some View {
        let isSelected = selection == side
        return Button {
            selection = side
        } label: {
            Text(side.displayName)
                .font(SomaTypography.control)
                .foregroundStyle(isSelected ? Color.white : SomaColors.inkSecondary)
                .frame(minWidth: 64, minHeight: SpacingTokens.minTapTarget)
        }
        .buttonStyle(.plain)
        .background {
            if isSelected {
                Capsule()
                    .fill(SomaColors.action)
                    .matchedGeometryEffect(id: "orientation-pill", in: pillNamespace)
            }
        }
        .accessibilityLabel(side.accessibilityLabel)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }
}

#Preview("Orientation control") {
    struct Host: View {
        @State private var side: BodySide = .back
        var body: some View {
            BodyOrientationControl(selection: $side.animation(.easeInOut(duration: 0.3)))
                .padding(SpacingTokens.xl)
                .background(SomaColors.canvas)
        }
    }
    return Host()
}
