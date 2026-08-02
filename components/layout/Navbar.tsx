"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
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
import { useCartDrawerStore } from "@/store/cart-drawer-store";

/* eslint-disable @typescript-eslint/no-explicit-any */

const NAV_LINKS = [
  { label: "Nuevo", href: "/productos?nuevos=true" },
  { label: "Hombres", href: "/productos?genero=HOMBRE" },
  { label: "Mujeres", href: "/productos?genero=MUJER" },
  { label: "Ofertas", href: "/productos?ofertas=true", highlight: true },
];

const ANUNCIO = "ENVÍOS A TODO MÉXICO 🇲🇽   ·   ROPA 100% ORIGINAL";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userKey = useCartUserKey(session?.user?.id);
  const totalItems = useCartStore((state) => state.getTotalItems(userKey));
  const openDrawer = useCartDrawerStore((state) => state.openDrawer);
  const favoritesCount = useFavoritesCountStore((state) => state.count);
  const nombreUsuario = session?.user?.name?.trim().split(" ")[0] ?? "Mi cuenta";

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickFuera(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickFuera);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickFuera
      );
    };
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
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-black/95 backdrop-blur-sm border-b border-zinc-800/80"
        : "bg-black border-b border-zinc-800"
        }`}
    >
      {/* Barra superior - marquee animado */}
      <div className="group overflow-hidden bg-white py-1 text-black">
        <div className="flex whitespace-nowrap w-max animate-marquee group-hover:[animation-play-state:paused]">
          {[0, 1].map((bloque) => (
            <div key={bloque} className="flex shrink-0" aria-hidden={bloque === 1}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="mx-5 text-[10px] font-medium uppercase tracking-[0.16em]"
                >
                  {ANUNCIO}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between lg:h-[60px]">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-[22px] tracking-[0.16em] text-white transition hover:opacity-80 sm:text-2xl"
          >
            LOS BOSS
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-6 md:flex lg:gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] transition ${link.highlight
                  ? "text-red-400 hover:text-red-300"
                  : "text-zinc-300 hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Iconos */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              aria-label="Buscar"
              onClick={() => { setSearchOpen((v) => !v); setMenuOpen(false); setUserMenuOpen(false); }}
              className="text-zinc-300 hover:text-white hover:scale-110 transition-all duration-300"
            >
              {searchOpen ? <X size={19} /> : <Search size={19} />}
            </button>

            <Link
              href="/favoritos"
              aria-label="Favoritos"
              className="text-zinc-300 hover:text-white hover:scale-110 transition-all duration-300 relative"
            >
              <Heart size={20} />
              {mounted && favoritesCount > 0 && (
                <span className="
                    absolute  
                    -top-2 
                    -right-2
                    min-w-[18px]
                    h-[18px] 
                    px-1
                    rounded-full
                    bg-white
                    text-black
                    text-[10px]
                    font-bold
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    animate-scale-in  
                  ">
                  {favoritesCount > 99 ? "99+" : favoritesCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={openDrawer}
              aria-label="Abrir carrito"
              className="relative text-zinc-300 transition-all duration-300 hover:scale-110 hover:text-white"
            >
              <ShoppingBag size={20} />

              {mounted && totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black shadow-lg">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            {/* Sesión */}
            {status === "loading" ? (
              <div className="h-9 w-9 animate-pulse rounded-xl bg-zinc-800" />
            ) : session ? (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setUserMenuOpen((actual) => !actual)
                  }
                  className={`
        flex
        h-10
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        px-2.5
        text-zinc-300
        transition-all
        duration-300
        hover:border-white/30
        hover:bg-white/[0.05]
        hover:text-white
        sm:px-3
        ${userMenuOpen
                      ? "border-white/30 bg-white/[0.06] text-white"
                      : "border-transparent"
                    }
      `}
                  aria-label="Abrir menú de cuenta"
                  aria-expanded={userMenuOpen}
                >
                  <User size={20} />

                  <span className="hidden max-w-28 truncate text-sm font-semibold lg:block">
                    {nombreUsuario}
                  </span>

                  <ChevronDown
                    size={14}
                    className={`hidden transition-transform duration-300 lg:block ${userMenuOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    className="
          absolute
          right-0
          top-full
          mt-3
          w-[290px]
          max-w-[calc(100vw-32px)]
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-[#0d0d0d]
          shadow-[0_25px_80px_rgba(0,0,0,.65)]
          animate-fade-in
        "
                  >
                    <div className="border-b border-white/10 px-5 py-4">
                      <p className="truncate font-semibold text-white">
                        {session.user?.name ?? "Usuario de Los Boss"}
                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {session.user?.email}
                      </p>
                    </div>

                    <nav className="p-2">
                      <Link
                        href="/cuenta"
                        onClick={() => setUserMenuOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
                      >
                        Mi cuenta
                      </Link>

                      <Link
                        href="/cuenta/pedidos"
                        onClick={() => setUserMenuOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
                      >
                        Mis pedidos
                      </Link>

                      <Link
                        href="/cuenta/direcciones"
                        onClick={() => setUserMenuOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
                      >
                        Mis direcciones
                      </Link>
                    </nav>

                    {(session.user as any)?.role === "ADMIN" && (
                      <div className="border-t border-white/10 p-2">
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
                        >
                          Panel administrador
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-white/10 p-2">
                      <button
                        type="button"
                        onClick={() =>
                          signOut({
                            callbackUrl: "/",
                          })
                        }
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                      >
                        <LogOut size={16} />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="
                  hidden
                  min-h-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/15
                  px-4
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-white
                  transition
                  hover:border-white/40
                  hover:bg-white/[0.05]
                  sm:inline-flex
                "
              >
                Entrar
              </Link>
            )}

            <button
              className="md:hidden text-zinc-300 hover:text-white"
              onClick={() => { setMenuOpen((actual) => !actual); setSearchOpen(false); setUserMenuOpen(false); }}
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
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-zinc-700
                  bg-zinc-950
                  pl-10
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  transition
                  focus:border-white
                "
              />
            </div>
          </form>
        )}

        {/* Nav móvil */}
        {menuOpen && (
          <nav className="md:hidden flex flex-col gap-2 border-t border-zinc-900 pt-4 pb-4 animate-fade-in">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-widest transition ${link.highlight
                  ? "text-red-400 hover:text-red-300"
                  : "text-zinc-300 hover:text-white"
                  }`}
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