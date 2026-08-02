"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-6">
            <div className="max-w-xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">
                    Error
                </p>

                <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
                    Ocurrió un problema
                </h1>

                <p className="mt-5 text-base leading-7 text-zinc-400">
                    Ha ocurrido un error inesperado. Intenta nuevamente.
                </p>

                <button
                    onClick={reset}
                    className="
                        mt-10
                        rounded-xl
                        bg-white
                        px-6
                        py-3
                        font-semibold
                        text-black
                        transition
                        hover:scale-[1.03]
                    "
                >
                    Intentar de nuevo
                </button>
            </div>
        </main>
    );
}