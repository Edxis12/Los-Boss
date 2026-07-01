"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { ShoppingBag, Heart, User, Search, Menu, X, LogOut } from "lucide-react";
import { useCartStore, useCartUserKey } from "@/store/cart-store";
import { useFavoritesCountStore } from "@/store/favorites-count-store";

/* eslint-disable @typescript-eslint/no-explicit-any */

const NAV_LINKS = [
  { label: "Nuevo", href: "/productos?ordenar=nuevo" },
  { label: "Hoodies", href: "/productos?categoria=hoodies" },
  { label: "Tops", href: "/productos?categoria=tops" },
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

  const userKey = useCartUserKey(session?.user?.id);
  const totalItems = useCartStore((state) => state.getTotalItems(userKey));
  const favoritesCount = useFavoritesCountStore((state) => state.count);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?buscar=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-extrabold text-white tracking-tight">
            LOS BOSS
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-300 hover:text-white transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Iconos */}
          <div className="flex items-center gap-4">
            <button
              aria-label="Buscar"
              onClick={() => setSearchOpen((v) => !v)}
              className="text-zinc-300 hover:text-white transition"
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            <Link
              href="/favoritos"
              aria-label="Favoritos"
              className="text-zinc-300 hover:text-white transition relative"
            >
              <Heart size={20} />
              {mounted && favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            <Link
              href="/carrito"
              aria-label="Carrito"
              className="text-zinc-300 hover:text-white transition relative"
            >
              <ShoppingBag size={20} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Sesión */}
            {status === "loading" ? (
              <div className="w-5 h-5 rounded-full bg-zinc-700 animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="text-zinc-300 hover:text-white transition"
                  aria-label="Mi cuenta"
                >
                  <User size={20} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                    <p className="px-4 py-3 text-sm text-zinc-400 border-b border-zinc-800 truncate">
                      {session.user?.email}
                    </p>
                    <Link
                      href="/cuenta/pedidos"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800"
                    >
                      Mis pedidos
                    </Link>
                    {(session.user as any)?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800"
                      >
                        Panel admin
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 text-left"
                    >
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition"
              >
                Iniciar sesión
              </Link>
            )}

            {/* Botón menú móvil */}
            <button
              className="md:hidden text-zinc-300"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menú"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Barra de búsqueda desplegable */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="pb-4">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-white"
            />
          </form>
        )}

        {/* Nav móvil */}
        {menuOpen && (
          <nav className="md:hidden flex flex-col gap-1 pb-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-2 py-2.5 text-sm font-medium text-zinc-300 hover:text-white"
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