"use client";

import { useEffect, useState } from "react";
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

type Props = {
    orderId: string;
    estadoActual: EstadoPedido;
    onUpdated?: (nuevoEstado: EstadoPedido) => void;
}

export default function OrderStatusSelect({
    orderId,
    estadoActual,
    onUpdated,
}: Props) {
    const router = useRouter();

    const [estado, setEstado] = useState<EstadoPedido>(estadoActual);

    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setEstado(estadoActual);
        setError("");
    }, [estadoActual, orderId]);

    async function handleChange(nuevoEstado: EstadoPedido) {
        if (guardando || nuevoEstado === estado) {
            return;
        }

        const estadoAnterior = estado;

        setEstado(nuevoEstado);
        setGuardando(true);
        setError("");

        try {
            const resultado = await actualizarEstadoPedido(orderId, nuevoEstado);

            if (resultado.error) {
                setEstado(estadoAnterior);
                setError(resultado.error);
                return;
            }

            onUpdated?.(nuevoEstado);
            router.refresh();
        } catch (error) {
            console.error("Error al actualizar el estado:", error);

            setEstado(estadoAnterior);
            setError("No se pudo actualizar el estado");
        } finally {
            setGuardando(false);
        }
    }

    return (
        <div className="min-w-0">
            <select
                value={estado}
                disabled={guardando}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => handleChange(event.target.value as EstadoPedido)}
                aria-label="Estado del pedido"
                className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-black
                    px-4
                    text-sm
                    font-semibold
                    text-white
                    outline-none
                    transition
                    focus:border-white
                    focus:ring-4
                    focus:ring-white/10
                    disabled:cursor-wait
                    disabled:opacity-50"
            >
                {ESTADOS.map((opcion) => (
                    <option
                        key={opcion.value}
                        value={opcion.value}
                    >
                        {opcion.label}
                    </option>
                ))}
            </select>

            <p
                className={`mt-2 text-xs ${error
                        ? "text-red-400"
                        : "text-zinc-600"
                    }`}
            >
                {error
                    ? error
                    : guardando
                        ? "Actualizando estado..."
                        : "El cambio se registra en el historial."}
            </p>
        </div>
    );
}