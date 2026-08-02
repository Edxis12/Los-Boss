"use client";

import {
    useEffect,
    useState,
} from "react";
import {
    useRouter,
    useSearchParams,
} from "next/navigation";

import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Search,
    X,
} from "lucide-react";

import OrderDetailsModal from "./OrderDetailsModal";
import OrderStatusBadge from "./OrderStatusBadge";

type EstadoPedido =
    | "PENDING"
    | "CONTACTED"
    | "PAYMENT_CONFIRMED"
    | "PREPARING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";

type EstadoFiltro =
    | EstadoPedido
    | "TODOS";

type Props = {
    // Se conserva temporalmente porque el modal
    // utiliza la estructura completa del pedido.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pedidos: any[];

    totalesPorEstado: Record<
        EstadoPedido,
        number
    >;

    busquedaActual: string;
    estadoActual: EstadoFiltro;
    paginaActual: number;
    totalPaginas: number;
    totalResultados: number;
};

const RESUMEN_ESTADOS: Array<{
    label: string;
    value: EstadoPedido;
}> = [
        {
            label: "Pendientes",
            value: "PENDING",
        },
        {
            label: "Contactados",
            value: "CONTACTED",
        },
        {
            label: "Confirmados",
            value: "PAYMENT_CONFIRMED",
        },
        {
            label: "Preparando",
            value: "PREPARING",
        },
        {
            label: "Enviados",
            value: "SHIPPED",
        },
        {
            label: "Entregados",
            value: "DELIVERED",
        },
    ];

