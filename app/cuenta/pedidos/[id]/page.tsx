import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    Check,
    Clock3,
    MapPin,
    PackageCheck,
    Phone,
    Truck,
    X,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

const PASOS_PEDIDO = [
    {
        status: "PENDING",
        label: "Pedido realizado",
        description: "Recibimos correctamente tu pedido.",
    },
    {
        status: "CONTACTED",
        label: "Cliente contactado",
        description: "Nos comunicamos contigo para confirmar los detalles.",
    },
    {
        status: "PAYMENT_CONFIRMED",
        label: "Pago confirmado",
        description: "El pago del pedido fue confirmado.",
    },
    {
        status: "PREPARING",
        label: "Preparando pedido",
        description: "Estamos preparando cuidadosamente tus productos.",
    },
    {
        status: "SHIPPED",
        label: "Pedido enviado",
        description: "Tu pedido ya se encuentra en camino.",
    },
    {
        status: "DELIVERED",
        label: "Pedido entregado",
        description: "Tu pedido fue entregado correctamente.",
    },
] as const;

const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pendiente",
    CONTACTED: "Contactado",
    PAYMENT_CONFIRMED: "Pago confirmado",
    PREPARING: "Preparando",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
};

const STATUS_STYLES: Record<string, string> = {
    PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    CONTACTED: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    PAYMENT_CONFIRMED:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    PREPARING: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    SHIPPED: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
    DELIVERED: "border-green-500/30 bg-green-500/10 text-green-300",
    CANCELLED: "border-red-500/30 bg-red-500/10 text-red-300",
};

function formatearFecha(fecha: Date | string) {
    return new Date(fecha).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "America/Mexico_City",
    });
}

function formatearHora(fecha: Date | string) {
    return new Date(fecha).toLocaleTimeString("es-MX", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Mexico_City",
    });
}

