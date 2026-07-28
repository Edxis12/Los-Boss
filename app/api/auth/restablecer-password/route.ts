import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import cryptop from "node:crypto";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                {
                    error: "Datos incompletos.",
                },
                {
                    status: 400,
                }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                {
                    error:
                        "La contraseña debe tener al menos 8 caracteres.",
                },
                {
                    status: 400,
                }
            );
        }

        const tokenHash = cryptop
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: {
                token: tokenHash,
            },
        });

        if (!resetToken) {
            return NextResponse.json(
                {
                    error:
                        "El enlace de recuperación no es válido.",
                },
                {
                    status: 400,
                }
            );
        }

        if (resetToken.expiresAt < new Date()) {
            await prisma.passwordResetToken.delete({
                where: {
                    token: tokenHash,
                },
            });

            return NextResponse.json(
                {
                    error:
                        "El enlace de recuperación ha expirado.",
                },
                {
                    status: 400,
                }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: {
                email: resetToken.email,
            },
            data: {
                password: hashedPassword,
            },
        });

        await prisma.passwordResetToken.delete({
            where: {
                token: tokenHash,
            },
        });

        return NextResponse.json({
            success: true,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error:
                    "Ocurrió un error al actualizar la contraseña.",
            },
            {
                status: 500,
            }
        );
    }
}