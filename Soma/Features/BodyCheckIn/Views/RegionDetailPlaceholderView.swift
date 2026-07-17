import SwiftUI

/// Placeholder destination proving the check-in screen is connected to a
/// scalable flow. The real refinement step replaces this in a later iteration.
struct RegionDetailPlaceholderView: View {
    let region: BodyRegion

    var body: some View {
        VStack(alignment: .leading, spacing: SpacingTokens.l) {
            Text(region.displayName)
                .font(SomaTypography.panelTitle)
                .foregroundStyle(SomaColors.inkSecondary)
            Text("The next step will let you refine the selected area and show whether the feeling spreads.")
                .font(SomaTypography.support)
                .foregroundStyle(SomaColors.ink)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(SpacingTokens.screenMargin)
        .background(SomaColors.canvas.ignoresSafeArea())
        .navigationTitle("Region details")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        RegionDetailPlaceholderView(region: .lowerBack)
    }
}
