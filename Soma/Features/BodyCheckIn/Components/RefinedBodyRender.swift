import SwiftUI

/// Softly dimensional rendering of the figure: a single smooth outline filled
/// with warm material, an inner luminous highlight, a shaded rim for volume,
/// and quiet structural contour lines per side. Drawn once per side/size —
/// nothing here animates continuously.
struct RefinedBodyRender: View {
    let side: BodySide

    var body: some View {
        Canvas { context, size in
            let fitted = BodyCanvas.fittedRect(in: size)
            guard fitted.width > 0 else { return }

            let outline = BodyOutline.path(in: fitted)
            let unit = fitted.width / BodyCanvas.size.width

            // Base material.
            context.drawLayer { layer in
                layer.clip(to: outline)
                layer.fill(
                    Path(fitted),
                    with: .linearGradient(
                        Gradient(colors: [SomaColors.bodyIvory, SomaColors.bodyRose]),
                        startPoint: CGPoint(x: fitted.midX, y: fitted.minY),
                        endPoint: CGPoint(x: fitted.midX, y: fitted.maxY)
                    )
                )

                // Inner luminosity around the chest and spine.
                layer.fill(
                    Path(fitted),
                    with: .radialGradient(
                        Gradient(colors: [Color.white.opacity(0.55), .clear]),
                        center: BodyCanvas.convert(CGPoint(x: 50, y: 62), to: fitted),
                        startRadius: 0,
                        endRadius: 60 * unit
                    )
                )

                // Faint lavender wash toward the legs ties the figure to the
                // lower light field.
                layer.fill(
                    Path(fitted),
                    with: .radialGradient(
                        Gradient(colors: [SomaColors.atmosphereLavender.opacity(0.35), .clear]),
                        center: BodyCanvas.convert(CGPoint(x: 50, y: 165), to: fitted),
                        startRadius: 0,
                        endRadius: 70 * unit
                    )
                )

                // Shaded rim inside the outline gives rounded volume.
                var rim = layer
                rim.addFilter(.blur(radius: 3 * unit))
                rim.stroke(outline, with: .color(SomaColors.bodyShade.opacity(0.55)), lineWidth: 4.5 * unit)
            }

            // Crisp hairline edge.
            context.stroke(outline, with: .color(SomaColors.bodyShade.opacity(0.5)), lineWidth: max(1, 0.5 * unit))

            // Structural contour lines.
            var contour = context
            contour.addFilter(.blur(radius: 0.4 * unit))
            contour.stroke(
                BodyOutline.contourLines(for: side, in: fitted),
                with: .color(SomaColors.bodyContour.opacity(0.22)),
                style: StrokeStyle(lineWidth: 1.1 * unit, lineCap: .round)
            )
        }
        .accessibilityHidden(true)
    }
}

#Preview("Back and front") {
    HStack(spacing: SpacingTokens.xl) {
        RefinedBodyRender(side: .back)
        RefinedBodyRender(side: .front)
    }
    .padding(SpacingTokens.xl)
    .background(SomaColors.canvas)
}
