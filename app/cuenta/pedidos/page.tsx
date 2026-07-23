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
                <div className="mx-auto flex min-h-[65vh] max-w-lg items-center px-4 py-14 text-center sm:px-6 sm:py-20">
                    <div className="w-full rounded-3xl border border-white/10 bg-[#0d0d0d] px-5 py-10 shadow-[0_25px_80px_rgba(0,0,0,.35)] sm:px-8 sm:py-14">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                            <Package size={27} className="text-zinc-400" />
                        </div>

                        <h1 className="mt-6 text-2xl font-black tracking-tight text-white min-[430px]:text-3xl sm:text-4xl">
                            Inicia sesión para ver tus pedidos
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500 sm:text-base">
                            Consulta el estado y seguimiento de tus compras.
                        </p>

                        <Link
                            href="/login"
                            className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:w-auto"
                        >
                            Iniciar sesión
                        </Link>
                    </div>
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
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                <div className="mb-8 sm:mb-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                        Tu cuenta
                    </p>

                    <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-white min-[430px]:text-4xl sm:text-5xl">
                                Mis pedidos
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
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
                    <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] px-5 py-14 text-center shadow-[0_30px_80px_rgba(0,0,0,.3)] sm:px-8 sm:py-20">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                            <Package
                                size={27}
                                className="text-zinc-500"
                            />
                        </div>

                        <h2 className="mt-6 text-2xl font-black tracking-tight text-white min-[430px]:text-3xl">
                            Todavía no tienes pedidos
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500 sm:text-base">
                            Cuando realices una compra podrás consultar aquí
                            todos sus detalles y seguimiento.
                        </p>

                        <Link
                            href="/productos"
                            className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:w-auto"
                        >
                            Explorar productos
                        </Link>
                    </section>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
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
                                        <div className="p-4 min-[430:p-5] sm:p-7 sm:p-7">
                                            <div className="flex flex-col gap-4 min-[430px]:flex-row min-[430px]:items-start min-[430px]:justify-between sm:gap-5">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600">
                                                        Pedido
                                                    </p>

                                                    <h2 className="mt-2 break-words text-xl font-black tracking-tight text-white min-[430px]:text-2xl">
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

                                            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 sm:mt-6">
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

                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-white">
                                                            {estado.label}
                                                        </p>

                                                        <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm sm:leading-6">
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

                                            <div className="mt-5 flex items-center gap-2.5 overflow-x-auto pb-1 sm:mt-6 sm:gap-3">
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
                                                                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 min-[430px]:h-16 min-[430px]:w-16"
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
                                                                        sizes="(max-width: 429px) 56px, 64px"
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
                                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-xs font-semibold text-zinc-400 min-[430px]:h-16 min-[430px]:w-16 min-[430px]:text-sm">
                                                        +
                                                        {pedido.items.length -
                                                            5}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-5 border-t border-white/10 bg-black/20 px-4 py-5 min-[430px]:px-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                                            <div className="flex flex-wrap gap-x-8 gap-y-4">
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

                                                    <p className="mt-1 break-all text-lg font-black text-white min-[430px]:text-xl">
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
                                                    min-h-12
                                                    w-full
                                                    items-center
                                                    justify-center
                                                    gap-2
                                                    rounded-xl
                                                    bg-white
                                                    px-5
                                                    text-sm
                                                    font-bold
                                                    text-black
                                                    transition-all
                                                    duration-300
                                                    hover:gap-3
                                                    hover:bg-zinc-200
                                                    sm:w-auto
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