"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AddressInput = {
    label?: string;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
};

async function requireUser() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Debes iniciar sesión");
    }

    return session.user.id;
}

function validarDireccion(data: AddressInput) {
    if (
        !data.fullName.trim() ||
        !data.phone.trim() ||
        !data.street.trim() ||
        !data.city.trim() ||
        !data.state.trim() ||
        !data.postalCode.trim()
    ) {
        return "Completa todos los campos requeridos";
    }

    if (!/^\d{10}$/.test(data.phone)) {
        return "El teléfono debe contener 10 números";
    }

    if (!/^\d{5}$/.test(data.postalCode)) {
        return "El código postal debe contener 5 números";
    }

    return null;
}

export async function crearDireccion(data: AddressInput) {
    const userId = await requireUser();
    const errorValidacion = validarDireccion(data);

    if (errorValidacion) {
        return { error: errorValidacion };
    }

    try {
        await prisma.$transaction(async (tx) => {
            const cantidadDirecciones = await tx.address.count({
                where: {
                    userId,
                    isSaved: true,
                },
            });

            await tx.address.create({
                data: {
                    label: data.label?.trim() || "Dirección",
                    fullName: data.fullName.trim(),
                    phone: data.phone.trim(),
                    street: data.street.trim(),
                    city: data.city.trim(),
                    state: data.state.trim(),
                    postalCode: data.postalCode.trim(),
                    country: "México",
                    isSaved: true,
                    isDefault: cantidadDirecciones === 0,
                    userId,
                },
            });
        });

        revalidatePath("/cuenta");
        revalidatePath("/cuenta/direcciones");
        revalidatePath("/checkout");

        return { success: true };
    } catch (error) {
        console.error("Error al crear dirección:", error);

        return {
            error:
                error instanceof Error
                    ? error.message
                    : "No se pudo guardar la dirección",
        };
    }
}

export async function establecerDireccionPrincipal(addressId: string) {
    const userId = await requireUser();

    try {
        const direccion = await prisma.address.findFirst({
            where: {
                id: addressId,
                userId,
                isSaved: true,
            },
            select: {
                id: true,
            },
        });

        if (!direccion) {
            return { error: "No encontramos la dirección" };
        }

        await prisma.$transaction([
            prisma.address.updateMany({
                where: {
                    userId,
                    isSaved: true,
                },
                data: {
                    isDefault: false,
                },
            }),
            prisma.address.update({
                where: {
                    id: addressId,
                },
                data: {
                    isDefault: true,
                },
            }),
        ]);

        revalidatePath("/cuenta");
        revalidatePath("/cuenta/direcciones");
        revalidatePath("/checkout");

        return { success: true };
    } catch (error) {
        console.error("Error al cambiar dirección principal:", error);

        return {
            error: "No se pudo cambiar la dirección principal",
        };
    }
}

export async function eliminarDireccion(addressId: string) {
    const userId = await requireUser();

    try {
        await prisma.$transaction(async (tx) => {
            const direccion = await tx.address.findFirst({
                where: {
                    id: addressId,
                    userId,
                    isSaved: true,
                },
                select: {
                    id: true,
                    isDefault: true,
                },
            });

            if (!direccion) {
                throw new Error("No encontramos la dirección");
            }

            await tx.address.delete({
                where: {
                    id: direccion.id,
                },
            });

            if (direccion.isDefault) {
                const siguienteDireccion = await tx.address.findFirst({
                    where: {
                        userId,
                        isSaved: true,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                    select: {
                        id: true,
                    },
                });

                if (siguienteDireccion) {
                    await tx.address.update({
                        where: {
                            id: siguienteDireccion.id,
                        },
                        data: {
                            isDefault: true,
                        },
                    });
                }
            }
        });

        revalidatePath("/cuenta");
        revalidatePath("/cuenta/direcciones");
        revalidatePath("/checkout");

        return { success: true };
    } catch (error) {
        console.error("Error al eliminar dirección:", error);

        return {
            error:
                error instanceof Error
                    ? error.message
                    : "No se pudo eliminar la dirección",
        };
    }
}

export async function actualizarDireccion(
    addressId: string,
    data: AddressInput
) {
    const userId = await requireUser();
    const errorValidacion = validarDireccion(data);

    if (errorValidacion) {
        return { error: errorValidacion };
    }

    try {
        const direccion = await prisma.address.findFirst({
            where: {
                id: addressId,
                userId,
                isSaved: true,
            },
            select: {
                id: true,
            },
        });

        if (!direccion) {
            return {
                error: "No encontramos la dirección",
            };
        }

        await prisma.address.update({
            where: {
                id: addressId,
            },
            data: {
                label: data.label?.trim() || "Dirección",
                fullName: data.fullName.trim(),
                phone: data.phone.trim(),
                street: data.street.trim(),
                city: data.city.trim(),
                state: data.state.trim(),
                postalCode: data.postalCode.trim(),
                country: "México",
            },
        });

        revalidatePath("/cuenta");
        revalidatePath("/cuenta/direcciones");
        revalidatePath(`/cuenta/direcciones/${addressId}/editar`);
        revalidatePath("/checkout");

        return {
            success: true,
        };
    } catch (error) {
        console.error("Error al actualizar dirección:", error);

        return {
            error:
                error instanceof Error
                    ? error.message
                    : "No se pudo actualizar la dirección",
        };
    }
}

export type DireccionGuardada = {
    id: string;
    label: string | null;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
};

export async function obtenerDireccionesGuardadas(): Promise<{
    direcciones?: DireccionGuardada[];
    error?: string;
}> {
    try {
        const userId = await requireUser();

        const direcciones = await prisma.address.findMany({
            where: {
                userId,
                isSaved: true,
            },
            orderBy: [
                {
                    isDefault: "desc",
                },
                {
                    createdAt: "asc",
                },
            ],
            select: {
                id: true,
                label: true,
                fullName: true,
                phone: true,
                street: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
                isDefault: true,
            },
        });

        return {
            direcciones,
        };
    } catch (error) {
        console.error("Error al obtener direcciones:", error);

        return {
            error: "No se pudieron cargar tus direcciones",
        };
    }
}