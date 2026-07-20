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

    try {
        const pedidoActual = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            select: {
                status: true,
            },
        });

        if (!pedidoActual) {
            return {
                error: "No se encontró el pedido",
            };
        }

        // Evita registrar dos veces el mismo estado.
        if (pedidoActual.status === nuevoEstado) {
            return {
                success: true,
            };
        }

        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    status: nuevoEstado,
                },
            });

            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: nuevoEstado,
                },
            });
        });

        revalidatePath("/admin/pedidos");
        revalidatePath("/admin/dashboard");
        revalidatePath("/cuenta/pedidos");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error al actualizar estado del pedido:", error);

        return {
            error:
                error instanceof Error
                    ? error.message
                    : "No se pudo actualizar el estado del pedido",
        };
    }
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