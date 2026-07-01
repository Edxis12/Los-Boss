import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { getFavoriteIds } from "@/lib/actions/favorite-actions";

type PageProps = {
    searchParams: Promise<{
        categoria?: string;
        buscar?: string;
        ordenar?: string;
        precioMin?: string;
        precioMax?: string;
    }>;
};

export default async function ProductosPage({ searchParams }: PageProps) {
    const { categoria, buscar, ordenar, precioMin, precioMax } =
        await searchParams;

    // Construimos el filtro de Prisma dinámicamente según los query params
    const where: {
        isActive: boolean;
        category?: { slug: string };
        OR?: {
            name?: { contains: string; mode: "insensitive" };
            description?: { contains: string; mode: "insensitive" };
        }[];
        price?: { gte?: number; lte?: number };
    } = {
        isActive: true,
    };

    if (categoria) {
        where.category = { slug: categoria };
    }

    if (buscar) {
        where.OR = [
            { name: { contains: buscar, mode: "insensitive" } },
            { description: { contains: buscar, mode: "insensitive" } },
        ];
    }

    if (precioMin || precioMax) {
        where.price = {};
        if (precioMin) where.price.gte = Number(precioMin);
        if (precioMax) where.price.lte = Number(precioMax);
    }

    const orderBy =
        ordenar === "precio-asc"
            ? { price: "asc" as const }
            : ordenar === "precio-desc"
                ? { price: "desc" as const }
                : { createdAt: "desc" as const }; // "nuevo" o sin parámetro: lo más reciente primero

    const [productos, categorias, favoritosIds] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy,
            include: {
                images: { orderBy: { position: "asc" }, take: 1 },
            },
        }),
        prisma.category.findMany({ orderBy: { name: "asc" } }),
        getFavoriteIds(),
    ]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">
                    {buscar
                        ? `Resultados para "${buscar}"`
                        : categoria
                            ? categorias.find((c) => c.slug === categoria)?.name ?? "Productos"
                            : "Todos los productos"}
                </h1>
                <p className="text-zinc-400 text-sm mt-1">
                    {productos.length} {productos.length === 1 ? "producto" : "productos"}
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <FilterSidebar categorias={categorias} categoriaActiva={categoria} />

                <div className="flex-1">
                    {productos.length === 0 ? (
                        <p className="text-zinc-400 text-center py-20">
                            No encontramos productos con esos filtros.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                            {productos.map((producto) => (
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
                    )}
                </div>
            </div>
        </div>
    );
}