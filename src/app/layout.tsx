import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arrows — Puzzle Escape · Investor Prototype",
  description:
    "Arrows is a minimalist logic puzzle game where you extract arrows from intricate grids without causing collisions. Stress-free, handcrafted, infinitely replayable. An investor prototype by SiddManeA productions.",
  keywords: [
    "Arrows",
    "Puzzle Escape",
    "SiddManeA productions",
    "logic puzzle",
    "minimalist game",
    "relaxing puzzle",
    "investor prototype",
  ],
  authors: [{ name: "SiddManeA productions" }],
  openGraph: {
    title: "Arrows — Puzzle Escape",
    description:
      "A minimalist logic puzzle where you extract arrows from intricate grids. Stress-free, handcrafted, infinitely replayable.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arrows — Puzzle Escape",
    description:
      "A minimalist logic puzzle where you extract arrows from intricate grids.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
