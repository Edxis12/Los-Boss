import Link from "next/link";
import {
    ArrowRight,
    Heart,
    MapPin,
    Package,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CuentaPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <main className="min-h-screen bg-black">
                <div className="mx-auto max-w-md px-4 py-24 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                        <UserRound size={27} className="text-zinc-400" />
                    </div>

                    <h1 className="mt-6 text-2xl font-bold text-white">
                        Inicia sesión para acceder a tu cuenta
                    </h1>

                    <p className="mt-3 text-zinc-500">
                        Consulta tus pedidos, favoritos y datos personales.
                    </p>

                    <Link
                        href="/login"
                        className="mt-7 inline-block rounded-2xl bg-white px-7 py-3.5 font-bold text-black transition hover:bg-zinc-200"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </main>
        );
    }

    const [pedidosCount, favoritosCount, direccionesCount] = await Promise.all([
        prisma.order.count({
            where: {
                userId: session.user.id,
            },
        }),
        prisma.favorite.count({
            where: {
                userId: session.user.id,
            },
        }),

        prisma.address.count({
            where: {
                userId: session.user.id,
                isSaved: true,
            },
        }),
    ]);

    return (
        <main className="min-h-screen bg-black">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                <div className="mb-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                        Tu espacio
                    </p>

                    <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                        Mi cuenta
                    </h1>

                    <p className="mt-3 text-zinc-500">
                        Administra tus compras y consulta tu actividad en Los Boss.
                    </p>
                </div>

                <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 shadow-[0_30px_80px_rgba(0,0,0,.3)] sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
                                <UserRound size={24} />
                            </div>

                            <div>
                                <p className="text-xl font-bold text-white">
                                    {session.user.name ?? "Usuario de Los Boss"}
                                </p>

                                <p className="mt-1 text-sm text-zinc-500">
                                    {session.user.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <ShieldCheck size={16} className="text-zinc-300" />
                            Cuenta protegida
                        </div>
                    </div>
                </section>

                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    <Link
                        href="/cuenta/pedidos"
                        className="group rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 shadow-[0_25px_70px_rgba(0,0,0,.25)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-8"
                    >
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                                <Package size={21} />
                            </div>

                            <ArrowRight
                                size={20}
                                className="text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-white"
                            />
                        </div>

                        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Compras
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-white">
                            Mis pedidos
                        </h2>

                        <p className="mt-3 leading-7 text-zinc-500">
                            Consulta estados, productos, direcciones y el seguimiento
                            completo de tus compras.
                        </p>

                        <p className="mt-7 text-sm font-semibold text-white">
                            {pedidosCount}{" "}
                            {pedidosCount === 1 ? "pedido registrado" : "pedidos registrados"}
                        </p>
                    </Link>

                    <Link
                        href="/favoritos"
                        className="group rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 shadow-[0_25px_70px_rgba(0,0,0,.25)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-8"
                    >
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                                <Heart size={21} />
                            </div>

                            <ArrowRight
                                size={20}
                                className="text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-white"
                            />
                        </div>

                        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Colección personal
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-white">
                            Mis favoritos
                        </h2>

                        <p className="mt-3 leading-7 text-zinc-500">
                            Encuentra rápidamente los productos que guardaste para
                            revisarlos más tarde.
                        </p>

                        <p className="mt-7 text-sm font-semibold text-white">
                            {favoritosCount}{" "}
                            {favoritosCount === 1
                                ? "producto guardado"
                                : "productos guardados"}
                        </p>
                    </Link>

                    <Link
                        href="/cuenta/direcciones"
                        className="group rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 shadow-[0_25px_70px_rgba(0,0,0,.25)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-8"
                    >
                        <div className="flex items-start justify-between gap-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                                <MapPin size={21} />
                            </div>

                            <ArrowRight size={20} className="text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-white" />
                        </div>

                        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Entregas
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-white">
                            Mis direcciones
                        </h2>

                        <p className="mt-3 leading-7 text-zinc-500">
                            Guarda, edita y elige la dirección principal para tus próximas
                            compras.
                        </p>

                        <p className="mt-7 text-sm font-semibold text-white">
                            {direccionesCount}{" "}
                            {direccionesCount === 1
                                ? "dirección guardada"
                                : "direcciones guardadas"}
                        </p>
                    </Link>
                </div>
            </div>
        </main>
    );
}