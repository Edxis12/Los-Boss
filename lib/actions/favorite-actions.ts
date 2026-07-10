"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Agrega o quita un producto de favoritos (toggle). Requiere sesión activa.
export async function toggleFavorite(productId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Debes iniciar sesión para guardar favoritos" };
    }

    const existente = await prisma.favorite.findUnique({
        where: {
            userId_productId: {
                userId: session.user.id,
                productId,
            },
        },
    });

    if (existente) {
        await prisma.favorite.delete({ where: { id: existente.id } });
        revalidatePath("/favoritos");
        return { favorito: false };
    }

    await prisma.favorite.create({
        data: { userId: session.user.id, productId },
    });
    revalidatePath("/favoritos");
    return { favorito: true };
}

// Devuelve el set de IDs de productos que el usuario actual tiene en favoritos
export async function getFavoriteIds(): Promise<string[]> {
    const session = await auth();

    if (!session?.user?.id) return [];

    const favoritos = await prisma.favorite.findMany({
        where: {
            userId: session.user.id,
        },
        select: {
            productId: true,
        },
    });

    return favoritos.map(
        (f: typeof favoritos[number]) => f.productId
    );
}