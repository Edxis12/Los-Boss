import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";

import Providers from "@/providers";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FavoritesSync from "@/components/layout/FavoritesSync";

import CartDrawer from "@/components/cart/CartDrawer";
import QuickViewModal from "@/components/shop/QuickViewModal";

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://los-boss.vercel.app"
  ),

  title: {
    default: "Los Boss",
    template: "%s | Los Boss",
  },

  description:
    "Compra ropa 100% original de las mejores marcas. Envíos a todo México.",

  keywords: [
    "ropa",
    "streetwear",
    "luxury",
    "hype",
    "tenis",
    "playeras",
    "Los Boss",
  ],

  authors: [
    {
      name: "Los Boss",
    },
  ],

  applicationName: "Los Boss",

  category: "fashion",

  creator: "Los Boss",

  openGraph: {
    title: "Los Boss",

    description:
      "Compra ropa 100% original de las mejores marcas. Envíos a todo México.",

    url: "https://los-boss.vercel.app",

    siteName: "Los Boss",

    locale: "es_MX",

    type: "website",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Los Boss",
      },
    ],
  },

  referrer: "origin-when-cross-origin",

  twitter: {
    card: "summary_large_image",

    title: "Los Boss",

    description:
      "Compra ropa 100% original de las mejores marcas.",

    images: ["/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">
        <Providers>
          <FavoritesSync />
          <Navbar />
          <CartDrawer />
          <QuickViewModal />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
