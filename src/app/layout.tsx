import type { Metadata } from "next";
import {
  Averia_Serif_Libre,
  JetBrains_Mono,
  Quantico,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

const averiaSerifLibre = Averia_Serif_Libre({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  variable: "--font-averia-serif-libre",
});

const quantico = Quantico({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-quantico",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mgbuilds.in"),
  title: "Monojit Goswami | Portfolio",
  description: "Monojit Goswami - Backend & AI Engineer specializing in RAG systems and high-performance ML pipelines",
  keywords: "AI Engineer, Backend Developer, RAG, Machine Learning, Python, React",
  authors: [{ name: "Monojit Goswami" }],
  openGraph: {
    title: "Monojit Goswami | Portfolio",
    description: "Monojit Goswami - Backend & AI Engineer specializing in RAG systems and high-performance ML pipelines",
    url: "https://mgbuilds.in",
    siteName: "Monojit Goswami Portfolio",
    images: [
      {
        url: "https://mgbuilds.in/og_image/og-image.png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monojit Goswami | Portfolio",
    description: "Monojit Goswami - Backend & AI Engineer specializing in RAG systems and high-performance ML pipelines",
    images: ["https://mgbuilds.in/og_image/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={[
          spaceGrotesk.variable,
          jetBrainsMono.variable,
          averiaSerifLibre.variable,
          quantico.variable,
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}
