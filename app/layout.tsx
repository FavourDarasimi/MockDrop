import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-src",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-src",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-src",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MockDrop — Paste JSON. Get a live API.",
  description:
    "Paste a JSON payload, pick a status code, get a live REST endpoint that returns it. No signup. Mocks expire after 24 hours.",
  applicationName: "MockDrop",
  robots: { index: true, follow: true },
  openGraph: {
    title: "MockDrop — Paste JSON. Get a live API.",
    description:
      "Paste a JSON payload, pick a status code, get a live REST endpoint that returns it. No signup.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0F0D" },
    { media: "(prefers-color-scheme: light)", color: "#F6FAF7" },
  ],
};

const THEME_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem("mockdrop-theme");
    var mode =
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    var root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(mode);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`light ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
