import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d4af37" },
    { media: "(prefers-color-scheme: dark)", color: "#d4af37" },
  ],
};

export const metadata: Metadata = {
  title: "Grupo Lisea | Seguridad Privada Profesional",
  description: "Plataforma de Seguridad Privada Profesional - Acceso Seguro y Protegido",
  keywords: ["seguridad", "privada", "profesional", "lisea", "protección", "guardias"],
  authors: [{ name: "Grupo Lisea" }],
  creator: "Grupo Lisea",
  publisher: "Grupo Lisea",
  formatDetection: {
    telephone: true,
    email: false,
    address: false,
  },
  metadataBase: new URL("https://grupo-lisea-segurity.vercel.app"),
  icons: {
    icon: [
      { url: "/escudo.jpg", sizes: "32x32" },
      { url: "/escudo.jpg", sizes: "192x192" },
    ],
    apple: [
      { url: "/escudo.jpg", sizes: "180x180" },
      { url: "/escudo.jpg", sizes: "152x152" },
      { url: "/escudo.jpg", sizes: "167x167" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lisea Security",
    startupImage: [
      { url: "/escudo.jpg", media: "(device-width: 320px)" },
    ],
  },
  openGraph: {
    title: "Grupo Lisea - Seguridad Privada Profesional",
    description: "Plataforma de Seguridad Privada Profesional - Acceso Seguro y Protegido",
    url: "https://grupo-lisea-segurity.vercel.app",
    siteName: "Grupo Lisea",
    images: [
      {
        url: "/escudo.jpg",
        width: 512,
        height: 512,
        alt: "Grupo Lisea - Escudo",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grupo Lisea - Seguridad Privada",
    description: "Plataforma de Seguridad Privada Profesional",
    images: ["/escudo.jpg"],
  },
  robots: {
    index: false,
    follow: false,
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
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/escudo.jpg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/escudo.jpg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/escudo.jpg" />
        <link rel="apple-touch-icon" sizes="167x167" href="/escudo.jpg" />
        <link rel="apple-touch-startup-image" href="/escudo.jpg" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#d4af37" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#d4af37" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}