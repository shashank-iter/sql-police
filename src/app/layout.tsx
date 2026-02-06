import type { Metadata } from "next";
import { ReactNode } from "react";
import { Bebas_Neue, Source_Code_Pro } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import OGIMage from "../../public/images/og_image.png";
import "./globals.css";

// ── Fonts ──────────────────────────────────
// Bebas Neue  →  Headlines / case titles (noir atmosphere)
// Source Code Pro → Code editor & monospace UI
const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sourceCode = Source_Code_Pro({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SQL Police",
  description:
    "A gamified SQL learning platform. Solve police cases by writing queries.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "SQL Police",
    description:
      "A gamified SQL learning platform. Solve police cases by writing queries.",
    url: "https://sql-police.vercel.app",
    siteName: "SQL Police",
    // images: [
    //   {
    //     // url: OGImage.src,
    //     width: 1200,
    //     height: 630,
    //     alt: "SQL Police",
    //   },
    // ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SQL Police",
    description:
      "A gamified SQL learning platform. Solve police cases by writing queries.",
    // images: OGIMage,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${bebas.variable} ${sourceCode.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-mono antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
