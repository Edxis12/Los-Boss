import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PencilLine } from "lucide-react";

import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditarProductoPage({
    params,
}: Props) {
    const { id } = await params;

    const [producto, categorias] = await Promise.all([
        prisma.product.findUnique({
            where: {
                id,
            },
            include: {
                images: {
                    orderBy: {
                        position: "asc",
                    },
                },
                variants: true,
            },
        }),

        prisma.category.findMany({
            orderBy: {
                name: "asc",
            },
        }),
    ]);

    if (!producto) {
        notFound();
    }

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
                            Editar producto
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
                            Modifica la información, imágenes, precio, inventario y
                            variantes del producto.
                        </p>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-300 sm:h-14 sm:w-14">
                        <PencilLine size={22} />
                    </div>
                </div>
            </div>

            <section className="mt-8 rounded-3xl border border-white/10 bg-[#0d0d0d] p-4 shadow-[0_30px_80px_rgba(0,0,0,.3)] min-[430px]:p-5 sm:mt-10 sm:p-8">
                <div className="mb-6 border-b border-white/10 pb-5 sm:mb-8 sm:pb-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:text-xs">
                        Información del producto
                    </p>

                    <h2 className="mt-2 break-words text-xl font-bold text-white sm:text-2xl">
                        {producto.name}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                        Revisa los datos actuales y guarda los cambios cuando termines.
                    </p>
                </div>

                <div className="min-w-0">
                    <ProductForm
                        categorias={categorias}
                        producto={{
                            id: producto.id,
                            name: producto.name,
                            slug: producto.slug,
                            description: producto.description,
                            price: Number(producto.price),
                            comparePrice: producto.comparePrice
                                ? Number(producto.comparePrice)
                                : null,
                            brand: producto.brand,
                            categoryId: producto.categoryId,
                            imageUrls: producto.images.map(
                                (img: (typeof producto.images)[number]) => img.url
                            ),
                            isFeatured: producto.isFeatured,
                            gender: producto.gender,
                            variantes: producto.variants.map(
                                (v: (typeof producto.variants)[number]) => ({
                                    id: v.id,
                                    size: v.size ?? "",
                                    color: v.color ?? "",
                                    stock: v.stock,
                                })
                            ),
                        }}
                    />
                </div>
            </section>
        </div>
    );
}