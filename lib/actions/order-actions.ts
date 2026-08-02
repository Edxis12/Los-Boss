"use server";

import type { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

type ItemPedido = {
  variantId: string;
  quantity: number;
};

type DireccionManualInput = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
};

type DireccionPedidoInput =
  | {
    savedAddressId: string;
  }
  | DireccionManualInput;

export type ItemValidacionStock = {
  variantId: string;
  quantity: number;
};

export type ResultadoStockCarrito = {
  variantId: string;
  stockActual: number;
  cantidadSolicitada: number;
  disponible: boolean;
  existe: boolean;
  productoActivo: boolean;
  nombreProducto: string;
};

export async function validarStockCarrito(
  items: ItemValidacionStock[]
): Promise<ResultadoStockCarrito[]> {
  if (items.length === 0) {
    return [];
  }

  const variantIds = Array.from(
    new Set(items.map((item) => item.variantId))
  );

  const variantes = await prisma.productVariant.findMany({
    where: {
      id: {
        in: variantIds,
      },
    },
    select: {
      id: true,
      stock: true,
      product: {
        select: {
          name: true,
          isActive: true,
        },
      },
    },
  });

  const variantesPorId = new Map(
    variantes.map(
      (variante: typeof variantes[number]) => [
        variante.id,
        variante,
      ]
    )
  );

  return items.map((item: ItemValidacionStock) => {
    const variante = variantesPorId.get(item.variantId);

    if (!variante) {
      return {
        variantId: item.variantId,
        stockActual: 0,
        cantidadSolicitada: item.quantity,
        disponible: false,
        existe: false,
        productoActivo: false,
        nombreProducto: "Producto no disponible",
      };
    }

    const productoActivo = variante.product.isActive;

    return {
      variantId: item.variantId,
      stockActual: variante.stock,
      cantidadSolicitada: item.quantity,
      disponible:
        productoActivo &&
        variante.stock > 0 &&
        variante.stock >= item.quantity,
      existe: true,
      productoActivo,
      nombreProducto: variante.product.name,
    };
  });
}

