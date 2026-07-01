import { prisma } from "@/lib/prisma";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export default async function AdminPedidosPage() {
  const pedidos = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      address: true,
      items: { include: { product: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Pedidos</h1>
      <p className="text-zinc-400 text-sm mb-8">
        {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"} en total
      </p>

      {pedidos.length === 0 ? (
        <p className="text-zinc-400 text-center py-20">
          Todavía no hay pedidos.
        </p>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <details
              key={pedido.id}
              className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden group"
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none">
                <div className="flex items-center gap-4 min-w-0">
                  <div>
                    <p className="text-white font-semibold">
                      {pedido.orderNumber}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {pedido.user.name || pedido.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <p className="text-sm text-zinc-400 hidden sm:block">
                    {new Date(pedido.createdAt).toLocaleDateString("es-MX")}
                  </p>
                  <p className="text-white font-semibold">
                    ${Number(pedido.total).toLocaleString("es-MX")}
                  </p>
                  <OrderStatusSelect
                    orderId={pedido.id}
                    estadoActual={pedido.status}
                  />
                </div>
              </summary>

              <div className="border-t border-zinc-800 px-5 py-4 space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">
                    Dirección de envío
                  </p>
                  <p className="text-sm text-zinc-300">
                    {pedido.address.fullName} · {pedido.address.phone}
                    <br />
                    {pedido.address.street}, {pedido.address.city},{" "}
                    {pedido.address.state}, CP {pedido.address.postalCode}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 mb-2">Productos</p>
                  <div className="space-y-1.5">
                    {pedido.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-zinc-300">
                          {item.quantity}× {item.product.name}
                        </span>
                        <span className="text-zinc-400">
                          $
                          {(Number(item.price) * item.quantity).toLocaleString(
                            "es-MX"
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}