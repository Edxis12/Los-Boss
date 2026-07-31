"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";

export default function VerificationSentPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">

                <div className="flex justify-center mb-6">
                    <div className="bg-white rounded-full p-4">
                        <Mail className="w-8 h-8 text-black" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-white">
                    Revisa tu correo
                </h1>

                <p className="text-zinc-400 mt-5 leading-7">
                    Hemos enviado un enlace de verificación a:
                </p>

                <p className="mt-2 text-white font-semibold break-all">
                    {email}
                </p>

                <p className="mt-6 text-zinc-500 text-sm leading-6">
                    Haz clic en el enlace recibido para activar tu cuenta.
                    Si no encuentras el correo, revisa tu carpeta de spam.
                </p>

                <Link
                    href="/login"
                    className="mt-8 inline-flex bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition"
                >
                    Ir al inicio de sesión
                </Link>
            </div>
        </div>
    );
}