export async function crearPedido(
  items: ItemPedido[],
  direccion: DireccionPedidoInput
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: "Debes iniciar sesión para completar tu compra",
    };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return {
      error: "Tu carrito está vacío",
    };
  }

  /*
   * Validación básica antes de consultar la base de datos.
   * No aceptamos cantidades decimales, negativas, cero o exageradas.
   */
  for (const item of items) {
    if (
      typeof item.variantId !== "string" ||
      !item.variantId.trim() ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0 ||
      item.quantity > 100
    ) {
      return {
        error: "El carrito contiene datos no válidos",
      };
    }
  }

  /*
   * Agrupamos variantes repetidas.
   * Evita que alguien envíe dos entradas de la misma variante
   * para intentar superar el stock disponible.
   */
  const cantidadesPorVariante = new Map<string, number>();

  for (const item of items) {
    cantidadesPorVariante.set(
      item.variantId,
      (cantidadesPorVariante.get(item.variantId) ?? 0) +
      item.quantity
    );
  }

  const itemsNormalizados = Array.from(
    cantidadesPorVariante,
    ([variantId, quantity]) => ({
      variantId,
      quantity,
    })
  );

  const userId = session.user.id;

  try {
    const pedido = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        /*
         * Obtenemos productos, precios y stock directamente
         * desde la base de datos.
         */
        const variantes =
          await tx.productVariant.findMany({
            where: {
              id: {
                in: itemsNormalizados.map(
                  (item) => item.variantId
                ),
              },
            },
            select: {
              id: true,
              stock: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  isActive: true,
                },
              },
            },
          });

        if (
          variantes.length !==
          itemsNormalizados.length
        ) {
          throw new Error(
            "Uno de los productos ya no está disponible"
          );
        }

        const variantesPorId = new Map(
          variantes.map((variante) => [
            variante.id,
            variante,
          ])
        );

        const itemsSeguros = itemsNormalizados.map(
          (item) => {
            const variante =
              variantesPorId.get(item.variantId);

            if (!variante) {
              throw new Error(
                "Uno de los productos ya no está disponible"
              );
            }

            if (!variante.product.isActive) {
              throw new Error(
                `${variante.product.name} ya no está disponible`
              );
            }

            if (variante.stock < item.quantity) {
              throw new Error(
                `No hay suficiente stock de ${variante.product.name}`
              );
            }

            return {
              productId: variante.product.id,
              variantId: variante.id,
              productName: variante.product.name,
              quantity: item.quantity,

              /*
               * Precio real de Prisma.
               * Nunca usamos el precio enviado por el navegador.
               */
              price: variante.product.price,
            };
          }
        );

        /*
         * Resolvemos y validamos la dirección.
         */
        let datosDireccion: {
          label?: string | null;
          fullName: string;
          phone: string;
          street: string;
          city: string;
          state: string;
          postalCode: string;
          country: string;
        };

        if ("savedAddressId" in direccion) {
          const direccionGuardada =
            await tx.address.findFirst({
              where: {
                id: direccion.savedAddressId,
                userId,
                isSaved: true,
              },
              select: {
                label: true,
                fullName: true,
                phone: true,
                street: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
              },
            });

          if (!direccionGuardada) {
            throw new Error(
              "La dirección seleccionada ya no está disponible"
            );
          }

          datosDireccion = direccionGuardada;
        } else {
          const fullName = direccion.fullName.trim();
          const phone = direccion.phone.trim();
          const street = direccion.street.trim();
          const city = direccion.city.trim();
          const state = direccion.state.trim();
          const postalCode =
            direccion.postalCode.trim();

          if (
            !fullName ||
            !phone ||
            !street ||
            !city ||
            !state ||
            !postalCode
          ) {
            throw new Error(
              "Completa todos los campos de dirección"
            );
          }

          if (!/^\d{10}$/.test(phone)) {
            throw new Error(
              "El teléfono debe contener 10 números"
            );
          }

          if (!/^\d{5}$/.test(postalCode)) {
            throw new Error(
              "El código postal debe contener 5 números"
            );
          }

          datosDireccion = {
            label: null,
            fullName,
            phone,
            street,
            city,
            state,
            postalCode,
            country: "México",
          };
        }

        /*
         * Copia histórica de la dirección usada.
         */
        const direccionCreada =
          await tx.address.create({
            data: {
              label: datosDireccion.label,
              fullName: datosDireccion.fullName,
              phone: datosDireccion.phone,
              street: datosDireccion.street,
              city: datosDireccion.city,
              state: datosDireccion.state,
              postalCode:
                datosDireccion.postalCode,
              country: datosDireccion.country,
              isSaved: false,
              isDefault: false,
              userId,
            },
          });

        /*
         * Descuento atómico del inventario.
         *
         * Aunque dos pedidos intenten comprar la última
         * pieza simultáneamente, solo uno podrá disminuirla.
         */
        for (const item of itemsSeguros) {
          const resultado =
            await tx.productVariant.updateMany({
              where: {
                id: item.variantId,
                stock: {
                  gte: item.quantity,
                },
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });

          if (resultado.count !== 1) {
            throw new Error(
              `El stock de ${item.productName} cambió. Revisa tu carrito e intenta nuevamente.`
            );
          }
        }

        /*
         * Calculamos el total usando únicamente precios
         * obtenidos desde la base de datos.
         */
        const total = itemsSeguros.reduce(
          (acumulado, item) =>
            acumulado +
            Number(item.price) * item.quantity,
          0
        );

        /*
         * No usamos count() + 1 porque dos pedidos
         * simultáneos podrían recibir el mismo número.
         */
        const identificador = randomUUID()
          .replaceAll("-", "")
          .slice(0, 10)
          .toUpperCase();

        const orderNumber = `LB-${identificador}`;

        const nuevoPedido = await tx.order.create({
          data: {
            orderNumber,
            userId,
            addressId: direccionCreada.id,
            total,
            history: {
              create: {
                status: "PENDING",
              },
            },
            items: {
              create: itemsSeguros.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
        });

        return nuevoPedido;
      }
    );

    revalidatePath("/cuenta/pedidos");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/dashboard");
    revalidatePath("/productos");
    revalidatePath("/carrito");

    return {
      success: true,
      orderNumber: pedido.orderNumber,
      orderId: pedido.id,
    };
  } catch (error) {
    console.error("Error al crear pedido:", error);

    /*
     * Mensajes que sí podemos mostrar al usuario.
     */
    if (
      error instanceof Error &&
      (
        error.message.includes("stock") ||
        error.message.includes("disponible") ||
        error.message.includes("dirección") ||
        error.message.includes("teléfono") ||
        error.message.includes("código postal") ||
        error.message.includes("campos")
      )
    ) {
      return {
        error: error.message,
      };
    }

    return {
      error:
        "No fue posible procesar el pedido. Intenta nuevamente.",
    };
  }
}