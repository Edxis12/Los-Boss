import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import OrdersTable from "@/components/admin/orders/OrdersTable";

const PEDIDOS_POR_PAGINA = 20;

const ESTADOS_VALIDOS = [
  "PENDING",
  "CONTACTED",
  "PAYMENT_CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type EstadoPedido = (typeof ESTADOS_VALIDOS)[number];

type PageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

function esEstadoValido(value?: string): value is EstadoPedido {
  return (
    typeof value === "string" &&
    ESTADOS_VALIDOS.includes(value as EstadoPedido)
  );
}

export default async function AdminPedidosPage({
  searchParams,
}: PageProps) {
  const parametros = await searchParams;

  const busqueda = parametros.search?.trim() ?? "";

  const estadoActual = esEstadoValido(parametros.status)
    ? parametros.status
    : "TODOS";

  const paginaSolicitada = Math.max(
    1,
    Number.parseInt(parametros.page ?? "1", 10) || 1
  );

  /*
   * Este filtro base contiene la búsqueda, pero todavía
   * no contiene el estado. Se reutiliza para calcular
   * los contadores de cada estado.
   */
  const filtroBusqueda: Prisma.OrderWhereInput = busqueda
    ? {
        OR: [
          {
            orderNumber: {
              contains: busqueda,
              mode: "insensitive",
            },
          },
          {
            user: {
              is: {
                name: {
                  contains: busqueda,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            user: {
              is: {
                email: {
                  contains: busqueda,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      }
    : {};

  const where: Prisma.OrderWhereInput = {
    ...filtroBusqueda,

    ...(estadoActual !== "TODOS"
      ? {
          status:
            estadoActual as Prisma.OrderWhereInput["status"],
        }
      : {}),
  };

  /*
   * El total filtrado se utiliza para calcular las páginas.
   * groupBy genera los contadores de estados sin cargar pedidos.
   */
  const [totalPedidosFiltrados, resumenEstados] =
    await Promise.all([
      prisma.order.count({
        where,
      }),

      prisma.order.groupBy({
        by: ["status"],
        where: filtroBusqueda,
        _count: {
          _all: true,
        },
      }),
    ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(
      totalPedidosFiltrados / PEDIDOS_POR_PAGINA
    )
  );

  const paginaActual = Math.min(
    paginaSolicitada,
    totalPaginas
  );

  const pedidos = await prisma.order.findMany({
    where,

    orderBy: {
      createdAt: "desc",
    },

    skip:
      (paginaActual - 1) *
      PEDIDOS_POR_PAGINA,

    take: PEDIDOS_POR_PAGINA,

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

  const pedidosPlano = pedidos.map((pedido) => ({
    ...pedido,

    total: Number(pedido.total),

    createdAt:
      pedido.createdAt.toISOString(),

    updatedAt:
      pedido.updatedAt.toISOString(),

    history: pedido.history.map((registro) => ({
      ...registro,
      createdAt:
        registro.createdAt.toISOString(),
    })),

    items: pedido.items.map((item) => ({
      ...item,

      price: Number(item.price),

      product: item.product
        ? {
            ...item.product,

            price: Number(
              item.product.price
            ),

            comparePrice:
              item.product.comparePrice
                ? Number(
                    item.product.comparePrice
                  )
                : null,

            createdAt:
              item.product.createdAt.toISOString(),

            updatedAt:
              item.product.updatedAt.toISOString(),

            images: item.product.images,
          }
        : null,
    })),
  }));

  const totalesPorEstado = Object.fromEntries(
    ESTADOS_VALIDOS.map((estado) => [
      estado,
      resumenEstados.find(
        (registro) =>
          registro.status === estado
      )?._count._all ?? 0,
    ])
  ) as Record<EstadoPedido, number>;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:text-xs sm:tracking-[0.3em]">
          Administración
        </p>

        <div className="mt-2 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-[28px] font-black tracking-tight text-white min-[430px]:text-[34px] sm:text-[38px]">
              Pedidos
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
              Revisa las compras, consulta sus
              detalles y administra el estado de
              cada pedido.
            </p>
          </div>

          <div className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-zinc-400 sm:text-sm">
            {totalPedidosFiltrados}{" "}
            {totalPedidosFiltrados === 1
              ? "pedido encontrado"
              : "pedidos encontrados"}
          </div>
        </div>
      </div>

      {totalPedidosFiltrados === 0 &&
      !busqueda &&
      estadoActual === "TODOS" ? (
        <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] px-5 py-14 text-center shadow-[0_30px_80px_rgba(0,0,0,.3)] sm:px-8 sm:py-20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
            <span className="text-2xl">
              📦
            </span>
          </div>

          <h2 className="mt-6 text-2xl font-black tracking-tight text-white min-[430px]:text-3xl">
            Todavía no hay pedidos
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500 sm:text-base">
            Cuando un cliente complete una compra,
            aparecerá aquí para que puedas revisarla
            y darle seguimiento.
          </p>
        </section>
      ) : (
        <div className="min-w-0">
          <OrdersTable
            pedidos={pedidosPlano}
            totalesPorEstado={totalesPorEstado}
            busquedaActual={busqueda}
            estadoActual={estadoActual}
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            totalResultados={
              totalPedidosFiltrados
            }
          />
        </div>
      )}
    </div>
  );
}