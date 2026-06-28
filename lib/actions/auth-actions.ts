"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function registerUser(formData: {
    name: string;
    email: string;
    password: string;
}) {
    // 1. Validar los datos que llegan del formulario
    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const { name, email, password } = parsed.data;

    // 2. Revisar que el correo no esté ya registrado
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return { error: "Ya existe una cuenta con ese correo" };
    }

    // 3. Encriptar la contraseña antes de guardarla (NUNCA en texto plano)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear el usuario
    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    return { success: true };
}