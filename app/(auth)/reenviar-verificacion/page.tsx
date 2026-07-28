"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ResendVerificationPage() {
    const searchParams = useSearchParams();

    const [email, setEmail] = useState(
        searchParams.get("email") ?? ""
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                "/api/auth/reenviar-verificacion",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            setSuccess(data.message);
        } catch {
            setError(
                "Ocurrió un error al reenviar el correo."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-8 shadow-2xl">

                <div className="mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center mb-5">
                        {success ? <CheckCircle2 /> : <Mail />}
                    </div>

                    <h1 className="text-3xl font-black text-white">
                        Reenviar verificación
                    </h1>

                    <p className="mt-3 text-zinc-400 leading-7">
                        Introduce el correo con el que te registraste.
                        Si la cuenta aún no ha sido verificada,
                        enviaremos un nuevo enlace.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="space-y-5">

                        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-300 text-sm leading-6">
                            {success}
                        </div>

                        <Link
                            href="/login"
                            className="flex h-14 items-center justify-center rounded-xl bg-white font-semibold text-black hover:bg-zinc-200 transition"
                        >
                            Volver al inicio de sesión
                        </Link>

                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div>
                            <label className="text-sm text-zinc-300">
                                Correo electrónico
                            </label>

                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                className="mt-2 w-full h-14 rounded-xl bg-black/40 border border-white/10 px-4 text-white outline-none focus:border-white"
                                placeholder="tu@correo.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5" />
                                    Reenviar correo
                                </>
                            )}
                        </button>

                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver al inicio de sesión
                        </Link>
                    </form>
                )}
            </div>
        </main>
    );
}