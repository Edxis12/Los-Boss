"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { prisma } from "../prisma";
import { size, success } from "zod";

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
    comparePrice?: number | null;
    brand?: string;
    categoryId: string;
    imageUrls: string[];
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
            comparePrice: data.comparePrice ?? null,
            brand: data.brand || null,
            isFeatured: data.isFeatured,
            gender: data.gender,
            category: { connect: { id: data.categoryId } },
            images: data.imageUrls.length > 0
                ? {
                    create: data.imageUrls.map((url, index) => ({
                        url: url.trim(),
                        position: index,
                    })),
                }
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

export async function actualizarOfertaProducto(
    productId: string,
    comparePrice: number | null
) {
    await requireAdmin();

    await prisma.product.update({
        where: { id: productId },
        data: {
            comparePrice,
        },
    });

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    return { succes: true };
}

type VarianteUpdate = {
    id?: string;
    size?: string;
    color?: string;
    stock: number;
}

export async function actualizarProducto(data: {
    productId: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    comparePrice?: number | null;
    brand?: string;
    categoryId: string;
    imageUrls: string[];
    isFeatured: boolean;
    gender: "HOMBRE" | "MUJER" | "UNISEX";
    variantes: VarianteInput[];
}) {
    await requireAdmin();

    if (!data.productId || !data.name || !data.slug || !data.categoryId) {
        return { error: "Faltan campos requeridos" };
    }

    const existente = await prisma.product.findFirst({
        where: {
            slug: data.slug,
            NOT: {
                id: data.productId,
            },
        },
    });

    if (existente) {
        return { error: "Ya existe otro producto con ese slug" };
    }

    await prisma.productImage.deleteMany({
        where: {
            productId: data.productId,
        },
    });

    if (data.imageUrls.length > 0) {
        await prisma.productImage.createMany({
            data: data.imageUrls.map((url, index) => ({
                productId: data.productId,
                url: url.trim(),
                position: index,
            })),
        });
    }

    await prisma.product.update({
        where: {
            id: data.productId,
        },
        data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            price: data.price,
            comparePrice: data.comparePrice ?? null,
            brand: data.brand || null,
            isFeatured: data.isFeatured,
            gender: data.gender,
            category: {
                connect: {
                    id: data.categoryId,
                },
            },
        },
    });

    await prisma.productVariant.deleteMany({
        where: {
            productId: data.productId,
        },
    });

    await prisma.productVariant.createMany({
        data: data.variantes.map((v, i) => ({
            productId: data.productId,
            sku: `${data.slug.toUpperCase()}-${i}-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 7)}`,
            size: v.size || null,
            color: v.color || null,
            stock: v.stock,
        })),
    });

    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${data.productId}/editar`);
    revalidatePath("/productos");
    revalidatePath(`/productos/${data.slug}`);

    return { success: true };
}