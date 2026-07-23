import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { getFavoriteIds } from "@/lib/actions/favorite-actions";
import Link from "next/link";
import { PackageSearch, SlidersHorizontal } from "lucide-react";

type PageProps = {
    searchParams: Promise<{
        categoria?: string;
        buscar?: string;
        ordenar?: string;
        precioMin?: string;
        precioMax?: string;
        genero?: string;
        ofertas?: string;
        destacados?: string;
        nuevos?: string;
        marca?: string;
        disponibilidad?: string;
    }>;
};

type Genero = "HOMBRE" | "MUJER" | "UNISEX";

type ProductWhere = {
    isActive: boolean;
    category?: {
        slug: string;
    };
    gender?: Genero;
    brand?: string;
    isFeatured?: boolean;
    createdAt?: {
        gte: Date;
    };
    OR?: Array<{
        name?: {
            contains: string;
            mode: "insensitive";
        };
        description?: {
            contains: string;
            mode: "insensitive";
        };
        brand?: {
            contains: string;
            mode: "insensitive";
        };
    }>;
    price?: {
        gte?: number;
        lte?: number;
    };
    comparePrice?: {
        not: null;
    };
    variants?: {
        some?: {
            stock?: {
                gt?: number;
                gte?: number;
                lte?: number;
            };
        };
        none?: {
            stock?: {
                gt?: number;
            };
        };
    };
};

const GENERO_LABELS: Record<string, string> = {
    HOMBRE: "Hombres",
    MUJER: "Mujeres",
    UNISEX: "Unisex",
};

