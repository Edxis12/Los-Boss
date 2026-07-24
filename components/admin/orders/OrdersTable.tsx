"use client";

import { useState } from "react";
import OrderDetailsModal from "./OrderDetailsModal";
import OrderStatusBadge from "./OrderStatusBadge";
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

            <div className="grid grid-cols-2 gap-3 p-4 border-b border-zinc-800 bg-black min-[500px]:grid-cols-3 xl:grid-cols-6">
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

            <div className="flex flex-col gap-3 border-b border-zinc-800 bg-zinc-950 p-4 lg:flex-row">
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
                    className="h-11 w-full rounded-xl border border-zinc-800 bg-black px-4 text-sm text-white outline-none focus:border-white lg:w-64"
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

            <div className="divide-y divide-zinc-800">
                {pedidosFiltrados.length === 0 ? (
                    <section
                        className="
rounded-3xl
border
border-white/10
bg-[#0d0d0d]
px-5
py-14
text-center
"
                    >

                        <h2>
                            No encontramos pedidos
                        </h2>

                        <p>
                            Prueba con otra búsqueda o
                            cambia el filtro aplicado.
                        </p>

                    </section>
                ) : (
                    pedidosFiltrados.map((pedido) => {
                        const totalArticulos = pedido.items.reduce(
                            (total: number, item: any) => total + item.quantity,
                            0
                        );

                        return (

                            <div
                                key={pedido.id}
                                className="grid gap-4 p-5 transition hover:bg-zinc-800/40 sm:p-6 lg:grid-cols-[minmax(0,1fr)minmax(0,1.4fr)minmax(0,.8fr)minmax(0,1fr)auto]"
                            >
                                <div>
                                    <p className="text-xs text-zinc-500">Pedido</p>
                                    <p className="font-semibold text-white">{pedido.orderNumber}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-zinc-500">Cliente</p>
                                    <p className="truncate text-white">{pedido.user.name || "Sin nombre"}</p>
                                    <p className="truncate text-xs text-zinc-500">{pedido.user.email}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-zinc-500">Artículos</p>
                                    <p className="text-zinc-300">{totalArticulos} piezas</p>
                                </div>

                                <div>
                                    <p className="text-xs text-zinc-500">Fecha</p>
                                    <p className="text-zinc-400">
                                        {new Date(pedido.createdAt).toLocaleDateString("es-MX")}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-zinc-500">Estado</p>
                                    <div className="mt-1">
                                        <OrderStatusBadge status={pedido.status} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 lg:justify-end">
                                    <div className="lg:hidden">
                                        <p className="text-xs text-zinc-500">Total</p>
                                        <p className="font-semibold text-white">
                                            ${Number(pedido.total).toLocaleString("es-MX")}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setPedidoSeleccionado(pedido)}
                                        className="
                                            flex    
                                            h-11
                                            w-11
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                            border-zinc-700
                                            text-zinc-400
                                            transition
                                            hover:bg-zinc-800
                                            hover:text-white
                                        "
                                    >
                                        <Eye size={18} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 lg:hidden">
                                    <p className="text-xs text-zinc-500">Total</p>
                                    <p className="font-semibold text-white">
                                        ${Number(pedido.total).toLocaleString("es-MX")}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <OrderDetailsModal
                pedido={pedidoSeleccionado}
                open={!!pedidoSeleccionado}
                onClose={() => setPedidoSeleccionado(null)}
            />
        </div>
    );
}