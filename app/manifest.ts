import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MockDrop — Paste JSON. Get a live API.",
    short_name: "MockDrop",
    description:
      "Paste a JSON payload, pick a status code, get a live CORS-enabled REST endpoint. No signup. Ephemeral 24h mocks.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0F0D",
    theme_color: "#0A0F0D",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
