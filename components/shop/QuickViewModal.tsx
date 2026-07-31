"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    AlertCircle,
    LoaderCircle,
    X,
} from "lucide-react";
import {
    AnimatePresence,
    motion,
} from "motion/react";

import ProductGallery from "./ProductGallery";
import ProductActions from "./ProductActions";
import QuickViewSkeleton from "./QuickViewSkeleton";

import { useQuickViewStore } from "@/store/quick-view-store";
import {
    getQuickViewProduct,
    type QuickViewProduct,
} from "@/lib/actions/product-actions";

export default function QuickViewModal() {
    const isOpen = useQuickViewStore(
        (state) => state.isOpen
    );

    const productSlug = useQuickViewStore(
        (state) => state.productSlug
    );

    const closeQuickView = useQuickViewStore(
        (state) => state.closeQuickView
    );

    const cacheProduct = useQuickViewStore(
        (state) => state.cacheProduct
    );

    const cache = useQuickViewStore(
        (state) => state.cache
    );

    const [product, setProduct] =
        useState<QuickViewProduct | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState(false);

    useEffect(() => {
        if (!isOpen || !productSlug) {
            setProduct(null);
            setLoading(false);
            setError(false);
            return;
        }

        const slug = productSlug;

        let cancelled = false;

        async function loadProduct() {
            setError(false);

            // Buscar primero en la caché
            const cached = cache[slug];

            if (cached) {
                setProduct(cached);
                setLoading(false);

                // Actualizar silenciosamente en segundo plano
                try {
                    const fresh =
                        await getQuickViewProduct(slug);

                    if (
                        fresh &&
                        !cancelled
                    ) {
                        cacheProduct(fresh);
                        setProduct(fresh);
                    }
                } catch {
                    // Ignorar errores al actualizar
                }

                return;
            }

            // Si no existe en caché, cargar normalmente
            setLoading(true);
            setProduct(null);

            try {
                const result =
                    await getQuickViewProduct(slug);

                if (cancelled) {
                    return;
                }

                if (!result) {
                    setError(true);
                    return;
                }

                cacheProduct(result);
                setProduct(result);
            } catch (error) {
                console.error(
                    "No se pudo cargar la vista rápida:",
                    error
                );

                if (!cancelled) {
                    setError(true);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadProduct();

        return () => {
            cancelled = true;
        };
    }, [
        isOpen,
        productSlug,
        cache,
        cacheProduct,
    ]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        function handleKeyDown(
            event: KeyboardEvent
        ) {
            if (event.key === "Escape") {
                closeQuickView();
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [isOpen, closeQuickView]);

    const stockTotal =
        product?.variants.reduce(
            (total, variant) =>
                total + variant.stock,
            0
        ) ?? 0;

    const agotado = stockTotal <= 0;

    const pocoStock =
        stockTotal > 0 && stockTotal <= 3;

    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    key="quick-view-modal"
                    className="
                        fixed
                        inset-0
                        z-[80]
                        flex
                        items-center
                        justify-center
                        p-0
                        sm:p-5
                        lg:p-8
                    "
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 0.14,
                        ease: "easeOut",
                    }}
                >
                    {/* Fondo oscuro */}
                    <button
                        type="button"
                        aria-label="Cerrar vista rápida"
                        onClick={closeQuickView}
                        className="
                            absolute
                            inset-0
                            cursor-default
                            bg-black/75
                        "
                    />

                    {/* Panel principal */}
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={
                            product
                                ? `Vista rápida de ${product.name}`
                                : "Vista rápida del producto"
                        }
                        initial={{ y: 12 }}
                        animate={{ y: 0 }}
                        exit={{ y: 8 }}
                        transition={{
                            duration: 0.18,
                            ease: [
                                0.22,
                                1,
                                0.36,
                                1,
                            ],
                        }}
                        className="
                            relative
                            z-10
                            h-[94dvh]
                            w-full
                            max-w-[1500px]
                            overflow-hidden
                            rounded-t-[28px]
                            border
                            border-white/10
                            bg-[#090909]
                            shadow-2xl
                            sm:h-[90dvh]
                            sm:rounded-[32px]
                        "
                    >
                        {/* Botón cerrar */}
                        <button
                            type="button"
                            onClick={closeQuickView}
                            aria-label="Cerrar"
                            className="
                                absolute
                                right-4
                                top-4
                                z-50
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-white/10
                                bg-black/80
                                text-zinc-300
                                transition-colors
                                duration-150
                                hover:bg-white
                                hover:text-black
                            "
                        >
                            <X size={20} />
                        </button>

                        <div className="h-full overflow-y-auto overscroll-contain">
                            {loading && <QuickViewSkeleton />}

                            {!loading &&
                                error && (
                                    <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-400/20 bg-red-400/10">
                                            <AlertCircle
                                                size={
                                                    27
                                                }
                                                className="text-red-400"
                                            />
                                        </div>

                                        <h2 className="mt-5 text-xl font-bold text-white">
                                            No pudimos
                                            cargar el
                                            producto
                                        </h2>

                                        <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                                            El producto
                                            pudo haber
                                            dejado de estar
                                            disponible.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={
                                                closeQuickView
                                            }
                                            className="
                                                mt-6
                                                rounded-xl
                                                bg-white
                                                px-6
                                                py-3
                                                text-sm
                                                font-bold
                                                text-black
                                                transition-colors
                                                duration-150
                                                hover:bg-zinc-200
                                            "
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                )}

                            {!loading &&
                                product && (
                                    <div
                                        className="
                                            grid
                                            min-h-full
                                            gap-7
                                            p-4
                                            pb-12
                                            sm:p-7
                                            lg:grid-cols-[minmax(0,1.15fr)_minmax(400px,.85fr)]
                                            lg:gap-12
                                            lg:p-10
                                            xl:grid-cols-[minmax(0,1.2fr)_minmax(440px,.8fr)]
                                            xl:gap-16
                                            xl:p-12
                                        "
                                    >
                                        {/* Galería */}
                                        <div className="min-w-0">
                                            <ProductGallery
                                                images={
                                                    product.images
                                                }
                                                productName={
                                                    product.name
                                                }
                                            />
                                        </div>

                                        {/* Información */}
                                        <div className="min-w-0 py-2 lg:pr-4">
                                            {product.brand && (
                                                <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
                                                    {
                                                        product.brand
                                                    }
                                                </p>
                                            )}

                                            <h2 className="mt-2 break-words text-3xl font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-4xl xl:text-5xl">
                                                {
                                                    product.name
                                                }
                                            </h2>

                                            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                                                {
                                                    product
                                                        .category
                                                        .name
                                                }
                                            </p>

                                            <div className="mt-7 flex flex-wrap items-end gap-3">
                                                <p className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
                                                    $
                                                    {product.price.toLocaleString(
                                                        "es-MX"
                                                    )}
                                                </p>

                                                {product.comparePrice &&
                                                    product.comparePrice >
                                                    product.price && (
                                                        <p className="pb-1 text-base text-zinc-500 line-through">
                                                            $
                                                            {product.comparePrice.toLocaleString(
                                                                "es-MX"
                                                            )}
                                                        </p>
                                                    )}
                                            </div>

                                            <div className="mt-5 flex items-center gap-2">
                                                <span
                                                    className={`
                                                        h-2.5
                                                        w-2.5
                                                        rounded-full
                                                        ${agotado
                                                            ? "bg-red-400"
                                                            : pocoStock
                                                                ? "bg-amber-400"
                                                                : "bg-emerald-400"
                                                        }
                                                    `}
                                                />

                                                <span
                                                    className={`
                                                        text-sm
                                                        font-medium
                                                        ${agotado
                                                            ? "text-red-400"
                                                            : pocoStock
                                                                ? "text-amber-400"
                                                                : "text-emerald-400"
                                                        }
                                                    `}
                                                >
                                                    {agotado
                                                        ? "Producto agotado"
                                                        : pocoStock
                                                            ? `Últimas ${stockTotal} piezas`
                                                            : "Disponible"}
                                                </span>
                                            </div>

                                            <div className="my-7 border-t border-white/10" />

                                            <ProductActions
                                                productId={
                                                    product.id
                                                }
                                                slug={
                                                    product.slug
                                                }
                                                name={
                                                    product.name
                                                }
                                                price={
                                                    product.price
                                                }
                                                imageUrl={
                                                    product
                                                        .images[0]
                                                        ?.url
                                                }
                                                variants={
                                                    product.variants
                                                }
                                            />

                                            <div className="my-7 border-t border-white/10" />

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                                                    Descripción
                                                </p>

                                                <p className="mt-3 line-clamp-5 whitespace-pre-line text-sm leading-7 text-zinc-400 sm:text-[15px]">
                                                    {
                                                        product.description
                                                    }
                                                </p>
                                            </div>

                                            <Link
                                                href={`/productos/${product.slug}`}
                                                onClick={
                                                    closeQuickView
                                                }
                                                className="
                                                    mt-7
                                                    inline-flex
                                                    items-center
                                                    gap-2
                                                    text-sm
                                                    font-semibold
                                                    text-white
                                                    underline
                                                    decoration-zinc-600
                                                    underline-offset-4
                                                    transition-colors
                                                    duration-150
                                                    hover:decoration-white
                                                "
                                            >
                                                Ver información
                                                completa

                                                <span
                                                    aria-hidden="true"
                                                >
                                                    →
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}