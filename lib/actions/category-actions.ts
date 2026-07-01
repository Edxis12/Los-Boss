"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("No autorizado");
    }
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

export async function crearCategoria(name: string, imageUrl?: string) {
    await requireAdmin();

    if (!name.trim()) {
        return { error: "El nombre es requerido" };
    }

    const slug = slugify(name);

    const existente = await prisma.category.findUnique({ where: { slug } });
    if (existente) {
        return { error: "Ya existe una categoría con ese nombre" };
    }

    await prisma.category.create({
        data: { name: name.trim(), slug, imageUrl: imageUrl || null },
    });

    revalidatePath("/admin/categorias");
    revalidatePath("/productos");
    return { success: true };
}

export async function eliminarCategoria(categoryId: string) {
    await requireAdmin();

    const productosEnCategoria = await prisma.product.count({
        where: { categoryId },
    });

    if (productosEnCategoria > 0) {
        return {
            error: `No puedes eliminar esta categoría: tiene ${productosEnCategoria} producto(s) asignado(s). Reasígnalos primero.`,
        };
    }

    await prisma.category.delete({ where: { id: categoryId } });

    revalidatePath("/admin/categorias");
    revalidatePath("/productos");
    return { success: true };
}