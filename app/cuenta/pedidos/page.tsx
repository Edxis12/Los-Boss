import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ESTADOS_LABEL: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pendiente", color: "bg-amber-500/10 text-amber-400" },
    PAID: { label: "Pagado", color: "bg-blue-500/10 text-blue-400" },
    PROCESSING: { label: "En proceso", color: "bg-blue-500/10 text-blue-400" },
    SHIPPED: { label: "Enviado", color: "bg-purple-500/10 text-purple-400" },
    DELIVERED: { label: "Entregado", color: "bg-green-500/10 text-green-400" },
    CANCELLED: { label: "Cancelado", color: "bg-red-500/10 text-red-400" },
};

export default async function MisPedidosPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="max-w-md mx-auto px-4 py-24 text-center">
                <h1 className="text-2x1 font-bold text-white mb-2">
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
        <div className="max-w-4x1 mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2x1 font-bold text-white mb-8">Mis pedidos</h1>

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
                    {pedidos.map((pedido) => {
                        const estado = ESTADOS_LABEL[pedido.status];
                        return (
                            <div
                                key={pedido.id}
                                className="bg-zinc-900 rounded-xl p-5 border border-zinc-800"
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
                                    {pedido.items.slice(0, 5).map((item) => (
                                        <div
                                            key={item.id}
                                            className="relative w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden shrink-0"
                                        >
                                            {item.product.images[0]?.url && (
                                                <Image
                                                    src={item.product.images[0].url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                />
                                            )}
                                        </div>
                                    ))}
                                    {pedido.items.length > 5 && (
                                        <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-400">
                                            +{pedido.items.length - 5}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                                    <p className="text-sm text-zinc-400">
                                        {pedido.items.length}{" "}
                                        {pedido.items.length === 1 ? "producto" : "productos"}
                                    </p>
                                    <p className="text-white font-semibold">
                                        ${Number(pedido.total).toLocaleString("es-MX")}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}