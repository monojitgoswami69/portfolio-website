import type { Metadata } from "next";
import { Arvo, JetBrains_Mono, Quantico } from "next/font/google";
import { Providers } from "@/features/admin/components/context/Providers";
import { ToastContainer } from "@/features/admin/components/ui/ToastContainer";
import "@/features/admin/admin.css";

const adminBody = Arvo({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--admin-font-body",
});

const adminDisplay = Quantico({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--admin-font-display",
});

const adminMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--admin-font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio Manager Admin",
    template: "%s | Portfolio Manager Admin",
  },
  description: "Portfolio Manager admin dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "admin-theme",
        adminBody.variable,
        adminDisplay.variable,
        adminMono.variable,
      ].join(" ")}
    >
      <Providers>
        {children}
        <ToastContainer />
      </Providers>
    </div>
  );
}
