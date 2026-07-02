import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Bebas_Neue } from "next/font/google";
import Providers from "@/providers";
import Navbar from "@/components/layout/Navbar";
import FavoritesSync from "@/components/layout/FavoritesSync";
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
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-600">
            © {new Date().getFullYear()} Los Boss · Tuxtla Gutiérrez, Chiapas · Hype y Luxury · Todos los derechos reservados
          </footer>
        </Providers>
      </body>
    </html>
  );
}
