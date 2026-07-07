"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, useCartUserKey } from "@/store/cart-store";
import { useSession } from "next-auth/react";
import { AlertTriangle } from "lucide-react";

type Variant = {
    id: string;
    size: string | null;
    color: string | null;
    stock: number;
};

type ProductActionsProps = {
    productId: string;
    slug: string;
    name: string;
    price: number;
    imageUrl?: string;
    variants: Variant[];
};

export default function ProductActions({
    productId,
    slug,
    name,
    price,
    imageUrl,
    variants,
}: ProductActionsProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const userKey = useCartUserKey(session?.user?.id);
    const addItem = useCartStore((state) => state.addItem);

    // Tallas y colores únicos disponibles
    const tallas = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
    const colores = Array.from(new Set(variants.map((v) => v.color).filter(Boolean)));

    const [tallaSeleccionada, setTallaSeleccionada] = useState<string | null>(
        tallas.length > 0 ? null : (variants[0]?.size ?? null)
    );
    const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(
        colores.length > 0 ? null : (variants[0]?.color ?? null)
    );
    const [agregado, setAgregado] = useState(false);

    // Encuentra la variante exacta que coincide con la selección actual
    const varianteActual = variants.find(
        (v) =>
            (tallas.length === 0 || v.size === tallaSeleccionada) &&
            (colores.length === 0 || v.color === colorSeleccionado)
    );

    const sinStock = !varianteActual || varianteActual.stock <= 0;
    const faltaSeleccionar =
        (tallas.length > 0 && !tallaSeleccionada) ||
        (colores.length > 0 && !colorSeleccionado);

    function handleAgregar() {
        if (!varianteActual || sinStock || faltaSeleccionar) return;

        addItem(userKey, {
            productId,
            variantId: varianteActual.id,
            slug,
            name,
            price,
            imageUrl,
            size: varianteActual.size,
            color: varianteActual.color,
        });

        setAgregado(true);
        setTimeout(() => setAgregado(false), 2000);
    }

    return (
        <div className="space-y-8">
            {/* Selector de color */}
            {colores.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">

                        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-400">
                            Color
                        </p>

                        {colorSeleccionado && (
                            <span className="text-sm text-zinc-500">
                                {colorSeleccionado}
                            </span>
                        )}

                    </div>

                    <div className="flex flex-wrap gap-3">
                        {colores.map((color) => (
                            <button
                                key={color}
                                onClick={() => setColorSeleccionado(color)}
                                className={`
                                        px-5
                                        h-11
                                        rounded-lg
                                        border
                                        text-sm
                                        transition-all
                                        duration-300
                                        ease-out

                                        ${colorSeleccionado === color
                                        ? "bg-white text-black border-white shadow-[0_8px_30px_rgba(255,255,255,0.18)]"
                                        : "bg-[#0d0d0d] border-zinc-700 text-zinc-300 hover:border-white hover:bg-[#181818] active:scale-95"
                                    }
                                    `}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Selector de talla */}
            {tallas.length > 0 && (
                <div className="space-y-3">

                    <div className="flex items-center justify-between">

                        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-400">
                            Talla
                        </p>

                        {tallaSeleccionada && (
                            <span className="text-sm text-zinc-500">
                                {tallaSeleccionada}
                            </span>
                        )}

                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {tallas.map((talla) => {
                            const disponible = variants.some(
                                (v) =>
                                    v.size === talla &&
                                    (colores.length === 0 || v.color === colorSeleccionado) &&
                                    v.stock > 0
                            );
                            return (
                                <button
                                    key={talla}
                                    disabled={!disponible}
                                    onClick={() => setTallaSeleccionada(talla)}
                                    className={`
                                            h-14
                                            rounded-lg
                                            border
                                            font-medium
                                            transition-all
                                            duration-300
                                            ease-out

                                            ${tallaSeleccionada === talla
                                            ? "bg-white text-black border-white scale-105 shadow-[0_8px_30px_rgba(255,255,255,0.18)]"
                                            : disponible
                                                ? "bg-[#0d0d0d] border-zinc-700 text-zinc-300 hover:border-white hover:bg-[#181818] active:scale-95"
                                                : "bg-[#090909] border-zinc-800 text-zinc-700 cursor-not-allowed"
                                        }
                                        `}
                                >
                                    {talla}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Stock disponible */}
            {varianteActual && varianteActual.stock > 0 && varianteActual.stock <= 3 && (
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-sm text-amber-300 w-fit">
                    <AlertTriangle size={16} />
                    <span>
                        Solo quedan {varianteActual.stock} piezas disponibles
                    </span>
                </div>
            )}

            {sinStock && !faltaSeleccionar && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                    <p className="text-sm text-red-300">
                        Este producto no tiene existencias en la variante seleccionada
                    </p>
                </div>
            )}

            <button
                onClick={handleAgregar}
                disabled={sinStock || faltaSeleccionar}
                className={`
                    h-14
                    w-full
                    rounded-xl
                    font-semibold
                    text-base
                    transition-all
                    duration-300
                    ease-out
                    hover:scale-[1.01]
                    active:scale-[0.99]
                    disabled:opacity-40
                    disabled:hover:scale-100
                    disabled:cursor-not-allowed

                    ${agregado
                        ? "bg-emerald-500 text-white shadow-[0_20px_45px_rgba(34,197,94,.35)] hover:bg-emerald-400"
                        : "bg-white text-black shadow-[0_20px_45px_rgba(255,255,255,.15)] hover:bg-zinc-200 hover:shadow-[0_20px_55px_rgba(255,255,255,.22)]"
                    }
                `}
            >
                {agregado
                    ? "✓ Agregado al carrito"
                    : sinStock
                        ? "Sin stock"
                        : faltaSeleccionar
                            ? "Selecciona una opción"
                            : `Agregar al carrito • $${price.toLocaleString("es-MX")}`}
            </button>

            {agregado && (
                <button
                    onClick={() => router.push("/carrito")}
                    className="
                        h-14
                        w-full
                        rounded-xl
                        border
                        border-zinc-700
                        bg-transparent
                        hover:border-white
                        hover:bg-[#1a1a1a]
                        transition-all
                        duration-300
                        ease-out
                        text-white
                        font-medium
                    "
                >
                    Ver carrito
                </button>
            )}
        </div>
    );
}