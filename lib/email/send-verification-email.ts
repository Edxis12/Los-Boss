import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/email/resend";
import { verificationEmailTemplate } from "@/lib/email/templates/verification-email";

type SendVerificationEmailProps = {
    name: string;
    email: string;
};

export async function sendVerificationEmail({
    name,
    email,
}: SendVerificationEmailProps) {
    const normalizedEmail = email.trim().toLowerCase();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!appUrl) {
        throw new Error(
            "Falta la variable de entorno NEXT_PUBLIC_APP_URL"
        );
    }

    if (!fromEmail) {
        throw new Error(
            "Falta la variable de entorno RESEND_FROM_EMAIL"
        );
    }

    const rawToken = randomBytes(32).toString("hex");

    const hashedToken = createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
    );

    await prisma.emailVerificationToken.deleteMany({
        where: {
            email: normalizedEmail,
        },
    });

    const savedToken =
        await prisma.emailVerificationToken.create({
            data: {
                email: normalizedEmail,
                token: hashedToken,
                expiresAt,
            },
        });

    const verificationUrl =
        `${appUrl}/verificar-correo/${rawToken}`;

    try {
        const result = await resend.emails.send({
            from: fromEmail,
            to: normalizedEmail,
            subject: "Verifica tu correo electrónico | Los Boss",
            html: verificationEmailTemplate({
                name,
                verificationUrl,
            }),
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

        return {
            success: true,
        };
    } catch (error) {
        await prisma.emailVerificationToken
            .delete({
                where: {
                    id: savedToken.id,
                },
            })
            .catch(() => undefined);

        console.error(
            "Error al enviar el correo de verificación:",
            error
        );

        throw new Error(
            "No fue posible enviar el correo de verificación."
        );
    }
}