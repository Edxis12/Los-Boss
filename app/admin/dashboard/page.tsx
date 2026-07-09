import { prisma } from "@/lib/prisma";
import { Package, ShoppingCart, Users, AlertTriangle, BadgePercent, Heart, DollarSign } from "lucide-react";

export default async function AdminDashboardPage() {
    const [
        totalProductos,
        productosActivos,
        productosOferta,
        totalPedidos,
        totalUsuarios,
        totalFavoritos,
        ventas,
        productosBajoStock,
        pedidosRecientes,
    ] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({ where: { comparePrice: { not: null } } }),
        prisma.order.count(),
        prisma.user.count(),
        prisma.favorite.count(),

        prisma.order.aggregate({
            _sum: { total: true },
        }),

        prisma.productVariant.findMany({
            where: { stock: { lte: 3 } },
            take: 5,
            orderBy: { stock: "asc" },
            include: {
                product: {
                    include: {
                        images: { orderBy: { position: "asc" }, take: 1 },
                    },
                },
            },
        }),

        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                user: true,
                items: true,
            },
        }),
    ]);

    const totalVentas = Number(ventas._sum.total ?? 0);

    const stats = [
        {
            label: "Productos",
            value: totalProductos,
            detail: `${productosActivos} activos`,
            icon: Package,
        },
        {
            label: "Pedidos",
            value: totalPedidos,
            detail: "Pedidos totales",
            icon: ShoppingCart,
        },
        {
            label: "Usuarios",
            value: totalUsuarios,
            detail: "Clientes registrados",
            icon: Users,
        },
        {
            label: "Ventas",
            value: `${totalVentas.toLocaleString("es-MX")}`,
            detail: "Ventas acumuladas",
            icon: DollarSign,
        },
        {
            label: "En oferta",
            value: productosOferta,
            detail: "Productos con descuento",
            icon: BadgePercent,
        },
        {
            label: "Favoritos",
            value: totalFavoritos,
            detail: "Productos guardados",
            icon: Heart,
        },
        {
            label: "Stock bajo",
            value: productosBajoStock.length,
            detail: "Variantes con 3 o menos",
            icon: AlertTriangle,
            alerta: productosBajoStock.length > 0,
        },
    ];

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-white">
                    Dashboard
                </h1>
                <p className="text-zinc-500 text-sm mt-1">
                    Resumen general de Los Boss
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.label}
                            className={`rounded-2xl border bg-zinc-950 p-5 ${stat.alerta
                                    ? "border-amber-500/40"
                                    : "border-zinc-800"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div
                                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.alerta
                                            ? "bg-amber-500/10 text-amber-400"
                                            : "bg-white/5 text-zinc-300"
                                        }`}
                                >
                                    <Icon size={20} />
                                </div>
                            </div>

                            <p className="text-3xl font-black text-white">
                                {stat.value}
                            </p>
                            <p className="text-sm text-zinc-400 mt-1">
                                {stat.label}
                            </p>
                            <p className="text-xs text-zinc-600 mt-2">
                                {stat.detail}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                Productos con poco stock
                            </h2>
                            <p className="text-sm text-zinc-500">
                                Variantes con 3 piezas o menos
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {productosBajoStock.length === 0 ? (
                            <p className="text-sm text-zinc-500">
                                No hay productos con poco stock.
                            </p>
                        ) : (
                            productosBajoStock.map((variant: {
                                id: string;
                                stock: number;
                                size: string | null;
                                color: string | null;
                                product: {
                                    name: string;
                                };
                            }) => (
                                <div
                                    key={variant.id}
                                    className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {variant.product.name}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {[variant.color, variant.size]
                                                .filter(Boolean)
                                                .join(" / ") || "General"}
                                        </p>
                                    </div>

                                    <span className="text-sm font-bold text-amber-400">
                                        {variant.stock}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                Pedidos recientes
                            </h2>
                            <p className="text-sm text-zinc-500">
                                Últimos pedidos registrados
                            </p>
                        </div>
                    </div>

                    <div>
                        {pedidosRecientes.length === 0 ? (
                            <p className="text-sm text-zinc-950">
                                Todavía no hay pedidos.
                            </p>
                        ) : (
                            pedidosRecientes.map((pedido) => (
                                <div
                                    key={pedido.id}
                                    className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-0"
                                >
                                    <div>
                                        <p className="text-xs text-zinc-500">
                                            #{pedido.orderNumber}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {pedido.user.name ??
                                                pedido.user.email ??
                                                "cliente"}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">
                                            ${Number(pedido.total).toLocaleString("es-MX")}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            {pedido.status}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}