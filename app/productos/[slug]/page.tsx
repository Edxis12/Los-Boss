import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductActions from "@/components/shop/ProductActions";

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

    if (!producto) {
        notFound();
    }

    const imagenPrincipal = producto.images[0]?.url;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid md:grid-cols-2 gap-10">
                {/* Galería */}
                <div className="space-y-4">
                    <div className="relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden">
                        {imagenPrincipal ? (
                            <Image
                                src={imagenPrincipal}
                                alt={producto.name}
                                fill
                                className="object-cover"
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
                        <div className="grid grid-cols-4 gap-3">
                            {producto.images.slice(1).map((img) => (
                                <div
                                    key={img.id}
                                    className="relative aspect-square bg-zinc-900 rounded-lg overflow-hidden"
                                >
                                    <Image
                                        src={img.url}
                                        alt={producto.name}
                                        fill
                                        className="object-cover"
                                        sizes="150px"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Información */}
                <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                        {producto.brand}
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                        {producto.name}
                    </h1>
                    <p className="text-xl font-semibold text-zinc-200 mt-3">
                        ${Number(producto.price).toLocaleString("es-MX")}
                    </p>

                    <p className="text-zinc-400 text-sm leading-relaxed mt-6">
                        {producto.description}
                    </p>

                    <div className="mt-8">
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
                </div>
            </div>
        </div>
    );
}