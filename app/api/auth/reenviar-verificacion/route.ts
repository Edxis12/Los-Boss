import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email =
            typeof body.email === "string"
                ? body.email.trim().toLowerCase()
                : "";

        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    error: "El correo electrónico es obligatorio.",
                },
                {
                    status: 400,
                }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
            select: {
                name: true,
                email: true,
                emailVerified: true,
            },
        });

        /*
         * Se devuelve una respuesta general cuando la cuenta no existe.
         * Esto evita revelar qué correos están registrados.
         */
        if (!user) {
            return NextResponse.json({
                success: true,
                message:
                    "Si existe una cuenta pendiente de verificación, enviaremos un nuevo correo.",
            });
        }

        if (user.emailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Este correo ya fue verificado. Puedes iniciar sesión.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!user.email) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "La cuenta no tiene un correo electrónico válido.",
                },
                {
                    status: 400,
                }
            );
        }

        await sendVerificationEmail({
            name: user.name ?? "Usuario",
            email: user.email,
        });

        return NextResponse.json({
            success: true,
            message:
                "Hemos enviado un nuevo correo de verificación.",
        });
    } catch (error) {
        console.error(
            "Error al reenviar el correo de verificación:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    "No fue posible enviar el correo. Inténtalo nuevamente.",
            },
            {
                status: 500,
            }
        );
    }
}