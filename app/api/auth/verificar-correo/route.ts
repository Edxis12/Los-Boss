import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: "Token inválido." },
                { status: 400 }
            );
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const verificationToken =
            await prisma.emailVerificationToken.findUnique({
                where: {
                    token: tokenHash,
                },
            });

        if (!verificationToken) {
            return NextResponse.json(
                {
                    error: "Este enlace de verificación no es válido.",
                },
                {
                    status: 400,
                }
            );
        }

        if (verificationToken.expiresAt < new Date()) {
            await prisma.emailVerificationToken.delete({
                where: {
                    token: tokenHash,
                },
            });

            return NextResponse.json(
                {
                    error: "Este enlace ha expirado.",
                },
                {
                    status: 400,
                }
            );
        }

        await prisma.$transaction([
            prisma.user.update({
                where: {
                    email: verificationToken.email,
                },
                data: {
                    emailVerified: new Date(),
                },
            }),

            prisma.emailVerificationToken.delete({
                where: {
                    token: tokenHash,
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Ocurrió un error al verificar el correo.",
            },
            {
                status: 500,
            }
        );
    }
}