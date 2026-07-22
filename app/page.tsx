import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getFavoriteIds } from "@/lib/actions/favorite-actions";
import ProductCard from "@/components/shop/ProductCard";

const BENEFICIOS = [
  {
    icon: Truck,
    label: "Envíos a todo México",
  },
  {
    icon: ShieldCheck,
    label: "100% original",
  },
  {
    icon: RefreshCw,
    label: "Cambios fáciles",
  },
  {
    icon: Star,
    label: "Marcas premium",
  },
];

const FONDOS_CATEGORIAS = [
  "from-zinc-800 via-zinc-900 to-black",
  "from-zinc-700 via-zinc-900 to-black",
  "from-neutral-700 via-neutral-900 to-black",
  "from-stone-700 via-zinc-900 to-black",
];

export default async function HomePage() {
  const [destacados, categorias, favoritosIds] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: {
          take: 1,
          orderBy: {
            position: "asc",
          },
        },
        variants: {
          select: {
            stock: true,
          },
        },
      },
    }),

    prisma.category.findMany({
      take: 4,
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
      },
    }),

    getFavoriteIds(),
  ]);

  const idsDestacados = destacados.map((producto) => producto.id);

  const nuevosProductos = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(idsDestacados.length > 0
        ? {
            id: {
              notIn: idsDestacados,
            },
          }
        : {}),
    },
    take: 4,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      images: {
        take: 1,
        orderBy: {
          position: "asc",
        },
      },
      variants: {
        select: {
          stock: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-black">
      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.08),transparent_32%),linear-gradient(135deg,#090909_0%,#000_48%,#111_100%)]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#fff_0,#fff_1px,transparent_1px,transparent_28px)",
          }}
        />

        <div className="relative mx-auto grid min-h-[76vh] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(420px,.88fr)] lg:px-8 lg:py-24">
          <div className="max-w-3xl animate-fade-in">
            <div className="mb-7 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-300">
                Boutique premium
              </span>

              <span className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                México
              </span>
            </div>

            <h1 className="font-display text-[clamp(4.5rem,10vw,8.5rem)] leading-[0.82] tracking-[0.01em] text-white">
              HYPE
              <span className="block text-zinc-500">
                &amp; LUXURY
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
              Ropa y accesorios originales para quienes buscan piezas
              con presencia, estilo y personalidad. Entregas personales
              y envíos a todo México.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/productos"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-white px-8 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-[0_18px_50px_rgba(255,255,255,.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-200"
              >
                Ver catálogo
              </Link>

              <Link
                href="/productos?isFeatured=true"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.025] px-8 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.06]"
              >
                Ver destacados
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-7 sm:gap-5">
              <div>
                <p className="text-xl font-black text-white sm:text-2xl">
                  100%
                </p>
                <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
                  Original
                </p>
              </div>

              <div>
                <p className="text-xl font-black text-white sm:text-2xl">
                  MX
                </p>
                <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
                  Envíos nacionales
                </p>
              </div>

              <div>
                <p className="text-xl font-black text-white sm:text-2xl">
                  24/7
                </p>
                <p className="mt-1 text-[11px] text-zinc-600 sm:text-xs">
                  Catálogo disponible
                </p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-8 rounded-full bg-white/[0.025] blur-3xl" />

            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0d0d] shadow-[0_40px_120px_rgba(0,0,0,.6)]">
              <Image
                src="/images/losBoss.jpg"
                alt="Los Boss Boutique"
                fill
                priority
                className="object-cover opacity-70"
                sizes="(min-width: 1024px) 520px, 100vw"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
                  Los Boss Boutique
                </p>

                <p className="mt-3 max-w-sm text-2xl font-black leading-tight text-white">
                  Piezas seleccionadas para destacar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="border-b border-zinc-200 bg-white text-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-y divide-zinc-200 md:grid-cols-4 md:divide-y-0">
            {BENEFICIOS.map((beneficio) => {
              const Icon = beneficio.icon;

              return (
                <div
                  key={beneficio.label}
                  className="flex flex-col items-center justify-center gap-3 px-4 py-7 text-center"
                >
                  <Icon size={21} />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600 sm:text-xs">
                    {beneficio.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      {categorias.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                Explora
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Comprar por categoría
              </h2>

              <p className="mt-3 max-w-xl text-zinc-500">
                Encuentra rápidamente las piezas que mejor combinan con
                tu estilo.
              </p>
            </div>

            <Link
              href="/productos"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:gap-3 hover:text-white"
            >
              Ver todo
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categorias.map((categoria, index) => (
              <Link
                key={categoria.id}
                href={`/productos?categoria=${categoria.slug}`}
                className="group relative min-h-[300px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
              >
                {categoria.imageUrl ? (
                  <Image
                    src={categoria.imageUrl}
                    alt={categoria.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      FONDOS_CATEGORIAS[
                        index % FONDOS_CATEGORIAS.length
                      ]
                    }`}
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    Colección
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-4">
                    <h3 className="text-2xl font-black text-white">
                      {categoria.name}
                    </h3>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white transition group-hover:bg-white group-hover:text-black">
                      <ArrowRight size={17} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PRODUCTOS DESTACADOS */}
      <section className="border-y border-white/10 bg-[#050505]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                Selección
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Productos destacados
              </h2>

              <p className="mt-3 max-w-xl text-zinc-500">
                Una selección de las piezas más especiales disponibles
                actualmente.
              </p>
            </div>

            <Link
              href="/productos?isFeatured=true"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:gap-3 hover:text-white"
            >
              Ver destacados
              <ArrowRight size={16} />
            </Link>
          </div>

          {destacados.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
              {destacados.map((producto) => {
                const stockTotal = producto.variants.reduce(
                  (total, variante) => total + variante.stock,
                  0
                );

                return (
                  <ProductCard
                    key={producto.id}
                    id={producto.id}
                    slug={producto.slug}
                    name={producto.name}
                    price={Number(producto.price)}
                    brand={producto.brand}
                    imageUrl={producto.images[0]?.url}
                    esFavorito={favoritosIds.includes(producto.id)}
                    stockTotal={stockTotal}
                    isFeatured={producto.isFeatured}
                    createdAt={producto.createdAt.toISOString()}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-16 text-center">
              <Star
                size={28}
                className="mx-auto text-zinc-600"
              />

              <h3 className="mt-5 text-xl font-bold text-white">
                Próximamente nuevos destacados
              </h3>

              <p className="mx-auto mt-2 max-w-md text-zinc-500">
                Mientras tanto puedes explorar todos los productos
                disponibles en nuestro catálogo.
              </p>

              <Link
                href="/productos"
                className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:bg-zinc-200"
              >
                Explorar productos
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* NUEVOS INGRESOS */}
      {nuevosProductos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                Recién llegados
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Nuevos ingresos
              </h2>

              <p className="mt-3 max-w-xl text-zinc-500">
                Conoce las últimas piezas que se agregaron al catálogo
                de Los Boss.
              </p>
            </div>

            <Link
              href="/productos?orden=recientes"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:gap-3 hover:text-white"
            >
              Ver novedades
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
            {nuevosProductos.map((producto) => {
              const stockTotal = producto.variants.reduce(
                (total, variante) => total + variante.stock,
                0
              );

              return (
                <ProductCard
                  key={producto.id}
                  id={producto.id}
                  slug={producto.slug}
                  name={producto.name}
                  price={Number(producto.price)}
                  brand={producto.brand}
                  imageUrl={producto.images[0]?.url}
                  esFavorito={favoritosIds.includes(producto.id)}
                  stockTotal={stockTotal}
                  isFeatured={producto.isFeatured}
                  createdAt={producto.createdAt.toISOString()}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="relative overflow-hidden border-t border-zinc-200 bg-white py-20 text-black lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,.08),transparent_35%)]" />

        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
            Los Boss Boutique
          </p>

          <h2 className="mt-5 font-display text-[clamp(3rem,8vw,6rem)] leading-[0.9]">
            CONSIGUE TU PIEZA
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-600">
            Colecciones limitadas, piezas originales y envíos a todo
            México.
          </p>

          <Link
            href="/productos"
            className="mt-9 inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-black px-9 text-sm font-bold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-900"
          >
            Explorar catálogo
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}