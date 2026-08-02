"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";

type RegisterUserInput = {
    name: string;
    email: string;
    password: string;
};

type RegisterUserResult = {
    success?: boolean;
    error?: string;
    requiresVerification?: boolean;
    email?: string;
};

export async function registerUser(
    formData: RegisterUserInput
): Promise<RegisterUserResult> {
    try {
        const emailVerificationEnabled =
            process.env.EMAIL_VERIFICATION_ENABLED === "true";

        // 1. Validar los datos
        const parsed = registerSchema.safeParse(formData);

        if (!parsed.success) {
            return {
                error:
                    parsed.error.issues[0]?.message ??
                    "Los datos ingresados no son válidos.",
            };
        }

        const name = parsed.data.name.trim();
        const email = parsed.data.email.trim().toLowerCase();
        const password = parsed.data.password;

        // 2. Comprobar si ya existe una cuenta
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
                emailVerified: true,
            },
        });

        if (existingUser) {
            if (
                emailVerificationEnabled &&
                !existingUser.emailVerified
            ) {
                return {
                    error:
                        "Ya existe una cuenta con ese correo, pero todavía no ha sido verificada.",
                    requiresVerification: true,
                    email,
                };
            }

            return {
                error: "Ya existe una cuenta con ese correo.",
            };
        }

        /*
         * Solo comprobamos Resend cuando la verificación
         * por correo está activada.
         */
        if (emailVerificationEnabled) {
            if (!process.env.RESEND_API_KEY) {
                console.error(
                    "Falta configurar RESEND_API_KEY."
                );

                return {
                    error:
                        "El servicio de correo no está configurado correctamente.",
                };
            }

            if (!process.env.RESEND_FROM_EMAIL) {
                console.error(
                    "Falta configurar RESEND_FROM_EMAIL."
                );

                return {
                    error:
                        "El correo remitente no está configurado correctamente.",
                };
            }

            if (!process.env.NEXT_PUBLIC_APP_URL) {
                console.error(
                    "Falta configurar NEXT_PUBLIC_APP_URL."
                );

                return {
                    error:
                        "La dirección de la aplicación no está configurada correctamente.",
                };
            }
        }

        // 3. Encriptar contraseña
        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        // 4. Crear usuario
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,

                /*
                 * Si la verificación está desactivada,
                 * la cuenta queda habilitada inmediatamente.
                 */
                emailVerified: emailVerificationEnabled
                    ? null
                    : new Date(),
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        /*
         * 5. Enviar correo únicamente cuando
         * la verificación esté activada.
         */
        if (emailVerificationEnabled) {
            try {
                await sendVerificationEmail({
                    name: user.name ?? name,
                    email,
                });
            } catch (error) {
                console.error(
                    "Error al enviar la verificación durante el registro:",
                    error
                );

                await prisma.user
                    .delete({
                        where: {
                            id: user.id,
                        },
                    })
                    .catch((deleteError) => {
                        console.error(
                            "No se pudo eliminar la cuenta después del fallo de correo:",
                            deleteError
                        );
                    });

                return {
                    error:
                        "No pudimos enviar el correo de verificación. Inténtalo nuevamente.",
                };
            }
        }

        return {
            success: true,
            requiresVerification:
                emailVerificationEnabled,
            email,
        };
    } catch (error) {
        console.error(
            "Error al registrar usuario:",
            error
        );

        return {
            error:
                "Ocurrió un error al crear la cuenta. Inténtalo nuevamente.",
        };
    }
}