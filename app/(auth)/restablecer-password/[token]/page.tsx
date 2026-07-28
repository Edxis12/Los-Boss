"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (password.length < 8) {
            setError("La contraseña debe tener mínimo 8 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/restablecer-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            setSuccess(true);

            setTimeout(() => {
                router.push("/login");
            }, 3000);

        } catch {
            setError("Ocurrió un error.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-6">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.08),transparent_60%)]" />

            <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 shadow-[0_40px_120px_rgba(0,0,0,.7)]">

                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white"
                >
                    <ArrowLeft size={16} />
                    Volver al Login
                </Link>

                <h1 className="mt-8 text-4xl font-black text-white">
                    Nueva contraseña
                </h1>

                <p className="mt-3 text-zinc-500">
                    Escribe una contraseña nueva para tu cuenta.
                </p>

                {success ? (
                    <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">

                        <div className="flex gap-3">

                            <CheckCircle2 className="text-emerald-400" />

                            <div>

                                <h2 className="font-bold text-white">
                                    Contraseña actualizada
                                </h2>

                                <p className="mt-2 text-sm text-zinc-400">
                                    Ahora serás redirigido al inicio de sesión.
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
                            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-300 text-sm">
                                {error}
                            </div>
                        )}

                        <div>

                            <label className="text-sm text-zinc-300">
                                Nueva contraseña
                            </label>

                            <div className="relative mt-2">

                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-14 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-12 text-white outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                                >
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>

                            </div>

                        </div>

                        <div>

                            <label className="text-sm text-zinc-300">
                                Confirmar contraseña
                            </label>

                            <div className="relative mt-2">

                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />

                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e)=>setConfirmPassword(e.target.value)}
                                    className="h-14 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-12 text-white outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                                >
                                    {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>

                            </div>

                        </div>

                        <button
                            disabled={loading}
                            className="h-14 w-full rounded-xl bg-white font-bold text-black transition hover:bg-zinc-200 disabled:opacity-50"
                        >
                            {loading
                                ? "Actualizando..."
                                : "Actualizar contraseña"}
                        </button>

                    </form>

                )}

            </div>

        </main>
    );
}