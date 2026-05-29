import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SafeLine — Gestion EPI Cordiste",
  description: "Gérez vos équipements de protection individuelle, suivez les dates d'expiration légales et respectez vos obligations réglementaires.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SafeLine",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
