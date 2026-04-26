import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Quantico:ital,wght@0,400;0,700;1,400;1,700&family=JetBrains+Mono:wght@100..800&family=Averia+Serif+Libre:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Geo&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
