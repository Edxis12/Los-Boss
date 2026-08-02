import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/shop/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import Pagination from "@/components/shop/Pagination";
import { getFavoriteIds } from "@/lib/actions/favorite-actions";
import Link from "next/link";
import { PackageSearch, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";

const PRODUCTOS_POR_PAGINA = 12;

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
        page?: string;
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

export const metadata: Metadata = {
    title: "Productos",
    description:
        "Explora ropa y accesorios originales de Los Boss. Encuentra productos destacados, novedades, ofertas y envíos a todo México.",
};

export default async function ProductosPage({
    searchParams,
}: PageProps) {
    const parametros = await searchParams;

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
        page,
    } = parametros;

    const paginaSolicitada = Math.max(
        1,
        Number.parseInt(page ?? "1", 10) || 1
    );

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

    const [
        totalProductos,
        categorias,
        marcasConNulos,
        favoritosIds,
    ] = await Promise.all([
        prisma.product.count({
            where,
        }),

        prisma.category.findMany({
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
                slug: true,
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

    const totalPaginas = Math.max(
        1,
        Math.ceil(
            totalProductos / PRODUCTOS_POR_PAGINA
        )
    );

    const paginaActual = Math.min(
        paginaSolicitada,
        totalPaginas
    );

    const productos = await prisma.product.findMany({
        where,
        orderBy,

        skip:
            (paginaActual - 1) *
            PRODUCTOS_POR_PAGINA,

        take: PRODUCTOS_POR_PAGINA,

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
    });

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
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 xl:px-10">
            <div className="mb-8 sm:mb-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:text-xs sm:tracking-[0.3em]">
                    Catálogo
                </p>

                <div className="mt-2.5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="break-words text-[30px] font-black leading-tight tracking-tight text-white min-[430px]:text-[34px] sm:text-[40px] lg:text-[44px]">
                            {titulo}
                        </h1>

                        <p className="mt-2.5 max-w-xl text-sm leading-6 text-zinc-500 sm:text-[15px] sm:leading-7">
                            Explora nuestra selección de ropa y accesorios originales.
                        </p>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-zinc-400 sm:text-sm">
                        <SlidersHorizontal size={15} />

                        {totalProductos}{" "}
                        {totalProductos === 1
                            ? "producto encontrado"
                            : "productos encontrados"}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
                <FilterSidebar
                    categorias={categorias}
                    marcas={marcas}
                    categoriaActiva={categoria}
                />

                <div className="min-w-0 flex-1">
                    {productos.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] px-5 py-14 text-center sm:rounded-3xl sm:px-6 sm:py-16 lg:py-20">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] sm:h-16 sm:w-16">
                                <PackageSearch size={27} className="text-zinc-500" />
                            </div>

                            <h2 className="mt-5 text-xl font-bold text-white sm:text-2xl">
                                No encontramos productos
                            </h2>

                            <p className="mx-auto mt-3 max-w-md leading-7 text-zinc-500">
                                No hay productos que coincidan con los filtros seleccionados.
                                Prueba eliminando algunos filtros.
                            </p>

                            <Link
                                href="/productos"
                                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:min-h-12 sm:rounded-2xl sm:px-7"
                            >
                                Limpiar filtros
                            </Link>
                        </div>
                    ) : (
                        <div className="
                                    grid
                                    grid-cols-1
                                    gap-x-3
                                    gap-y-7
                                    min-[390px]:grid-cols-2
                                    min-[390px]:gap-x-4
                                    sm:gap-x-5
                                    sm:gap-y-9
                                    lg:grid-cols-3
                                    lg:gap-x-6
                                    xl:grid-cols-4
                                    xl:gap-x-7
                                    xl:gap-y-12
                                ">
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
                                })}

                        </div>
                    )}
                    <Pagination
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        searchParams={parametros}
                    />
                </div>
            </div>
        </div>
    );
}