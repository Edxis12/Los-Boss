import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
    searchParams: Promise<{
        orden?: string;
    }>;
};

export default async function ConfirmacionPedidoPage({
    searchParams,
}: PageProps) {
    const { orden } = await searchParams;
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center">
                <h1 className="mb-2 text-2xl font-bold text-white">
                    Inicia sesión para consultar tu pedido
                </h1>

                <Link
                    href="/login"
                    className="mt-4 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
                >
                    Iniciar sesión
                </Link>
            </div>
        );
    }

    if (!orden) {
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center">
                <h1 className="mb-2 text-2xl font-bold text-white">
                    No encontramos el número de pedido
                </h1>

                <Link
                    href="/cuenta/pedidos"
                    className="mt-4 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
                >
                    Ver mis pedidos
                </Link>
            </div>
        );
    }

    const pedido = await prisma.order.findFirst({
        where: {
            orderNumber: orden,
            userId: session.user.id,
        },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            images: {
                                take: 1,
                                orderBy: {
                                    position: "asc",
                                },
                            },
                        },
                    },
                    variant: true,
                },
            },
        },
    });

    if (!pedido) {
        return (
            <div className="mx-auto max-w-md px-4 py-24 text-center">
                <h1 className="mb-2 text-2xl font-bold text-white">
                    No pudimos encontrar este pedido
                </h1>

                <p className="mb-6 text-zinc-400">
                    Revisa tus pedidos para consultar la información disponible.
                </p>

                <Link
                    href="/cuenta/pedidos"
                    className="inline-block rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
                >
                    Ver mis pedidos
                </Link>
            </div>
        );
    }

    const totalPiezas = pedido.items.reduce(
        (
            total: number,
            item: typeof pedido.items[number]
        ) => total + item.quantity,
        0
    );

    return (
        <main className="min-h-screen bg-black">
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] shadow-[0_35px_100px_rgba(0,0,0,.45)]">
                    <div className="border-b border-white/10 px-6 py-10 text-center sm:px-10">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                            <CheckCircle2
                                size={42}
                                className="text-emerald-400"
                            />
                        </div>

                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-400">
                            Pedido registrado
                        </p>

                        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                            ¡Pedido confirmado!
                        </h1>

                        <p className="mt-4 text-zinc-400">
                            Gracias por tu compra. Nos pondremos en contacto contigo
                            para coordinar el pago y la entrega.
                        </p>

                        <div className="mx-auto mt-6 w-fit rounded-full border border-white/10 bg-white/[0.04] px-5 py-2">
                            <span className="text-sm text-zinc-500">
                                Número de pedido:
                            </span>{" "}
                            <span className="font-bold text-white">
                                {pedido.orderNumber}
                            </span>
                        </div>
                    </div>

                    <div className="px-6 py-8 sm:px-10">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                                    Tu compra
                                </p>

                                <h2 className="mt-1 text-2xl font-bold text-white">
                                    Resumen del pedido
                                </h2>
                            </div>

                            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
                                {totalPiezas}{" "}
                                {totalPiezas === 1 ? "pieza" : "piezas"}
                            </span>
                        </div>

                        <div className="space-y-5">
                            {pedido.items.map(
                                (item: typeof pedido.items[number]) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 border-b border-white/10 pb-5 last:border-0"
                                    >
                                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
                                            {item.product?.images[0]?.url ? (
                                                <Image
                                                    src={item.product.images[0].url}
                                                    alt={
                                                        item.product.name ??
                                                        "Producto"
                                                    }
                                                    fill
                                                    className="object-contain p-2"
                                                    sizes="96px"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                                                    Sin imagen
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-white">
                                                {item.product?.name ??
                                                    "Producto no disponible"}
                                            </p>

                                            {(item.variant?.color ||
                                                item.variant?.size) && (
                                                    <p className="mt-1 text-sm text-zinc-500">
                                                        {[
                                                            item.variant.color,
                                                            item.variant.size,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" / ")}
                                                    </p>
                                                )}

                                            <div className="mt-4 flex items-end justify-between gap-4">
                                                <p className="text-sm text-zinc-500">
                                                    $
                                                    {Number(
                                                        item.price
                                                    ).toLocaleString("es-MX")}{" "}
                                                    × {item.quantity}
                                                </p>

                                                <p className="font-bold text-white">
                                                    $
                                                    {(
                                                        Number(item.price) *
                                                        item.quantity
                                                    ).toLocaleString("es-MX")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="mt-7 flex items-end justify-between border-t border-white/10 pt-6">
                            <span className="font-semibold text-white">
                                Total
                            </span>

                            <span className="text-3xl font-black tracking-tight text-white">
                                ${Number(pedido.total).toLocaleString("es-MX")}
                            </span>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                                <ShieldCheck
                                    size={19}
                                    className="shrink-0 text-zinc-300"
                                />
                                <span className="text-xs text-zinc-500">
                                    Información protegida
                                </span>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                                <PackageCheck
                                    size={19}
                                    className="shrink-0 text-zinc-300"
                                />
                                <span className="text-xs text-zinc-500">
                                    Productos revisados
                                </span>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                                <Truck
                                    size={19}
                                    className="shrink-0 text-zinc-300"
                                />
                                <span className="text-xs text-zinc-500">
                                    Entrega coordinada
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-2">
                            <Link
                                href="/cuenta/pedidos"
                                className="rounded-2xl bg-white py-4 text-center font-bold text-black transition hover:bg-zinc-200"
                            >
                                Ver mis pedidos
                            </Link>

                            <Link
                                href="/productos"
                                className="rounded-2xl border border-zinc-700 py-4 text-center font-semibold text-white transition hover:border-white hover:bg-white/[0.04]"
                            >
                                Seguir comprando
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}