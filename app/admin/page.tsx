import { prisma } from "@/lib/prisma";
import { Package, ShoppingCart, Users, AlertTriangle } from "lucide-react";

export default async function AdminDashboardPage() {
    const [totalProductos, totalPedidos, totalUsuarios, productosBajoStock] =
        await Promise.all([
            prisma.product.count(),
            prisma.order.count(),
            prisma.user.count(),
            prisma.productVariant.count({ where: { stock: { lte: 3 } } }),
        ]);

    const stats = [
        { label: "Productos", value: totalProductos, icon: Package },
        { label: "Pedidos totales", value: totalPedidos, icon: ShoppingCart },
        { label: "Usuarios registrados", value: totalUsuarios, icon: Users },
        {
            label: "Variantes con poco sotck",
            value: productosBajoStock,
            icon: AlertTriangle,
            alerta: productosBajoStock > 0,
        },
    ];

    return (
        <div>
            <h1 className="text-2x1 font-bold text-white mb-1">Dashboard</h1>
            <p className="text-zinc-400 text-sm mb-8">
                Resumen general de tu tienda
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className={`bg-zinc-900 rounded-xl p-5 border ${stat.alerta ? "border-amber-500/40" : "border-zinc-800"}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <Icon
                                    size={20}
                                    className={stat.alerta ? "text-amber-400" : "text-zinc-400"}
                                />
                            </div>
                            <p className="text-2x1 font-bold text-white">{stat.value}</p>
                            <p className="text-sm text-zinc-400 mt-1">{stat.label}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}