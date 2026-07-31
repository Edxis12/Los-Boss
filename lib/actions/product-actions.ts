"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../auth";
import { prisma } from "../prisma";
import type { ActionResponse } from "@/lib/types/action-response";

// Helper: confirma que quien llama es admin. Lanza error si no.
async function requireAdmin() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("No autorizado");
    }
}

type VarianteInput = {
    id?: string;
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
}): Promise<ActionResponse> {

    try {
        await requireAdmin();

        if (!data.name || !data.slug || !data.categoryId || data.variantes.length === 0) {
            return { success: false, error: "Faltan campos requeridos" };
        }

        const existente = await prisma.product.findUnique({
            where: { slug: data.slug },
        });
        if (existente) {
            return { success: false, error: "Ya existe un producto con ese slug" };
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

    } catch (error) {
        return {
            success: false,
            error: "No se pudo crear el producto."
        }
    }
}

export async function actualizarStock(variantId: string, nuevoStock: number): Promise<ActionResponse> {

    try {
        await requireAdmin();

        if (nuevoStock < 0) {
            return { success: false, error: "El stock no puede ser negativo" };
        }

        await prisma.productVariant.update({
            where: { id: variantId },
            data: { stock: nuevoStock },
        });

        revalidatePath("/admin/productos");
        revalidatePath("/productos");
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: "No se pudo actualizar el stock."
        }
    }
}

export async function eliminarProducto(productId: string): Promise<ActionResponse> {

    try {

        await requireAdmin();

        await prisma.product.delete({ where: { id: productId } });

        revalidatePath("/admin/productos");
        revalidatePath("/productos");

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: "No se pudo eliminar el producto."
        }
    }
}

export async function cambiarEstadoProducto(
    productId: string,
    isActive: boolean
): Promise<ActionResponse> {
    try {
        await requireAdmin();

        await prisma.product.update({
            where: { id: productId },
            data: { isActive },
        });

        revalidatePath("/admin/productos");
        revalidatePath("/productos");
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: "No se pudo cambiar el estado del producto."
        }
    }
}

