"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useCartStore, useCartUserKey } from "@/store/cart-store";
import { useFavoritesCountStore } from "@/store/favorites-count-store";

/* eslint-disable @typescript-eslint/no-explicit-any */

const NAV_LINKS = [
  { label: "Nuevo", href: "/productos?ordenar=nuevo" },
  { label: "Hombres", href: "/productos?genero=HOMBRE" },
  { label: "Mujeres", href: "/productos?genero=MUJER" },
  { label: "Tenis", href: "/productos?categoria=tenis" },
  { label: "Accesorios", href: "/productos?categoria=accesorios" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userKey = useCartUserKey(session?.user?.id);
  const totalItems = useCartStore((state) => state.getTotalItems(userKey));
  const favoritesCount = useFavoritesCountStore((state) => state.count);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?buscar=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/95 backdrop-blur-sm border-b border-zinc-800/80"
          : "bg-black border-b border-zinc-800"
      }`}
    >
      {/* Barra superior */}
      <div className="bg-white text-black text-center text-xs py-1.5 font-medium tracking-widest uppercase">
        Envíos a todo México 🇲🇽 · Ropa 100% Original
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-3xl text-white tracking-widest hover:opacity-80 transition"
          >
            LOS BOSS
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold text-zinc-300 hover:text-white transition tracking-widest uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Iconos */}
          <div className="flex items-center gap-5">
            <button
              aria-label="Buscar"
              onClick={() => setSearchOpen((v) => !v)}
              className="text-zinc-300 hover:text-white transition"
            >
              {searchOpen ? <X size={19} /> : <Search size={19} />}
            </button>

            <Link
              href="/favoritos"
              aria-label="Favoritos"
              className="text-zinc-300 hover:text-white transition relative"
            >
              <Heart size={19} />
              {mounted && favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            <Link
              href="/carrito"
              aria-label="Carrito"
              className="text-zinc-300 hover:text-white transition relative"
            >
              <ShoppingBag size={19} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Sesión */}
            {status === "loading" ? (
              <div className="w-5 h-5 rounded-full bg-zinc-800 animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1 text-zinc-300 hover:text-white transition"
                  aria-label="Mi cuenta"
                >
                  <User size={19} />
                  <ChevronDown size={13} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-xs text-zinc-500 truncate">
                        {session.user?.email}
                      </p>
                      <p className="text-sm font-medium text-white mt-0.5">
                        {session.user?.name ?? "Mi cuenta"}
                      </p>
                    </div>
                    <Link
                      href="/cuenta/pedidos"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
                    >
                      Mis pedidos
                    </Link>
                    <Link
                      href="/favoritos"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
                    >
                      Mis favoritos
                    </Link>
                    {(session.user as any)?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-900 transition border-t border-zinc-800"
                      >
                        Panel admin
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-900 text-left border-t border-zinc-800 transition"
                    >
                      <LogOut size={15} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold tracking-widest uppercase text-white border border-zinc-700 hover:border-white px-4 py-2 rounded-lg transition"
              >
                Entrar
              </Link>
            )}

            <button
              className="md:hidden text-zinc-300 hover:text-white"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menú"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="pb-4 animate-fade-in">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos, marcas..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm outline-none focus:border-white transition"
              />
            </div>
          </form>
        )}

        {/* Nav móvil */}
        {menuOpen && (
          <nav className="md:hidden flex flex-col gap-1 pb-4 animate-fade-in">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-2 py-3 text-sm font-semibold uppercase tracking-widest text-zinc-300 hover:text-white border-b border-zinc-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}