export default async function PedidoDetallePage({ params }: PageProps) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center">
                <h1 className="text-2xl font-bold text-white">
                    Inicia sesión para consultar tu pedido
                </h1>

                <p className="mt-3 text-zinc-500">
                    Necesitas acceder a tu cuenta para ver esta información.
                </p>

                <Link
                    href="/login"
                    className="mt-7 inline-block rounded-2xl bg-white px-7 py-3.5 font-bold text-black transition hover:bg-zinc-200"
                >
                    Iniciar sesión
                </Link>
            </div>
        );
    }

    const pedido = await prisma.order.findFirst({
        where: {
            id,
            userId: session.user.id,
        },
        include: {
            address: true,
            history: {
                orderBy: {
                    createdAt: "asc",
                },
            },
            items: {
                include: {
                    variant: true,
                    product: {
                        include: {
                            images: {
                                take: 1,
                                orderBy: {
                                    position: "asc",
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!pedido) {
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center">
                <h1 className="text-2xl font-bold text-white">
                    No encontramos este pedido
                </h1>

                <p className="mt-3 text-zinc-500">
                    Es posible que el pedido no exista o no pertenezca a tu cuenta.
                </p>

                <Link
                    href="/cuenta/pedidos"
                    className="mt-7 inline-block rounded-2xl bg-white px-7 py-3.5 font-bold text-black transition hover:bg-zinc-200"
                >
                    Volver a mis pedidos
                </Link>
            </div>
        );
    }

    const historial =
        pedido.history.length > 0
            ? pedido.history
            : [
                {
                    id: `inicial-${pedido.id}`,
                    orderId: pedido.id,
                    status: "PENDING" as const,
                    createdAt: pedido.createdAt,
                },
            ];

    const historialPorEstado = new Map(
        historial.map((registro) => [registro.status, registro])
    );

    const indiceEstadoActual = PASOS_PEDIDO.findIndex(
        (paso) => paso.status === pedido.status
    );

    const pedidoCancelado = pedido.status === "CANCELLED";
    const registroCancelado = historialPorEstado.get("CANCELLED");

    const totalPiezas = pedido.items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return (
        <main className="min-h-screen bg-black">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                <Link
                    href="/cuenta/pedidos"
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
                >
                    <ArrowLeft size={16} />
                    Volver a mis pedidos
                </Link>

                <div className="mt-8 flex flex-col gap-6 border-b border-white/10 pb-9 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                            Seguimiento del pedido
                        </p>

                        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                            {pedido.orderNumber}
                        </h1>

                        <p className="mt-3 text-zinc-500">
                            Pedido realizado el {formatearFecha(pedido.createdAt)}
                        </p>
                    </div>

                    <span
                        className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold ${STATUS_STYLES[pedido.status] ??
                            "border-white/10 bg-white/5 text-zinc-300"
                            }`}
                    >
                        {STATUS_LABELS[pedido.status] ?? pedido.status}
                    </span>
                </div>

                {pedido.status === "DELIVERED" && (
                    <div className="mt-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] p-6 sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black">
                                <Check size={23} strokeWidth={3} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Tu pedido fue entregado
                                </h2>

                                <p className="mt-2 leading-7 text-zinc-400">
                                    Muchas gracias por confiar en Los Boss. Esperamos
                                    verte nuevamente muy pronto.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {pedidoCancelado && (
                    <div className="mt-8 rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-6 sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                                <X size={23} strokeWidth={3} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Este pedido fue cancelado
                                </h2>

                                <p className="mt-2 leading-7 text-zinc-400">
                                    Comunícate con nosotros si necesitas más
                                    información sobre la cancelación.
                                </p>

                                {registroCancelado && (
                                    <p className="mt-3 text-sm text-red-300">
                                        {formatearFecha(registroCancelado.createdAt)} ·{" "}
                                        {formatearHora(registroCancelado.createdAt)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-8">
                        {/* Timeline */}
                        <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 shadow-[0_30px_80px_rgba(0,0,0,.3)] sm:p-8">
                            <div className="mb-8">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
                                    Progreso
                                </p>

                                <h2 className="mt-2 text-2xl font-bold text-white">
                                    Seguimiento
                                </h2>
                            </div>

                            <div>
                                {PASOS_PEDIDO.map((paso, index) => {
                                    const registro =
                                        historialPorEstado.get(paso.status);

                                    const completado =
                                        !pedidoCancelado &&
                                        indiceEstadoActual >= index;

                                    const esActual =
                                        !pedidoCancelado &&
                                        pedido.status === paso.status;

                                    const esUltimo =
                                        index === PASOS_PEDIDO.length - 1;

                                    return (
                                        <div
                                            key={paso.status}
                                            className="relative flex gap-5 pb-9 last:pb-0"
                                        >
                                            {!esUltimo && (
                                                <div
                                                    className={`absolute left-[17px] top-9 h-full w-px ${completado
                                                            ? "bg-white/40"
                                                            : "bg-white/10"
                                                        }`}
                                                />
                                            )}

                                            <div
                                                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${completado
                                                        ? esActual
                                                            ? "border-white bg-white text-black shadow-[0_0_24px_rgba(255,255,255,.3)]"
                                                            : "border-white/30 bg-zinc-800 text-white"
                                                        : "border-white/10 bg-black text-zinc-700"
                                                    }`}
                                            >
                                                {completado ? (
                                                    <Check size={17} strokeWidth={3} />
                                                ) : (
                                                    <Clock3 size={15} />
                                                )}
                                            </div>

                                            <div className="min-w-0 pt-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3
                                                        className={`font-semibold ${completado
                                                                ? "text-white"
                                                                : "text-zinc-600"
                                                            }`}
                                                    >
                                                        {paso.label}
                                                    </h3>

                                                    {esActual && (
                                                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
                                                            Estado actual
                                                        </span>
                                                    )}
                                                </div>

                                                <p
                                                    className={`mt-1 text-sm leading-6 ${completado
                                                            ? "text-zinc-500"
                                                            : "text-zinc-700"
                                                        }`}
                                                >
                                                    {paso.description}
                                                </p>

                                                {registro && (
                                                    <p className="mt-2 text-xs text-zinc-600">
                                                        {formatearFecha(
                                                            registro.createdAt
                                                        )}{" "}
                                                        ·{" "}
                                                        {formatearHora(
                                                            registro.createdAt
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {pedidoCancelado && (
                                    <div className="relative flex gap-5 pt-9">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
                                            <X size={17} strokeWidth={3} />
                                        </div>

                                        <div className="pt-1">
                                            <h3 className="font-semibold text-red-300">
                                                Pedido cancelado
                                            </h3>

                                            {registroCancelado && (
                                                <p className="mt-2 text-xs text-zinc-600">
                                                    {formatearFecha(
                                                        registroCancelado.createdAt
                                                    )}{" "}
                                                    ·{" "}
                                                    {formatearHora(
                                                        registroCancelado.createdAt
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Productos */}
                        <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 shadow-[0_30px_80px_rgba(0,0,0,.3)] sm:p-8">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
                                        Tu compra
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold text-white">
                                        Productos
                                    </h2>
                                </div>

                                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-500">
                                    {totalPiezas}{" "}
                                    {totalPiezas === 1 ? "pieza" : "piezas"}
                                </span>
                            </div>

                            <div className="mt-7 space-y-5">
                                {pedido.items.map((item) => {
                                    const imageUrl =
                                        item.product?.images[0]?.url;

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex gap-4 border-b border-white/10 pb-5 last:border-0 last:pb-0"
                                        >
                                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
                                                {imageUrl ? (
                                                    <Image
                                                        src={imageUrl}
                                                        alt={
                                                            item.product?.name ??
                                                            "Producto"
                                                        }
                                                        fill
                                                        className="object-contain p-2"
                                                        sizes="96px"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-white">
                                                    {item.product?.name ??
                                                        "Producto no disponible"}
                                                </p>

                                                {(item.variant?.color ||
                                                    item.variant?.size) && (
                                                        <p className="mt-1 text-sm text-zinc-500">
                                                            {[
                                                                item.variant.color,
                                                                item.variant.size,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(" / ")}
                                                        </p>
                                                    )}

                                                <div className="mt-4 flex items-end justify-between gap-4">
                                                    <p className="text-sm text-zinc-500">
                                                        $
                                                        {Number(
                                                            item.price
                                                        ).toLocaleString(
                                                            "es-MX"
                                                        )}{" "}
                                                        × {item.quantity}
                                                    </p>

                                                    <p className="font-bold text-white">
                                                        $
                                                        {(
                                                            Number(item.price) *
                                                            item.quantity
                                                        ).toLocaleString(
                                                            "es-MX"
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6 lg:sticky lg:top-28">
                        {/* Total */}
                        <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 shadow-[0_30px_80px_rgba(0,0,0,.3)]">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
                                Resumen
                            </p>

                            <div className="mt-5 flex justify-between text-sm text-zinc-500">
                                <span>Productos</span>
                                <span>{totalPiezas}</span>
                            </div>

                            <div className="mt-3 flex justify-between gap-4 text-sm text-zinc-500">
                                <span>Entrega</span>
                                <span className="text-right">
                                    Coordinada con el cliente
                                </span>
                            </div>

                            <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
                                <span className="font-semibold text-white">
                                    Total
                                </span>

                                <span className="text-3xl font-black tracking-tight text-white">
                                    $
                                    {Number(pedido.total).toLocaleString(
                                        "es-MX"
                                    )}
                                </span>
                            </div>
                        </section>

                        {/* Dirección */}
                        <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 shadow-[0_30px_80px_rgba(0,0,0,.3)]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                                    <MapPin size={18} />
                                </div>

                                <h2 className="font-bold text-white">
                                    Dirección de entrega
                                </h2>
                            </div>

                            <div className="mt-5 space-y-2 text-sm leading-6">
                                <p className="font-semibold text-white">
                                    {pedido.address.fullName}
                                </p>

                                <p className="text-zinc-500">
                                    {pedido.address.street}
                                </p>

                                <p className="text-zinc-500">
                                    {pedido.address.city},{" "}
                                    {pedido.address.state}
                                </p>

                                <p className="text-zinc-500">
                                    C.P. {pedido.address.postalCode},{" "}
                                    {pedido.address.country}
                                </p>

                                <div className="flex items-center gap-2 pt-2 text-zinc-400">
                                    <Phone size={15} />
                                    {pedido.address.phone}
                                </div>
                            </div>
                        </section>

                        <Link
                            href="/productos"
                            className="block rounded-2xl bg-white py-4 text-center font-bold text-black transition hover:bg-zinc-200"
                        >
                            Seguir comprando
                        </Link>
                    </aside>
                </div>
            </div>
        </main>
    );
}