export async function actualizarOfertaProducto(
    productId: string,
    comparePrice: number | null
): Promise<ActionResponse> {

    try {
        await requireAdmin();

        await prisma.product.update({
            where: { id: productId },
            data: {
                comparePrice,
            },
        });

        revalidatePath("/admin/productos");
        revalidatePath("/productos");
        return { success: true };
    } catch (error) {
        console.error(
            "Error al actualizar oferta del producto:",
            error
        );

        return {
            success: false,
            error: "No se pudo actualizar la oferta del producto.",
        };
    }
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
}): Promise<ActionResponse> {
    await requireAdmin();

    if (
        !data.productId ||
        !data.name ||
        !data.slug ||
        !data.categoryId ||
        data.variantes.length === 0
    ) {
        return {
            success: false,
            error: "Faltan campos requeridos",
        };
    }

    if (
        data.variantes.some(
            (variante) =>
                !Number.isInteger(variante.stock) ||
                variante.stock < 0
        )
    ) {
        return {
            success: false,
            error: "El stock de las variantes no es válido",
        };
    }

    const productoConMismoSlug =
        await prisma.product.findFirst({
            where: {
                slug: data.slug,
                NOT: {
                    id: data.productId,
                },
            },
            select: {
                id: true,
            },
        });

    if (productoConMismoSlug) {
        return {
            success: false,
            error: "Ya existe otro producto con ese slug",
        };
    }

    try {
        await prisma.$transaction(async (tx) => {
            const variantesExistentes =
                await tx.productVariant.findMany({
                    where: {
                        productId: data.productId,
                    },
                    select: {
                        id: true,
                    },
                });

            const idsExistentes = new Set(
                variantesExistentes.map(
                    (variante) => variante.id
                )
            );

            const idsRecibidos = new Set(
                data.variantes
                    .map((variante) => variante.id)
                    .filter(
                        (id): id is string =>
                            typeof id === "string"
                    )
            );

            // Evita modificar una variante que pertenezca
            // a otro producto.
            const contieneIdInvalido = Array.from(
                idsRecibidos
            ).some((id) => !idsExistentes.has(id));

            if (contieneIdInvalido) {
                throw new Error(
                    "Una de las variantes no pertenece a este producto"
                );
            }

            await tx.product.update({
                where: {
                    id: data.productId,
                },
                data: {
                    name: data.name.trim(),
                    slug: data.slug,
                    description: data.description.trim(),
                    price: data.price,
                    comparePrice:
                        data.comparePrice ?? null,
                    brand: data.brand?.trim() || null,
                    isFeatured: data.isFeatured,
                    gender: data.gender,
                    category: {
                        connect: {
                            id: data.categoryId,
                        },
                    },
                },
            });

            /*
             * Imágenes:
             * pueden recrearse porque el carrito no depende
             * del ID de ProductImage.
             */
            await tx.productImage.deleteMany({
                where: {
                    productId: data.productId,
                },
            });

            if (data.imageUrls.length > 0) {
                await tx.productImage.createMany({
                    data: data.imageUrls
                        .map((url) => url.trim())
                        .filter(Boolean)
                        .map((url, index) => ({
                            productId: data.productId,
                            url,
                            position: index,
                        })),
                });
            }

            /*
             * Variantes existentes:
             * se actualizan y conservan su mismo ID.
             */
            const variantesParaActualizar =
                data.variantes.filter(
                    (
                        variante
                    ): variante is VarianteInput & {
                        id: string;
                    } => Boolean(variante.id)
                );

            for (const variante of variantesParaActualizar) {
                await tx.productVariant.update({
                    where: {
                        id: variante.id,
                    },
                    data: {
                        size: variante.size?.trim() || null,
                        color:
                            variante.color?.trim() || null,
                        stock: variante.stock,
                    },
                });
            }

            /*
             * Variantes nuevas:
             * solo se crean las que todavía no tienen ID.
             */
            const variantesNuevas =
                data.variantes.filter(
                    (variante) => !variante.id
                );

            if (variantesNuevas.length > 0) {
                const marcaTiempo = Date.now();

                await tx.productVariant.createMany({
                    data: variantesNuevas.map(
                        (variante, index) => ({
                            productId: data.productId,
                            sku: `${data.slug.toUpperCase()}-${marcaTiempo}-${index}-${Math.random()
                                .toString(36)
                                .slice(2, 8)}`,
                            size:
                                variante.size?.trim() ||
                                null,
                            color:
                                variante.color?.trim() ||
                                null,
                            stock: variante.stock,
                        })
                    ),
                });
            }

            /*
             * Variantes retiradas del formulario:
             * si ya fueron utilizadas en carritos o pedidos,
             * conservamos su ID y las dejamos en stock 0.
             * Si nunca fueron utilizadas, se eliminan.
             */
            const variantesRetiradas =
                variantesExistentes.filter(
                    (variante) =>
                        !idsRecibidos.has(variante.id)
                );

            for (const variante of variantesRetiradas) {
                const [usosEnPedidos, usosEnCarritos] =
                    await Promise.all([
                        tx.orderItem.count({
                            where: {
                                variantId: variante.id,
                            },
                        }),
                        tx.cartItem.count({
                            where: {
                                variantId: variante.id,
                            },
                        }),
                    ]);

                if (
                    usosEnPedidos > 0 ||
                    usosEnCarritos > 0
                ) {
                    await tx.productVariant.update({
                        where: {
                            id: variante.id,
                        },
                        data: {
                            stock: 0,
                        },
                    });
                } else {
                    await tx.productVariant.delete({
                        where: {
                            id: variante.id,
                        },
                    });
                }
            }
        });

        revalidatePath("/admin/productos");
        revalidatePath(
            `/admin/productos/${data.productId}/editar`
        );
        revalidatePath("/productos");
        revalidatePath(`/productos/${data.slug}`);
        revalidatePath("/carrito");
        revalidatePath("/checkout");

        return {
            success: true,
        };
    } catch (error) {
        console.error(
            "Error al actualizar producto:",
            error
        );

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "No se pudo actualizar el producto",
        };
    }
}

export type QuickViewProduct = {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    comparePrice: number | null;
    brand: string | null;
    category: {
        name: string;
        slug: string;
    };
    images: {
        id: string;
        url: string;
        altText: string | null;
        position: number;
    }[];
    variants: {
        id: string;
        size: string | null;
        color: string | null;
        stock: number;
    }[];
};

export async function getQuickViewProduct(
    slug: string
): Promise<QuickViewProduct | null> {
    const product = await prisma.product.findUnique({
        where: {
            slug,
            isActive: true,
        },
        include: {
            images: {
                orderBy: {
                    position: "asc",
                },
            },
            variants: true,
            category: {
                select: {
                    name: true,
                    slug: true,
                },
            },
        },
    });

    if (!product) {
        return null;
    }

    return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        comparePrice: product.comparePrice
            ? Number(product.comparePrice)
            : null,
        brand: product.brand,
        category: product.category,
        images: product.images.map((image) => ({
            id: image.id,
            url: image.url,
            altText: image.altText,
            position: image.position,
        })),
        variants: product.variants.map((variant) => ({
            id: variant.id,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
        })),
    };
}