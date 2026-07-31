"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useShallow } from "zustand/react/shallow";

import CartDrawerItem from "./CartDrawerItem";

import {
    useCartStore,
    useCartUserKey,
} from "@/store/cart-store";

import { useCartDrawerStore } from "@/store/cart-drawer-store";

import {
    validarStockCarrito,
    type ResultadoStockCarrito,
} from "@/lib/actions/order-actions";

export default function CartDrawer() {
    const isOpen = useCartDrawerStore(
        (state) => state.isOpen
    );

    const closeDrawer = useCartDrawerStore(
        (state) => state.closeDrawer
    );

    const { data: session } = useSession();

    const userKey = useCartUserKey(
        session?.user?.id
    );

    const items = useCartStore(
        useShallow((state) => state.getItems(userKey))
    );

    const totalPrice = useCartStore(
        (state) => state.getTotalPrice(userKey)
    );

    const totalItems = useCartStore(
        (state) => state.getTotalItems(userKey)
    );

    const updateQuantity = useCartStore(
        (state) => state.updateQuantity
    );

    const removeItem = useCartStore(
        (state) => state.removeItem
    );

    const [validandoStock, setValidandoStock] =
        useState(false);

    const [
        stockPorVariante,
        setStockPorVariante,
    ] = useState<
        Record<string, ResultadoStockCarrito>
    >({});

    /*
     * Bloquea el scroll únicamente cuando
     * el Drawer se encuentra abierto.
     */
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow =
                previousOverflow;
        };
    }, [isOpen]);

    /*
     * Permite cerrar el Drawer con Escape.
     * El listener solamente existe mientras está abierto.
     */
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleKeyDown(
            event: KeyboardEvent
        ) {
            if (event.key === "Escape") {
                closeDrawer();
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [isOpen, closeDrawer]);

    /*
     * Comprueba el stock al abrir el Drawer
     * y mientras permanezca abierto.
     */
    useEffect(() => {
        if (!isOpen || items.length === 0) {
            setStockPorVariante({});
            setValidandoStock(false);
            return;
        }

        let cancelado = false;
        let validacionEnCurso = false;

        async function comprobarStock() {
            if (validacionEnCurso) {
                return;
            }

            validacionEnCurso = true;
            setValidandoStock(true);

            try {
                const resultados =
                    await validarStockCarrito(
                        items.map((item) => ({
                            variantId:
                                item.variantId,
                            quantity:
                                item.quantity,
                        }))
                    );

                if (cancelado) {
                    return;
                }

                const siguienteStock: Record<
                    string,
                    ResultadoStockCarrito
                > = {};

                for (const resultado of resultados) {
                    siguienteStock[
                        resultado.variantId
                    ] = resultado;

                    const varianteInvalida =
                        !resultado.existe ||
                        !resultado.productoActivo ||
                        resultado.stockActual <= 0;

                    if (varianteInvalida) {
                        removeItem(
                            userKey,
                            resultado.variantId
                        );

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
                    }
                }

                setStockPorVariante(
                    siguienteStock
                );
            } catch (error) {
                console.error(
                    "No se pudo validar el stock del Drawer:",
                    error
                );
            } finally {
                validacionEnCurso = false;

                if (!cancelado) {
                    setValidandoStock(false);
                }
            }
        }

        void comprobarStock();

        /*
         * Se amplía un poco el intervalo para reducir
         * llamadas mientras el usuario revisa el carrito.
         */
        const intervalo = window.setInterval(
            () => {
                void comprobarStock();
            },
            15000
        );

        function comprobarAlVolver() {
            if (
                document.visibilityState ===
                "visible"
            ) {
                void comprobarStock();
            }
        }

        document.addEventListener(
            "visibilitychange",
            comprobarAlVolver
        );

        window.addEventListener(
            "focus",
            comprobarAlVolver
        );

        return () => {
            cancelado = true;

            window.clearInterval(intervalo);

            document.removeEventListener(
                "visibilitychange",
                comprobarAlVolver
            );

            window.removeEventListener(
                "focus",
                comprobarAlVolver
            );
        };
    }, [
        isOpen,
        items,
        userKey,
        removeItem,
        updateQuantity,
    ]);

    return (
        <>
            {/* Fondo */}
            <button
                type="button"
                aria-label="Cerrar carrito"
                onClick={closeDrawer}
                tabIndex={isOpen ? 0 : -1}
                className={`
                    fixed
                    inset-0
                    z-40
                    bg-black/65
                    transition-opacity
                    duration-150
                    ease-out

                    ${isOpen
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                    }
                `}
            />

            {/* Panel */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Carrito de compras"
                aria-hidden={!isOpen}
                className={`
                    fixed
                    right-0
                    top-0
                    z-50
                    flex
                    h-dvh
                    w-full
                    max-w-md
                    flex-col
                    border-l
                    border-white/10
                    bg-[#0d0d0d]
                    shadow-2xl
                    transition-transform
                    duration-[220ms]
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    will-change-transform

                    ${isOpen
                        ? "translate-x-0"
                        : "translate-x-full"
                    }
                `}
            >
                {/* Encabezado */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            Tu carrito
                        </h2>

                        <p className="mt-0.5 text-sm text-zinc-500">
                            {totalItems === 0
                                ? "Sin productos"
                                : `${totalItems} ${totalItems === 1
                                    ? "artículo"
                                    : "artículos"
                                }`}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeDrawer}
                        aria-label="Cerrar carrito"
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            text-zinc-400
                            transition-colors
                            duration-150
                            hover:bg-white/10
                            hover:text-white
                        "
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                                <ShoppingBag
                                    size={26}
                                    className="text-zinc-500"
                                />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-white">
                                Tu carrito está vacío
                            </h3>

                            <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
                                Explora nuestros productos
                                y agrega tus favoritos.
                            </p>

                            <Link
                                href="/productos"
                                onClick={closeDrawer}
                                className="
                                    mt-6
                                    flex
                                    min-h-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-white
                                    px-6
                                    text-sm
                                    font-bold
                                    text-black
                                    transition-colors
                                    duration-150
                                    hover:bg-zinc-200
                                "
                            >
                                Ver productos
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4 p-5">
                            {items.map((item) => {
                                const estadoStock =
                                    stockPorVariante[
                                    item.variantId
                                    ];

                                return (
                                    <CartDrawerItem
                                        key={
                                            item.variantId
                                        }
                                        item={item}
                                        stockActual={
                                            estadoStock?.stockActual
                                        }
                                        validandoStock={
                                            validandoStock
                                        }
                                        onClick={
                                            closeDrawer
                                        }
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Resumen */}
                {items.length > 0 && (
                    <div className="border-t border-white/10 bg-[#0d0d0d] p-5 sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <span className="text-sm text-zinc-400">
                                Subtotal (
                                {totalItems})
                            </span>

                            <span className="text-xl font-black tracking-tight text-white">
                                $
                                {totalPrice.toLocaleString(
                                    "es-MX"
                                )}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <Link
                                href="/carrito"
                                onClick={closeDrawer}
                                className="
                                    flex
                                    min-h-12
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-white/15
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition-colors
                                    duration-150
                                    hover:border-white/30
                                    hover:bg-white/[0.05]
                                "
                            >
                                Ver carrito
                            </Link>

                            <Link
                                href="/checkout"
                                onClick={closeDrawer}
                                className="
                                    flex
                                    min-h-12
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-white
                                    text-sm
                                    font-bold
                                    text-black
                                    transition-colors
                                    duration-150
                                    hover:bg-zinc-200
                                "
                            >
                                Continuar al checkout
                            </Link>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}