import SwiftUI

/// First step of the symptom flow: "Where does it hurt?"
/// One continuous scene — atmospheric backdrop, editorial headline, the body
/// as hero, and an organic panel rising around its lower half.
struct BodyCheckInView: View {
    @State private var viewModel: BodyCheckInViewModel
    @State private var detailRegion: BodyRegion?
    @State private var isDescribePlaceholderPresented = false
    @State private var isPrivacyNotePresented = false
    @State private var hasAppeared = false

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    @MainActor
    init(viewModel: BodyCheckInViewModel? = nil) {
        let model = viewModel ?? BodyCheckInViewModel()
        #if DEBUG
        // Dev-only hooks so tools and manual QA can launch straight into a
        // given state (SOMA_DEBUG_PRESELECT=lowerBack, SOMA_DEBUG_SIDE=front).
        let environment = ProcessInfo.processInfo.environment
        if environment["SOMA_DEBUG_PRESELECT"] == "lowerBack", model.selectedRegion == nil {
            model.toggle(.lowerBack)
        }
        if environment["SOMA_DEBUG_SIDE"] == "front" {
            model.select(side: .front)
        }
        #endif
        _viewModel = State(initialValue: model)
    }

    var body: some View {
        VStack(spacing: 0) {
            topChrome
            headline
            BodyHeroScene(
                side: viewModel.side,
                selectedRegion: viewModel.isSelectionVisible ? viewModel.selectedRegion : nil,
                onRegionTap: handleRegionTap
            )
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(.top, SpacingTokens.xs)
            // The figure continues behind the panel crest so the scene reads
            // as one continuous space instead of a stack of blocks.
            .padding(.bottom, -SpacingTokens.xxl)
            .opacity(hasAppeared ? 1 : 0)
            .offset(y: hasAppeared || reduceMotion ? 0 : 6)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background {
            BodyAmbientBackground(isRegionSelected: viewModel.isSelectionVisible)
                .ignoresSafeArea()
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            SymptomSelectionPanel(
                selectedRegion: viewModel.selectedRegion,
                side: sideBinding,
                onDescribe: { isDescribePlaceholderPresented = true },
                onContinue: handleContinue
            )
            .opacity(hasAppeared ? 1 : 0)
            .offset(y: hasAppeared || reduceMotion ? 0 : 18)
        }
        .toolbar(.hidden, for: .navigationBar)
        .navigationDestination(item: $detailRegion) { region in
            RegionDetailPlaceholderView(region: region)
        }
        .alert("Describe it instead", isPresented: $isDescribePlaceholderPresented) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Text-based symptom entry will be added in the next iteration.")
        }
        .alert("Private by design", isPresented: $isPrivacyNotePresented) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Your check-in stays on this device.")
        }
        .onAppear {
            guard !hasAppeared else { return }
            withAnimation(SomaMotion.appear(reduceMotion: reduceMotion, delay: 0.05)) {
                hasAppeared = true
            }
        }
    }

    // MARK: - Sections

    private var topChrome: some View {
        HStack {
            Text("Soma")
                .font(SomaTypography.wordmark)
                .foregroundStyle(SomaColors.ink)
                .accessibilityAddTraits(.isHeader)
            Spacer()
            Button {
                isPrivacyNotePresented = true
            } label: {
                Image(systemName: "lock")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(SomaColors.inkSecondary)
                    .frame(width: 36, height: 36)
                    .background {
                        Circle()
                            .fill(.ultraThinMaterial)
                            .overlay(Circle().strokeBorder(Color.white.opacity(0.5), lineWidth: 1))
                    }
            }
            .frame(minWidth: SpacingTokens.minTapTarget, minHeight: SpacingTokens.minTapTarget)
            .accessibilityLabel("Privacy")
        }
        .padding(.horizontal, SpacingTokens.screenMargin)
        .padding(.top, SpacingTokens.xs)
    }

    private var headline: some View {
        VStack(alignment: .leading, spacing: SpacingTokens.xs + 2) {
            Text("Where does it hurt?")
                .font(SomaTypography.display)
                .foregroundStyle(SomaColors.ink)
                .accessibilityAddTraits(.isHeader)
            Text("Tap the area that feels uncomfortable.")
                .font(SomaTypography.support)
                .foregroundStyle(SomaColors.inkSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, SpacingTokens.screenMargin)
        .padding(.top, SpacingTokens.m)
    }

    // MARK: - Actions

    private var sideBinding: Binding<BodySide> {
        Binding(
            get: { viewModel.side },
            set: { newSide in
                guard newSide != viewModel.side else { return }
                withAnimation(SomaMotion.sideSwitch(reduceMotion: reduceMotion)) {
                    viewModel.select(side: newSide)
                }
            }
        )
    }

    private func handleRegionTap(_ region: BodyRegion) {
        let nowSelected = withAnimation(SomaMotion.selection(reduceMotion: reduceMotion)) {
            viewModel.toggle(region)
        }
        if nowSelected {
            Haptics.lightImpact()
        } else {
            Haptics.selection()
        }
    }

    private func handleContinue() {
        guard let region = viewModel.selectedRegion else { return }
        Haptics.lightImpact()
        detailRegion = region
    }
}

// MARK: - Previews

#Preview("No area selected") {
    NavigationStack {
        BodyCheckInView()
    }
}

#Preview("Lower back selected") {
    let viewModel = BodyCheckInViewModel()
    viewModel.toggle(.lowerBack)
    return NavigationStack {
        BodyCheckInView(viewModel: viewModel)
    }
}

#Preview("Large Dynamic Type") {
    NavigationStack {
        BodyCheckInView()
    }
    .environment(\.dynamicTypeSize, .accessibility1)
}

#Preview("Dark fallback") {
    NavigationStack {
        BodyCheckInView()
    }
    .preferredColorScheme(.dark)
}
