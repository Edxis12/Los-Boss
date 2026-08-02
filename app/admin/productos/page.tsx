import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import {
    ChevronLeft,
    ChevronRight,
    ImageIcon,
    Package,
    Plus,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import ProductRowActions from "@/components/admin/ProductRowActions";
import AdminProductsFilters from "@/components/admin/products/AdminProductsFilters";

const PRODUCTOS_POR_PAGINA = 20;

type EstadoProducto =
    | "TODOS"
    | "ACTIVOS"
    | "INACTIVOS";

type PageProps = {
    searchParams: Promise<{
        page?: string;
        search?: string;
        categoria?: string;
        estado?: string;
    }>;
};

function obtenerEstado(
    estado?: string
): EstadoProducto {
    if (
        estado === "ACTIVOS" ||
        estado === "INACTIVOS"
    ) {
        return estado;
    }

    return "TODOS";
}

function crearHrefPaginacion(
    pagina: number,
    filtros: {
        search: string;
        categoria: string;
        estado: EstadoProducto;
    }
) {
    const params = new URLSearchParams();

    if (pagina > 1) {
        params.set("page", String(pagina));
    }

    if (filtros.search) {
        params.set("search", filtros.search);
    }

    if (filtros.categoria) {
        params.set(
            "categoria",
            filtros.categoria
        );
    }

    if (filtros.estado !== "TODOS") {
        params.set("estado", filtros.estado);
    }

    const query = params.toString();

    return query
        ? `/admin/productos?${query}`
        : "/admin/productos";
}

export default async function AdminProductosPage({
    searchParams,
}: PageProps) {
    const parametros = await searchParams;

    const busqueda =
        parametros.search?.trim() ?? "";

    const categoriaActual =
        parametros.categoria?.trim() ?? "";

    const estadoActual = obtenerEstado(
        parametros.estado
    );

    const paginaSolicitada = Math.max(
        1,
        Number.parseInt(
            parametros.page ?? "1",
            10
        ) || 1
    );

    const where: Prisma.ProductWhereInput = {
        ...(busqueda
            ? {
                  OR: [
                      {
                          name: {
                              contains: busqueda,
                              mode: "insensitive",
                          },
                      },
                      {
                          brand: {
                              contains: busqueda,
                              mode: "insensitive",
                          },
                      },
                      {
                          slug: {
                              contains: busqueda,
                              mode: "insensitive",
                          },
                      },
                  ],
              }
            : {}),

        ...(categoriaActual
            ? {
                  category: {
                      slug: categoriaActual,
                  },
              }
            : {}),

        ...(estadoActual === "ACTIVOS"
            ? {
                  isActive: true,
              }
            : estadoActual === "INACTIVOS"
              ? {
                    isActive: false,
                }
              : {}),
    };

    const [
        totalProductos,
        categorias,
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
    ]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(
            totalProductos /
                PRODUCTOS_POR_PAGINA
        )
    );

    const paginaActual = Math.min(
        paginaSolicitada,
        totalPaginas
    );

    const productos =
        await prisma.product.findMany({
            where,

            orderBy: {
                createdAt: "desc",
            },

            skip:
                (paginaActual - 1) *
                PRODUCTOS_POR_PAGINA,

            take: PRODUCTOS_POR_PAGINA,

            select: {
                id: true,
                name: true,
                price: true,
                comparePrice: true,
                isActive: true,

                category: {
                    select: {
                        name: true,
                    },
                },

                images: {
                    orderBy: {
                        position: "asc",
                    },
                    take: 1,
                    select: {
                        id: true,
                        url: true,
                        altText: true,
                    },
                },

                variants: {
                    select: {
                        id: true,
                        stock: true,
                    },
                },
            },
        });

    const tieneFiltros =
        Boolean(busqueda) ||
        Boolean(categoriaActual) ||
        estadoActual !== "TODOS";

    const filtrosActuales = {
        search: busqueda,
        categoria: categoriaActual,
        estado: estadoActual,
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Encabezado */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:text-xs sm:tracking-[0.3em]">
                    Administración
                </p>

                <div className="mt-2 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-[28px] font-black tracking-tight text-white min-[430px]:text-[34px] sm:text-[38px]">
                            Productos
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
                            Administra productos,
                            precios, inventario y
                            estado de publicación.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center">
                        <div className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-zinc-400 sm:text-sm">
                            {totalProductos}{" "}
                            {totalProductos === 1
                                ? "producto encontrado"
                                : "productos encontrados"}
                        </div>

                        <Link
                            href="/admin/productos/nuevo"
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200 min-[430px]:w-auto sm:min-h-12 sm:rounded-2xl"
                        >
                            <Plus size={17} />
                            Nuevo producto
                        </Link>
                    </div>
                </div>
            </div>

            <AdminProductsFilters
                categorias={categorias}
                busquedaActual={busqueda}
                categoriaActual={
                    categoriaActual
                }
                estadoActual={estadoActual}
            />

            {totalProductos === 0 &&
            !tieneFiltros ? (
                <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] px-5 py-14 text-center shadow-[0_30px_80px_rgba(0,0,0,.3)] sm:px-8 sm:py-20">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                        <Package
                            size={27}
                            className="text-zinc-500"
                        />
                    </div>

                    <h2 className="mt-6 text-2xl font-black tracking-tight text-white min-[430px]:text-3xl">
                        Todavía no hay productos
                    </h2>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500 sm:text-base">
                        Crea el primer producto
                        para comenzar a construir
                        el catálogo de Los Boss.
                    </p>

                    <Link
                        href="/admin/productos/nuevo"
                        className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:w-auto"
                    >
                        <Plus size={17} />
                        Crear producto
                    </Link>
                </section>
            ) : totalProductos === 0 ? (
                <section className="rounded-2xl border border-white/10 bg-[#0d0d0d] px-5 py-14 text-center sm:rounded-3xl sm:px-8 sm:py-16">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                        <Package
                            size={24}
                            className="text-zinc-500"
                        />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-white sm:text-2xl">
                        No encontramos productos
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                        Prueba con otra búsqueda o
                        elimina algunos filtros.
                    </p>

                    <Link
                        href="/admin/productos"
                        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200"
                    >
                        Limpiar filtros
                    </Link>
                </section>
            ) : (
                <>
                    {/* Tarjetas móvil/tablet */}
                    <div className="grid gap-4 lg:hidden">
                        {productos.map(
                            (producto) => {
                                const stockTotal =
                                    producto.variants.reduce(
                                        (
                                            total,
                                            variante
                                        ) =>
                                            total +
                                            variante.stock,
                                        0
                                    );

                                return (
                                    <article
                                        key={
                                            producto.id
                                        }
                                        className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-[0_20px_60px_rgba(0,0,0,.25)] min-[430px]:rounded-3xl"
                                    >
                                        <div className="grid min-[430px]:grid-cols-[130px_minmax(0,1fr)]">
                                            <div className="relative aspect-[16/10] bg-zinc-950 min-[430px]:aspect-auto min-[430px]:min-h-[180px]">
                                                {producto
                                                    .images[0]
                                                    ?.url ? (
                                                    <Image
                                                        src={
                                                            producto
                                                                .images[0]
                                                                .url
                                                        }
                                                        alt={
                                                            producto
                                                                .images[0]
                                                                .altText ??
                                                            producto.name
                                                        }
                                                        fill
                                                        className="object-contain p-3"
                                                        sizes="(max-width: 429px) 100vw, 130px"
                                                    />
                                                ) : (
                                                    <div className="flex h-full min-h-36 items-center justify-center">
                                                        <ImageIcon
                                                            size={
                                                                25
                                                            }
                                                            className="text-zinc-700"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex min-w-0 flex-col p-4 sm:p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="line-clamp-2 text-base font-bold leading-6 text-white min-[430px]:text-lg">
                                                            {
                                                                producto.name
                                                            }
                                                        </p>

                                                        <p className="mt-1 truncate text-xs text-zinc-600">
                                                            {
                                                                producto
                                                                    .category
                                                                    .name
                                                            }
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                                            producto.isActive
                                                                ? "bg-emerald-500/10 text-emerald-400"
                                                                : "bg-zinc-700/40 text-zinc-400"
                                                        }`}
                                                    >
                                                        {producto.isActive
                                                            ? "Activo"
                                                            : "Inactivo"}
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-3">
                                                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                                                        <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                                                            Precio
                                                        </p>

                                                        <p className="mt-1 break-all text-sm font-bold text-white">
                                                            $
                                                            {Number(
                                                                producto.price
                                                            ).toLocaleString(
                                                                "es-MX"
                                                            )}
                                                        </p>

                                                        {producto.comparePrice && (
                                                            <p className="mt-1 break-all text-xs text-red-400 line-through">
                                                                $
                                                                {Number(
                                                                    producto.comparePrice
                                                                ).toLocaleString(
                                                                    "es-MX"
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                                                        <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                                                            Stock
                                                            total
                                                        </p>

                                                        <p
                                                            className={`mt-1 text-sm font-bold ${
                                                                stockTotal <=
                                                                3
                                                                    ? "text-amber-400"
                                                                    : "text-white"
                                                            }`}
                                                        >
                                                            {
                                                                stockTotal
                                                            }{" "}
                                                            {stockTotal ===
                                                            1
                                                                ? "pieza"
                                                                : "piezas"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-auto border-t border-white/10 pt-4">
                                                    <ProductRowActions
                                                        productId={
                                                            producto.id
                                                        }
                                                        isActive={
                                                            producto.isActive
                                                        }
                                                        menuKey={`mobile-${producto.id}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>

                    {/* Tabla escritorio */}
                    <div className="hidden overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 lg:block">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-800 text-left text-zinc-400">
                                        <th className="px-5 py-4 font-medium">
                                            Producto
                                        </th>

                                        <th className="px-4 py-4 font-medium">
                                            Categoría
                                        </th>

                                        <th className="px-4 py-4 font-medium">
                                            Precio
                                        </th>

                                        <th className="px-4 py-4 font-medium">
                                            Stock
                                        </th>

                                        <th className="px-4 py-4 font-medium">
                                            Estado
                                        </th>

                                        <th className="px-5 py-4 text-right font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {productos.map(
                                        (
                                            producto
                                        ) => {
                                            const stockTotal =
                                                producto.variants.reduce(
                                                    (
                                                        total,
                                                        variante
                                                    ) =>
                                                        total +
                                                        variante.stock,
                                                    0
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        producto.id
                                                    }
                                                    className="border-b border-zinc-800 transition last:border-0 hover:bg-white/[0.025]"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
                                                                {producto
                                                                    .images[0]
                                                                    ?.url ? (
                                                                    <Image
                                                                        src={
                                                                            producto
                                                                                .images[0]
                                                                                .url
                                                                        }
                                                                        alt={
                                                                            producto
                                                                                .images[0]
                                                                                .altText ??
                                                                            producto.name
                                                                        }
                                                                        fill
                                                                        className="object-contain p-1"
                                                                        sizes="48px"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center">
                                                                        <ImageIcon
                                                                            size={
                                                                                18
                                                                            }
                                                                            className="text-zinc-700"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="max-w-[260px] truncate font-medium text-white">
                                                                    {
                                                                        producto.name
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-xs text-zinc-600">
                                                                    {
                                                                        producto
                                                                            .variants
                                                                            .length
                                                                    }{" "}
                                                                    {producto
                                                                        .variants
                                                                        .length ===
                                                                    1
                                                                        ? "variante"
                                                                        : "variantes"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 text-zinc-300">
                                                        <span className="inline-flex max-w-[180px] truncate rounded-full border border-white/10 bg-white/[0.025] px-3 py-1 text-xs">
                                                            {
                                                                producto
                                                                    .category
                                                                    .name
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <p className="whitespace-nowrap font-medium text-zinc-200">
                                                            $
                                                            {Number(
                                                                producto.price
                                                            ).toLocaleString(
                                                                "es-MX"
                                                            )}
                                                        </p>

                                                        {producto.comparePrice && (
                                                            <p className="mt-1 whitespace-nowrap text-xs text-red-400 line-through">
                                                                $
                                                                {Number(
                                                                    producto.comparePrice
                                                                ).toLocaleString(
                                                                    "es-MX"
                                                                )}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={
                                                                stockTotal <=
                                                                3
                                                                    ? "font-semibold text-amber-400"
                                                                    : "text-zinc-300"
                                                            }
                                                        >
                                                            {
                                                                stockTotal
                                                            }
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                                producto.isActive
                                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                                    : "bg-zinc-700/40 text-zinc-400"
                                                            }`}
                                                        >
                                                            {producto.isActive
                                                                ? "Activo"
                                                                : "Inactivo"}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <ProductRowActions
                                                            productId={
                                                                producto.id
                                                            }
                                                            isActive={
                                                                producto.isActive
                                                            }
                                                            menuKey={`desktop-${producto.id}`}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Paginación */}
                    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-center text-xs text-zinc-500 sm:text-left sm:text-sm">
                            Página {paginaActual} de{" "}
                            {totalPaginas} ·{" "}
                            {totalProductos}{" "}
                            {totalProductos === 1
                                ? "resultado"
                                : "resultados"}
                        </p>

                        <div className="grid grid-cols-2 gap-2 sm:flex">
                            {paginaActual > 1 ? (
                                <Link
                                    href={crearHrefPaginacion(
                                        paginaActual -
                                            1,
                                        filtrosActuales
                                    )}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                                >
                                    <ChevronLeft
                                        size={16}
                                    />
                                    Anterior
                                </Link>
                            ) : (
                                <span className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-zinc-800 px-4 text-sm font-medium text-zinc-600 opacity-50">
                                    <ChevronLeft
                                        size={16}
                                    />
                                    Anterior
                                </span>
                            )}

                            {paginaActual <
                            totalPaginas ? (
                                <Link
                                    href={crearHrefPaginacion(
                                        paginaActual +
                                            1,
                                        filtrosActuales
                                    )}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                                >
                                    Siguiente
                                    <ChevronRight
                                        size={16}
                                    />
                                </Link>
                            ) : (
                                <span className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-zinc-800 px-4 text-sm font-medium text-zinc-600 opacity-50">
                                    Siguiente
                                    <ChevronRight
                                        size={16}
                                    />
                                </span>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}