export default async function ProductosPage({
    searchParams,
}: PageProps) {
    const {
        categoria,
        buscar,
        ordenar,
        precioMin,
        precioMax,
        genero,
        ofertas,
        destacados,
        nuevos,
        marca,
        disponibilidad,
    } = await searchParams;

    const where: ProductWhere = {
        isActive: true,
    };

    if (categoria) {
        where.category = {
            slug: categoria,
        };
    }

    if (
        genero &&
        ["HOMBRE", "MUJER", "UNISEX"].includes(genero)
    ) {
        where.gender = genero as Genero;
    }

    if (marca) {
        where.brand = marca;
    }

    if (buscar) {
        where.OR = [
            {
                name: {
                    contains: buscar,
                    mode: "insensitive",
                },
            },
            {
                description: {
                    contains: buscar,
                    mode: "insensitive",
                },
            },
            {
                brand: {
                    contains: buscar,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (precioMin || precioMax) {
        where.price = {};

        if (precioMin && !Number.isNaN(Number(precioMin))) {
            where.price.gte = Number(precioMin);
        }

        if (precioMax && !Number.isNaN(Number(precioMax))) {
            where.price.lte = Number(precioMax);
        }
    }

    if (ofertas === "true") {
        where.comparePrice = {
            not: null,
        };
    }

    if (destacados === "true") {
        where.isFeatured = true;
    }

    if (nuevos === "true") {
        const haceTreintaDias = new Date();
        haceTreintaDias.setDate(haceTreintaDias.getDate() - 30);

        where.createdAt = {
            gte: haceTreintaDias,
        };
    }

    if (disponibilidad === "disponible") {
        where.variants = {
            some: {
                stock: {
                    gt: 3,
                },
            },
        };
    }

    if (disponibilidad === "poco-stock") {
        where.variants = {
            some: {
                stock: {
                    gte: 1,
                    lte: 3,
                },
            },
        };
    }

    if (disponibilidad === "agotado") {
        where.variants = {
            none: {
                stock: {
                    gt: 0,
                },
            },
        };
    }

    const orderBy =
        ordenar === "precio-asc"
            ? { price: "asc" as const }
            : ordenar === "precio-desc"
                ? { price: "desc" as const }
                : { createdAt: "desc" as const };

    const [productos, categorias, marcasConNulos, favoritosIds] =
        await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                include: {
                    images: {
                        orderBy: {
                            position: "asc",
                        },
                        take: 1,
                    },
                    variants: {
                        select: {
                            stock: true,
                        },
                    },
                },
            }),

            prisma.category.findMany({
                orderBy: {
                    name: "asc",
                },
            }),

            prisma.product.findMany({
                where: {
                    isActive: true,
                    brand: {
                        not: null,
                    },
                },
                select: {
                    brand: true,
                },
                distinct: ["brand"],
                orderBy: {
                    brand: "asc",
                },
            }),

            getFavoriteIds(),
        ]);

    const marcas = marcasConNulos
        .map(
            (
                producto: typeof marcasConNulos[number]
            ) => producto.brand
        )
        .filter(
            (marcaProducto): marcaProducto is string =>
                Boolean(marcaProducto)
        );

    const titulo =
        ofertas === "true"
            ? "Ofertas"
            : destacados === "true"
                ? "Productos destacados"
                : nuevos === "true"
                    ? "Productos nuevos"
                    : buscar
                        ? `Resultados para "${buscar}"`
                        : genero
                            ? GENERO_LABELS[genero] ?? "Productos"
                            : categoria
                                ? categorias.find(
                                    (
                                        categoriaItem: typeof categorias[number]
                                    ) =>
                                        categoriaItem.slug === categoria
                                )?.name ?? "Productos"
                                : "Todos los productos";

    return (
        <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
            <div className="mb-10">
                <p className="text-xs font-semibold upperase tracking-[0.35em] text-zinc-600">
                    Catálogo
                </p>

                <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                            {titulo}
                        </h1>

                        <p className="mt-3 max-w-xl text-zinc-500">
                            Explora nuestra selección de ropa y accesorios originales.
                        </p>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400">
                        <SlidersHorizontal size={15} />

                        {productos.length}{" "}
                        {productos.length === 1
                            ? "producto encontrado"
                            : "productos encontrados"}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                <FilterSidebar
                    categorias={categorias}
                    marcas={marcas}
                    categoriaActiva={categoria}
                />

                <div className="min-w-0 flex-1">
                    {productos.length === 0 ? (
                        <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] px-6 py-20 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                                <PackageSearch size={27} className="text-zinc-500" />
                            </div>

                            <h2 className="mt-6 text-2xl font-bold text-white">
                                No encontramos productos
                            </h2>

                            <p className="mx-auto mt-3 max-w-md leading-7 text-zinc-500">
                                No hay productos que coincidan con los filtros seleccionados.
                                Prueba eliminando algunos filtros.
                            </p>

                            <Link
                                href="/productos"
                                className="mt-7 inline-flex rounded-2xl bg-white px-7 py-3.5 font-bold text-black transition hover:bg-zinc-200"
                            >
                                Limpiar filtros
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-x-6 gap-y-12 min-[430px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8 xl:gap-y-16">
                            {productos.map(
                                (
                                    producto: typeof productos[number]
                                ) => {
                                    const stockTotal =
                                        producto.variants.reduce(
                                            (
                                                total: number,
                                                variante: typeof producto.variants[number]
                                            ) =>
                                                total +
                                                variante.stock,
                                            0
                                        );

                                    return (
                                        <ProductCard
                                            key={producto.id}
                                            id={producto.id}
                                            slug={producto.slug}
                                            name={producto.name}
                                            price={Number(
                                                producto.price
                                            )}
                                            comparePrice={
                                                producto.comparePrice
                                                    ? Number(
                                                        producto.comparePrice
                                                    )
                                                    : null
                                            }
                                            brand={producto.brand}
                                            imageUrl={
                                                producto.images[0]
                                                    ?.url
                                            }
                                            esFavorito={favoritosIds.includes(
                                                producto.id
                                            )}
                                            stockTotal={stockTotal}
                                            isFeatured={
                                                producto.isFeatured
                                            }
                                            createdAt={producto.createdAt.toISOString()}
                                        />
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}