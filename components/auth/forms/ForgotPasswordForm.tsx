"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import {
    Alert,
    Button,
    Input,
} from "@/components/ui";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Ingresa tu correo electrónico.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "/api/auth/recuperar-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: normalizedEmail,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                        data.error ||
                        "No se pudo enviar el correo de recuperación."
                );
                return;
            }

            setSuccess(
                data.message ||
                    "Te enviamos un enlace para restablecer tu contraseña."
            );
        } catch (error) {
            console.error(
                "Error al recuperar contraseña:",
                error
            );

            setError(
                "Ocurrió un error al enviar el correo. Inténtalo nuevamente."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="mb-8">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                    Recupera tu acceso
                </p>

                <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                    ¿Olvidaste tu contraseña?
                </h1>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Ingresa el correo asociado a tu cuenta y te
                    enviaremos un enlace para crear una nueva
                    contraseña.
                </p>
            </div>

            {error && (
                <Alert
                    variant="error"
                    className="mb-6"
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    variant="success"
                    className="mb-6"
                >
                    {success}
                </Alert>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <Input
                    id="email"
                    label="Correo electrónico"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    icon={Mail}
                    disabled={loading}
                    required
                />

                <Button
                    type="submit"
                    loading={loading}
                    loadingText="Enviando enlace..."
                >
                    Enviar enlace de recuperación
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-zinc-500">
                ¿Recordaste tu contraseña?{" "}
                <Link
                    href="/login"
                    className="font-semibold text-white transition hover:text-zinc-300"
                >
                    Iniciar sesión
                </Link>
            </p>
        </div>
    );
}