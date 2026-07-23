import {
    AlertTriangle,
    Package,
    ShoppingCart,
    Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import SalesChart from "@/components/admin/dashboard/SalesChart";
import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import LowStock from "@/components/admin/dashboard/LowStock";
import TopProducts, {
    type TopProduct,
} from "@/components/admin/dashboard/TopProducts";

function obtenerUltimosDias(cantidad: number) {
    const dias: Date[] = [];
    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    for (let i = cantidad - 1; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        dias.push(fecha);
    }

    return dias;
}

function claveFecha(fecha: Date) {
    return [
        fecha.getFullYear(),
        String(fecha.getMonth() + 1).padStart(2, "0"),
        String(fecha.getDate()).padStart(2, "0"),
    ].join("-");
}

export default async function AdminDashboardPage() {
    const ultimosSieteDias = obtenerUltimosDias(7);
    const fechaInicio = ultimosSieteDias[0];

    const [
        totalProductos,
        totalPedidos,
        totalUsuarios,
        productosBajoStock,
        pedidosRecientes,
        variantesBajoStock,
        pedidosUltimosDias,
        productosAgrupados,
    ] = await Promise.all([
        prisma.product.count(),

        prisma.order.count(),

        prisma.user.count({
            where: {
                role: "USER",
            },
        }),

        prisma.productVariant.count({
            where: {
                stock: {
                    lte: 3,
                },
                product: {
                    isActive: true,
                },
            },
        }),

        prisma.order.findMany({
            take: 5,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                orderNumber: true,
                total: true,
                status: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        }),

        prisma.productVariant.findMany({
            take: 8,
            where: {
                stock: {
                    lte: 3,
                },
                product: {
                    isActive: true,
                },
            },
            orderBy: {
                stock: "asc",
            },
            select: {
                id: true,
                stock: true,
                size: true,
                color: true,
                product: {
                    select: {
                        name: true,
                    },
                },
            },
        }),

        prisma.order.findMany({
            where: {
                createdAt: {
                    gte: fechaInicio,
                },
                status: {
                    not: "CANCELLED",
                },
            },
            select: {
                total: true,
                createdAt: true,
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

    const idsProductos = productosAgrupados
        .map((registro) => registro.productId)
        .filter((id): id is string => Boolean(id));

    const productos =
        idsProductos.length > 0
            ? await prisma.product.findMany({
                where: {
                    id: {
                        in: idsProductos,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    images: {
                        take: 1,
                        orderBy: {
                            position: "asc",
                        },
                        select: {
                            url: true,
                        },
                    },
                },
            })
            : [];

    const productosPorId = new Map(
        productos.map((producto) => [producto.id, producto])
    );

    const topProductos = productosAgrupados.reduce<TopProduct[]>(
        (resultado, registro) => {
            if (!registro.productId) {
                return resultado;
            }

            const producto = productosPorId.get(
                registro.productId
            );

            if (!producto) {
                return resultado;
            }

            resultado.push({
                id: producto.id,
                nombre: producto.name,
                imagen: producto.images[0]?.url ?? null,
                vendidos: registro._sum.quantity ?? 0,
                posicion: resultado.length + 1,
            });

            return resultado;
        },
        []
    );

    const ventasPorFecha = new Map<string, number>();

    for (const pedido of pedidosUltimosDias) {
        const clave = claveFecha(pedido.createdAt);

        ventasPorFecha.set(
            clave,
            (ventasPorFecha.get(clave) ?? 0) + Number(pedido.total)
        );
    }

    const ventasGrafica = ultimosSieteDias.map((fecha) => ({
        date: fecha.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
        }),
        total: ventasPorFecha.get(claveFecha(fecha)) ?? 0,
    }));

    const stats = [
        {
            label: "Productos",
            value: totalProductos,
            detail: "Productos registrados en la tienda",
            icon: Package,
        },
        {
            label: "Pedidos totales",
            value: totalPedidos,
            detail: "Pedidos realizados por clientes",
            icon: ShoppingCart,
        },
        {
            label: "Usuarios registrados",
            value: totalUsuarios,
            detail: "Cuentas de clientes activas",
            icon: Users,
        },
        {
            label: "Variantes con poco stock",
            value: productosBajoStock,
            detail:
                productosBajoStock > 0
                    ? "Requieren revisión de inventario"
                    : "El inventario se encuentra estable",
            icon: AlertTriangle,
            alerta: productosBajoStock > 0,
        },
    ];

    const pedidosRecientesPlano = pedidosRecientes.map((pedido) => ({
        ...pedido,
        total: Number(pedido.total),
    }));

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:text-xs sm:tracking-[0.3em]">
                    Administración
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-white min-[430px]:text-4xl">
                    Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
                    Resumen general del rendimiento y actividad de Los Boss.
                </p>
            </div>

            <DashboardStats stats={stats} />

            <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,.7fr)]">
                <section className="min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
                    <div className="mb-4 sm:mb-6">
                        <h2 className="text-base font-bold leading-6 text-white sm:text-lg">
                            Ventas de los últimos 7 días
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm">
                            Total generado por pedidos no cancelados
                        </p>
                    </div>

                    <SalesChart data={ventasGrafica} />
                </section>

                <LowStock variantes={variantesBajoStock} />
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <RecentOrders pedidos={pedidosRecientesPlano} />
                <TopProducts productos={topProductos} />
            </div>
        </div>
    );
}