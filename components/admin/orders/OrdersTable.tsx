"use client";

import { useState } from "react";
import OrderDetailsModal from "./OrderDetailsModal";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderStatusSelect from "../OrderStatusSelect";
import { Eye, Search } from "lucide-react";

type Props = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pedidos: any[];
};

export default function OrdersTable({ pedidos }: Props) {

    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any>(null);
    const [busqueda, setBusqueda] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("TODOS");

    const RESUMEN_ESTADOS = [
        { label: "Pendientes", value: "PENDING" },
        { label: "Contactados", value: "CONTACTED" },
        { label: "Confirmados", value: "PAYMENT_CONFIRMED" },
        { label: "Preparando", value: "PREPARING" },
        { label: "Enviados", value: "SHIPPED" },
        { label: "Entregados", value: "DELIVERED" },
    ]

    function contarPorEstado(estado: string) {
        return pedidos.filter((pedido) => pedido.status === estado).length;
    }

    const pedidosFiltrados = pedidos.filter((pedido) => {
        const texto = `${pedido.orderNumber} ${pedido.user.name ?? ""} ${pedido.user.email ?? ""}`.toLowerCase();

        const coincideBusqueda = texto.includes(busqueda.toLowerCase());
        const coincideEstado =
            estadoFiltro === "TODOS" || pedido.status === estadoFiltro;

        return coincideBusqueda && coincideEstado;
    })

    return (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 p-4 border-b border-zinc-800 bg-black">
                {RESUMEN_ESTADOS.map((estado) => {
                    const activo = estadoFiltro === estado.value;

                    return (
                        <button
                            key={estado.value}
                            type="button"
                            onClick={() =>
                                setEstadoFiltro(activo ? "TODOS" : estado.value)
                            }
                            className={`
                    rounded-2xl
                    border
                    p-4
                    text-left
                    transition
                    ${activo
                                    ? "border-white bg-white text-black"
                                    : "border-zinc-800 bg-zinc-950 text-white hover:border-zinc-600"
                                }
                `}
                        >
                            <p
                                className={`
                        text-2xl
                        font-black
                        ${activo
                                        ? "text-black"
                                        : "text-white"
                                    }
                    `}
                            >
                                {contarPorEstado(estado.value)}
                            </p>

                            <p
                                className={`
                        mt-1
                        text-xs
                        font-medium
                        ${activo
                                        ? "text-zinc-700"
                                        : "text-zinc-500"
                                    }
                    `}
                            >
                                {estado.label}
                            </p>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col md:flex-row gap-3 p-4 border-b border-zinc-800 bg-zinc-950">
                <div className="relative flex-1">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por pedido, cliente o correo..."
                        className="w-full rounded-xl border border-zinc-800 bg-black px-10 py-2.5 text-sm text-white outline-none focus:border-white"
                    />
                </div>

                <select
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                    className="rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-white"
                >
                    <option value="TODOS">Todos los estados</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="CONTACTED">Contactado</option>
                    <option value="PAYMENT_CONFIRMED">Pago confirmado</option>
                    <option value="PREPARING">Preparando</option>
                    <option value="SHIPPED">Enviado</option>
                    <option value="DELIVERED">Entregado</option>
                    <option value="CANCELLED">Cancelado</option>
                </select>
            </div>

            <table className="w-full">
                <thead className="border-b border-zinc-800 bg-zinc-950">
                    <tr className="text-left text-xs uppercase tracking-wider text-zinc-500">
                        <th className="px-6 py-4">Pedido</th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Artículos</th>
                        <th className="px-6 py-4">Fecha</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {pedidosFiltrados.map((pedido) => (
                        <tr
                            key={pedido.id}
                            className="border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors"
                        >
                            <td className="px-6 py-5 font-semibold text-white">
                                {pedido.orderNumber}
                            </td>

                            <td className="px-6 py-5">
                                <div>
                                    <p className="text-white">
                                        {pedido.user.name || "Sin nombre"}
                                    </p>

                                    <p className="text-xs text-zinc-500">
                                        {pedido.user.email}
                                    </p>
                                </div>
                            </td>

                            <td className="px-6 py-5 text-zinc-300">
                                {pedido.items.reduce(
                                    (total: number, item: any) => total + item.quantity,
                                    0
                                )}{" "}
                                piezas
                            </td>

                            <td className="px-6 py-5 text-zinc-400">
                                {new Date(pedido.createdAt).toLocaleDateString("es-MX")}
                            </td>

                            <td className="px-6 py-5 font-semibold text-white">
                                ${Number(pedido.total).toLocaleString("es-MX")}
                            </td>

                            <td className="px-6 py-5">
                                <OrderStatusBadge status={pedido.status} />
                            </td>

                            <td className="px-6 py-5">
                                <div className="flex items-center justify-end gap-3">

                                    <button
                                        onClick={() => setPedidoSeleccionado(pedido)}
                                        className="
                                            h-10
                                            w-10
                                            rounded-lg
                                            border
                                            border-zinc-700
                                            flex
                                            items-center
                                            justify-center
                                            text-zinc-400
                                            hover:bg-zinc-800
                                            hover:text-white
                                            transition
                                        "
                                    >
                                        <Eye size={18} />
                                    </button>

                                    <OrderStatusSelect
                                        orderId={pedido.id}
                                        estadoActual={pedido.status}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <OrderDetailsModal
                pedido={pedidoSeleccionado}
                open={!!pedidoSeleccionado}
                onClose={() => setPedidoSeleccionado(null)}
            />
        </div>
    );
}