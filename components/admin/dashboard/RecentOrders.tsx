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
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                    <ShoppingCart size={19} />
                </div>

                <div>
                    <h2 className="text-lg font-bold text-white">
                        Pedidos recientes
                    </h2>
                    <p className="text-sm text-zinc-500">
                        Últimos pedidos registrados
                    </p>
                </div>
            </div>

            {pedidos.length === 0 ? (
                <p className="text-sm text-zinc-500">
                    Todavía no hay pedidos.
                </p>
            ) : (
                <div className="space-y-1">
                    {pedidos.map((pedido) => (
                        <div
                            key={pedido.id}
                            className="flex flex-col gap-3 border-b border-zinc-800 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    #{pedido.orderNumber}
                                </p>

                                <p className="text-xs text-zinc-500">
                                    {pedido.user.name ??
                                        pedido.user.email ??
                                        "Cliente"}
                                </p>
                            </div>

                            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                                <p className="text-sm font-bold text-white">
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