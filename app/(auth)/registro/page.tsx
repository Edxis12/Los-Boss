"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Sparkles,
    UserRound,
} from "lucide-react";
import { registerUser } from "@/lib/actions/auth-actions";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const result = await registerUser({
                name,
                email,
                password,
            });

            if (result.error) {
                setError(result.error);
                return;
            }

            router.push(
                `/verificacion-enviada?email=${encodeURIComponent(
                    email.trim().toLowerCase()
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

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#050505] px-4 py-10 sm:px-6 lg:px-8">
            {/* Luces decorativas */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/10 blur-[140px]" />

                <div className="absolute bottom-[-180px] left-[-120px] h-[360px] w-[360px] rounded-full bg-zinc-700/20 blur-[140px]" />

                <div className="absolute right-[-140px] top-1/3 h-[340px] w-[340px] rounded-full bg-zinc-800/30 blur-[130px]" />
            </div>

            <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] shadow-[0_30px_100px_rgba(0,0,0,0.65)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
                    {/* Panel izquierdo */}
                    <section className="relative hidden min-h-[720px] overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between lg:p-12">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%),linear-gradient(145deg,#101010,#050505_70%)]" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-300">
                                <Sparkles className="h-4 w-4" />
                                Los Boss
                            </div>

                            <h1 className="mt-10 max-w-xl text-5xl font-black leading-[1.05] tracking-[-0.04em] text-white">
                                Tu próxima compra comienza con una cuenta.
                            </h1>

                            <p className="mt-6 max-w-lg text-base leading-8 text-zinc-400">
                                Regístrate para guardar productos, administrar tus
                                pedidos y disfrutar una experiencia personalizada
                                dentro de Los Boss.
                            </p>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <Feature
                                icon={<ShieldCheck className="h-5 w-5" />}
                                title="Cuenta protegida"
                                description="Tu contraseña se almacena de forma segura y tu correo debe verificarse."
                            />

                            <Feature
                                icon={<LockKeyhole className="h-5 w-5" />}
                                title="Acceso privado"
                                description="Tus favoritos, carrito y pedidos estarán vinculados únicamente a tu cuenta."
                            />

                            <Feature
                                icon={<Mail className="h-5 w-5" />}
                                title="Verificación por correo"
                                description="Recibirás un enlace para confirmar que realmente tienes acceso a tu correo."
                            />
                        </div>

                        <p className="relative z-10 text-xs leading-6 text-zinc-600">
                            Al crear una cuenta aceptas el uso de tus datos para
                            operar las funciones principales de la tienda.
                        </p>
                    </section>

                    {/* Formulario */}
                    <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
                        <div className="w-full max-w-md">
                            <div className="mb-8 lg:hidden">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-300">
                                    <Sparkles className="h-4 w-4" />
                                    Los Boss
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-zinc-500">
                                    Bienvenido a Los Boss
                                </p>

                                <h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-white">
                                    Crea tu cuenta
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-zinc-400">
                                    Completa tus datos y después verifica tu correo
                                    electrónico.
                                </p>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
                                >
                                    {error}
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="mt-8 space-y-5"
                            >
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Nombre completo
                                    </label>

                                    <div className="group relative">
                                        <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition group-focus-within:text-white" />

                                        <input
                                            id="name"
                                            type="text"
                                            required
                                            autoComplete="name"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.045] pl-12 pr-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:bg-white/[0.07] focus:ring-4 focus:ring-white/5"
                                            placeholder="Edgar Murillo"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-medium text-zinc-300"
                                    >
                                        Correo electrónico
                                    </label>

                                    <div className="group relative">
                                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition group-focus-within:text-white" />

                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.045] pl-12 pr-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:bg-white/[0.07] focus:ring-4 focus:ring-white/5"
                                            placeholder="tu@correo.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-4">
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-zinc-300"
                                        >
                                            Contraseña
                                        </label>

                                        <span className="text-xs text-zinc-600">
                                            Mínimo 8 caracteres
                                        </span>
                                    </div>

                                    <div className="group relative">
                                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition group-focus-within:text-white" />

                                        <input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            required
                                            minLength={8}
                                            autoComplete="new-password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.045] pl-12 pr-12 text-white outline-none transition placeholder:text-zinc-600 focus:border-white/30 focus:bg-white/[0.07] focus:ring-4 focus:ring-white/5"
                                            placeholder="Crea una contraseña segura"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (current) => !current
                                                )
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Ocultar contraseña"
                                                    : "Mostrar contraseña"
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Creando cuenta...
                                        </>
                                    ) : (
                                        <>
                                            Crear cuenta
                                            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="my-7 flex items-center gap-4">
                                <div className="h-px flex-1 bg-white/10" />

                                <span className="text-xs uppercase tracking-[0.25em] text-zinc-600">
                                    o continúa con
                                </span>

                                <div className="h-px flex-1 bg-white/10" />
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    signIn("google", {
                                        callbackUrl: "/",
                                    })
                                }
                                disabled={loading}
                                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <GoogleIcon />
                                Continuar con Google
                            </button>

                            <p className="mt-8 text-center text-sm text-zinc-500">
                                ¿Ya tienes una cuenta?{" "}
                                <Link
                                    href="/login"
                                    className="font-semibold text-white underline decoration-zinc-700 underline-offset-4 transition hover:decoration-white"
                                >
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

function Feature({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                {icon}
            </div>

            <div>
                <h3 className="font-semibold text-white">{title}</h3>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5"
        >
            <path
                fill="currentColor"
                d="M21.6 12.227c0-.709-.064-1.391-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.51h3.232c1.891-1.741 2.982-4.305 2.982-7.35Z"
            />
            <path
                fill="currentColor"
                d="M12 22c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.041.955-3.386.955-2.605 0-4.81-1.76-5.6-4.123H3.06v2.591A9.997 9.997 0 0 0 12 22Z"
                opacity=".8"
            />
            <path
                fill="currentColor"
                d="M6.4 13.9A6.01 6.01 0 0 1 6.086 12c0-.659.114-1.3.314-1.9V7.509H3.06A9.997 9.997 0 0 0 2 12c0 1.614.386 3.141 1.06 4.491L6.4 13.9Z"
                opacity=".65"
            />
            <path
                fill="currentColor"
                d="M12 5.977c1.468 0 2.786.505 3.823 1.495l2.868-2.868C16.96 2.991 14.696 2 12 2a9.997 9.997 0 0 0-8.94 5.509L6.4 10.1C7.19 7.736 9.395 5.977 12 5.977Z"
                opacity=".9"
            />
        </svg>
    );
}