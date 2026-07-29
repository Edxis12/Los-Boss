"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import {
    type CartItem,
    useCartStore,
    useCartUserKey,
} from "@/store/cart-store";

interface CartDrawerItemProps {
    item: CartItem;
    stockActual?: number;
    validandoStock: boolean;
    onClick?: () => void;
}

export default function CartDrawerItem({
    item,
    stockActual,
    validandoStock,
    onClick,
}: CartDrawerItemProps) {
    const { data: session } = useSession();
    const userKey = useCartUserKey(session?.user?.id);

    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const llegoAlMaximo = typeof stockActual === "number" && item.quantity >= stockActual;

    return (
        <article className="flex gap-4 rounded-2xl border border-white/10 p-3 transition hover:border-white/20">
            <Link
                href={`/productos/${item.slug}`}
                onClick={onClick}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white"
            >
                {item.imageUrl && (
                    <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="96px"
                    />
                )}
            </Link>

            <div className="min-w-0 flex-1">
                <Link
                    href={`/productos/${item.slug}`}
                    onClick={onClick}
                    className="line-clamp-2 font-semibold text-white transition hover:text-zinc-300"
                >
                    {item.name}
                </Link>

                {(item.color || item.size) && (
                    <p className="mt-1 text-sm text-zinc-400">
                        {[item.color, item.size]
                            .filter(Boolean)
                            .join(" / ")}
                    </p>
                )}

                <p className="mt-2 font-bold text-white">
                    ${(item.price * item.quantity).toLocaleString("es-MX")}
                </p>

                <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center overflow-hidden rounded-full border border-white/10">
                        <button
                            type="button"
                            onClick={() =>
                                updateQuantity(
                                    userKey,
                                    item.variantId,
                                    item.quantity - 1
                                )
                            }
                            className="flex h-8 w-8 items-center justify-center text-zinc-300 transition hover:bg-white hover:text-black"
                            aria-label="Disminuir cantidad"
                        >
                            <Minus size={14} />
                        </button>

                        <span className="w-7 text-center text-sm font-semibold text-white">
                            {item.quantity}
                        </span>

                        <button
                            type="button"
                            onClick={() => {
                                if (
                                    validandoStock ||
                                    llegoAlMaximo
                                ) {
                                    return;
                                }

                                updateQuantity(
                                    userKey,
                                    item.variantId,
                                    item.quantity + 1
                                );
                            }}
                            disabled={
                                validandoStock ||
                                llegoAlMaximo
                            }
                            className="
        flex
        h-8
        w-8
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
    "
                            aria-label="Aumentar cantidad"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            removeItem(userKey, item.variantId)
                        }
                        className="flex h-8 w-8 items-center justify-center text-zinc-500 transition hover:text-red-400"
                        aria-label={`Eliminar ${item.name}`}
                    >
                        <Trash2 size={15} />
                    </button>

                    {typeof stockActual === "number" &&
                        stockActual > 0 &&
                        stockActual <= 3 && (
                            <p className="mt-2 text-xs text-amber-400">
                                Solo quedan {stockActual} disponibles
                            </p>
                        )}
                </div>
            </div>
        </article>
    );
}