"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ESTADOS_PEDIDO = [
    "PENDING",
    "CONTACTED",
    "PAYMENT_CONFIRMED",
    "PREPARING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
] as const;

export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number];

async function requireAdmin() {
    const session = await auth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("No autorizado");
    }
}

export async function actualizarEstadoPedido(
    orderId: string,
    nuevoEstado: EstadoPedido
) {
    await requireAdmin();

    if (!ESTADOS_PEDIDO.includes(nuevoEstado)) {
        return {
            error: "Estado de pedido no válido",
        };
    }

    await prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            status: nuevoEstado,
        },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/dashboard");
    revalidatePath("/cuenta/pedidos");

    return {
        success: true,
    };
}

export async function actualizarNotasPedido(
    orderId: string,
    adminNotes: string
) {
    await requireAdmin();

    await prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            adminNotes: adminNotes.trim() || null,
        },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/dashboard");

    return {
        success: true,
    };
}