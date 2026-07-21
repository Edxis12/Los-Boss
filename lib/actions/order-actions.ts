"use server";

import type { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ItemPedido = {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
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

  if (items.length === 0) {
    return {
      error: "Tu carrito está vacío",
    };
  }

  const userId = session.user.id;

  try {
    const pedido = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Comprobar el stock de todas las variantes
        for (const item of items) {
          const variante = await tx.productVariant.findUnique({
            where: {
              id: item.variantId,
            },
            include: {
              product: {
                select: {
                  isActive: true,
                }
              }
            }
          });

          if (!variante) {
            throw new Error(
              "Una de las variantes seleccionadas ya no existe"
            );
          }

          if (!variante.product.isActive) {
            throw new Error(
              "Uno de los productos ya no está disponible"
            );
          }

          if (variante.stock < item.quantity) {
            throw new Error(
              "No hay suficiente stock disponible para uno de los productos"
            );
          }
        }

        // 2. Crear una copia de la dirección para conservarla en el pedido
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
          const direccionGuardada = await tx.address.findFirst({
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
          if (
            !direccion.fullName.trim() ||
            !direccion.phone.trim() ||
            !direccion.street.trim() ||
            !direccion.city.trim() ||
            !direccion.state.trim() ||
            !direccion.postalCode.trim()
          ) {
            throw new Error("Completa todos los campos de dirección");
          }

          if (!/^\d{10}$/.test(direccion.phone)) {
            throw new Error("El teléfono debe contener 10 números");
          }

          if (!/^\d{5}$/.test(direccion.postalCode)) {
            throw new Error(
              "El código postal debe contener 5 números"
            );
          }

          datosDireccion = {
            label: null,
            fullName: direccion.fullName.trim(),
            phone: direccion.phone.trim(),
            street: direccion.street.trim(),
            city: direccion.city.trim(),
            state: direccion.state.trim(),
            postalCode: direccion.postalCode.trim(),
            country: "México",
          };
        }

        const direccionCreada = await tx.address.create({
          data: {
            label: datosDireccion.label,
            fullName: datosDireccion.fullName,
            phone: datosDireccion.phone,
            street: datosDireccion.street,
            city: datosDireccion.city,
            state: datosDireccion.state,
            postalCode: datosDireccion.postalCode,
            country: datosDireccion.country,
            isSaved: false,
            isDefault: false,
            userId,
          },
        });


        // 3. Calcular el total
        const total = items.reduce(
          (acumulado, item) =>
            acumulado + item.price * item.quantity,
          0
        );

        // 4. Generar el número de pedido
        const totalPedidos = await tx.order.count();

        const orderNumber = `LB-${String(totalPedidos + 1).padStart(
          5,
          "0"
        )}`;

        // 5. Crear el pedido y sus productos
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
              create: items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
        });

        // 6. Descontar el stock
        for (const item of items) {
          await tx.productVariant.update({
            where: {
              id: item.variantId,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        return nuevoPedido;
      }
    );

    revalidatePath("/cuenta/pedidos");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/dashboard");
    revalidatePath("/productos");

    return {
      success: true,
      orderNumber: pedido.orderNumber,
      orderId: pedido.id,
    };
  } catch (error) {
    console.error("Error al crear pedido:", error);

    const mensaje =
      error instanceof Error
        ? error.message
        : "Error al procesar el pedido";

    return {
      error: mensaje,
    };
  }
}