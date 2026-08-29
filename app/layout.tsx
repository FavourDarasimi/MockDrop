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

const SITE_URL =
  process.env.MOCKDROP_BASE_URL?.replace(/\/+$/, "") ||
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://mockdrop.pxxl.click";

const SITE_NAME = "MockDrop";
const TITLE = "MockDrop — Paste JSON. Get a live API.";
const DESCRIPTION =
  "Paste a JSON payload, pick a status code, get a live CORS-enabled REST endpoint in 2 seconds. No signup, no backend. Ephemeral mocks expire in 24 hours — perfect for frontend prototypes, demos & QA.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | MockDrop",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  keywords: [
    "mock api",
    "mock api generator",
    "json mock server",
    "fake api",
    "fake rest api",
    "frontend mock api",
    "cors mock api",
    "api prototyping",
    "mock backend",
    "ephemeral api",
    "MockDrop",
  ],
  authors: [{ name: "MockDrop", url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: TITLE,
    description:
      "Paste JSON, pick a status code, get a live REST endpoint in 2 seconds. No signup. CORS-enabled.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Paste JSON, get a live CORS-enabled REST endpoint. No signup. 24h ephemeral mocks for frontend dev.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
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

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description: DESCRIPTION,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Paste JSON to generate live REST endpoint",
    "CORS-enabled GET endpoints",
    "Status code simulation (200, 404, 500)",
    "Ephemeral 24-hour TTL",
    "No signup required",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
