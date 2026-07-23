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
                <div className="w-full rounded-3xl border border-white/10 bg-[#0d0d0d] px-5 py-10 shadow-[0_25px_80px_rgba(0,0,0,.35)] sm:px-8 sm:py-14">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                        <UserRound size={27} className="text-zinc-400" />
                    </div>

                    <h1 className="mt-6 text-2xl font-black tracking-tight text-white min-[430px]:text-3xl sm:text-4xl">
                        Inicia sesión para acceder a tu cuenta
                    </h1>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500 sm:text-base">
                        Consulta tus pedidos, favoritos y datos personales.
                    </p>

                    <Link
                        href="/login"
                        className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:w-auto"
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
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                <div className="mb-8 sm:mb-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                        Tu espacio
                    </p>

                    <h1 className="mt-3 text-3xl font-black tracking-tight text-white min-[430px]:text-4xl sm:text-5xl">
                        Mi cuenta
                    </h1>

                    <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
                        Administra tus compras y consulta tu actividad en Los Boss.
                    </p>
                </div>

                <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-[0_30px_80px_rgba(0,0,0,.3)] sm:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-black sm:h-14 sm:w-14">
                                <UserRound size={24} />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-lg font-bold text-white sm:text-xl">
                                    {session.user.name ?? "Usuario de Los Boss"}
                                </p>

                                <p className="mt-1 truncate text-xs text-zinc-500 sm:text-sm">
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

                <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                    <Link
                        href="/cuenta/pedidos"
                        className="group rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,.25)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-8"
                    >
                        <div className="flex items-start justify-between gap-4 sm:gap-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black sm:h-12 sm:w-12">
                                <Package size={21} />
                            </div>

                            <ArrowRight
                                size={20}
                                className="text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-white"
                            />
                        </div>

                        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:mt-8 sm:text-xs sm:tracking-[0.3em]">
                            Compras
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                            Mis pedidos
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-zinc-500 sm:text-base">
                            Consulta estados, productos, direcciones y el seguimiento
                            completo de tus compras.
                        </p>

                        <p className="mt-6 text-sm font-semibold text-white sm:mt-7">
                            {pedidosCount}{" "}
                            {pedidosCount === 1 ? "pedido registrado" : "pedidos registrados"}
                        </p>
                    </Link>

                    <Link
                        href="/favoritos"
                        className="group rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,.25)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-8"
                    >
                        <div className="flex items-start justify-between gap-4 sm:gap-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black sm:h-12 sm:w-12">
                                <Heart size={21} />
                            </div>

                            <ArrowRight
                                size={20}
                                className="text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-white"
                            />
                        </div>

                        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:mt-8 sm:text-xs sm:tracking-[0.3em]">
                            Colección personal
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                            Mis favoritos
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-zinc-500 sm:text-base">
                            Encuentra rápidamente los productos que guardaste para
                            revisarlos más tarde.
                        </p>

                        <p className="mt-6 text-sm font-semibold text-white sm:mt-7">
                            {favoritosCount}{" "}
                            {favoritosCount === 1
                                ? "producto guardado"
                                : "productos guardados"}
                        </p>
                    </Link>

                    <Link
                        href="/cuenta/direcciones"
                        className="group rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,.25)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-8"
                    >
                        <div className="flex items-start justify-between gap-4 sm:gap-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black sm:h-12 sm:w-12">
                                <MapPin size={21} />
                            </div>

                            <ArrowRight size={20} className="text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-white" />
                        </div>

                        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 sm:mt-8 sm:text-xs sm:tracking-[0.3em]">
                            Entregas
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                            Mis direcciones
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-zinc-500 sm:text-base">
                            Guarda, edita y elige la dirección principal para tus próximas
                            compras.
                        </p>

                        <p className="mt-6 text-sm font-semibold text-white sm:mt-7">
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