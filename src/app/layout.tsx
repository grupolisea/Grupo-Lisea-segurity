import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#d4af37",
};

export const metadata: Metadata = {
  title: "Grupo Lisea | Seguridad Privada Profesional",
  description: "Plataforma de Seguridad Privada Profesional - Acceso Seguro y Protegido",
  keywords: ["seguridad", "privada", "protección", "acceso seguro", "Lisea"],
  authors: [{ name: "Grupo Lisea" }],
  icons: {
    icon: "/escudo.jpg",
    apple: "/escudo.jpg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lisea Security",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Grupo Lisea | Seguridad Privada Profesional",
    description: "Plataforma de Seguridad Privada Profesional",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lisea Security" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
