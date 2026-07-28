"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
    const { token } = useParams<{ token: string }>();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function verifyEmail() {
            try {
                const response = await fetch("/api/auth/verificar-correo", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setSuccess(false);
                    setMessage(
                        data.error ??
                        "No fue posible verificar tu correo."
                    );
                } else {
                    setSuccess(true);
                    setMessage(
                        "Tu correo electrónico ha sido verificado correctamente."
                    );
                }
            } catch {
                setSuccess(false);
                setMessage(
                    "Ocurrió un error al verificar tu correo."
                );
            } finally {
                setLoading(false);
            }
        }

        if (token) {
            verifyEmail();
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">

                {loading ? (
                    <>
                        <Loader2 className="w-16 h-16 animate-spin text-white mx-auto" />

                        <h1 className="text-3xl font-bold text-white mt-6">
                            Verificando...
                        </h1>

                        <p className="text-zinc-400 mt-4">
                            Espera un momento.
                        </p>
                    </>
                ) : success ? (
                    <>
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />

                        <h1 className="text-3xl font-bold text-white mt-6">
                            ¡Correo verificado!
                        </h1>

                        <p className="text-zinc-400 mt-4 leading-7">
                            {message}
                        </p>

                        <Link
                            href="/login"
                            className="mt-8 inline-flex bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-zinc-200 transition"
                        >
                            Iniciar sesión
                        </Link>
                    </>
                ) : (
                    <>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto" />

                        <h1 className="text-3xl font-bold text-white mt-6">
                            No fue posible verificar
                        </h1>

                        <p className="text-zinc-400 mt-4 leading-7">
                            {message}
                        </p>

                        <Link
                            href="/login"
                            className="mt-8 inline-flex bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-zinc-200 transition"
                        >
                            Volver al inicio de sesión
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}