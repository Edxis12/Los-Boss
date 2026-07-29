import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Bebas_Neue } from "next/font/google";
import Providers from "@/providers";
import Navbar from "@/components/layout/Navbar";
import FavoritesSync from "@/components/layout/FavoritesSync";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import CartDrawer from "@/components/cart/CartDrawer";

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

export const metadata: Metadata = {
  title: "Los Boss | Hype & Luxury",
  description: "Ropa 100% original. Tuxtla Gutiérrez. Envíos a todo México.",
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
          <CartDrawer/>
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
