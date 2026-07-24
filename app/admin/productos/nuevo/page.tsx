import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export default async function NuevoProductoPage() {
    const categorias = await prisma.category.findMany({
        orderBy: {
            name: "asc",
        },
    });

    return (
        <div className="mx-auto w-full max-w-5xl">
            <Link
                href="/admin/productos"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl text-sm font-medium text-zinc-500 transition hover:text-white"
            >
                <ArrowLeft size={16} />
                Volver a productos
            </Link>

            <div className="mt-6 sm:mt-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:text-xs sm:tracking-[0.3em]">
                    Administración
                </p>

                <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-3xl font-black tracking-tight text-white min-[430px]:text-4xl sm:text-5xl">
                            Nuevo producto
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
                            Completa la información, imágenes, precio, categoría y
                            variantes para agregar el producto al catálogo.
                        </p>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300 sm:h-14 sm:w-14">
                        <PackagePlus size={22} />
                    </div>
                </div>
            </div>

            {categorias.length === 0 ? (
                <section className="mt-8 rounded-3xl border border-amber-500/20 bg-amber-500/[0.06] p-5 sm:mt-10 sm:p-7">
                    <h2 className="text-lg font-bold text-white sm:text-xl">
                        Primero crea una categoría
                    </h2>

                    <p className="mt-2 text-sm leading-7 text-zinc-400">
                        Necesitas al menos una categoría antes de poder registrar un
                        producto.
                    </p>

                    <Link
                        href="/admin/categorias"
                        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-5 text-sm font-bold text-black transition hover:bg-zinc-200 sm:w-auto"
                    >
                        Ir a categorías
                    </Link>
                </section>
            ) : (
                <section className="mt-8 rounded-3xl border border-white/10 bg-[#0d0d0d] p-4 shadow-[0_30px_80px_rgba(0,0,0,.3)] min-[430px]:p-5 sm:mt-10 sm:p-8">
                    <div className="mb-6 border-b border-white/10 pb-5 sm:mb-8 sm:pb-6">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:text-xs">
                            Información del producto
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                            Datos del catálogo
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            Los campos obligatorios deben completarse antes de guardar.
                        </p>
                    </div>

                    <div className="min-w-0">
                        <ProductForm categorias={categorias} />
                    </div>
                </section>
            )}
        </div>
    );
}