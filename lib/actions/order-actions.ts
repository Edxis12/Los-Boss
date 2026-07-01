"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ItemPedido = {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
};

type DireccionInput = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
};

export async function crearPedido(
  items: ItemPedido[],
  direccion: DireccionInput
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para completar tu compra" };
  }

  if (items.length === 0) {
    return { error: "Tu carrito está vacío" };
  }

//   Extraemos el userId aqui, ya verificado y como string puro.
// Esto evita que typescript "pierda" la verificacion de null dentro
// del clousure de la transaccion mas abajo.
  const userId: string = session.user.id;

  try {
    // Usamos una transacción: si algo falla a la mitad (ej. no hay stock),
    // se revierte TODO (no se crea el pedido a medias ni se descuenta stock de más).
    const pedido = await prisma.$transaction(async (tx) => {
      // 1. Verificar stock disponible de cada variante
      for (const item of items) {
        const variante = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (!variante || variante.stock < item.quantity) {
          throw new Error(
            `No hay suficiente stock disponible para uno de los productos`
          );
        }
      }

      // 2. Crear (o reusar) la dirección del usuario
      const direccionCreada = await tx.address.create({
        data: {
          ...direccion,
          userId,
        },
      });

      // 3. Calcular el total
      const total = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      // 4. Generar número de orden legible (ej: LB-00001)
      const totalPedidos = await tx.order.count();
      const orderNumber = `LB-${String(totalPedidos + 1).padStart(5, "0")}`;

      // 5. Crear el pedido con sus items
      const nuevoPedido = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: direccionCreada.id,
          total,
          status: "PENDING",
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

      // 6. Descontar el stock de cada variante
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return nuevoPedido;
    });

    revalidatePath("/cuenta/pedidos");
    revalidatePath("/admin/pedidos");
    revalidatePath("/productos");

    return { success: true, orderNumber: pedido.orderNumber, orderId: pedido.id };
  } catch (error) {
    console.error("Error al crear pedido:", error);
    const mensaje =
      error instanceof Error ? error.message : "Error al procesar el pedido";
    return { error: mensaje };
  }
}