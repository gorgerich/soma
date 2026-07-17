import Testing
@testable import Soma

@MainActor
struct BodyCheckInViewModelTests {
    @Test func initialStateHasNoSelectionAndShowsBack() {
        let model = BodyCheckInViewModel()
        #expect(model.selectedRegion == nil)
        #expect(model.side == .back)
        #expect(!model.canContinue)
        #expect(model.summaryTitle == "No area selected")
    }

    @Test func selectingLowerBackEnablesContinue() {
        let model = BodyCheckInViewModel()
        let nowSelected = model.toggle(.lowerBack)
        #expect(nowSelected)
        #expect(model.selectedRegion == .lowerBack)
        #expect(model.canContinue)
        #expect(model.summaryTitle == "Lower back selected")
        #expect(model.isSelectionVisible)
    }

    @Test func togglingSelectedRegionClearsSelection() {
        let model = BodyCheckInViewModel()
        model.toggle(.lowerBack)
        let nowSelected = model.toggle(.lowerBack)
        #expect(!nowSelected)
        #expect(model.selectedRegion == nil)
        #expect(!model.canContinue)
        #expect(model.summaryTitle == "No area selected")
    }

    @Test func switchingToFrontHidesButPreservesSelection() {
        let model = BodyCheckInViewModel()
        model.toggle(.lowerBack)
        model.select(side: .front)
        // Decision: the selection is preserved but not visible or tappable on
        // the front, so summary and Continue stay consistent.
        #expect(model.selectedRegion == .lowerBack)
        #expect(!model.isSelectionVisible)
        #expect(model.activeRegions.isEmpty)
        #expect(model.canContinue)
    }

    @Test func returningToBackRestoresVisibleSelection() {
        let model = BodyCheckInViewModel()
        model.toggle(.lowerBack)
        model.select(side: .front)
        model.select(side: .back)
        #expect(model.selectedRegion == .lowerBack)
        #expect(model.isSelectionVisible)
        #expect(model.activeRegions == [.lowerBack])
    }

    @Test func continueUnavailableWithoutSelection() {
        let model = BodyCheckInViewModel()
        #expect(!model.canContinue)
        model.toggle(.lowerBack)
        model.toggle(.lowerBack)
        #expect(!model.canContinue)
    }

    @Test func lowerBackIsOnlyActiveOnBackSide() {
        let model = BodyCheckInViewModel()
        #expect(model.activeRegions == [.lowerBack])
        model.select(side: .front)
        #expect(model.activeRegions.isEmpty)
    }
}
