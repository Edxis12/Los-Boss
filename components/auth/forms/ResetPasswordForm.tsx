"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import {
    Alert,
    Button,
    PasswordInput,
} from "@/components/ui";

export default function ResetPasswordForm() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (!token) {
            setError("El enlace de recuperación no es válido.");
            return;
        }

        if (password.length < 8) {
            setError(
                "La contraseña debe tener al menos 8 caracteres."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "/api/auth/restablecer-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        password,
                    }),
                }
            );

            const data = await response
                .json()
                .catch(() => ({
                    error:
                        "El servidor devolvió una respuesta inválida.",
                }));

            if (!response.ok) {
                setError(
                    data.error ||
                    "No se pudo actualizar la contraseña."
                );
                return;
            }

            setSuccess(true);

            window.setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (error) {
            console.error(
                "Error al restablecer contraseña:",
                error
            );

            setError(
                "Ocurrió un error al actualizar la contraseña."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 shadow-[0_40px_120px_rgba(0,0,0,.7)] sm:p-8">
            <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
            >
                <ArrowLeft size={16} />
                Volver al inicio de sesión
            </Link>

            <div className="mt-8">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                    Recupera tu acceso
                </p>

                <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                    Nueva contraseña
                </h1>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Escribe una contraseña nueva para tu cuenta.
                </p>
            </div>

            {success ? (
                <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                    <div className="flex gap-3">
                        <CheckCircle2
                            size={22}
                            className="shrink-0 text-emerald-400"
                        />

                        <div>
                            <h2 className="font-bold text-white">
                                Contraseña actualizada
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Tu contraseña se actualizó correctamente.
                                Serás redirigido al inicio de sesión.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-6"
                >
                    {error && (
                        <Alert variant="error">
                            {error}
                        </Alert>
                    )}

                    <PasswordInput
                        id="password"
                        label="Nueva contraseña"
                        autoComplete="new-password"
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        disabled={loading}
                        required
                    />

                    <PasswordInput
                        id="confirmPassword"
                        label="Confirmar contraseña"
                        autoComplete="new-password"
                        placeholder="Repite tu contraseña"
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(event.target.value)
                        }
                        disabled={loading}
                        required
                    />

                    <Button
                        type="submit"
                        loading={loading}
                        loadingText="Actualizando contraseña..."
                    >
                        Actualizar contraseña
                    </Button>
                </form>
            )}
        </div>
    );
}