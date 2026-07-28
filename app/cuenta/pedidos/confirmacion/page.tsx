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
            <div className="mx-auto flex min-h-[65vh] max-w-lg items-center px-4 py-14 text-center sm:px-6 sm:py-20">
                <h1 className="mb-3 text-2xl font-black tracking-tight text-white min-[430px]:text-3xl sm:text-4xl">
                    Inicia sesión para consultar tu pedido
                </h1>

                <Link
                    href="/login"
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:w-auto"
                >
                    Iniciar sesión
                </Link>
            </div>
        );
    }

    if (!orden) {
        return (
            <div className="mx-auto flex min-h-[65vh] max-w-lg items-center px-4 py-14 text-center sm:px-6 sm:py-20">
                <h1 className="mb-3 text-2xl font-black tracking-tight text-white min-[430px]:text-3xl sm:text-4xl">
                    No encontramos el número de pedido
                </h1>

                <Link
                    href="/cuenta/pedidos"
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:w-auto"
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
            <div className="mx-auto flex min-h-[65vh] max-w-lg items-center px-4 py-14 text-center sm:px-6 sm:py-20">
                <h1 className="mb-3 text-2xl font-black tracking-tight text-white min-[430px]:text-3xl sm:text-4xl">
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
            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
                <section className="overflow-hidden rounded-2xl min-[430px]:rounded-3xl border border-white/10 bg-[#0d0d0d] shadow-[0_35px_100px_rgba(0,0,0,.45)]">
                    <div className="border-b border-white/10 px-4 py-7 min-[430px]:px-5 min-[430px]:py-8 text-center min-[430px]:px-6 sm:px-10 sm:py-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 min-[430px]:h-20 min-[430px]:w-20">
                            <CheckCircle2
                                size={34}
                                className="text-emerald-400"
                            />
                        </div>

                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-400">
                            Pedido registrado
                        </p>

                        <h1 className="mt-3 text-[30px] font-black tracking-tight text-white min-[430px]:text-4xl sm:text-5xl">
                            ¡Pedido confirmado!
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7">
                            Gracias por tu compra. Nos pondremos en contacto contigo
                            para coordinar el pago y la entrega.
                        </p>

                        <div className="mx-auto mt-6 max-w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3">
                            <span className="text-sm text-zinc-500">
                                Número de pedido:
                            </span>{" "}
                            <span className="break-all font-bold text-white">
                                {pedido.orderNumber}
                            </span>
                        </div>
                    </div>

                    <div className="px-5 py-7 min-[430px]:px-6 sm:px-10 sm:py-8">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                                    Tu compra
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-white min-[430px]:text-2xl">
                                    Resumen del pedido
                                </h2>
                            </div>

                            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
                                {totalPiezas}{" "}
                                {totalPiezas === 1 ? "pieza" : "piezas"}
                            </span>
                        </div>

                        <div className="space-y-4 min-[430px]:space-y-5">
                            {pedido.items.map(
                                (item: typeof pedido.items[number]) => (
                                    <div
                                        key={item.id}
                                        className="grid gap-3 min-[430px]:gap-4 border-b border-white/10 pb-5 last:border-0 last:pb-0 min-[430px]:grid-cols-[80px_minmax(0,1fr)] sm:grid-cols-[96px_minmax(0,1fr)]"
                                    >
                                        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 min-[430px]:w-20 sm:w-24 sm:rounded-2xl">
                                            {item.product?.images[0]?.url ? (
                                                <Image
                                                    src={item.product.images[0].url}
                                                    alt={
                                                        item.product.name ??
                                                        "Producto"
                                                    }
                                                    fill
                                                    className="object-contain p-2"
                                                    sizes="(max-width:429px) 100vw, (max-width:639px) 80px, 96px"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                                                    Sin imagen
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="break-words font-semibold text-white">
                                                {item.product?.name ??
                                                    "Producto no disponible"}
                                            </p>

                                            {(item.variant?.color ||
                                                item.variant?.size) && (
                                                    <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                                                        {[
                                                            item.variant.color,
                                                            item.variant.size,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" / ")}
                                                    </p>
                                                )}

                                            <div className="mt-4 flex flex-col gap-1 min-[430px]:flex-row min-[430px]:items-end min-[430px]:justify-between min-[430px]:gap-4">
                                                <p className="text-sm text-zinc-500">
                                                    $
                                                    {Number(
                                                        item.price
                                                    ).toLocaleString("es-MX")}{" "}
                                                    × {item.quantity}
                                                </p>

                                                <p className="break-all font-bold text-white min-[430px]:shrink-0">
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

                        <div className="mt-7 flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-6">
                            <span className="font-semibold text-white">
                                Total
                            </span>

                            <span className="break-all text-[28px] font-black tracking-tight text-white min-[430px]:text-3xl">
                                ${Number(pedido.total).toLocaleString("es-MX")}
                            </span>
                        </div>

                        <div className="mt-8 grid gap-3 min-[430px]:grid-cols-2 sm:grid-cols-3">
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
                                href={`/cuenta/pedidos/${pedido.id}`}
                                className="flex min-h-12 sm:min-h-14 w-full items-center justify-center rounded-xl sm:rounded-2xl bg-white px-5 text-center text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200 sm:text-base"
                            >
                                Ver seguimiento del pedido
                            </Link>

                            <Link
                                href="/productos"
                                className="flex min-h-12 sm:min-h-14 w-full items-center justify-center rounded-xl sm:rounded-2xl border border-zinc-700 px-5 text-center text-sm font-semibold text-white transition hover:border-white hover:bg-white/[0.04] sm:text-base"
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