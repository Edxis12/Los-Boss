import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const genericMessage =
    "Si existe una cuenta asociada a ese correo, recibirás un enlace para restablecer tu contraseña.";

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
    try {
        const body: unknown = await request.json();

        if (
            typeof body !== "object" ||
            body === null ||
            !("email" in body) ||
            typeof body.email !== "string"
        ) {
            return NextResponse.json(
                { error: "Ingresa un correo electrónico válido." },
                { status: 400 }
            );
        }

        const email = body.email.trim().toLowerCase();

        if (!email || !email.includes("@") || email.length > 254) {
            return NextResponse.json(
                { error: "Ingresa un correo electrónico válido." },
                { status: 400 }
            );
        }

        const genericResponse = {
            success: true,
            message: genericMessage,
        };

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                email: true,
                name: true,
                password: true,
            },
        });

        // No revelamos si el correo está registrado.
        if (!user?.email) {
            return NextResponse.json(genericResponse);
        }

        /*
         * Un usuario creado únicamente con Google puede no tener contraseña.
         * Por seguridad devolvemos el mismo mensaje genérico.
         */
        if (!user.password) {
            return NextResponse.json(genericResponse);
        }

        if (!process.env.RESEND_API_KEY) {
            console.error("Falta configurar RESEND_API_KEY.");

            return NextResponse.json(
                { error: "El servicio de correo no está configurado." },
                { status: 500 }
            );
        }

        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
            "http://localhost:3000";

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        const resetUrl = `${appUrl}/restablecer-password/${token}`;

        /*
         * Guardamos un hash del token en la base de datos.
         * El token original solamente se envía en el enlace.
         */
        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        await prisma.$transaction([
            prisma.passwordResetToken.deleteMany({
                where: { email },
            }),
            prisma.passwordResetToken.create({
                data: {
                    email,
                    token: tokenHash,
                    expiresAt,
                },
            }),
        ]);

        const safeName = escapeHtml(user.name?.trim() || "cliente");

        const { error } = await resend.emails.send({
            from:
                process.env.RESEND_FROM_EMAIL ??
                "Los Boss <onboarding@resend.dev>",
            to: user.email,
            subject: "Restablece tu contraseña | Los Boss",
            html: `
                <!doctype html>
                <html lang="es">
                    <head>
                        <meta charset="UTF-8" />
                        <meta
                            name="viewport"
                            content="width=device-width, initial-scale=1"
                        />
                    </head>

                    <body
                        style="
                            margin: 0;
                            padding: 0;
                            background: #080808;
                            font-family: Arial, Helvetica, sans-serif;
                            color: #ffffff;
                        "
                    >
                        <table
                            role="presentation"
                            width="100%"
                            cellspacing="0"
                            cellpadding="0"
                            border="0"
                            style="background: #080808; padding: 32px 16px;"
                        >
                            <tr>
                                <td align="center">
                                    <table
                                        role="presentation"
                                        width="100%"
                                        cellspacing="0"
                                        cellpadding="0"
                                        border="0"
                                        style="
                                            max-width: 560px;
                                            border: 1px solid #262626;
                                            border-radius: 24px;
                                            background: #111111;
                                            overflow: hidden;
                                        "
                                    >
                                        <tr>
                                            <td style="padding: 34px 32px 10px;">
                                                <p
                                                    style="
                                                        margin: 0;
                                                        color: #8a8a8a;
                                                        font-size: 12px;
                                                        font-weight: 700;
                                                        letter-spacing: 4px;
                                                        text-transform: uppercase;
                                                    "
                                                >
                                                    LOS BOSS
                                                </p>

                                                <h1
                                                    style="
                                                        margin: 18px 0 0;
                                                        color: #ffffff;
                                                        font-size: 32px;
                                                        line-height: 1.15;
                                                    "
                                                >
                                                    Restablece tu contraseña
                                                </h1>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="padding: 12px 32px 32px;">
                                                <p
                                                    style="
                                                        margin: 0 0 16px;
                                                        color: #d4d4d4;
                                                        font-size: 16px;
                                                        line-height: 1.7;
                                                    "
                                                >
                                                    Hola, ${safeName}.
                                                </p>

                                                <p
                                                    style="
                                                        margin: 0;
                                                        color: #a3a3a3;
                                                        font-size: 15px;
                                                        line-height: 1.7;
                                                    "
                                                >
                                                    Recibimos una solicitud para
                                                    cambiar la contraseña de tu
                                                    cuenta. Presiona el siguiente
                                                    botón para crear una nueva.
                                                </p>

                                                <table
                                                    role="presentation"
                                                    cellspacing="0"
                                                    cellpadding="0"
                                                    border="0"
                                                    style="margin: 28px 0;"
                                                >
                                                    <tr>
                                                        <td
                                                            style="
                                                                border-radius: 14px;
                                                                background: #ffffff;
                                                            "
                                                        >
                                                            <a
                                                                href="${resetUrl}"
                                                                style="
                                                                    display: inline-block;
                                                                    padding: 16px 24px;
                                                                    color: #000000;
                                                                    font-size: 15px;
                                                                    font-weight: 700;
                                                                    text-decoration: none;
                                                                "
                                                            >
                                                                Restablecer contraseña
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <p
                                                    style="
                                                        margin: 0;
                                                        color: #737373;
                                                        font-size: 13px;
                                                        line-height: 1.7;
                                                    "
                                                >
                                                    Este enlace expirará en
                                                    30 minutos y solo puede
                                                    utilizarse una vez.
                                                </p>

                                                <p
                                                    style="
                                                        margin: 20px 0 0;
                                                        color: #737373;
                                                        font-size: 13px;
                                                        line-height: 1.7;
                                                        word-break: break-all;
                                                    "
                                                >
                                                    Si el botón no funciona, copia
                                                    esta dirección en tu navegador:
                                                    <br />
                                                    ${resetUrl}
                                                </p>

                                                <p
                                                    style="
                                                        margin: 20px 0 0;
                                                        color: #737373;
                                                        font-size: 13px;
                                                        line-height: 1.7;
                                                    "
                                                >
                                                    Si no solicitaste este cambio,
                                                    puedes ignorar el mensaje.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                </html>
            `,
            text: [
                `Hola, ${user.name?.trim() || "cliente"}.`,
                "",
                "Recibimos una solicitud para restablecer tu contraseña de Los Boss.",
                `Abre este enlace: ${resetUrl}`,
                "",
                "El enlace expira en 30 minutos y solo puede utilizarse una vez.",
                "Si no solicitaste este cambio, ignora el mensaje.",
            ].join("\n"),
        });

        if (error) {
            console.error("Error de Resend:", error);

            // Si el envío falla, borramos el token que no pudo entregarse.
            await prisma.passwordResetToken.deleteMany({
                where: {
                    email,
                    token: tokenHash,
                },
            });

            return NextResponse.json(
                { error: "No fue posible enviar el correo de recuperación." },
                { status: 500 }
            );
        }

        return NextResponse.json(genericResponse);
    } catch (error) {
        console.error("Error al recuperar contraseña:", error);

        return NextResponse.json(
            { error: "Ocurrió un error al procesar la solicitud." },
            { status: 500 }
        );
    }
}