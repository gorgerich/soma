import CoreGraphics

/// Shared design space for the body scene. The silhouette, contour details,
/// region overlays and selection glow are all defined in a 100 × 220 unit
/// canvas that is aspect-fitted into the available space, so every layer
/// stays aligned on every device size.
enum BodyCanvas {
    static let size = CGSize(width: 100, height: 220)

    /// The largest aspect-correct rect for the canvas centered in `available`.
    static func fittedRect(in available: CGSize) -> CGRect {
        guard available.width > 0, available.height > 0 else { return .zero }
        let scale = min(available.width / size.width, available.height / size.height)
        let width = size.width * scale
        let height = size.height * scale
        return CGRect(
            x: (available.width - width) / 2,
            y: (available.height - height) / 2,
            width: width,
            height: height
        )
    }

    /// Converts a rect in canvas units into view coordinates.
    static func convert(_ rect: CGRect, to fitted: CGRect) -> CGRect {
        let scale = fitted.width / size.width
        return CGRect(
            x: fitted.minX + rect.minX * scale,
            y: fitted.minY + rect.minY * scale,
            width: rect.width * scale,
            height: rect.height * scale
        )
    }

    /// Converts a point in canvas units into view coordinates.
    static func convert(_ point: CGPoint, to fitted: CGRect) -> CGPoint {
        let scale = fitted.width / size.width
        return CGPoint(
            x: fitted.minX + point.x * scale,
            y: fitted.minY + point.y * scale
        )
    }
}

extension BodyRegion {
    /// The region's footprint in canvas units (lumbar area, above the hips).
    var canvasRect: CGRect {
        switch self {
        case .lowerBack: CGRect(x: 38, y: 96, width: 24, height: 18)
        }
    }
}
