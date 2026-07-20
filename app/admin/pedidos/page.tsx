import { prisma } from "@/lib/prisma";
import OrdersTable from "@/components/admin/orders/OrdersTable";

export default async function AdminPedidosPage() {
  const pedidos = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true
        },
      },
      address: true,
      history: {
        orderBy: {
          createdAt: "asc",
        },
      },
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { position: "asc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  const pedidosPlano = pedidos.map((pedido: typeof pedidos[number]) => ({
    ...pedido,
    total: Number(pedido.total),
    adminNotes: pedido.adminNotes,
    createdAt: pedido.createdAt.toISOString(),
    updatedAt: pedido.updatedAt.toISOString(),

    history: pedido.history.map(
      (registro: typeof pedido.history[number]) => ({
        ...registro,
        createdAt: registro.createdAt.toISOString(),
      })
    ),

    items: pedido.items.map((item: typeof pedido.items[number]) => ({
      ...item,
      price: Number(item.price),
      product: item.product
        ? {
          ...item.product,
          price: Number(item.product.price),
          comparePrice: item.product.comparePrice
            ? Number(item.product.comparePrice)
            : null,
          createdAt: item.product.createdAt.toISOString(),
          updatedAt: item.product.updatedAt.toISOString(),
          images: item.product.images,
        }
        : null,
    })),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Pedidos</h1>
        <p className="text-zinc-500">
          {pedidos.length} pedidos registrados
        </p>
      </div>

      {pedidos.length === 0 ? (
        <p className="text-zinc-400 text-center py-20">
          Todavía no hay pedidos.
        </p>
      ) : (
        <OrdersTable pedidos={pedidosPlano} />
      )}
    </div>
  );
}