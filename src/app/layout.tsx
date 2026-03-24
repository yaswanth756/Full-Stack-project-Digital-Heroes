import type { Metadata } from "next";
import { Outfit, Reenie_Beanie } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const reenieBeanie = Reenie_Beanie({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-reenie",
});

export const metadata: Metadata = {
  title: "Softly Golf — Play. Give. Win.",
  description:
    "A subscription golf platform combining score tracking, monthly prize draws, and charitable giving.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${reenieBeanie.variable}`}>
      <body
        style={{
          backgroundColor: "#FDFCF8",
          color: "#292524",
          fontFamily: "var(--font-outfit), sans-serif",
        }}
        className="antialiased min-h-screen relative overflow-x-hidden"
      >
        {/* Grain Overlay */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            pointerEvents: "none",
            mixBlendMode: "overlay",
            opacity: 0.35,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />
        {children}
      </body>
    </html>
  );
}
