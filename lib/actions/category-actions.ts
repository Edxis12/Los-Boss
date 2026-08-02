"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/lib/types/action-response";

async function requireAdmin() {
    const session = await auth();

    if (!session?.user?.id) {
        return {
            authorized: false as const,
        };
    }

    const usuario = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        select: {
            role: true,
        },
    });

    return {
        authorized:
            usuario?.role === "ADMIN",
    };
}

function validarCategoryId(categoryId: string) {
    return (
        typeof categoryId === "string" &&
        categoryId.trim().length > 0 &&
        categoryId.length <= 100
    );
}

function slugify(texto: string) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

function normalizarImagen(imageUrl?: string) {
    const imagen = imageUrl?.trim();

    if (!imagen) {
        return {
            value: null,
        };
    }

    if (imagen.length > 500) {
        return {
            error: "La URL de la imagen es demasiado larga",
        };
    }

    try {
        const url = new URL(imagen);

        if (
            url.protocol !== "https:" ||
            url.hostname !== "res.cloudinary.com"
        ) {
            return {
                error: "La imagen debe provenir de Cloudinary",
            };
        }

        return {
            value: url.toString(),
        };
    } catch {
        return {
            error: "La URL de la imagen no es válida",
        };
    }
}

function revalidarCategorias() {
    revalidatePath("/");
    revalidatePath("/productos");
    revalidatePath("/admin/categorias");
    revalidatePath("/admin/productos");
}

export async function crearCategoria(
    name: string,
    imageUrl?: string
): Promise<ActionResponse> {
    const admin = await requireAdmin();

    if (!admin.authorized) {
        return {
            success: false,
            error: "No autorizado",
        };
    }

    const nombreLimpio = name.trim();

    if (nombreLimpio.length > 60) {
        return {
            success: false,
            error: "El nombre no puede superar 60 caracteres",
        };
    }

    if (!nombreLimpio) {
        return {
            success: false,
            error: "El nombre es requerido",
        };
    }

    const slug = slugify(nombreLimpio);

    if (!slug) {
        return {
            success: false,
            error: "Escribe un nombre válido",
        };
    }

    const imagenNormalizada = normalizarImagen(imageUrl);

    if (imagenNormalizada.error) {
        return {
            success: false,
            error: imagenNormalizada.error,
        };
    }

    try {
        const existente = await prisma.category.findFirst({
            where: {
                OR: [
                    {
                        slug,
                    },
                    {
                        name: {
                            equals: nombreLimpio,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            select: {
                id: true,
            },
        });

        if (existente) {
            return {
                success: false,
                error: "Ya existe una categoría con ese nombre",
            };
        }

        await prisma.category.create({
            data: {
                name: nombreLimpio,
                slug,
                imageUrl: imagenNormalizada.value,
            },
        });

        revalidarCategorias();

        return {
            success: true,
            message: "Categoría creada correctamente",
        };
    } catch (error) {
        console.error("Error al crear categoría:", error);

        return {
            success: false,
            error: "No se pudo crear la categoría",
        };
    }
}

export async function actualizarCategoria(
    categoryId: string,
    name: string,
    imageUrl?: string
): Promise<ActionResponse> {
    const admin = await requireAdmin();

    if (!admin.authorized) {
        return {
            success: false,
            error: "No autorizado",
        };
    }

    const nombreLimpio = name.trim();

    if (nombreLimpio.length > 60) {
        return {
            success: false,
            error: "El nombre no puede superar 60 caracteres",
        };
    }

    if (!validarCategoryId(categoryId)) {
        return {
            success: false,
            error: "La categoría no es válida",
        };
    }

    if (!nombreLimpio) {
        return {
            success: false,
            error: "El nombre es requerido",
        };
    }

    const slug = slugify(nombreLimpio);

    if (!slug) {
        return {
            success: false,
            error: "Escribe un nombre válido",
        };
    }

    const imagenNormalizada = normalizarImagen(imageUrl);

    if (imagenNormalizada.error) {
        return {
            success: false,
            error: imagenNormalizada.error,
        };
    }

    try {
        const categoria = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
            select: {
                id: true,
            },
        });

        if (!categoria) {
            return {
                success: false,
                error: "No encontramos la categoría",
            };
        }

        const duplicada = await prisma.category.findFirst({
            where: {
                id: {
                    not: categoryId,
                },
                OR: [
                    {
                        slug,
                    },
                    {
                        name: {
                            equals: nombreLimpio,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            select: {
                id: true,
            },
        });

        if (duplicada) {
            return {
                success: false,
                error: "Ya existe otra categoría con ese nombre",
            };
        }

        await prisma.category.update({
            where: {
                id: categoryId,
            },
            data: {
                name: nombreLimpio,
                slug,
                imageUrl: imagenNormalizada.value,
            },
        });

        revalidarCategorias();

        return {
            success: true,
            message: "Categoría actualizada correctamente",
        };
    } catch (error) {
        console.error("Error al actualizar categoría:", error);

        return {
            success: false,
            error: "No se pudo actualizar la categoría",
        };
    }
}

export async function eliminarCategoria(
    categoryId: string
): Promise<ActionResponse> {
    const admin = await requireAdmin();

    if (!admin.authorized) {
        return {
            success: false,
            error: "No autorizado",
        };
    }

    if (!validarCategoryId(categoryId)) {
        return {
            success: false,
            error: "La categoría no es válida",
        };
    }

    try {
        const categoria = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!categoria) {
            return {
                success: false,
                error: "No encontramos la categoría",
            };
        }

        if (categoria._count.products > 0) {
            return {
                success: false,
                error: `No puedes eliminar "${categoria.name}" porque tiene ${categoria._count.products
                    } ${categoria._count.products === 1
                        ? "producto asignado"
                        : "productos asignados"
                    }. Reasígnalos primero.`,
            };
        }

        await prisma.category.delete({
            where: {
                id: categoryId,
            },
        });

        revalidarCategorias();

        return {
            success: true,
            message: "Categoría eliminada correctamente",
        };
    } catch (error) {
        console.error("Error al eliminar categoría:", error);

        return {
            success: false,
            error: "No se pudo eliminar la categoría",
        };
    }
} 