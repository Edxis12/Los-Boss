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
        genero?: string;
        ofertas?: string;
    }>;
};

const GENERO_LABELS: Record<string, string> = {
    HOMBRE: "Hombres",
    MUJER: "Mujeres",
    UNISEX: "Unisex",
};

export default async function ProductosPage({ searchParams }: PageProps) {
    const { categoria, buscar, ordenar, precioMin, precioMax, genero, ofertas } =
        await searchParams;

    const where: {
        isActive: boolean;
        category?: { slug: string };
        gender?: "HOMBRE" | "MUJER" | "UNISEX";
        OR?: {
            name?: { contains: string; mode: "insensitive" };
            description?: { contains: string; mode: "insensitive" };
        }[];
        price?: { gte?: number; lte?: number };
        comparePrice?: { not?: null };
    } = {
        isActive: true,
    };

    if (categoria) where.category = { slug: categoria };

    if (genero && ["HOMBRE", "MUJER", "UNISEX"].includes(genero)) {
        where.gender = genero as "HOMBRE" | "MUJER" | "UNISEX";
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

    if (ofertas === "true") {
        where.comparePrice = {
            not: null,
        };
    }

    const orderBy =
        ordenar === "precio-asc"
            ? { price: "asc" as const }
            : ordenar === "precio-desc"
                ? { price: "desc" as const }
                : { createdAt: "desc" as const };

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

    // Título dinámico según los filtros activos
    const titulo = ofertas === "true"
    ? "Ofertas"
    : buscar
        ? `Resultados para "${buscar}"`
        : genero
            ? GENERO_LABELS[genero] ?? "Productos"
            : categoria
                ? categorias.find((c) => c.slug === categoria)?.name ?? "Productos"
                : "Todos los productos";

    return (
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-black tracking-tight text-white">{titulo}</h1>
                <p className="text-zinc-500 mt-2">
                    {productos.length}{" "}
                    {productos.length === 1 ? "producto" : "productos"}
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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-16">
                            {productos.map((producto) => (
                                <ProductCard
                                    key={producto.id}
                                    id={producto.id}
                                    slug={producto.slug}
                                    name={producto.name}
                                    price={Number(producto.price)}
                                    comparePrice={
                                        producto.comparePrice ? Number(producto.comparePrice) : null
                                    }
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