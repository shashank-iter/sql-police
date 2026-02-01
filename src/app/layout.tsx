import type { Metadata, ReactNode } from "next";
import { Bebas_Neue, Source_Code_Pro } from "next/font/google";
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
  title: "SQL Detective",
  description:
    "A gamified SQL learning platform. Solve police cases by writing queries.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${bebas.variable} ${sourceCode.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-mono antialiased">{children}</body>
    </html>
  );
}
