import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Clock3, Package, X } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ESTADOS_LABEL: Record<
    string,
    {
        label: string;
        color: string;
        mensaje: string;
    }
> = {
    PENDING: {
        label: "Pendiente",
        color: "border-amber-500/30 bg-amber-500/10 text-amber-300",
        mensaje: "Recibimos correctamente tu pedido.",
    },
    CONTACTED: {
        label: "Contactado",
        color: "border-sky-500/30 bg-sky-500/10 text-sky-300",
        mensaje: "Nos comunicamos contigo para confirmar los detalles.",
    },
    PAYMENT_CONFIRMED: {
        label: "Pago confirmado",
        color:
            "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        mensaje: "El pago de tu pedido fue confirmado.",
    },
    PREPARING: {
        label: "Preparando",
        color: "border-orange-500/30 bg-orange-500/10 text-orange-300",
        mensaje: "Estamos preparando cuidadosamente tus productos.",
    },
    SHIPPED: {
        label: "Enviado",
        color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
        mensaje: "Tu pedido ya se encuentra en camino.",
    },
    DELIVERED: {
        label: "Entregado",
        color: "border-green-500/30 bg-green-500/10 text-green-300",
        mensaje: "Tu pedido fue entregado correctamente.",
    },
    CANCELLED: {
        label: "Cancelado",
        color: "border-red-500/30 bg-red-500/10 text-red-300",
        mensaje: "Este pedido fue cancelado.",
    },
};

const FLUJO_ESTADOS = [
    "PENDING",
    "CONTACTED",
    "PAYMENT_CONFIRMED",
    "PREPARING",
    "SHIPPED",
    "DELIVERED",
] as const;

function obtenerProgreso(status: string) {
    if (status === "CANCELLED") {
        return 0;
    }

    const indice = FLUJO_ESTADOS.indexOf(
        status as (typeof FLUJO_ESTADOS)[number]
    );

    if (indice < 0) {
        return 0;
    }

    return Math.round(
        ((indice + 1) / FLUJO_ESTADOS.length) * 100
    );
}

