"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCartStore, useCartUserKey } from "@/store/cart-store";

export default function CarritoPage() {
    const { data: session } = useSession();
    const userKey = useCartUserKey(session?.user?.id);

    const items = useCartStore((state) => state.getItems(userKey));
    const totalPrice = useCartStore((state) => state.getTotalPrice(userKey));
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

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

            <div className="grid md:grid-cols-3 gap-10">
                {/* Lista de productos */}
                <div className="md:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.variantId}
                            className="flex gap-4 bg-zinc-900 rounded-xl p-4"
                        >
                            <Link
                                href={`/productos/${item.slug}`}
                                className="relative w-24 h-24 bg-zinc-800 rounded-lg overflow-hidden shrink-0"
                            >
                                {item.imageUrl && (
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                        sizes="96px"
                                    />
                                )}
                            </Link>

                            <div className="flex-1 min-w-0">
                                <Link
                                    href={`/productos/${item.slug}`}
                                    className="font-medium text-white hover:underline line-clamp-1"
                                >
                                    {item.name}
                                </Link>
                                {(item.size || item.color) && (
                                    <p className="text-sm text-zinc-400 mt-0.5">
                                        {[item.color, item.size].filter(Boolean).join(" / ")}
                                    </p>
                                )}
                                <p className="text-sm font-semibold text-zinc-200 mt-1">
                                    ${item.price.toLocaleString("es-MX")}
                                </p>

                                <div className="flex items-center gap-3 mt-3">
                                    <div className="flex items-center border border-zinc-700 rounded-lg">
                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    userKey,
                                                    item.variantId,
                                                    item.quantity - 1
                                                )
                                            }
                                            className="px-2.5 py-1.5 text-zinc-300 hover:text-white"
                                            aria-label="Disminuir cantidad"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="px-3 text-sm text-white">
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
                                            className="px-2.5 py-1.5 text-zinc-300 hover:text-white"
                                            aria-label="Aumentar cantidad"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeItem(userKey, item.variantId)}
                                        className="text-zinc-500 hover:text-red-400 transition"
                                        aria-label="Eliminar producto"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-white font-semibold whitespace-nowrap">
                                ${(item.price * item.quantity).toLocaleString("es-MX")}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Resumen */}
                <div className="bg-zinc-900 rounded-xl p-6 h-fit">
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
                        className="block w-full bg-white text-black text-center font-semibold rounded-lg py-3 hover:bg-zinc-200 transition"
                    >
                        Continuar al checkout
                    </Link>
                </div>
            </div>
        </div>
    );
}