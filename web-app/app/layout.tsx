import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soma — дневник самочувствия",
  description:
    "Soma помогает показать, где болит, описать ощущения и сохранить понятную картину симптома. Не ставит диагнозы и не заменяет врача.",
  applicationName: "Soma",
  appleWebApp: {
    capable: true,
    title: "Soma",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f3f0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <div className="app-shell">
          <div className="app-canvas">{children}</div>
        </div>
      </body>
    </html>
  );
}
