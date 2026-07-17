import SwiftUI

/// Primary action capsule: deep plum surface with an integrated circular
/// arrow affordance. The arrow is decorative — the whole capsule is one
/// button. Disabled it goes dormant (outlined, quiet) instead of turning
/// into a grey system control.
struct SomaPrimaryAction: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
        }
        .buttonStyle(SomaPrimaryActionStyle())
    }
}

private struct SomaPrimaryActionStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 0) {
            leadingAffordance
            Spacer(minLength: 0)
            configuration.label
                .font(SomaTypography.button)
                .foregroundStyle(isEnabled ? Color.white : SomaColors.inkSecondary)
            Spacer(minLength: 0)
            // Invisible twin keeps the label optically centered.
            Color.clear.frame(width: 40, height: 40)
        }
        .padding(.horizontal, SpacingTokens.s)
        .frame(maxWidth: .infinity, minHeight: 56)
        .background {
            Capsule().fill(isEnabled
                ? (configuration.isPressed ? SomaColors.actionPressed : SomaColors.action)
                : SomaColors.action.opacity(0.07))
        }
        .overlay {
            if !isEnabled {
                Capsule().strokeBorder(SomaColors.action.opacity(0.2), lineWidth: 1)
            }
        }
        .scaleEffect(configuration.isPressed && isEnabled ? 0.985 : 1)
        .animation(SomaMotion.press, value: configuration.isPressed)
    }

    private var leadingAffordance: some View {
        ZStack {
            Circle()
                .fill(isEnabled ? Color.white.opacity(0.16) : .clear)
                .overlay {
                    if !isEnabled {
                        Circle().strokeBorder(SomaColors.action.opacity(0.25), lineWidth: 1)
                    }
                }
            Image(systemName: "arrow.right")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(isEnabled ? Color.white : SomaColors.inkSecondary.opacity(0.8))
        }
        .frame(width: 40, height: 40)
        .accessibilityHidden(true)
    }
}

#Preview("Enabled / disabled") {
    VStack(spacing: SpacingTokens.l) {
        SomaPrimaryAction(title: "Continue") {}
        SomaPrimaryAction(title: "Continue") {}
            .disabled(true)
    }
    .padding(SpacingTokens.screenMargin)
    .background(SomaColors.panel)
}
