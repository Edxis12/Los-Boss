import { prisma } from "@/lib/prisma";
import OrdersTable from "@/components/admin/orders/OrdersTable";

export default async function AdminPedidosPage() {
  const pedidos = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
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
                orderBy: {
                  position: "asc",
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  const pedidosPlano = pedidos.map(
    (pedido: (typeof pedidos)[number]) => ({
      ...pedido,
      total: Number(pedido.total),
      adminNotes: pedido.adminNotes,
      createdAt: pedido.createdAt.toISOString(),
      updatedAt: pedido.updatedAt.toISOString(),

      history: pedido.history.map(
        (registro: (typeof pedido.history)[number]) => ({
          ...registro,
          createdAt: registro.createdAt.toISOString(),
        })
      ),

      items: pedido.items.map(
        (item: (typeof pedido.items)[number]) => ({
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
        })
      ),
    })
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:text-xs sm:tracking-[0.3em]">
          Administración
        </p>

        <div className="mt-2 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-white min-[430px]:text-4xl">
              Pedidos
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
              Revisa las compras, consulta sus detalles y administra el estado
              de cada pedido.
            </p>
          </div>

          <div className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400">
            {pedidos.length}{" "}
            {pedidos.length === 1
              ? "pedido registrado"
              : "pedidos registrados"}
          </div>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] px-5 py-14 text-center shadow-[0_30px_80px_rgba(0,0,0,.3)] sm:px-8 sm:py-20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
            <span className="text-2xl">📦</span>
          </div>

          <h2 className="mt-6 text-2xl font-black tracking-tight text-white min-[430px]:text-3xl">
            Todavía no hay pedidos
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500 sm:text-base">
            Cuando un cliente complete una compra, aparecerá aquí para que
            puedas revisarla y darle seguimiento.
          </p>
        </section>
      ) : (
        <div className="min-w-0">
          <OrdersTable pedidos={pedidosPlano} />
        </div>
      )}
    </div>
  );
}