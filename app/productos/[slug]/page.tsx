import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductActions from "@/components/shop/ProductActions";
import ProductCard from "@/components/shop/ProductCard";
import { getFavoriteIds } from "@/lib/actions/favorite-actions";
import { ChevronRight } from "lucide-react";
import ProductGallery from "@/components/shop/ProductoGallery";

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
        NOT: { id: producto.id },
      },
      take: 4,
      include: { images: { take: 1, orderBy: { position: "asc" } } },
    }),
    getFavoriteIds(),
  ]);

  const imagenPrincipal = producto.images[0]?.url;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
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
          <span className="text-zinc-300 line-clamp-1">{producto.name}</span>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="max-w-[1700px] mx-auto px-8 xl:px-14 py-12">
        <div className="grid lg:grid-cols-[65%_35%] gap-28 items-start">
          {/* Galería */}
          <ProductGallery
            images={producto.images}
            productName={producto.name}
          />

          {/* Info del producto */}
          <div className="
            sticky 
            top-28 
            h-fit 
            flex 
            flex-col 
            pt-8 
            lg:pt-12 
            animate-fade-in
            max-w-[560px]
            ">

            {/* Marca */}
            {producto.brand && (
              <span className="text-xs uppercase tracking-[0.25em] text-zinc-500 font-medium">
                {producto.brand}
              </span>
            )}

            {/* Nombre */}
            <h1 className="
                  text-5xl
                  lg:text-6xl
                  font-black
                  leading-[1.05]
                  tracking-[-2px]
                  text-white
                  mb-5
                  max-w-[620px]
                ">
              {producto.name}
            </h1>

            {/* Categoría */}
            <p className="mt-4 uppercase tracking-[0.18em] text-xs text-zinc-500">
              {producto.category.name}
            </p>

            {/* Precio */}
            <div className="flex items-end gap-4 mt-8">

              <h2 className="text-[56px] font-black tracking-[-2px] text-zinc-100"
                style={{
                  textShadow: "0 0 30px rgba(255,255,255,0.12)"
                }}
              >
                ${Number(producto.price).toLocaleString("es-MX")}
              </h2>

              {producto.comparePrice &&
                Number(producto.comparePrice) > Number(producto.price) && (
                  <>
                    <span className="text-lg text-zinc-500 line-through">
                      ${Number(producto.comparePrice).toLocaleString("es-MX")}
                    </span>

                    <span className="rounded-full bg-white text-black px-3 py-1 text-xs font-bold">
                      -
                      {Math.round(
                        (1 -
                          Number(producto.price) /
                          Number(producto.comparePrice)) *
                        100
                      )}
                      %
                    </span>
                  </>
                )}

            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">
                Disponible para entrega
              </span>
            </div>

            {/* Línea */}
            <div className="my-8 border-t border-white/15" />

            {/* Descripción */}
            <div>

              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-400 mb-3">
                Descripción
              </h2>

              <p className="leading-8 text-[17px] text-zinc-300">
                {producto.description}
              </p>

            </div>

            {/* Línea */}
            <div className="my-8 border-t border-white/15" />

            {/* Selector */}
            <div className="pt-2">
              <ProductActions
                productId={producto.id}
                slug={producto.slug}
                name={producto.name}
                price={Number(producto.price)}
                imageUrl={imagenPrincipal}
                variants={producto.variants.map((v) => ({
                  id: v.id,
                  size: v.size,
                  color: v.color,
                  stock: v.stock,
                }))}
              />
            </div>

            {/* Beneficios */}
            <div className="mt-12 space-y-4">

              <div className="
                flex
                items-start  
                gap-4
                rounded-xl
                border
                border-white/10
                bg-white/[0.02]
                p-5
              ">
                <div className="mt-2 h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.7)]" />
                <div>
                  <h3 className="font-medium text-white">
                    Producto 100% original
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    Todos nuestros productos son cuidadosamente revisados antes de ser entregados.
                  </p>
                </div>
              </div>

              <div className="
                flex
                items-start  
                gap-4
                rounded-xl
                border
                border-white/10
                bg-white/[0.02]
                p-5
              ">
                <div className="mt-2 h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.7)]" />
                <div>
                  <h3 className="font-medium text-white">
                    Envíos a todo México
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    Empaque seguro y envío confiable a cualquier estado del país.
                  </p>
                </div>
              </div>

              <div className="
                flex
                items-start  
                gap-4
                rounded-xl
                border
                border-white/10
                bg-white/[0.02]
                p-5
              ">
                <div className="mt-2 h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.7)]" />
                <div>
                  <h3 className="font-medium text-white">
                    Entregas personales
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    Disponibles en Tuxtla Gutiérrez, Chiapas.
                  </p>
                </div>
              </div>
            </div>
          </div>


        </div>
        {/* Productos relacionados */}
        {relacionados.length > 0 && (
          <div className="mt-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] tracking-widest uppercase text-zinc-500 mb-1">
                  De la misma categoría
                </p>
                <h2 className="section-title text-white">También te puede gustar</h2>
              </div>
              <Link
                href={`/productos?categoria=${producto.category.slug}`}
                className="text-xs text-zinc-400 hover:text-white transition tracking-wide"
              >
                Ver todo →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {relacionados.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  price={Number(p.price)}
                  brand={p.brand}
                  imageUrl={p.images[0]?.url}
                  esFavorito={favoritosIds.includes(p.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}