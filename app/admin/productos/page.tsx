import Image from "next/image";
import Link from "next/link";
import {
    ImageIcon,
    Package,
    Plus,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import ProductRowActions from "@/components/admin/ProductRowActions";

export default async function AdminProductosPage() {
    const productos = await prisma.product.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            category: true,
            images: {
                orderBy: {
                    position: "asc",
                },
                take: 1,
            },
            variants: true,
        },
    });

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Encabezado */}
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:text-xs sm:tracking-[0.3em]">
                    Administración
                </p>

                <div className="mt-2 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white min-[430px]:text-4xl">
                            Productos
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
                            Administra los productos, precios, inventario y estado
                            de publicación de tu tienda.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center">
                        <div className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400">
                            {productos.length}{" "}
                            {productos.length === 1
                                ? "producto registrado"
                                : "productos registrados"}
                        </div>

                        <Link
                            href="/admin/productos/nuevo"
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200 min-[430px]:w-auto"
                        >
                            <Plus size={17} />
                            Nuevo producto
                        </Link>
                    </div>
                </div>
            </div>

            {productos.length === 0 ? (
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
                        Crea el primer producto para comenzar a construir el
                        catálogo de Los Boss.
                    </p>

                    <Link
                        href="/admin/productos/nuevo"
                        className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:w-auto"
                    >
                        <Plus size={17} />
                        Crear producto
                    </Link>
                </section>
            ) : (
                <>
                    {/* Tarjetas para móvil y tablet */}
                    <div className="grid gap-4 lg:hidden">
                        {productos.map(
                            (producto: typeof productos[number]) => {
                                const stockTotal =
                                    producto.variants.reduce(
                                        (
                                            total: number,
                                            variante: typeof producto.variants[number]
                                        ) => total + variante.stock,
                                        0
                                    );

                                return (
                                    <article
                                        key={producto.id}
                                        className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] shadow-[0_20px_60px_rgba(0,0,0,.25)]"
                                    >
                                        <div className="grid min-[430px]:grid-cols-[130px_minmax(0,1fr)]">
                                            <div className="relative aspect-[16/10] bg-zinc-950 min-[430px]:aspect-auto min-[430px]:min-h-[180px]">
                                                {producto.images[0]?.url ? (
                                                    <Image
                                                        src={
                                                            producto.images[0]
                                                                .url
                                                        }
                                                        alt={producto.name}
                                                        fill
                                                        className="object-contain p-3"
                                                        sizes="(max-width: 429px) 100vw, 130px"
                                                    />
                                                ) : (
                                                    <div className="flex h-full min-h-36 items-center justify-center">
                                                        <ImageIcon
                                                            size={25}
                                                            className="text-zinc-700"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex min-w-0 flex-col p-4 sm:p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="line-clamp-2 text-lg font-bold leading-6 text-white">
                                                            {producto.name}
                                                        </p>

                                                        <p className="mt-1 truncate text-xs text-zinc-600">
                                                            {
                                                                producto.category
                                                                    .name
                                                            }
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${producto.isActive
                                                            ? "bg-emerald-500/10 text-emerald-400"
                                                            : "bg-zinc-700/40 text-zinc-400"
                                                            }`}
                                                    >
                                                        {producto.isActive
                                                            ? "Activo"
                                                            : "Inactivo"}
                                                    </span>
                                                </div>

                                                <div className="mt-5 grid grid-cols-2 gap-3">
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
                                                            Stock total
                                                        </p>

                                                        <p
                                                            className={`mt-1 text-sm font-bold ${stockTotal <= 3
                                                                ? "text-amber-400"
                                                                : "text-white"
                                                                }`}
                                                        >
                                                            {stockTotal}{" "}
                                                            {stockTotal === 1
                                                                ? "pieza"
                                                                : "piezas"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-auto border-t border-white/10 pt-4">
                                                    <ProductRowActions
                                                        productId={producto.id}
                                                        isActive={producto.isActive}
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

                    {/* Tabla de escritorio */}
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
                                            Stock total
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
                                                <tr
                                                    key={producto.id}
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
                                                                producto.category
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
                                                                stockTotal <= 3
                                                                    ? "font-semibold text-amber-400"
                                                                    : "text-zinc-300"
                                                            }
                                                        >
                                                            {stockTotal}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${producto.isActive
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
                                                            productId={producto.id}
                                                            isActive={producto.isActive}
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
                </>
            )}
        </div>
    );
}