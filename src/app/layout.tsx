import type { Metadata } from "next";
import {
  Averia_Serif_Libre,
  JetBrains_Mono,
  Quantico,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import PWARegister from "@/features/pwa/PWARegister";

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
  manifest: "/favicons/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MG | Portfolio",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon.ico", sizes: "any" },
    ],
    apple: "/favicons/apple-touch-icon.png",
  },
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
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MG | Portfolio" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
      </head>
      <body
        className={[
          spaceGrotesk.variable,
          jetBrainsMono.variable,
          averiaSerifLibre.variable,
          quantico.variable,
        ].join(" ")}
      >
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
