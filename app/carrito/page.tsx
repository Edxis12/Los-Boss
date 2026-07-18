"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
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
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="h-8 w-48 bg-zinc-900 rounded animate-pulse mb-8" />
                <div className="space-y-4">
                    <div className="h-28 bg-zinc-900 rounded-xl animate-pulse" />
                    <div className="h-28 bg-zinc-900 rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Tu carrito está vacío
                </h1>
                <p className="text-zinc-400 mb-6">
                    Agrega productos para verlos aquí.
                </p>
                <Link
                    href="/productos"
                    className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition"
                >
                    Ver productos
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-bold text-white mb-8">
                Tu carrito ({items.length})
            </h1>

            {avisoStock && (
                <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                    {avisoStock}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-10">
                {/* Lista de productos */}
                <div className="md:col-span-2 space-y-4">
                    {items.map((item) => {
                        const estadoStock = stockPorVariante[item.variantId];
                        const stockActual = estadoStock?.stockActual;

                        const llegoAlMaximo = typeof stockActual === "number" && item.quantity >= stockActual;

                        return (
                            <div
                                key={item.variantId}
                                className="
                                flex 
                                gap-6 
                                rounded-3xl 
                                border
                                border-white/10
                                bg-[#0d0d0d]
                                p-6
                                transition-all
                                duration-300
                                hover:border-white/20
                                hover:shadow-[0_20px_50px_rgba(0,0,0,.35)]    
                            "
                            >
                                <Link
                                    href={`/productos/${item.slug}`}
                                    className="
                                    relative 
                                    w-32 
                                    h-32 
                                    rounded-2xl
                                    bg-[linear-gradient(180deg,#fafafa,#f2f2f2)]  
                                    border
                                    border-zinc-200
                                    shrink-0"
                                >
                                    {item.imageUrl && (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className="object-contain p-3"
                                            sizes="96px"
                                        />
                                    )}
                                </Link>

                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/productos/${item.slug}`}
                                        className="text-xl font-bold tracking-tight text-white hover:text-zinc-300 transition line-clamp-2"
                                    >
                                        {item.name}
                                    </Link>
                                    {(item.size || item.color) && (
                                        <p className="text-sm text-zinc-400 mt-0.5">
                                            {[item.color, item.size].filter(Boolean).join(" / ")}
                                        </p>
                                    )}
                                    <p className="mt-2 text-xl font-black tracking-tight text-white">
                                        ${item.price.toLocaleString("es-MX")}
                                    </p>

                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center rounded-full border border-white/15 bg-black/20 overflow-hidden">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        userKey,
                                                        item.variantId,
                                                        item.quantity - 1
                                                    )
                                                }
                                                className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:bg-white hover:text-black transition"
                                                aria-label="Disminuir cantidad"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-10 text-center font-semibold text-white">
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
                                                    h-10
                                                    w-10
                                                    items-center
                                                    justify-center
                                                    text-zinc-300
                                                    transition
                                                    hover:bg-white
                                                    hover:text-black
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-30
                                                    disabled:hover:bg-transparent
                                                    disabled:hover:text-zinc-300"
                                                aria-label="Aumentar cantidad"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>



                                        <button
                                            onClick={() => removeItem(userKey, item.variantId)}
                                            className="h-10 w-10 flex items-center justify-center hover:text-red-400 transition"
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

                                <p className="text-2xl font-black tracking-tight text-white whitespace-nowrap">
                                    ${(item.price * item.quantity).toLocaleString("es-MX")}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Resumen */}
                <div className="sticky top-28 h-fit rounded-3xl border border-white/10 bg-[#0d0d0d] p-8 shadow-[0_30px_80px_rgba(0,0,0,.3)]">
                    <h2 className="text-lg font-semibold text-white mb-4">Resumen</h2>

                    <div className="flex justify-between text-sm text-zinc-300 mb-2">
                        <span>Subtotal</span>
                        <span>${totalPrice.toLocaleString("es-MX")}</span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-400 mb-4">
                        <span>Envío</span>
                        <span>Se calcula en el checkout</span>
                    </div>

                    <div className="border-t border-zinc-800 pt-4 flex justify-between font-semibold text-white mb-6">
                        <span>Total</span>
                        <span>${totalPrice.toLocaleString("es-MX")}</span>
                    </div>

                    <Link
                        href="/checkout"
                        className="
                            block
                            w-full
                            rounded-2xl
                            bg-white
                            py-4
                            text-center
                            text-lg
                            font-bold
                            text-black
                            shadow-[0_15px_35px_rgba(255,255,255,.18)]
                            hover:scale-[1.02]
                            hover:bg-zinc-100
                            transition-all
                            duration-300
                        "
                    >
                        Continuar al checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}