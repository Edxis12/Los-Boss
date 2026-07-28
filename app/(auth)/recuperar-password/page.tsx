"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Mail,
    ShieldCheck,
} from "lucide-react";

export default function RecuperarPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/recuperar-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Ocurrió un error.");
                return;
            }

            setSuccess(true);
        } catch {
            setError("No fue posible enviar el correo.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-black">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/[0.045] blur-[140px]" />

                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:42px_42px]" />
            </div>

            <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0b0b] p-4 shadow-[0_40px_120px_rgba(0,0,0,.7)] min-[430px]:rounded-3xl min-[430px]:p-6 sm:p-10">

                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Volver al inicio de sesión
                    </Link>

                    <div className="mt-7">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                            Recuperación
                        </p>

                        <h1 className="mt-3 text-[30px] font-black tracking-tight text-white min-[430px]:text-4xl sm:text-5xl">
                            ¿Olvidaste tu contraseña?
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-zinc-500 sm:mt-3 sm:text-base sm:leading-7">
                            Escribe el correo asociado a tu cuenta y te
                            enviaremos un enlace para crear una nueva contraseña.
                        </p>
                    </div>

                    {success ? (
                        <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">

                            <div className="flex items-start gap-3">
                                <CheckCircle2
                                    size={22}
                                    className="mt-0.5 shrink-0 text-emerald-400"
                                />

                                <div>
                                    <h2 className="font-bold text-white">
                                        Revisa tu correo
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                                        Si existe una cuenta asociada a esa
                                        dirección, te enviaremos un enlace para
                                        restablecer tu contraseña.
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/login"
                                className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-white text-sm font-bold text-black transition hover:bg-zinc-200 sm:min-h-14 sm:rounded-2xl"
                            >
                                Volver al Login
                            </Link>

                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 space-y-6"
                        >
                            {error && (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                                    <p className="text-sm text-red-300">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-zinc-300">
                                    Correo electrónico
                                </label>

                                <div className="relative mt-2">
                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                                    />

                                    <input
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="correo@ejemplo.com"
                                        className="h-14 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white focus:ring-4 focus:ring-white/10"
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 sm:rounded-2xl sm:p-5">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck
                                        size={20}
                                        className="mt-0.5 shrink-0 text-zinc-300"
                                    />

                                    <p className="text-sm leading-6 text-zinc-500">
                                        Por seguridad, siempre mostraremos el
                                        mismo mensaje aunque el correo no exista.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-black shadow-[0_18px_40px_rgba(255,255,255,.12)] transition-all hover:-translate-y-0.5 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-14 sm:rounded-2xl sm:text-base"
                            >
                                {loading
                                    ? "Enviando..."
                                    : "Enviar enlace"}

                                {!loading && (
                                    <ArrowRight
                                        size={18}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}