import SwiftUI

/// Entry point of the app's navigation flow. The Body Check-In screen is the
/// first step; later steps push onto this stack.
struct RootView: View {
    var body: some View {
        NavigationStack {
            BodyCheckInView()
        }
        .tint(SomaColors.action)
    }
}

#Preview {
    RootView()
}
