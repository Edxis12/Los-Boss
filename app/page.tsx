import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getFavoriteIds } from "@/lib/actions/favorite-actions";
import ProductCard from "@/components/shop/ProductCard";
import { ShieldCheck, Truck, RefreshCw, Star } from "lucide-react";

const BENEFICIOS = [
  { icon: Truck, label: "Envíos a todo México" },
  { icon: ShieldCheck, label: "100% Original" },
  { icon: RefreshCw, label: "Cambios fáciles" },
  { icon: Star, label: "Marcas premium" },
];

export default async function HomePage() {
  const session = await auth();
  const [destacados, favoritosIds] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 4,
      include: { images: { take: 1, orderBy: { position: "asc" } } },
    }),
    getFavoriteIds(),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Fondo con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900" />

        {/* Textura decorativa */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl animate-fade-in">
            <p className="text-xs tracking-[0.4em] uppercase text-zinc-400 mb-4">
              Tuxtla Gutiérrez · Chiapas
            </p>

            <h1 className="font-display text-[clamp(4rem,12vw,9rem)] leading-none text-white mb-6">
              HYPE &<br />
              LUXURY
            </h1>

            <p className="text-zinc-300 text-lg mb-10 max-w-xl leading-relaxed">
              Ropa y accesorios 100% originales. Encuentra las piezas que
              definen tu estilo — entregas personales en Tuxtla o envíos a
              cualquier parte de México.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/productos"
                className="bg-white text-black font-semibold px-8 py-3.5 rounded-lg hover:bg-zinc-100 transition text-sm tracking-wide uppercase"
              >
                Ver catálogo
              </Link>
              <Link
                href="/productos?isFeatured=true"
                className="border border-zinc-700 text-white px-8 py-3.5 rounded-lg hover:border-white transition text-sm tracking-wide uppercase"
              >
                Destacados
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="border-y border-zinc-900 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-200">
            {BENEFICIOS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.label}
                  className="flex flex-col items-center gap-2 py-6 px-4 text-center"
                >
                  <Icon size={22} className="text-black" />
                  <span className="text-xs text-zinc-600 tracking-wider uppercase font-medium">
                    {b.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      {destacados.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-zinc-500 mb-2">
                Selección
              </p>
              <h2 className="section-title text-white">Destacados</h2>
            </div>
            <Link
              href="/productos"
              className="text-sm text-zinc-400 hover:text-white transition tracking-wide"
            >
              Ver todo →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {destacados.map((producto) => (
              <ProductCard
                key={producto.id}
                id={producto.id}
                slug={producto.slug}
                name={producto.name}
                price={Number(producto.price)}
                brand={producto.brand}
                imageUrl={producto.images[0]?.url}
                esFavorito={favoritosIds.includes(producto.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="bg-white text-black py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2
            className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-none mb-4"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            CONSIGUE TU PIEZA
          </h2>
          <p className="text-zinc-600 mb-8 text-lg">
            Colecciones limitadas. Entregas personales o envío a todo México.
          </p>
          <Link
            href="/productos"
            className="inline-block bg-black text-white font-semibold px-10 py-4 rounded-lg hover:bg-zinc-900 transition text-sm tracking-widest uppercase"
          >
            Explorar catálogo
          </Link>
        </div>
      </section>
    </>
  );
}