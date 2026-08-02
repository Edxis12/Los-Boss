import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-6">
            <div className="max-w-xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">
                    Error 404
                </p>

                <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
                    Página no encontrada
                </h1>

                <p className="mt-5 text-base leading-7 text-zinc-400">
                    La página que buscas no existe o fue movida.
                </p>

                <div className="mt-10 flex justify-center">
                    <Link
                        href="/"
                        className="
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
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </main>
    );
}