import OrderStatusBadge from "@/components/admin/orders/OrderStatusBadge";
import type { EstadoPedido } from "@/lib/actions/admin-order-actions";
import { ShoppingCart } from "lucide-react";

export type RecentOrder = {
    id: string;
    orderNumber: string;
    total: number;
    status: EstadoPedido;
    user: {
        name: string | null;
        email: string | null;
    };
};

type Props = {
    pedidos: RecentOrder[];
};

export default function RecentOrders({ pedidos }: Props) {
    return (
        <section className="h-full rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
            <div className="mb-6 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-zinc-300">
                    <ShoppingCart size={20} className="shrink-0" />
                </div>

                <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white">
                        Pedidos recientes
                    </h2>
                    <p className="text-sm text-zinc-500">
                        Últimos pedidos registrados
                    </p>
                </div>
            </div>

            {pedidos.length === 0 ? (
                <div className="py-10 text-center">
                    <p className="text-sm text-zinc-500">
                        Todavía no hay pedidos registrados.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pedidos.map((pedido) => (
                        <div
                            key={pedido.id}
                            className="
                                flex
                                flex-col
                                gap-4
                                rounded-2xl
                                border
                                border-zinc-800
                                bg-zinc-950
                                p-4
                                transition
                                duration-300
                                hover:border-zinc-700
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                    #{pedido.orderNumber}
                                </p>

                                <p className="truncate text-xs text-zinc-500">
                                    {pedido.user.name ??
                                        pedido.user.email ??
                                        "Cliente"}
                                </p>
                            </div>

                            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                                <p className="text-base font-black text-white sm:text-sm">
                                    ${pedido.total.toLocaleString("es-MX")}
                                </p>

                                <OrderStatusBadge status={pedido.status} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}