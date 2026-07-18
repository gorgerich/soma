import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Soma — дневник самочувствия",
    short_name: "Soma",
    description:
      "Покажите, где болит, опишите ощущения и сохраните понятную картину симптома. Без диагнозов.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f3f0",
    theme_color: "#f8f3f0",
    lang: "ru",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
