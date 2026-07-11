import { prisma } from "@/lib/prisma";
import { Package, ShoppingCart, Users, AlertTriangle, BadgePercent, Heart, DollarSign } from "lucide-react";
import SalesChart, { type SalesChartPoint } from "@/components/admin/dashboard/SalesChart";

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
        productosMasVendidos
    ] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({ where: { comparePrice: { not: null } } }),
        prisma.order.count({
            where: {
                status: {
                    not: "CANCELLED",
                },
            },
        }),
        prisma.user.count(),
        prisma.favorite.count(),

        prisma.order.aggregate({
            where: {
                status: { not: "CANCELLED" }
            },
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

        prisma.orderItem.groupBy({
            by: ["productId"],
            where: {
                productId: {
                    not: null,
                },
                order: {
                    status: {
                        not: "CANCELLED",
                    },
                },
            },
            _sum: {
                quantity: true,
            },
            orderBy: {
                _sum: {
                    quantity: "desc",
                },
            },
            take: 5,
        }),
    ]);

    const idsProductosMasVendidos = productosMasVendidos
        .map((item) => item.productId)
        .filter((id): id is string => id !== null);

    const productosVendidos = await prisma.product.findMany({
        where: {
            id: {
                in: idsProductosMasVendidos,
            },
        },
        include: {
            images: {
                orderBy: {
                    position: "asc",
                },
                take: 1,
            },
        },
    });

    const rankingProductos = productosMasVendidos.map(
        (venta: typeof productosMasVendidos[number], index: number) => {
            const producto = productosVendidos.find(
                (p: typeof productosVendidos[number]) => 
                    p.id === venta.productId
        );

        return {
            id: producto?.id ?? `producto-eliminado-${index}`,
            nombre: producto?.name ?? "Producto eliminado",
            imagen: producto?.images[0]?.url ?? null,
            vendidos: venta._sum.quantity ?? 0,
            posicion: index + 1,
        };
    });

    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);

    const haceSeisDias = new Date(hoy);
    haceSeisDias.setDate(hoy.getDate() - 6);
    haceSeisDias.setHours(0, 0, 0, 0);

    const pedidosUltimosSieteDias = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: haceSeisDias,
                lte: hoy,
            },
            status: {
                not: "CANCELLED",
            },
        },
        select: {
            total: true,
            createdAt: true,
        },
    });

    const ventasPorDia: SalesChartPoint[] = Array.from(
        { length: 7 },
        (_, index) => {
            const fecha = new Date(haceSeisDias);
            fecha.setDate(haceSeisDias.getDate() + index);

            const inicioDia = new Date(fecha);
            inicioDia.setHours(0, 0, 0, 0);

            const finDia = new Date(fecha);
            finDia.setHours(23, 59, 59, 999);

            const total = pedidosUltimosSieteDias
                .filter(
                    (
                        pedido: typeof pedidosUltimosSieteDias[number]
                    ) =>
                        pedido.createdAt >= inicioDia &&
                        pedido.createdAt <= finDia
                )
                .reduce(
                    (
                        acumulado: number,
                        pedido: typeof pedidosUltimosSieteDias[number]
                    ) => acumulado + Number(pedido.total),
                    0
                );

            return {
                date: fecha.toLocaleDateString("es-MX", {
                    weekday: "short",
                }),
                total,
            };
        }
    );

    const totalVentas = Number(ventas._sum.total ?? 0);

    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);

    const inicioMes = new Date(
        inicioHoy.getFullYear(),
        inicioHoy.getMonth(),
        1
    );

    const [
        ventasHoy,
        ventasMes,
        pedidosPendientes,
    ] = await Promise.all([
        prisma.order.aggregate({
            where: {
                createdAt: {
                    gte: inicioHoy,
                },
                status: {
                    not: "CANCELLED",
                },
            },
            _sum: {
                total: true,
            },
        }),

        prisma.order.aggregate({
            where: {
                createdAt: {
                    gte: inicioMes,
                },
                status: {
                    not: "CANCELLED",
                },
            },
            _sum: {
                total: true,
            },
        }),

        prisma.order.count({
            where: {
                status: "PENDING",
            },
        }),
    ]);

    const totalVentasHoy = Number(
        ventasHoy._sum.total ?? 0
    );

    const totalVentasMes = Number(
        ventasMes._sum.total ?? 0
    );

    const ticketPromedio =
        totalPedidos > 0
            ? totalVentas / totalPedidos
            : 0;

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
            value: `$${totalVentas.toLocaleString("es-MX")}`,
            detail: "Ventas acumuladas",
            icon: DollarSign,
        },
        {
            label: "Ventas hoy",
            value: `$${totalVentasHoy.toLocaleString("es-MX")}`,
            detail: "Ingresos del día",
            icon: DollarSign,
        },
        {
            label: "Ventas del mes",
            value: `$${totalVentasMes.toLocaleString("es-MX")}`,
            detail: "Ingresos del mes",
            icon: DollarSign,
        },
        {
            label: "Ticket promedio",
            value: `$${ticketPromedio.toLocaleString("es-MX")}`,
            detail: "Promedio por pedido",
            icon: ShoppingCart,
        },
        {
            label: "Pendientes",
            value: pedidosPendientes,
            detail: "Pedidos por atender",
            icon: AlertTriangle,
            alerta: pedidosPendientes > 0,
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

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-white">
                        Ventas de los últimos 7 días
                    </h2>
                    <p className="text-sm text-zinc-500">
                        Total de pedidos registrados, excepto cancelados
                    </p>
                </div>

                <SalesChart data={ventasPorDia} />
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-white">
                        🏆 Productos más vendidos
                    </h2>
                    <div>
                        {rankingProductos.length === 0 ? (
                            <p className="text-sm text-zinc-500">
                                Aún no hay ventas registradas.
                            </p>
                        ) : (
                            rankingProductos.map((producto) => (
                                <div
                                    key={producto.id}
                                    className="flex items-center justify-between border-b border-zinc-800 py-3 last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {producto.nombre}
                                        </p>

                                        <p className="text-xs text-zinc-500">
                                            {producto.vendidos} vendidos
                                        </p>
                                    </div>

                                    <span className="text-sm font-bold text-white">
                                        #{producto.posicion}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
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
                            <p className="text-sm text-zinc-500">
                                Todavía no hay pedidos.
                            </p>
                        ) : (
                            pedidosRecientes.map((pedido: {
                                id: string;
                                orderNumber: string;
                                total: unknown;
                                status: string;
                                user: {
                                    name: string | null;
                                    email: string | null;
                                }
                            }) => (
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