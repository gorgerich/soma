import SwiftUI

/// The figure's outline as one smooth closed Bézier path with elongated,
/// gender-neutral proportions. The right half is authored as curve segments
/// and mirrored for the left, which keeps the silhouette symmetric and easy
/// to tune. All coordinates live in `BodyCanvas` units (100 × 220).
enum BodyOutline {
    private struct Segment {
        let to: CGPoint
        let c1: CGPoint
        let c2: CGPoint

        init(_ tx: CGFloat, _ ty: CGFloat, _ c1x: CGFloat, _ c1y: CGFloat, _ c2x: CGFloat, _ c2y: CGFloat) {
            to = CGPoint(x: tx, y: ty)
            c1 = CGPoint(x: c1x, y: c1y)
            c2 = CGPoint(x: c2x, y: c2y)
        }
    }

    /// Top of the head, on the centerline.
    private static let crown = CGPoint(x: 50, y: 8)

    /// Right half of the outline, crown → crotch (centerline to centerline).
    private static let rightSide: [Segment] = [
        Segment(60.5, 20, 56, 8, 60, 13),        // head
        Segment(57.5, 30, 61, 25, 59.5, 28),     // skull base
        Segment(54.5, 36, 56, 32.5, 55, 34),     // neck
        Segment(76, 46, 56.5, 41.5, 67, 42),     // trapezius to shoulder
        Segment(81, 54, 80, 47, 81, 50),         // deltoid cap
        Segment(84, 80, 82.5, 62, 84, 71),       // upper arm
        Segment(83, 102, 84, 88, 83.8, 95),      // forearm to wrist
        Segment(80, 114, 83, 107, 82, 112),      // hand, outer edge
        Segment(77.5, 103, 78, 112, 77.6, 107),  // hand, inner edge
        Segment(78.5, 82, 77.4, 96, 78, 88),     // inner forearm
        Segment(69, 58, 79, 72, 73.5, 62),       // inner arm to armpit
        Segment(63.5, 92, 67, 70, 64, 82),       // lat to waist
        Segment(69.5, 116, 63.5, 100, 67.5, 107),// waist to hip
        Segment(63, 152, 70.5, 128, 66, 141),    // outer thigh to knee
        Segment(58.5, 188, 61.5, 163, 60, 177),  // calf to ankle
        Segment(55, 200, 58, 193, 56.8, 197.5),  // heel
        Segment(51.5, 190, 53, 199.5, 52, 194.5),// foot inner to ankle
        Segment(52.5, 154, 51.3, 178, 52, 164),  // inner calf to knee
        Segment(50, 128, 52.6, 143, 51, 133),    // inner thigh to crotch
    ]

    /// The full mirrored outline in view coordinates.
    static func path(in fitted: CGRect) -> Path {
        let scale = fitted.width / BodyCanvas.size.width
        func view(_ p: CGPoint) -> CGPoint {
            CGPoint(x: fitted.minX + p.x * scale, y: fitted.minY + p.y * scale)
        }
        func mirrored(_ p: CGPoint) -> CGPoint {
            CGPoint(x: 100 - p.x, y: p.y)
        }

        var path = Path()
        path.move(to: view(crown))
        for segment in rightSide {
            path.addCurve(to: view(segment.to), control1: view(segment.c1), control2: view(segment.c2))
        }
        // Walk back up the left side by mirroring the right-half segments in
        // reverse; control points swap order under the mirror.
        for index in stride(from: rightSide.count - 1, through: 0, by: -1) {
            let from = index == 0 ? crown : rightSide[index - 1].to
            let segment = rightSide[index]
            path.addCurve(
                to: view(mirrored(from)),
                control1: view(mirrored(segment.c2)),
                control2: view(mirrored(segment.c1))
            )
        }
        path.closeSubpath()
        return path
    }

    /// Quiet structural contour lines for the given side, in view coordinates.
    /// Back: spine hint and shoulder blades. Front: collarbone hints.
    static func contourLines(for side: BodySide, in fitted: CGRect) -> Path {
        let scale = fitted.width / BodyCanvas.size.width
        func view(_ x: CGFloat, _ y: CGFloat) -> CGPoint {
            CGPoint(x: fitted.minX + x * scale, y: fitted.minY + y * scale)
        }

        var path = Path()
        switch side {
        case .back:
            // Spine, ending above the lumbar region.
            path.move(to: view(50, 47))
            path.addCurve(to: view(50, 94), control1: view(50.6, 62), control2: view(49.4, 80))
            // Shoulder blades.
            path.move(to: view(41.5, 56))
            path.addCurve(to: view(45.5, 72), control1: view(39.5, 62), control2: view(42, 69))
            path.move(to: view(58.5, 56))
            path.addCurve(to: view(54.5, 72), control1: view(60.5, 62), control2: view(58, 69))
        case .front:
            // Collarbones.
            path.move(to: view(41.5, 45.5))
            path.addCurve(to: view(49, 48), control1: view(44, 47.5), control2: view(46.5, 48))
            path.move(to: view(58.5, 45.5))
            path.addCurve(to: view(51, 48), control1: view(56, 47.5), control2: view(53.5, 48))
        }
        return path
    }
}
