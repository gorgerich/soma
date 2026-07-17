import SwiftUI

/// Central motion vocabulary. Every animation is one-shot and has a calm,
/// Reduce Motion-safe variant (opacity/layout only, no spatial transforms).
enum SomaMotion {
    /// Region select/deselect and panel morph.
    static func selection(reduceMotion: Bool) -> Animation {
        reduceMotion
            ? .easeInOut(duration: 0.2)
            : .spring(response: 0.38, dampingFraction: 0.85)
    }

    /// Front/back orientation change.
    static func sideSwitch(reduceMotion: Bool) -> Animation {
        .easeInOut(duration: reduceMotion ? 0.2 : 0.35)
    }

    /// Initial appearance of the scene (body material, ambient light, panel).
    static func appear(reduceMotion: Bool, delay: Double = 0) -> Animation {
        reduceMotion
            ? .easeOut(duration: 0.25)
            : .easeOut(duration: 0.55).delay(delay)
    }

    /// Pressed-state feedback on controls.
    static let press = Animation.easeOut(duration: 0.12)
}
