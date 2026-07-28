"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCartStore, useCartUserKey } from "@/store/cart-store";
import { validarStockCarrito, type ResultadoStockCarrito } from "@/lib/actions/order-actions";

export default function CarritoPage() {
    const { data: session } = useSession();
    const userKey = useCartUserKey(session?.user?.id);

    const items = useCartStore((state) => state.getItems(userKey));
    const totalPrice = useCartStore((state) => state.getTotalPrice(userKey));
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);

    const [mounted, setMounted] = useState(false);
    const [validandoStock, setValidandoStock] = useState(false);
    const [stockPorVariante, setStockPorVariante] = useState<Record<string, ResultadoStockCarrito>>({});
    const [avisoStock, setAvisoStock] = useState("");

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!mounted || items.length === 0) {
            setStockPorVariante({});
            setValidandoStock(false);
            return;
        }

        let cancelado = false;
        let validacionEnCurso = false;
        let temporizadorAviso: ReturnType<typeof setTimeout> | null = null;

        async function comprobarStock() {
            if (validacionEnCurso) return;

            validacionEnCurso = true;
            setValidandoStock(true);

            try {
                const resultados = await validarStockCarrito(
                    items.map((item) => ({
                        variantId: item.variantId,
                        quantity: item.quantity,
                    }))
                );

                if (cancelado) return;

                const siguienteStock: Record<
                    string,
                    ResultadoStockCarrito
                > = {};

                const productosEliminados: string[] = [];
                const cantidadesAjustadas: string[] = [];

                for (const resultado of resultados) {
                    siguienteStock[resultado.variantId] = resultado;

                    if (
                        !resultado.existe ||
                        !resultado.productoActivo ||
                        resultado.stockActual <= 0
                    ) {
                        removeItem(userKey, resultado.variantId);
                        productosEliminados.push(resultado.nombreProducto);
                        continue;
                    }

                    if (
                        resultado.cantidadSolicitada >
                        resultado.stockActual
                    ) {
                        updateQuantity(
                            userKey,
                            resultado.variantId,
                            resultado.stockActual
                        );

                        cantidadesAjustadas.push(
                            `${resultado.nombreProducto}: ahora ${resultado.stockActual}`
                        );
                    }
                }

                setStockPorVariante(siguienteStock);

                let nuevoAviso = "";

                if (productosEliminados.length > 0) {
                    nuevoAviso =
                        productosEliminados.length === 1
                            ? `${productosEliminados[0]} se eliminó porque ya no tiene existencias.`
                            : "Algunos productos se eliminaron porque ya no tienen existencias.";
                } else if (cantidadesAjustadas.length > 0) {
                    nuevoAviso =
                        cantidadesAjustadas.length === 1
                            ? `Actualizamos la cantidad de ${cantidadesAjustadas[0]}.`
                            : "Actualizamos algunas cantidades según el stock disponible.";
                }

                if (nuevoAviso) {
                    setAvisoStock(nuevoAviso);

                    temporizadorAviso = setTimeout(() => {
                        if (!cancelado) {
                            setAvisoStock("");
                        }
                    }, 6000);
                }
            } catch {
                if (!cancelado) {
                    setAvisoStock(
                        "No pudimos verificar las existencias en este momento."
                    );
                }
            } finally {
                validacionEnCurso = false;

                if (!cancelado) {
                    setValidandoStock(false);
                }
            }
        }

        void comprobarStock();

        // Revisa nuevamente cada 10 segundos.
        const intervalo = setInterval(() => {
            void comprobarStock();
        }, 10000);

        // Revisa inmediatamente cuando el usuario vuelve a la pestaña.
        function comprobarAlVolver() {
            if (document.visibilityState === "visible") {
                void comprobarStock();
            }
        }

        document.addEventListener(
            "visibilitychange",
            comprobarAlVolver
        );

        window.addEventListener("focus", comprobarAlVolver);

        return () => {
            cancelado = true;

            clearInterval(intervalo);

            if (temporizadorAviso) {
                clearTimeout(temporizadorAviso);
            }

            document.removeEventListener(
                "visibilitychange",
                comprobarAlVolver
            );

            window.removeEventListener("focus", comprobarAlVolver);
        };
    }, [
        mounted,
        items,
        userKey,
        removeItem,
        updateQuantity,
    ]);



    // Mientras no esté montado en el cliente, no sabemos qué hay en localStorage,
    // así que mostramos un estado neutro para evitar el mismatch de hidratación.
    if (!mounted) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">                <div className="h-8 w-48 bg-zinc-900 rounded animate-pulse mb-8" />
                <div className="space-y-4">
                    <div className="h-28 bg-zinc-900 rounded-xl animate-pulse" />
                    <div className="h-28 bg-zinc-900 rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-black">
                <div className="mx-auto flex min-h-[65vh] max-w-lg items-center px-4 py-14 sm:px-6 sm:py-20">
                    <div className="w-full rounded-3xl border border-white/10 bg-[#0d0d0d] px-5 py-12 text-center shadow-[0_25px_80px_rgba(0,0,0,.35)] sm:px-8 sm:py-16">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                            <ShoppingBag size={27} className="text-zinc-500" />
                        </div>

                        <h1 className="mt-6 text-2xl font-black tracking-tight text-white min-[430px]:text-3xl sm:text-4xl">
                            Tu carrito está vacío
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500 sm:text-base">
                            Explora el catálogo y agrega las piezas que quieras comprar.
                        </p>

                        <Link
                            href="/productos"
                            className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold text-black transition hover:bg-zinc-200 sm:w-auto"
                        >
                            Ver productos
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
            <div className="mb-6 sm:mb-10">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-600">
                    Tu compra
                </p>

                <h1 className="mt-2 text-[30px] font-black tracking-tight text-white min-[430px]:text-[36px] sm:text-4xl">                    Tu carrito
                </h1>

                <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                    {items.length}{" "}
                    {items.length === 1 ? "producto agregado" : "productos agregados"}
                </p>
            </div>

            {avisoStock && (
                <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                    {avisoStock}
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,.55fr)] lg:items-start lg:gap-10 xl:gap-14">
                {/* Lista de productos */}
                <div className="min-w-0 space-y-4">
                    {items.map((item) => {
                        const estadoStock = stockPorVariante[item.variantId];
                        const stockActual = estadoStock?.stockActual;

                        const llegoAlMaximo = typeof stockActual === "number" && item.quantity >= stockActual;

                        return (
                            <div
                                key={item.variantId}
                                className="
                                    grid
                                    grid-cols-[96px_minmax(0,1fr)]
                                    gap-3
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-[#0d0d0d]
                                    p-3
                                    transition-all
                                    duration-300
                                    hover:border-white/20
                                    hover:shadow-[0_20px_50px_rgba(0,0,0,.35)]
                                    min-[430px]:grid-cols-[110px_minmax(0,1fr)]
                                    min-[430px]:gap-4
                                    min-[430px]:rounded-3xl
                                    min-[430px]:p-4
                                    sm:gap-5
                                    sm:p-5
                                    md:grid-cols-[128px_minmax(0,1fr)_auto]
                                    md:items-start
                                    lg:p-6
                                "
                            >
                                <Link
                                    href={`/productos/${item.slug}`}
                                    className="
                                        relative
                                        aspect-square
                                        w-24
                                        overflow-hidden
                                        rounded-xl
                                        border
                                        border-zinc-200
                                        bg-[linear-gradient(180deg,#fafafa,#f2f2f2)]
                                        min-[430px]:w-[110px]
                                        min-[430px]:rounded-2xl
                                        md:w-32
                                    "
                                >
                                    {item.imageUrl && (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className="object-contain p-2 min-[430px]:p-3"
                                            sizes="(max-width: 429px) 96px, (max-width: 767px) 110px, 128px"
                                        />
                                    )}
                                </Link>

                                <div className="min-w-0">
                                    <Link
                                        href={`/productos/${item.slug}`}
                                        className="line-clamp-2 text-sm font-bold leading-5 tracking-tight text-white transition hover:text-zinc-300 min-[430px]:text-base min-[430px]:leading-6 sm:text-xl"                                    >
                                        {item.name}
                                    </Link>
                                    {(item.size || item.color) && (
                                        <p className="mt-1 text-xs text-zinc-400 min-[430px]:text-sm">
                                            {[item.color, item.size].filter(Boolean).join(" / ")}
                                        </p>
                                    )}
                                    <p className="mt-1.5 text-base font-black tracking-tight text-white min-[430px]:text-lg sm:text-xl">
                                        ${item.price.toLocaleString("es-MX")}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2 min-[430px]:mt-4 min-[430px]:gap-3">
                                        <div className="flex items-center rounded-full border border-white/15 bg-black/20 overflow-hidden">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        userKey,
                                                        item.variantId,
                                                        item.quantity - 1
                                                    )
                                                }
                                                className="flex h-9 w-9 items-center justify-center text-zinc-300 transition hover:bg-white hover:text-black min-[430px]:h-10 min-[430px]:w-10"
                                                aria-label="Disminuir cantidad"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-semibold text-white min-[430px]:w-10 min-[430px]:text-base">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        userKey,
                                                        item.variantId,
                                                        item.quantity + 1
                                                    )
                                                }
                                                disabled={validandoStock || llegoAlMaximo}
                                                className="
                                                    flex
                                                    h-9
                                                    w-9
                                                    items-center
                                                    justify-center
                                                    text-zinc-300
                                                    transition
                                                    hover:bg-white
                                                    hover:text-black
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-30
                                                    disabled:hover:bg-transparent
                                                    disabled:hover:text-zinc-300
                                                    min-[430px]:h-10
                                                    min-[430px]:w-10
                                                    "
                                                aria-label="Aumentar cantidad"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>



                                        <button
                                            onClick={() => removeItem(userKey, item.variantId)}
                                            className="flex h-9 w-9 items-center justify-center text-zinc-500 transition hover:text-red-400 min-[430px]:h-10 min-[430px]:w-10"
                                            aria-label="Eliminar producto"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    {typeof stockActual === "number" &&
                                        stockActual > 0 &&
                                        stockActual <= 3 && (
                                            <p className="mt-2 text-xs text-amber-400">
                                                Solo quedan {stockActual} disponibles
                                            </p>
                                        )}
                                </div>

                                <div className="col-span-2 flex items-center justify-between border-t border-white/10 pt-3 md:col-span-1 md:block md:border-0 md:pt-0 md:text-right">
                                    <span className="text-xs text-zinc-500 md:hidden">
                                        Total
                                    </span>

                                    <p className="whitespace-nowrap text-lg font-black tracking-tight text-white min-[430px]:text-xl sm:text-2xl">
                                        ${(item.price * item.quantity).toLocaleString("es-MX")}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Resumen */}
                <div className="h-fit rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 shadow-[0_30px_80px_rgba(0,0,0,.3)] min-[430px]:rounded-3xl min-[430px]:p-5 sm:p-6 lg:sticky lg:top-28 lg:p-8">
                    <h2 className="mb-4 text-base font-semibold text-white sm:text-lg">
                        Resumen
                    </h2>

                    <div className="flex justify-between text-sm text-zinc-300 mb-2">
                        <span>Subtotal</span>
                        <span>${totalPrice.toLocaleString("es-MX")}</span>
                    </div>
                    <div className="mb-4 flex items-start justify-between gap-4 text-sm text-zinc-400">
                        <span>Envío</span>
                        <span className="max-w-[170px] text-right">Se calcula en el checkout</span>
                    </div>

                    <div className="border-t border-zinc-800 pt-4 flex justify-between font-semibold text-white mb-6">
                        <span>Total</span>
                        <span>${totalPrice.toLocaleString("es-MX")}</span>
                    </div>

                    <Link
                        href="/checkout"
                        className="
                            flex
                            min-h-12
                            w-full
                            items-center
                            justify-center
                            rounded-xl
                            bg-white
                            px-5
                            text-center
                            text-sm
                            font-bold
                            text-black
                            shadow-[0_15px_35px_rgba(255,255,255,.18)]
                            transition-all
                            duration-300
                            hover:-translate-y-0.5
                            hover:bg-zinc-100
                            sm:min-h-14
                            sm:rounded-2xl
                            sm:text-base
                        "
                    >
                        Continuar al checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}