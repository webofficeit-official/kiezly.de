import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kiezly – Mini-Jobs & Helfer in deiner Nähe",
    short_name: "Kiezly",
    description:
      "Finde geprüfte Helfer für Babysitting, Umzug, Gartenarbeit & mehr – oder biete selbst Mini-Jobs in deiner Nachbarschaft an.",
    start_url: "/de",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e8622a",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-32.png",  sizes: "32x32",   type: "image/png" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