export default function OrdersTable({
    pedidos,
    totalesPorEstado,
    busquedaActual,
    estadoActual,
    paginaActual,
    totalPaginas,
    totalResultados,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [
        pedidoSeleccionado,
        setPedidoSeleccionado,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] = useState<any>(null);

    const [busqueda, setBusqueda] =
        useState(busquedaActual);

    useEffect(() => {
        setBusqueda(busquedaActual);
    }, [busquedaActual]);

    function navegar(
        cambios: Record<
            string,
            string | undefined
        >
    ) {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        Object.entries(cambios).forEach(
            ([nombre, valor]) => {
                if (valor) {
                    params.set(nombre, valor);
                } else {
                    params.delete(nombre);
                }
            }
        );

        const query = params.toString();

        router.push(
            query
                ? `/admin/pedidos?${query}`
                : "/admin/pedidos"
        );
    }

    function aplicarBusqueda(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        navegar({
            search:
                busqueda.trim() || undefined,
            page: undefined,
        });
    }

    function limpiarBusqueda() {
        setBusqueda("");

        navegar({
            search: undefined,
            page: undefined,
        });
    }

    function cambiarEstado(
        estado: EstadoFiltro
    ) {
        const siguienteEstado =
            estadoActual === estado
                ? "TODOS"
                : estado;

        navegar({
            status:
                siguienteEstado === "TODOS"
                    ? undefined
                    : siguienteEstado,
            page: undefined,
        });
    }

    function cambiarPagina(
        nuevaPagina: number
    ) {
        if (
            nuevaPagina < 1 ||
            nuevaPagina > totalPaginas ||
            nuevaPagina === paginaActual
        ) {
            return;
        }

        navegar({
            page: String(nuevaPagina),
        });
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            {/* Resumen por estado */}
            <div className="grid grid-cols-2 gap-3 border-b border-zinc-800 bg-black p-4 min-[500px]:grid-cols-3 xl:grid-cols-6">
                {RESUMEN_ESTADOS.map((estado) => {
                    const activo =
                        estadoActual === estado.value;

                    return (
                        <button
                            key={estado.value}
                            type="button"
                            onClick={() =>
                                cambiarEstado(estado.value)
                            }
                            className={`
                rounded-2xl
                border
                p-3
                text-left
                transition
                sm:p-4
                ${activo
                                    ? "border-white bg-white text-black"
                                    : "border-zinc-800 bg-zinc-950 text-white hover:border-zinc-600"
                                }
              `}
                        >
                            <p
                                className={`
                  text-xl
                  font-black
                  sm:text-2xl
                  ${activo
                                        ? "text-black"
                                        : "text-white"
                                    }
                `}
                            >
                                {totalesPorEstado[
                                    estado.value
                                ]}
                            </p>

                            <p
                                className={`
                  mt-1
                  text-[11px]
                  font-medium
                  sm:text-xs
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

            {/* Búsqueda y filtro */}
            <div className="flex flex-col gap-3 border-b border-zinc-800 bg-zinc-950 p-4 lg:flex-row">
                <form
                    onSubmit={aplicarBusqueda}
                    className="flex min-w-0 flex-1 gap-2"
                >
                    <div className="relative min-w-0 flex-1">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                            value={busqueda}
                            onChange={(event) =>
                                setBusqueda(
                                    event.target.value
                                )
                            }
                            placeholder="Buscar por pedido, cliente o correo..."
                            className="h-11 w-full rounded-xl border border-zinc-800 bg-black pl-10 pr-10 text-sm text-white outline-none transition focus:border-white"
                        />

                        {busqueda && (
                            <button
                                type="button"
                                onClick={limpiarBusqueda}
                                aria-label="Limpiar búsqueda"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="h-11 shrink-0 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
                    >
                        Buscar
                    </button>
                </form>

                <select
                    value={estadoActual}
                    onChange={(event) =>
                        cambiarEstado(
                            event.target
                                .value as EstadoFiltro
                        )
                    }
                    className="h-11 w-full rounded-xl border border-zinc-800 bg-black px-4 text-sm text-white outline-none transition focus:border-white lg:w-64"
                >
                    <option value="TODOS">
                        Todos los estados
                    </option>
                    <option value="PENDING">
                        Pendiente
                    </option>
                    <option value="CONTACTED">
                        Contactado
                    </option>
                    <option value="PAYMENT_CONFIRMED">
                        Pago confirmado
                    </option>
                    <option value="PREPARING">
                        Preparando
                    </option>
                    <option value="SHIPPED">
                        Enviado
                    </option>
                    <option value="DELIVERED">
                        Entregado
                    </option>
                    <option value="CANCELLED">
                        Cancelado
                    </option>
                </select>
            </div>

            {/* Pedidos */}
            <div className="divide-y divide-zinc-800">
                {pedidos.length === 0 ? (
                    <section className="bg-[#0d0d0d] px-5 py-14 text-center">
                        <h2 className="text-xl font-bold text-white">
                            No encontramos pedidos
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                            Prueba con otra búsqueda o cambia
                            el filtro aplicado.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setBusqueda("");

                                navegar({
                                    search: undefined,
                                    status: undefined,
                                    page: undefined,
                                });
                            }}
                            className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                        >
                            Limpiar filtros
                        </button>
                    </section>
                ) : (
                    pedidos.map((pedido) => {
                        const totalArticulos =
                            pedido.items.reduce(
                                (
                                    total: number,
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    item: any
                                ) =>
                                    total + item.quantity,
                                0
                            );

                        return (
                            <div
                                key={pedido.id}
                                className="grid gap-4 p-4 transition hover:bg-zinc-800/40 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,.8fr)_minmax(0,1fr)_auto_auto] lg:items-center"
                            >
                                <div className="min-w-0">
                                    <p className="text-xs text-zinc-500">
                                        Pedido
                                    </p>

                                    <p className="truncate font-semibold text-white">
                                        {pedido.orderNumber}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-zinc-500">
                                        Cliente
                                    </p>

                                    <p className="truncate text-white">
                                        {pedido.user.name ||
                                            "Sin nombre"}
                                    </p>

                                    <p className="truncate text-xs text-zinc-500">
                                        {pedido.user.email}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-zinc-500">
                                        Artículos
                                    </p>

                                    <p className="text-zinc-300">
                                        {totalArticulos}{" "}
                                        {totalArticulos === 1
                                            ? "pieza"
                                            : "piezas"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-zinc-500">
                                        Fecha
                                    </p>

                                    <p className="text-zinc-400">
                                        {new Date(
                                            pedido.createdAt
                                        ).toLocaleDateString(
                                            "es-MX"
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-zinc-500">
                                        Estado
                                    </p>

                                    <div className="mt-1">
                                        <OrderStatusBadge
                                            status={pedido.status}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 lg:block lg:border-0 lg:pt-0 lg:text-right">
                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            Total
                                        </p>

                                        <p className="font-semibold text-white">
                                            $
                                            {Number(
                                                pedido.total
                                            ).toLocaleString(
                                                "es-MX"
                                            )}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPedidoSeleccionado(
                                                pedido
                                            )
                                        }
                                        aria-label={`Ver pedido ${pedido.orderNumber}`}
                                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 text-zinc-400 transition hover:bg-zinc-800 hover:text-white lg:mt-2 lg:ml-auto"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Paginación */}
            {totalResultados > 0 && (
                <div className="flex flex-col gap-4 border-t border-zinc-800 bg-black/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-center text-xs text-zinc-500 sm:text-left sm:text-sm">
                        Página {paginaActual} de{" "}
                        {totalPaginas} ·{" "}
                        {totalResultados}{" "}
                        {totalResultados === 1
                            ? "resultado"
                            : "resultados"}
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:flex">
                        <button
                            type="button"
                            onClick={() =>
                                cambiarPagina(
                                    paginaActual - 1
                                )
                            }
                            disabled={paginaActual <= 1}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={16} />
                            Anterior
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                cambiarPagina(
                                    paginaActual + 1
                                )
                            }
                            disabled={
                                paginaActual >= totalPaginas
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Siguiente
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            <OrderDetailsModal
                pedido={pedidoSeleccionado}
                open={Boolean(
                    pedidoSeleccionado
                )}
                onClose={() =>
                    setPedidoSeleccionado(null)
                }
            />
        </div>
    );
}