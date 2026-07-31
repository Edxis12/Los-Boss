"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
    useCartStore,
    useCartUserKey,
} from "@/store/cart-store";
import { useCartDrawerStore } from "@/store/cart-drawer-store";
import { useQuickViewStore } from "@/store/quick-view-store";

import ColorSelector from "./ColorSelectorProps";
import SizeSelector from "./SizeSelector";
import StockMessage from "./StockMessage";
import AddToCartButton from "./AddToCartButton";

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

    const userKey = useCartUserKey(
        session?.user?.id
    );

    const addItem = useCartStore(
        (state) => state.addItem
    );

    const openCartDrawer = useCartDrawerStore(
        (state) => state.openDrawer
    );

    const isQuickViewOpen = useQuickViewStore(
        (state) => state.isOpen
    );

    const closeQuickView = useQuickViewStore(
        (state) => state.closeQuickView
    );

    const resetAddedTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(
            null
        );

    const tallas = Array.from(
        new Set(
            variants
                .map((variant) => variant.size)
                .filter(
                    (size): size is string =>
                        size !== null
                )
        )
    );

    const colores = Array.from(
        new Set(
            variants
                .map((variant) => variant.color)
                .filter(
                    (color): color is string =>
                        color !== null
                )
        )
    );

    const [
        tallaSeleccionada,
        setTallaSeleccionada,
    ] = useState<string | null>(
        tallas.length > 0
            ? null
            : (variants[0]?.size ?? null)
    );

    const [
        colorSeleccionado,
        setColorSeleccionado,
    ] = useState<string | null>(
        colores.length > 0
            ? null
            : (variants[0]?.color ?? null)
    );

    const [agregado, setAgregado] =
        useState(false);

    useEffect(() => {
        return () => {
            if (resetAddedTimerRef.current) {
                clearTimeout(
                    resetAddedTimerRef.current
                );
            }
        };
    }, []);

    const varianteActual = variants.find(
        (variant) =>
            (tallas.length === 0 ||
                variant.size ===
                tallaSeleccionada) &&
            (colores.length === 0 ||
                variant.color ===
                colorSeleccionado)
    );

    const sinStock =
        !varianteActual ||
        varianteActual.stock <= 0;

    const faltaSeleccionar =
        (tallas.length > 0 &&
            !tallaSeleccionada) ||
        (colores.length > 0 &&
            !colorSeleccionado);

    function handleAgregar() {
        if (
            !varianteActual ||
            sinStock ||
            faltaSeleccionar
        ) {
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

        if (resetAddedTimerRef.current) {
            clearTimeout(
                resetAddedTimerRef.current
            );
        }

        /*
         * Se abre primero el Drawer.
         * Después se cierra el Quick View.
         *
         * No usamos setTimeout porque ProductActions
         * se desmonta al cerrar el modal.
         */
        openCartDrawer();

        if (isQuickViewOpen) {
            closeQuickView();
        }

        resetAddedTimerRef.current = setTimeout(
            () => {
                setAgregado(false);
            },
            2000
        );
    }

    return (
        <div className="space-y-8">
            <ColorSelector
                colors={colores}
                selectedColor={colorSeleccionado}
                onSelect={(color) => {
                    setColorSeleccionado(color);
                    setTallaSeleccionada(null);
                }}
            />

            <SizeSelector
                sizes={tallas}
                selectedSize={tallaSeleccionada}
                selectedColor={colorSeleccionado}
                variants={variants}
                onSelect={setTallaSeleccionada}
            />

            <div className="animate-fade-in">
                <StockMessage
                    stock={
                        varianteActual?.stock ?? 0
                    }
                />
            </div>

            {sinStock &&
                !faltaSeleccionar && (
                    <StockMessage
                        stock={0}
                        showOutOfStock
                    />
                )}

            <AddToCartButton
                added={agregado}
                disabled={
                    sinStock ||
                    faltaSeleccionar
                }
                needsSelection={
                    faltaSeleccionar
                }
                price={price}
                onClick={handleAgregar}
            />

            {agregado &&
                !isQuickViewOpen && (
                    <div className="animate-fade-in">
                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/carrito"
                                )
                            }
                            className="
                                h-14
                                w-full
                                rounded-xl
                                border
                                border-zinc-700
                                bg-transparent
                                font-medium
                                text-white
                                transition-colors
                                duration-150
                                hover:border-white
                                hover:bg-[#1a1a1a]
                            "
                        >
                            Ver carrito
                        </button>
                    </div>
                )}
        </div>
    );
} 