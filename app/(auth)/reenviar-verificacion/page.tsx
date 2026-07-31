import { Suspense } from "react";
import ReenviarVerificacionClient from "./ReenviarVerificacionClient";

function LoadingReenviarVerificacion() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
            <p className="animate-pulse text-sm text-zinc-400">
                Cargando...
            </p>
        </main>
    );
}

export default function ReenviarVerificacionPage() {
    return (
        <Suspense fallback={<LoadingReenviarVerificacion />}>
            <ReenviarVerificacionClient />
        </Suspense>
    );
}