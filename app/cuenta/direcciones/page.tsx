import Link from "next/link";
import {
    ArrowLeft,
    Check,
    MapPin,
    Plus,
    Star,
    Trash2,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
    eliminarDireccion,
    establecerDireccionPrincipal,
} from "@/lib/actions/address-actions";

export default async function DireccionesPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <main className="min-h-screen bg-black">
                <div className="mx-auto max-w-md px-4 py-24 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                        <MapPin size={26} className="text-zinc-400" />
                    </div>

                    <h1 className="mt-6 text-2xl font-bold text-white">
                        Inicia sesión para ver tus direcciones
                    </h1>

                    <p className="mt-3 text-zinc-500">
                        Guarda tus datos de entrega para comprar más rápido.
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

    const direcciones = await prisma.address.findMany({
        where: {
            userId: session.user.id,
            isSaved: true,
        },
        orderBy: [
            {
                isDefault: "desc",
            },
            {
                createdAt: "asc",
            },
        ],
    });

    return (
        <main className="min-h-screen bg-black">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                <Link
                    href="/cuenta"
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
                >
                    <ArrowLeft size={16} />
                    Volver a mi cuenta
                </Link>

                <div className="mt-6 flex flex-col gap-5 sm:mt-8 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                            Tu cuenta
                        </p>

                        <h1 className="mt-3 text-3xl font-black tracking-tight text-white min-[430px]:text-4xl sm:text-5xl">
                            Mis direcciones
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
                            Guarda varias direcciones y elige cuál usar como principal
                            para tus próximas compras.
                        </p>
                    </div>

                    <Link
                        href="/cuenta/direcciones/nueva"
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-black transition hover:bg-zinc-200 sm:w-auto"
                    >
                        <Plus size={17} />
                        Agregar dirección
                    </Link>
                </div>

                {direcciones.length === 0 ? (
                    <section className="mt-8 rounded-3xl border border-white/10 bg-[#0d0d0d] px-5 py-14 text-center shadow-[0_30px_80px_rgba(0,0,0,.3)] sm:mt-10 sm:px-8 sm:py-20">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                            <MapPin size={27} className="text-zinc-500" />
                        </div>

                        <h2 className="mt-6 text-2xl font-black tracking-tight text-white min-[430px]:text-3xl">
                            Todavía no tienes direcciones guardadas
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500 sm:text-base">
                            Agrega una dirección para completar tus compras más rápido.
                            La primera se establecerá automáticamente como principal.
                        </p>

                        <Link
                            href="/cuenta/direcciones/nueva"
                            className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:w-auto"
                        >
                            <Plus size={17} />
                            Agregar mi primera dirección
                        </Link>
                    </section>
                ) : (
                    <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2">
                        {direcciones.map((direccion) => (
                            <article
                                key={direccion.id}
                                className={`
                                    rounded-3xl
                                    border
                                    bg-[#0d0d0d]
                                    p-5
                                    shadow-[0_25px_70px_rgba(0,0,0,.25)]
                                    transition
                                    sm:p-7
                                    ${direccion.isDefault
                                        ? "border-white/30"
                                        : "border-white/10 hover:border-white/20"
                                    }
                                `}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0"> 
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                                                {direccion.label || "Dirección"}
                                            </p>

                                            {direccion.isDefault && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
                                                    <Star
                                                        size={11}
                                                        className="fill-black"
                                                    />
                                                    Principal
                                                </span>
                                            )}
                                        </div>

                                        <h2 className="mt-4 break-words text-lg font-bold text-white sm:text-xl">
                                            {direccion.fullName}
                                        </h2>
                                    </div>

                                    <div
                                        className={`
                                            flex
                                            h-11
                                            w-11
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            ${direccion.isDefault
                                                ? "bg-white text-black"
                                                : "bg-white/[0.04] text-zinc-400"
                                            }
                                        `}
                                    >
                                        {direccion.isDefault ? (
                                            <Check size={19} strokeWidth={3} />
                                        ) : (
                                            <MapPin size={19} />
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2 text-sm leading-7 text-zinc-500">
                                    <p className="text-zinc-300">
                                        {direccion.phone}
                                    </p>

                                    <p className="break-words">{direccion.street}</p>

                                    <p className="break-words">
                                        {direccion.city}, {direccion.state}
                                    </p>

                                    <p className="break-words">
                                        C.P. {direccion.postalCode},{" "}
                                        {direccion.country}
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:mt-7 sm:flex-row">
                                    {!direccion.isDefault && (
                                        <form
                                            action={async () => {
                                                "use server";
                                                await establecerDireccionPrincipal(
                                                    direccion.id
                                                );
                                            }}
                                            className="flex-1"
                                        >
                                            <button
                                                type="submit"
                                                className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white/30 hover:bg-white/[0.04] hover:text-white"
                                            >
                                                Hacer principal
                                            </button>
                                        </form>
                                    )}

                                    <Link
                                        href={`/cuenta/direcciones/${direccion.id}/editar`}
                                        className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-zinc-300 transition hover:border-white/30 hover:bg-white/[0.04] hover:text-white"
                                    >
                                        Editar
                                    </Link>

                                    <form
                                        action={async () => {
                                            "use server";
                                            await eliminarDireccion(direccion.id);
                                        }}
                                    >
                                        <button
                                            type="submit"
                                            aria-label={`Eliminar ${direccion.label || "dirección"}`}
                                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 sm:w-12 sm:px-0"
                                        >
                                            <Trash2 size={16} />
                                            <span className="sm:hidden">
                                                Eliminar
                                            </span>
                                        </button>
                                    </form>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}