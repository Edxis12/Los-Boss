"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { prisma } from "../prisma";

// Helper: confirma que quien llama es admin. Lanza error si no.
async function requireAdmin() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("No autorizado");
    }
}

type VarianteInput = {
    size?: string;
    color?: string;
    stock: number;
};

export async function crearProducto(data: {
    name: string;
    slug: string;
    description: string;
    price: number;
    brand?: string;
    categoryId: string;
    imageUrl: string;
    isFeatured: boolean;
    gender: "HOMBRE" | "MUJER" | "UNISEX";
    variantes: VarianteInput[];
}) {
    await requireAdmin();

    if (!data.name || !data.slug || !data.categoryId || data.variantes.length === 0) {
        return { error: "Faltan campos requeridos" };
    }

    const existente = await prisma.product.findUnique({
        where: { slug: data.slug },
    });
    if (existente) {
        return { error: "Ya existe un producto con ese slug" };
    }

    await prisma.product.create({
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            price: data.price,
            brand: data.brand || null,
            isFeatured: data.isFeatured,
            gender: data.gender,
            category: { connect: { id: data.categoryId } },
            images: data.imageUrl
                ? { create: [{ url: data.imageUrl, position: 0 }] }
                : undefined,
            variants: {
                create: data.variantes.map((v, i) => ({
                    sku: `${data.slug.toUpperCase()}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    size: v.size || null,
                    color: v.color || null,
                    stock: v.stock,
                })),
            },
        },
    });

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    return { success: true };
}

export async function actualizarStock(variantId: string, nuevoStock: number) {
    await requireAdmin();

    if (nuevoStock < 0) {
        return { error: "El stock no puede ser negativo" };
    }

    await prisma.productVariant.update({
        where: { id: variantId },
        data: { stock: nuevoStock },
    });

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    return { success: true };
}

export async function eliminarProducto(productId: string) {
    await requireAdmin();

    await prisma.product.delete({ where: { id: productId } });

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    return { success: true };
}

export async function cambiarEstadoProducto(
    productId: string,
    isActive: boolean
) {
    await requireAdmin();
    
    await prisma.product.update({
        where: { id: productId },
        data: { isActive },
    });

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    return { success: true };
}