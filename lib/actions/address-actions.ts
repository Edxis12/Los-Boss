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

async function getUserId() {
    const session = await auth();
    return session?.user?.id ?? null;
}

async function requireUser() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Debes iniciar sesión");
    }

    return session.user.id;
}

function validarDireccion(data: AddressInput) {
    const fullName = data.fullName.trim();
    const phone = data.phone.trim();
    const street = data.street.trim();
    const city = data.city.trim();
    const state = data.state.trim();
    const postalCode = data.postalCode.trim();
    const label = data.label?.trim() ?? "";

    if (
        !fullName ||
        !phone ||
        !street ||
        !city ||
        !state ||
        !postalCode
    ) {
        return "Completa todos los campos requeridos";
    }

    if (!/^\d{10}$/.test(phone)) {
        return "El teléfono debe contener 10 números";
    }

    if (!/^\d{5}$/.test(postalCode)) {
        return "El código postal debe contener 5 números";
    }

    if (fullName.length > 100) {
        return "El nombre es demasiado largo";
    }

    if (street.length > 200) {
        return "La dirección es demasiado larga";
    }

    if (city.length > 100 || state.length > 100) {
        return "La ciudad o el estado no son válidos";
    }

    if (label.length > 50) {
        return "La etiqueta no puede superar 50 caracteres";
    }

    return null;
}

function validarAddressId(addressId: string) {
    return (
        typeof addressId === "string" &&
        addressId.trim().length > 0 &&
        addressId.length <= 100
    );
}

export async function crearDireccion(data: AddressInput) {
    const userId = await getUserId();
    const errorValidacion = validarDireccion(data);

    if (!userId) {
        return {
            error: "Debes iniciar sesión",
        };
    }

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

            if (cantidadDirecciones >= 10) {
                throw new Error(
                    "Solo puedes guardar hasta 10 direcciones"
                );
            }

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

        if (
            error instanceof Error &&
            error.message ===
            "Solo puedes guardar hasta 10 direcciones"
        ) {
            return {
                error: error.message,
            };
        }

        return {
            error: "No se pudo guardar la dirección",
        };
    }
}

export async function establecerDireccionPrincipal(addressId: string) {
    const userId = await getUserId();

    if (!userId) {
        return {
            error: "Debes iniciar sesión",
        };
    }

    if (!validarAddressId(addressId)) {
        return {
            error: "La dirección no es válida",
        };
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
            prisma.address.updateMany({
                where: {
                    id: addressId,
                    userId,
                    isSaved: true,
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
    const userId = await getUserId();

    if (!userId) {
        return {
            error: "Debes iniciar sesión",
        };
    }

    if (!validarAddressId(addressId)) {
        return {
            error: "La dirección no es válida",
        };
    }

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

        if (
            error instanceof Error &&
            error.message === "No encontramos la dirección"
        ) {
            return {
                error: error.message,
            };
        }

        return {
            error: "No se pudo eliminar la dirección",
        };
    }
}

export async function actualizarDireccion(
    addressId: string,
    data: AddressInput
) {
    const errorValidacion = validarDireccion(data);
    const userId = await getUserId();

    if (!userId) {
        return {
            error: "Debes iniciar sesión",
        };
    }

    if (!validarAddressId(addressId)) {
        return {
            error: "La dirección no es válida",
        };
    }

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

        const resultado =
            await prisma.address.updateMany({
                where: {
                    id: addressId,
                    userId,
                    isSaved: true,
                },
                data: {
                    label:
                        data.label?.trim() || "Dirección",
                    fullName: data.fullName.trim(),
                    phone: data.phone.trim(),
                    street: data.street.trim(),
                    city: data.city.trim(),
                    state: data.state.trim(),
                    postalCode:
                        data.postalCode.trim(),
                    country: "México",
                },
            });

        if (resultado.count !== 1) {
            return {
                error: "No encontramos la dirección",
            };
        }

        revalidatePath("/cuenta");
        revalidatePath("/cuenta/direcciones");
        revalidatePath(`/cuenta/direcciones/${addressId}/editar`);
        revalidatePath("/checkout");

        return {
            success: true,
        };
    } catch (error) {
        console.error(
            "Error al actualizar dirección:",
            error
        );

        return {
            error: "No se pudo actualizar la dirección",
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
        const userId = await getUserId();

        if (!userId) {
            return {
                error: "Debes iniciar sesión",
            };
        }

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