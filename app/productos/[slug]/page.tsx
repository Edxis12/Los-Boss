import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductActions from "@/components/shop/ProductActions";
import ProductCard from "@/components/shop/ProductCard";
import { getFavoriteIds } from "@/lib/actions/favorite-actions";
import { ChevronRight } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Galería */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-[#f5f5f5] rounded-2xl overflow-hidden">
              {imagenPrincipal ? (
                <Image
                  src={imagenPrincipal}
                  alt={producto.name}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  Sin imagen
                </div>
              )}
            </div>

            {producto.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {producto.images.slice(1).map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800"
                  >
                    <Image
                      src={img.url}
                      alt={producto.name}
                      fill
                      className="object-cover hover:scale-105 transition"
                      sizes="150px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info del producto */}
          <div className="flex flex-col">
            {/* Marca y nombre */}
            {producto.brand && (
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
                {producto.brand}
              </p>
            )}
            <h1 className="text-3xl font-bold text-white leading-tight">
              {producto.name}
            </h1>

            {/* Precio */}
            <div className="flex items-baseline gap-3 mt-4">
              <p className="text-2xl font-bold text-white">
                ${Number(producto.price).toLocaleString("es-MX")}
              </p>
              {producto.comparePrice &&
                Number(producto.comparePrice) > Number(producto.price) && (
                  <>
                    <p className="text-base text-zinc-500 line-through">
                      ${Number(producto.comparePrice).toLocaleString("es-MX")}
                    </p>
                    <span className="text-xs bg-white text-black font-bold px-2 py-0.5 rounded-full">
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

            {/* Separador */}
            <div className="border-t border-zinc-800 my-6" />

            {/* Descripción */}
            <p className="text-zinc-400 text-sm leading-relaxed">
              {producto.description}
            </p>

            {/* Separador */}
            <div className="border-t border-zinc-800 my-6" />

            {/* Acciones (talla, color, agregar al carrito) */}
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

            {/* Info extra */}
            <div className="mt-8 space-y-2.5">
              {[
                "✓ Producto 100% original",
                "✓ Entregas personales en Tuxtla Gutiérrez",
                "✓ Envíos a todo México",
              ].map((item) => (
                <p key={item} className="text-xs text-zinc-500">
                  {item}
                </p>
              ))}
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