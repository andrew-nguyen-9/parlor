import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import GoldSheen from "@/components/GoldSheen";
import "./globals.css";

// Art-deco display face: Roman inscriptions / engraved-signage feel.
// Loaded via next/font for zero layout shift and self-hosted serving.
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PARLOR — a secret order of the curious",
  description:
    "Ten rooms behind one velvet door — trivia forged nightly and a new murder mystery every dusk. Light a candle and pick a door.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "PARLOR — a secret order of the curious",
    description: "Ten rooms. A nightly question bank and a daily mystery.",
    images: ["/logo-512.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cinzel.variable}>
      <body className="noise min-h-screen">
        <GoldSheen />
        {children}
      </body>
    </html>
  );
}
