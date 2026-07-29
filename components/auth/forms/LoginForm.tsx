"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Alert from "@/components/ui/Alert";
import Divider from "@/components/ui/Divider";

import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
} from "lucide-react";

export default function LoginForm() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email: email.trim().toLowerCase(),
                password,
                redirect: false,
            });

            if (result?.error) {
                const isNotVerified =
                    result.error.includes("EMAIL_NOT_VERIFIED") ||
                    result.code === "EMAIL_NOT_VERIFIED";

                if (isNotVerified) {
                    setError(
                        "Debes verificar tu correo electrónico antes de iniciar sesión."
                    );
                    setLoading(false);
                    return;
                }

                setError("El correo o la contraseña son incorrectos.");
                setLoading(false);
                return;
            }

            router.push("/");
            router.refresh();
        } catch {
            setError("No fue posible iniciar sesión. Inténtalo nuevamente.");
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        setError("");
        setGoogleLoading(true);

        await signIn("google", {
            callbackUrl: "/",
        });
    }

    return (
        <div className="w-full max-w-md">
            <Link
                href="/"
                className="mb-10 inline-flex items-center gap-3 text-white lg:hidden"
            >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-black text-black">
                    LB
                </span>

                <span className="text-lg font-black tracking-[-0.04em]">
                    LOS BOSS
                </span>
            </Link>

            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                    Bienvenido de nuevo
                </p>

                <h1 className="mt-3 text-[32px] font-black tracking-[-0.045em] text-white min-[430px]:text-4xl sm:text-5xl">
                    Inicia sesión
                </h1>

                <p className="mt-2 text-sm leading-6 text-zinc-500 sm:mt-3 sm:text-base sm:leading-7">
                    Ingresa tus datos para acceder a tu cuenta de
                    Los Boss.
                </p>
            </div>

            {error && (
                <Alert variant="error" className="mt-6">

                    <p>{error}</p>

                    {error.includes("verificar tu correo") && (
                        <Link
                            href={`/reenviar-verificacion?email=${encodeURIComponent(email)}`}
                            className="mt-4 inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition"
                        >
                            Reenviar correo de verificación
                        </Link>
                    )}

                </Alert>
            )}

            <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5 sm:mt-8"
            >
                <Input
                    id="email"
                    label="Correo electrónico"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={Mail}
                />

                <div>
                    <div className="mb-2 flex items-center justify-between">

                        <label className="text-sm font-medium text-zinc-300">
                            Contraseña
                        </label>

                        <Link
                            href="/recuperar-password"
                            className="text-xs font-medium text-zinc-500 hover:text-white transition"
                        >
                            ¿La olvidaste?
                        </Link>

                    </div>

                    <PasswordInput
                        id="password"
                        label=""
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        placeholder="••••••••"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={googleLoading}
                    loading={loading}
                    loadingText="Iniciando sesión..."
                    rightIcon={
                        <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                        />
                    }
                >
                    Iniciar sesión
                </Button>
            </form>

            <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />

                <Divider>
                    o continúa con
                </Divider>

                <div className="h-px flex-1 bg-white/10" />
            </div>

            <Button
                type="button"
                variant="secondary"
                onClick={handleGoogleLogin}
                disabled={loading}
                loading={googleLoading}
                loadingText="Conectando con Google..."
                leftIcon={
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                        G
                    </span>
                }
            >
                Continuar con Google
            </Button>

            <p className="mt-8 text-center text-sm leading-6 text-zinc-500">
                ¿Todavía no tienes una cuenta?{" "}
                <Link
                    href="/registro"
                    className="font-semibold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
                >
                    Crear cuenta
                </Link>
            </p>
        </div>
    );
}