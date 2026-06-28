"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";

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

        addItem({
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
        <div className="space-y-6">
            {/* Selector de color */}
            {colores.length > 0 && (
                <div>
                    <p className="text-sm text-zinc-300 mb-2">Color</p>
                    <div className="flex gap-2">
                        {colores.map((color) => (
                            <button
                                key={color}
                                onClick={() => setColorSeleccionado(color)}
                                className={`px-4 py-2 rounded-lg text-sm border transition ${colorSeleccionado === color
                                        ? "border-white bg-white text-black"
                                        : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                                    }`}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Selector de talla */}
            {tallas.length > 0 && (
                <div>
                    <p className="text-sm text-zinc-300 mb-2">Talla</p>
                    <div className="flex gap-2 flex-wrap">
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
                                    className={`px-4 py-2 rounded-lg text-sm border transition ${tallaSeleccionada === talla
                                            ? "border-white bg-white text-black"
                                            : disponible
                                                ? "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                                                : "border-zinc-800 text-zinc-600 line-through cursor-not-allowed"
                                        }`}
                                >
                                    {talla}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Stock disponible */}
            {varianteActual && varianteActual.stock > 0 && varianteActual.stock <= 3 && (
                <p className="text-sm text-amber-400">
                    ¡Solo quedan {varianteActual.stock} disponibles!
                </p>
            )}

            <button
                onClick={handleAgregar}
                disabled={sinStock || faltaSeleccionar}
                className="w-full bg-white text-black font-semibold rounded-lg py-3.5 hover:bg-zinc-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {agregado
                    ? "✓ Agregado al carrito"
                    : sinStock
                        ? "Sin stock"
                        : faltaSeleccionar
                            ? "Selecciona una opción"
                            : "Agregar al carrito"}
            </button>

            {agregado && (
                <button
                    onClick={() => router.push("/carrito")}
                    className="w-full border border-zinc-700 text-white rounded-lg py-3 hover:bg-zinc-900 transition"
                >
                    Ver carrito
                </button>
            )}
        </div>
    );
}