export default async function MisPedidosPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <main className="min-h-screen bg-black">
                <div className="mx-auto max-w-md px-4 py-24 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                        <Package size={27} className="text-zinc-400" />
                    </div>

                    <h1 className="mt-6 text-2xl font-bold text-white">
                        Inicia sesión para ver tus pedidos
                    </h1>

                    <p className="mt-3 text-zinc-500">
                        Consulta el estado y seguimiento de tus compras.
                    </p>

                    <Link
                        href="/login"
                        className="mt-7 inline-block rounded-2xl bg-white px-7 py-3.5 font-bold text-black transition hover:bg-zinc-200"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </main>
        );
    }

    const pedidos = await prisma.order.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            items: {
                include: {
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

    return (
        <main className="min-h-screen bg-black">
            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                <div className="mb-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                        Tu cuenta
                    </p>

                    <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                                Mis pedidos
                            </h1>

                            <p className="mt-3 text-zinc-500">
                                Consulta el estado, progreso y detalle de tus
                                compras.
                            </p>
                        </div>

                        {pedidos.length > 0 && (
                            <span className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400">
                                {pedidos.length}{" "}
                                {pedidos.length === 1
                                    ? "pedido"
                                    : "pedidos"}
                            </span>
                        )}
                    </div>
                </div>

                {pedidos.length === 0 ? (
                    <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] px-6 py-20 text-center shadow-[0_30px_80px_rgba(0,0,0,.3)]">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                            <Package
                                size={27}
                                className="text-zinc-500"
                            />
                        </div>

                        <h2 className="mt-6 text-2xl font-bold text-white">
                            Todavía no tienes pedidos
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-zinc-500">
                            Cuando realices una compra podrás consultar aquí
                            todos sus detalles y seguimiento.
                        </p>

                        <Link
                            href="/productos"
                            className="mt-7 inline-block rounded-2xl bg-white px-7 py-3.5 font-bold text-black transition hover:bg-zinc-200"
                        >
                            Explorar productos
                        </Link>
                    </section>
                ) : (
                    <div className="space-y-6">
                        {pedidos.map(
                            (pedido: typeof pedidos[number]) => {
                                const estado =
                                    ESTADOS_LABEL[pedido.status] ?? {
                                        label: pedido.status,
                                        color:
                                            "border-white/10 bg-white/5 text-zinc-300",
                                        mensaje:
                                            "Consulta el detalle de tu pedido.",
                                    };

                                const totalPiezas =
                                    pedido.items.reduce(
                                        (
                                            total: number,
                                            item: typeof pedido.items[number]
                                        ) => total + item.quantity,
                                        0
                                    );

                                const progreso = obtenerProgreso(
                                    pedido.status
                                );

                                const cancelado =
                                    pedido.status === "CANCELLED";

                                const entregado =
                                    pedido.status === "DELIVERED";

                                return (
                                    <article
                                        key={pedido.id}
                                        className="
                                            overflow-hidden
                                            rounded-3xl
                                            border
                                            border-white/10
                                            bg-[#0d0d0d]
                                            shadow-[0_25px_70px_rgba(0,0,0,.3)]
                                            transition-all
                                            duration-300
                                            hover:-translate-y-1
                                            hover:border-white/20
                                        "
                                    >
                                        <div className="p-5 sm:p-7">
                                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
                                                        Pedido
                                                    </p>

                                                    <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                                                        {pedido.orderNumber}
                                                    </h2>

                                                    <p className="mt-2 text-sm capitalize text-zinc-500">
                                                        {new Date(
                                                            pedido.createdAt
                                                        ).toLocaleDateString(
                                                            "es-MX",
                                                            {
                                                                day: "numeric",
                                                                month: "long",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`w-fit rounded-full border px-3.5 py-2 text-xs font-semibold ${estado.color}`}
                                                >
                                                    {estado.label}
                                                </span>
                                            </div>

                                            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cancelado
                                                                ? "bg-red-500/10 text-red-400"
                                                                : entregado
                                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                                    : "bg-white/5 text-zinc-300"
                                                            }`}
                                                    >
                                                        {cancelado ? (
                                                            <X size={16} />
                                                        ) : entregado ? (
                                                            <Check
                                                                size={16}
                                                                strokeWidth={
                                                                    3
                                                                }
                                                            />
                                                        ) : (
                                                            <Clock3
                                                                size={15}
                                                            />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-semibold text-white">
                                                            {estado.label}
                                                        </p>

                                                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                                                            {estado.mensaje}
                                                        </p>
                                                    </div>
                                                </div>

                                                {!cancelado && (
                                                    <div className="mt-5">
                                                        <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-600">
                                                            <span>
                                                                Progreso del
                                                                pedido
                                                            </span>

                                                            <span>
                                                                {progreso}%
                                                            </span>
                                                        </div>

                                                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                                            <div
                                                                className="h-full rounded-full bg-white transition-all duration-500"
                                                                style={{
                                                                    width: `${progreso}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-1">
                                                {pedido.items
                                                    .slice(0, 5)
                                                    .map(
                                                        (
                                                            item: typeof pedido.items[number]
                                                        ) => (
                                                            <div
                                                                key={
                                                                    item.id
                                                                }
                                                                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
                                                            >
                                                                {item
                                                                    .product
                                                                    ?.images?.[0]
                                                                    ?.url ? (
                                                                    <Image
                                                                        src={
                                                                            item
                                                                                .product
                                                                                .images[0]
                                                                                .url
                                                                        }
                                                                        alt={
                                                                            item
                                                                                .product
                                                                                .name
                                                                        }
                                                                        fill
                                                                        className="object-contain p-1.5"
                                                                        sizes="64px"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center px-1 text-center text-[9px] text-zinc-500">
                                                                        Sin
                                                                        imagen
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    )}

                                                {pedido.items.length > 5 && (
                                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-zinc-400">
                                                        +
                                                        {pedido.items.length -
                                                            5}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-5 border-t border-white/10 bg-black/20 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                                            <div className="flex gap-8">
                                                <div>
                                                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                                                        Artículos
                                                    </p>

                                                    <p className="mt-1 font-semibold text-white">
                                                        {totalPiezas}{" "}
                                                        {totalPiezas === 1
                                                            ? "pieza"
                                                            : "piezas"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs uppercase tracking-wider text-zinc-600">
                                                        Total
                                                    </p>

                                                    <p className="mt-1 text-xl font-black text-white">
                                                        $
                                                        {Number(
                                                            pedido.total
                                                        ).toLocaleString(
                                                            "es-MX"
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/cuenta/pedidos/${pedido.id}`}
                                                className="
                                                    inline-flex
                                                    items-center
                                                    justify-center
                                                    gap-2
                                                    rounded-xl
                                                    bg-white
                                                    px-5
                                                    py-3
                                                    text-sm
                                                    font-bold
                                                    text-black
                                                    transition-all
                                                    duration-300
                                                    hover:gap-3
                                                    hover:bg-zinc-200
                                                "
                                            >
                                                Ver detalle
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}