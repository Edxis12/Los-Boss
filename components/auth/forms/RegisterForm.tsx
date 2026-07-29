"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Mail, UserRound } from "lucide-react";

import { registerUser } from "@/lib/actions/auth-actions";
import {
    Alert,
    Button,
    Divider,
    Input,
    PasswordInput,
} from "@/components/ui";

export default function RegisterForm() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedName) {
            setError("Ingresa tu nombre.");
            return;
        }

        if (!normalizedEmail) {
            setError("Ingresa tu correo electrónico.");
            return;
        }

        if (password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            setLoading(true);

            const result = await registerUser({
                name: normalizedName,
                email: normalizedEmail,
                password,
            });

            if (result.error) {
                setError(result.error);
                return;
            }

            router.push(
                `/verificacion-enviada?email=${encodeURIComponent(
                    normalizedEmail
                )}`
            );
        } catch (error) {
            console.error("Error al registrar usuario:", error);

            setError(
                "Ocurrió un error al crear tu cuenta. Inténtalo nuevamente."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleRegister() {
        setError("");
        setGoogleLoading(true);

        try {
            await signIn("google", {
                callbackUrl: "/",
            });
        } catch (error) {
            console.error("Error al registrarse con Google:", error);

            setError(
                "No se pudo continuar con Google. Inténtalo nuevamente."
            );
        } finally {
            setGoogleLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="mb-8">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                    Crea tu perfil
                </p>

                <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                    Regístrate
                </h1>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Crea una cuenta para guardar tus favoritos, consultar tus
                    pedidos y administrar tu información.
                </p>
            </div>

            {error && (
                <Alert variant="error" className="mb-6">
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    id="name"
                    label="Nombre completo"
                    type="text"
                    autoComplete="name"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    icon={UserRound}
                    disabled={loading || googleLoading}
                    required
                />

                <Input
                    id="email"
                    label="Correo electrónico"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    icon={Mail}
                    disabled={loading || googleLoading}
                    required
                />

                <PasswordInput
                    id="password"
                    label="Contraseña"
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={loading || googleLoading}
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
                    disabled={loading || googleLoading}
                    required
                />

                <Button
                    type="submit"
                    loading={loading}
                    loadingText="Creando cuenta..."
                    disabled={googleLoading}
                >
                    Crear cuenta
                </Button>
            </form>

            <Divider>o continúa con</Divider>

            <Button
                type="button"
                variant="secondary"
                onClick={handleGoogleRegister}
                loading={googleLoading}
                loadingText="Conectando con Google..."
                disabled={loading}
                leftIcon={
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                        G
                    </span>
                }
            >
                Continuar con Google
            </Button>

            <p className="mt-8 text-center text-sm text-zinc-500">
                ¿Ya tienes una cuenta?{" "}
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