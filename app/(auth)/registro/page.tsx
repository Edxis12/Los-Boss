"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { registerUser } from "@/lib/actions/auth-actions";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await registerUser({ name, email, password });

        if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        // Después de crear la cuenta, lo logueamos automáticamente
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setLoading(false);
        router.push("/");
        router.refresh();
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-white mb-1">LOS BOSS</h1>
                <p className="text-zinc-400 mb-6">Crea tu cuenta</p>

                {error && (
                    <p className="bg-red-950 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-zinc-300">Nombre</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
                            placeholder="Tu nombre"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-zinc-300">Correo electrónico</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
                            placeholder="tu@correo.com"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-zinc-300">Contraseña</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
                            placeholder="Mínimo 8 caracteres"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-semibold rounded-lg py-2.5 hover:bg-zinc-200 transition disabled:opacity-50"
                    >
                        {loading ? "Creando cuenta..." : "Crear cuenta"}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-zinc-500 text-sm">o</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                </div>

                <button
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    className="w-full flex items-center justify-center gap-2 border border-zinc-700 rounded-lg py-2.5 text-white hover:bg-zinc-800 transition"
                >
                    Continuar con Google
                </button>

                <p className="text-zinc-400 text-sm text-center mt-6">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login" className="text-white underline">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}