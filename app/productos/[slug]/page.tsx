import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductActions from "@/components/shop/ProductActions";
import ProductCard from "@/components/shop/ProductCard";
import { getFavoriteIds } from "@/lib/actions/favorite-actions";
import { ChevronRight } from "lucide-react";
import ProductGallery from "@/components/shop/ProductGallery";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductoDetallePage({ params }: PageProps) {
  const { slug } = await params;

  const producto = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
    },
  });

  if (!producto) notFound();

  const [relacionados, favoritosIds] = await Promise.all([
    prisma.product.findMany({
      where: {
        categoryId: producto.categoryId,
        isActive: true,
        NOT: {
          id: producto.id,
        },
      },
      take: 4,
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
    getFavoriteIds(),
  ]);

  const imagenPrincipal = producto.images[0]?.url;

  const stockTotal = producto.variants.reduce(
    (
      total: number,
      variante: typeof producto.variants[number]
    ) => total + variante.stock,
    0
  );

  const agotado = stockTotal <= 0;
  const pocoStock = stockTotal > 0 && stockTotal <= 3;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pb-1 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <nav className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap text-[11px] text-zinc-500 sm:text-xs">
          <Link href="/" className="hover:text-white transition">
            Inicio
          </Link>
          <ChevronRight size={12} />
          <Link href="/productos" className="hover:text-white transition">
            Productos
          </Link>
          <ChevronRight size={12} />
          <Link
            href={`/productos?categoria=${producto.category.slug}`}
            className="hover:text-white transition"
          >
            {producto.category.name}
          </Link>
          <ChevronRight size={12} />
          <span className="min-w-0 truncate text-zinc-300">{producto.name}</span>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="mx-auto max-w-[1700px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12 xl:px-14">
        <div className="grid items-start gap-7 sm:gap-9 md:gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,.85fr)] lg:gap-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(480px,.85fr)] xl:gap-14 2xl:gap-16">          {/* Galería */}
          <ProductGallery
            images={producto.images}
            productName={producto.name}
          />

          {/* Info del producto */}
          <div className="
            flex 
            h-fit
            max-w-none 
            animate-fade-in
            flex-col 
            pt-1
            lg:sticky
            lg:top-28 
            lg:max-w-[560px]
            lg:pt-4 
            xl:pt-8
            ">

            {/* Marca */}
            {producto.brand && (
              <span className="text-xs uppercase tracking-[0.25em] text-zinc-500 font-medium">
                {producto.brand}
              </span>
            )}

            {/* Nombre */}
            <h1 className="
                  mb-3
                  mt-2
                  max-w-[620px]
                  break-words
                  text-[30px]
                  font-black
                  leading-[1.08]
                  tracking-[-0.04em]
                  text-white
                  min-[430px]:text-[36px]
                  sm:mb-4
                  sm:text-[44px]
                  lg:text-[3.6rem]
                ">
              {producto.name}
            </h1>

            {/* Categoría */}
            <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500 sm:mt-3 sm:text-xs">
              {producto.category.name}
            </p>

            {/* Precio */}
            <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-2 sm:mt-7 sm:gap-x-4">
              <h2
                className="
                    break-all
                    text-[40px]
                    min-[430px]:text-[46px]
                    font-black
                    leading-none
                    tracking-[-0.05em]
                    text-zinc-100
                    sm:text-[52px]
                    lg:text-[3.25rem]
                  "
                style={{
                  textShadow: "0 0 30px rgba(255,255,255,0.12)",
                }}
              >
                ${Number(producto.price).toLocaleString("es-MX")}
              </h2>

              {producto.comparePrice &&
                Number(producto.comparePrice) > Number(producto.price) && (
                  <div className="flex items-center gap-2 pb-1">
                    <span className="text-sm text-zinc-500 line-through sm:text-base">
                      ${Number(producto.comparePrice).toLocaleString("es-MX")}
                    </span>

                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-black sm:px-3 sm:text-xs">
                      -
                      {Math.round(
                        (1 -
                          Number(producto.price) /
                          Number(producto.comparePrice)) *
                        100
                      )}
                      %
                    </span>
                  </div>
                )}
            </div>

            <div className="mt-4 flex items-start gap-2 sm:items-center">
              <div
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full sm:mt-0 ${agotado
                  ? "bg-red-400"
                  : pocoStock
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                  }`}
              />

              <span
                className={`text-sm font-medium ${agotado
                  ? "text-red-400"
                  : pocoStock
                    ? "text-amber-400"
                    : "text-emerald-400"
                  }`}
              >
                {agotado
                  ? "Producto agotado"
                  : pocoStock
                    ? `Últimas ${stockTotal} piezas disponibles`
                    : "Disponible para entrega"}
              </span>
            </div>

            {/* Línea */}
            <div className="my-6 border-t border-white/15 sm:my-8" />

            {/* Selector */}
            <div className="min-w-0 pt-1 sm:pt-2">
              <ProductActions
                productId={producto.id}
                slug={producto.slug}
                name={producto.name}
                price={Number(producto.price)}
                imageUrl={imagenPrincipal}
                variants={producto.variants.map(
                  (v: typeof producto.variants[number]) => ({
                    id: v.id,
                    size: v.size,
                    color: v.color,
                    stock: v.stock,
                  })
                )}
              />
            </div>

            <div className="my-6 border-t border-white/15 sm:my-8" />

            {/* Descripción */}
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-400">
                Descripción
              </h2>

              <p className="whitespace-pre-line text-sm leading-6 text-zinc-300 sm:text-base sm:leading-8 lg:text-[17px]">                {producto.description}
              </p>
            </div>

            {/* Línea */}
            <div className="my-6 border-t border-white/15 sm:my-8" />

            {/* Beneficios */}
            <div className="mt-9 grid gap-3 sm:mt-12 sm:grid-cols-2 lg:grid-cols-1 xl:gap-4">

              <div className="
                flex
                items-start  
                gap-2.5
                rounded-2xl
                border
                border-white/10
                bg-white/[0.02]
                p-3.5
                sm:gap-4
                sm:p-5
              ">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.7)]" />
                <div>
                  <h3 className="font-medium text-white">
                    Producto 100% original
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
                    Todos nuestros productos son cuidadosamente revisados antes de ser entregados.
                  </p>
                </div>
              </div>

              <div className="
                flex
                items-start  
                gap-2.5
                rounded-2xl
                border
                border-white/10
                bg-white/[0.02]
                p-3.5
                sm:gap-4
                sm:p-5
              ">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.7)]" />
                <div>
                  <h3 className="font-medium text-white">
                    Envíos a todo México
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
                    Empaque seguro y envío confiable a cualquier estado del país.
                  </p>
                </div>
              </div>

              <div className="
                flex
                items-start  
                gap-2.5
                rounded-2xl
                border
                border-white/10
                bg-white/[0.02]
                p-3.5
                sm:gap-4
                sm:p-5
              ">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.7)]" />
                <div>
                  <h3 className="font-medium text-white">
                    Entregas personales
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
                    Disponibles en Tuxtla Gutiérrez, Chiapas.
                  </p>
                </div>
              </div>
            </div>
          </div>


        </div>
        {/* Productos relacionados */}
        {relacionados.length > 0 && (
          <div className="mt-14 border-t border-white/10 pt-12 sm:mt-20 sm:pt-16">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] tracking-widest uppercase text-zinc-500 mb-1">
                  De la misma categoría
                </p>
                <h2 className="text-[28px] font-black tracking-tight text-white min-[430px]:text-[34px] sm:text-4xl lg:text-5xl">También te puede gustar</h2>
              </div>
              <Link
                href={`/productos?categoria=${producto.category.slug}`}
                className="text-xs text-zinc-400 hover:text-white transition tracking-wide"
              >
                Ver todo →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 min-[430px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
              {relacionados.map((p: typeof relacionados[number]) => {
                const stockRelacionado = p.variants.reduce(
                  (
                    total: number,
                    variante: typeof p.variants[number]
                  ) => total + variante.stock,
                  0
                );

                return (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    slug={p.slug}
                    name={p.name}
                    price={Number(p.price)}
                    comparePrice={
                      p.comparePrice
                        ? Number(p.comparePrice)
                        : null
                    }
                    brand={p.brand}
                    imageUrl={p.images[0]?.url}
                    esFavorito={favoritosIds.includes(p.id)}
                    stockTotal={stockRelacionado}
                    isFeatured={p.isFeatured}
                    createdAt={p.createdAt.toISOString()}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}