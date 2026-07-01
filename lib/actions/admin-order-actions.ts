"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { success } from "zod";

async function requireAdmin () {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("No autorizado");
    }
}

export async function actualizarEstadoPedido(
    orderId: string,
    nuevoEstado: OrderStatus
) {
    await requireAdmin();

    await prisma.order.update({
        where: { id: orderId },
        data: { status: nuevoEstado },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/cuenta/pedidos");
    return { success: true }
}