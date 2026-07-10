"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    actualizarEstadoPedido,
    type EstadoPedido,
} from "@/lib/actions/admin-order-actions";

const ESTADOS = [
    { value: "PENDING", label: "Pendiente" },
    { value: "CONTACTED", label: "Contactado" },
    { value: "PAYMENT_CONFIRMED", label: "Pago confirmado" },
    { value: "PREPARING", label: "Preparando" },
    { value: "SHIPPED", label: "Enviado" },
    { value: "DELIVERED", label: "Entregado" },
    { value: "CANCELLED", label: "Cancelado" },
] as const;

export default function OrderStatusSelect({
    orderId,
    estadoActual,
}: {
    orderId: string;
    estadoActual: string;
}) {
    const router = useRouter();

    const [estado, setEstado] = useState<EstadoPedido>(
        estadoActual as EstadoPedido
    );

    const [guardando, setGuardando] = useState(false);

    async function handleChange(nuevoEstado: EstadoPedido) {
        setEstado(nuevoEstado);
        setGuardando(true);

        await actualizarEstadoPedido(orderId, nuevoEstado);

        setGuardando(false);
        router.refresh();
    }

    return (
        <select
            value={estado}
            disabled={guardando}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
                handleChange(e.target.value as EstadoPedido)
            }
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-white outline-none focus:border-white disabled:opacity-50"
        >
            {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>
                    {e.label}
                </option>
            ))}
        </select>
    );
}