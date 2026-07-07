import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

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
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-white mb-1">
                Editar producto
            </h1>

            <p className="text-zinc-400 text-sm mb-8">
                Modifica la información del producto.
            </p>

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
                    imageUrls: producto.images.map((img) => img.url),
                    isFeatured: producto.isFeatured,
                    gender: producto.gender,
                    variantes: producto.variants.map((v) => ({
                        id: v.id,
                        size: v.size ?? "",
                        color: v.color ?? "",
                        stock: v.stock,
                    })),
                }}
            />
        </div>
    )
}