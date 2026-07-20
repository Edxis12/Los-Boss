import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ESTADOS_LABEL: Record<string, { label: string; color: string }> = {
    PENDING: {
        label: "Pendiente",
        color: "bg-amber-500/10 text-amber-400",
    },
    CONTACTED: {
        label: "Contactado",
        color: "bg-sky-500/10 text-sky-400",
    },
    PAYMENT_CONFIRMED: {
        label: "Pago confirmado",
        color: "bg-emerald-500/10 text-emerald-400",
    },
    PREPARING: {
        label: "Preparando",
        color: "bg-orange-500/10 text-orange-400",
    },
    SHIPPED: {
        label: "Enviado",
        color: "bg-indigo-500/10 text-indigo-400",
    },
    DELIVERED: {
        label: "Entregado",
        color: "bg-green-500/10 text-green-400",
    },
    CANCELLED: {
        label: "Cancelado",
        color: "bg-red-500/10 text-red-400",
    },
};

export default async function MisPedidosPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="max-w-md mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Inicia sesión para ver tus pedidos
                </h1>
                <Link
                    href="/login"
                    className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition mt-4"
                >
                    Iniciar sesión
                </Link>
            </div>
        );
    }

    const pedidos = await prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            items: {
                include: {
                    product: {
                        include: { images: { take: 1, orderBy: { position: "asc" } } },
                    },
                },
            },
        },
    });

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-10">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                    Tu cuenta
                </p>

                <h1 className="mt-2 text-4xl font-black tracking-tight text-white">
                    Mis pedidos
                </h1>


                <p className="mt-2 text-zinc-500">
                    Consulta el estado y resumen de tus compras.
                </p>
            </div>

            {pedidos.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-zinc-400 mb-6">Todavía no tienes pedidos</p>
                    <Link
                        href="/productos"
                        className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition"
                    >
                        Ver productos
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {pedidos.map((pedido: typeof pedidos[number]) => {
                        const estado = ESTADOS_LABEL[pedido.status] ?? {
                            label: pedido.status,
                            color: "bg-zinc-700/40 text-zinc-400"
                        };
                        return (
                            <div
                                key={pedido.id}
                                className="
                                    rounded-3xl
                                    border
                                    border-white/10
                                    bg-[#0d0d0d]
                                    p-5
                                    shadow-[0_20px_60px_rgba(0,0,0,.25)]
                                    transition
                                    hover:border-white/20
                                    sm:p-6
                                "
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-white font-semibold">
                                            {pedido.orderNumber}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {new Date(pedido.createdAt).toLocaleDateString("es-MX", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs px-2.5 py-1 rounded-full ${estado.color}`}
                                    >
                                        {estado.label}
                                    </span>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    {pedido.items.slice(0, 5).map((item: typeof pedido.items[number]) => (
                                        <div
                                            key={item.id}
                                            className="relative w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden shrink-0"
                                        >
                                            {item.product?.images?.[0]?.url ? (
                                                <Image
                                                    src={item.product.images[0].url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[9px] text-zinc-600">
                                                    Sin imagen
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {pedido.items.length > 5 && (
                                        <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-400">
                                            +{pedido.items.length - 5}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-zinc-400">
                                            {pedido.items.reduce(
                                                (
                                                    total: number,
                                                    item: typeof pedido.items[number]
                                                ) => total + item.quantity,
                                                0
                                            )}{" "}
                                            piezas
                                        </p>

                                        <p className="mt-1 text-xl font-black text-white">
                                            ${Number(pedido.total).toLocaleString("es-MX")}
                                        </p>
                                    </div>

                                    <Link
                                        href={`/cuenta/pedidos/${pedido.id}`}
                                        className="rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-black transition hover:bg-zinc-200"
                                    >
                                        Ver detalle
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}