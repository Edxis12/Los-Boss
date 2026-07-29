"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, useCartUserKey } from "@/store/cart-store";
import { useSession } from "next-auth/react";
import ColorSelector from "./ColorSelectorProps";
import SizeSelector from "./SizeSelector";
import StockMessage from "./StockMessage";
import AddToCartButton from "./AddToCartButton";
import { useCartDrawerStore } from "@/store/cart-drawer-store";

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
    const tallas = Array.from(
        new Set(
            variants
                .map((variant) => variant.size)
                .filter((size): size is string => size !== null)
        )
    );
    const colores = Array.from(
        new Set(
            variants
                .map((v) => v.color)
                .filter((color): color is string => color !== null)
        )
    );

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

    const openCartDrawer = useCartDrawerStore(
        (state) => state.openDrawer
    );

    function handleAgregar() {
        if (!varianteActual || sinStock || faltaSeleccionar) {
            return;
        }

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
        openCartDrawer();

        setTimeout(() => {
            setAgregado(false);
        }, 2000);
    }

    return (
        <div className="space-y-8">
            {/* Selector de color */}
            <ColorSelector
                colors={colores}
                selectedColor={colorSeleccionado}
                onSelect={(color) => {
                    setColorSeleccionado(color);
                    setTallaSeleccionada(null);
                }}
            />

            {/* Selector de talla */}
            <SizeSelector
                sizes={tallas}
                selectedSize={tallaSeleccionada}
                selectedColor={colorSeleccionado}
                variants={variants}
                onSelect={setTallaSeleccionada}
            />

            {/* Stock disponible */}
            <div className="animate-fade-in">
                <StockMessage
                    stock={varianteActual?.stock ?? 0}
                />
            </div>

            {sinStock && !faltaSeleccionar && (
                <StockMessage
                    stock={0}
                    showOutOfStock
                />
            )}

            <AddToCartButton
                added={agregado}
                disabled={sinStock || faltaSeleccionar}
                needsSelection={faltaSeleccionar}
                price={price}
                onClick={handleAgregar}
            />

            {agregado && (
                <div className="animate-fade-in">

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
                </div>
            )}
        </div>
    );
}