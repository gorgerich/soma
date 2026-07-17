import SwiftUI
import UIKit

/// Soma's palette: warm pearl atmosphere, rose/coral/lavender light fields,
/// plum ink and actions. Light mode is the primary art direction; dark values
/// are a coherent fallback, not the final dark theme.
enum SomaColors {
    // Surfaces
    static let canvas = dynamic(light: 0xF8F3F0, dark: 0x201A22)
    static let panel = dynamic(light: 0xFFFFFF, dark: 0x2A2330)
    static let hairline = dynamic(light: 0xE8DDD9, dark: 0x3A323E)

    // Text
    static let ink = dynamic(light: 0x2E2530, dark: 0xF1EAF0)
    static let inkSecondary = dynamic(light: 0x847786, dark: 0xA89FAC)

    // Actions
    static let action = dynamic(light: 0x4A2E4D, dark: 0x9A79A4)
    static let actionPressed = dynamic(light: 0x3A2340, dark: 0x8A6994)

    // Selection accents
    static let accentCoral = dynamic(light: 0xE39380, dark: 0xD98A77)
    static let accentLavender = dynamic(light: 0xA795C9, dark: 0xA795C9)

    // Atmospheric light fields
    static let atmosphereRose = dynamic(light: 0xF3D3CD, dark: 0x3A2C31)
    static let atmosphereCoral = dynamic(light: 0xEDB4A4, dark: 0x40302E)
    static let atmosphereLavender = dynamic(light: 0xDCD3EC, dark: 0x342E44)

    // Body material
    static let bodyIvory = dynamic(light: 0xFBF2EC, dark: 0x4A3E44)
    static let bodyRose = dynamic(light: 0xEDD2CC, dark: 0x3E3037)
    static let bodyShade = dynamic(light: 0xD8B4AE, dark: 0x57424A)
    static let bodyContour = dynamic(light: 0x8A5F63, dark: 0xC9A9AD)

    private static func dynamic(light: UInt32, dark: UInt32) -> Color {
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark ? UIColor(rgb: dark) : UIColor(rgb: light)
        })
    }
}

private extension UIColor {
    convenience init(rgb: UInt32) {
        self.init(
            red: CGFloat((rgb >> 16) & 0xFF) / 255,
            green: CGFloat((rgb >> 8) & 0xFF) / 255,
            blue: CGFloat(rgb & 0xFF) / 255,
            alpha: 1
        )
    }
}
