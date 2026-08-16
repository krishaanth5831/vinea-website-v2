import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import SmoothScroll from "@/components/SmoothScroll";
import Reveal from "@/components/Reveal";

import "./globals.css";

/* General Sans, variable, self-hosted. Picked over the obvious grotesks for the
   warmth in its lowercase — a single-storey-adjacent 'a' and an open 'g' that
   keep 140px display type from reading as a system font. One family, one file,
   weights 200-700 from a single 38 KB axis. */
const generalSans = localFont({
  src: "../fonts/GeneralSans-Variable.woff2",
  weight: "200 700",
  style: "normal",
  variable: "--font-general-sans",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

/* IBM Plex Mono, latin subset only, two weights. Mono appears exclusively on
   data labels, units and measurement tags — it is the page's truth signal, so
   spending it on anything else would spend the signal. */
const plexMono = localFont({
  src: [
    { path: "../fonts/IBMPlexMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/IBMPlexMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});

const SITE = "https://www.getvinea.nl";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Vinea — a harvesting robot for the glasshouse you already have",
    template: "%s — Vinea",
  },
  description:
    "A modular robot that harvests truss tomatoes in existing Dutch high-wire glasshouses, running on the pipe rail already in every aisle. Pre-prototype, simulation only, seeking 2027 pilot partners in Westland.",
  keywords: [
    "tomato harvesting robot",
    "greenhouse robotics",
    "high wire glasshouse",
    "pipe rail trolley",
    "Westland",
    "robotics as a service",
    "truss tomatoes",
  ],
  authors: [{ name: "Krishaanth Ramaraj" }],
  creator: "Krishaanth Ramaraj",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE,
    siteName: "Vinea",
    title: "Vinea — a harvesting robot for the glasshouse you already have",
    description:
      "Truss tomatoes, picked from the pipe rail that is already in the aisle. Pre-prototype and simulation-only: ~12 kg/hr measured in simulation against an 8,000 kg/week target.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vinea — a harvesting robot for the glasshouse you already have",
    description:
      "Truss tomatoes, picked from the pipe rail that is already in the aisle. Pre-prototype, simulation only, seeking 2027 pilot partners.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1512",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${generalSans.variable} ${plexMono.variable}`}>
      <body>
        <SmoothScroll />
        <Reveal />
        <a
          href="#main"
          className="t-mono sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-bone"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
