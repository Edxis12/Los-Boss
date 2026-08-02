"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion } from "motion/react";

import FavoriteButton from "./FavoriteButton";
import ProductPrice from "./ProductPriceProps";
import ProductBadges from "./ProductBadges";
import ProductImage from "./ProductImage";
import QuickViewButton from "./QuickViewButton";

import { useQuickViewStore } from "@/store/quick-view-store";
import { getQuickViewProduct } from "@/lib/actions/product-actions";

type ProductCardProps = {
    id: string;
    slug: string;
    name: string;
    price: number;
    comparePrice?: number | null;
    imageUrl?: string;
    brand?: string | null;
    esFavorito?: boolean;
    stockTotal: number;
    isFeatured: boolean;
    createdAt: string;
};

export default function ProductCard({
    id,
    slug,
    name,
    price,
    imageUrl,
    brand,
    esFavorito = false,
    comparePrice,
    stockTotal,
    isFeatured,
    createdAt,
}: ProductCardProps) {
    const agotado = stockTotal <= 0;

    // Evita solicitar varias veces el mismo producto mientras la primera peticion sigue pendiente.
    const prefetchEnCursoRef = useRef(false);

    // Evita precargar productos cuando el usuario solamente pasa rapidamente por encima.
    const prefetchTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    async function prefetchQuickView() {
        const quickViewStore = useQuickViewStore.getState();

        // Si el producto ya esta almacenado no volvemos a consultar la base de datos.
        if (quickViewStore.cache[slug]) {
            return;
        }

        if (prefetchEnCursoRef.current) {
            return;
        }

        prefetchEnCursoRef.current = true;

        try {
            const product = await getQuickViewProduct(slug);

            if (!product) {
                return;
            }

            // Revisamos nuevamente porque otra peticion pudo haber guardado el producto mientras esperabadmos la respuesta
            const currentStore = useQuickViewStore.getState();

            if (!currentStore.cache[slug]) {
                currentStore.cacheProduct(product);
            }
        } catch (error) {
            console.error(`No se pudo precargar el producto ${slug}:`, error);
        } finally {
            prefetchEnCursoRef.current = false;
        }
    }

    function handlePointEnter() {
        if (prefetchTimeRef.current) {
            clearTimeout(prefetchTimeRef.current);
        }

        // El retraso evita peticiones cuando el usuario solamente cruza el cursor sobre la tarjeta.

        prefetchTimeRef.current = setTimeout(() => {
            void prefetchQuickView();
        }, 150);
    }

    function handlePointerLeave() {
        if (!prefetchTimeRef.current) {
            return;
        }

        clearTimeout(prefetchTimeRef.current);
        prefetchTimeRef.current = null;
    }

    function handleFocus() {
        void prefetchQuickView();
    }

    return (
        <article className="group block animate-fade-in" onPointerEnter={handlePointEnter} onPointerLeave={handlePointerLeave} onFocus={handleFocus}>
            <motion.div
                whileHover={{ y: -6 }}
                transition={{
                    duration: 0.18,
                    ease: "easeOut",
                }}
                className="
                    relative
                    aspect-[3/4]
                    overflow-hidden
                    rounded-2xl
                    lg:rounded-3xl
                    border
                    border-zinc-200
                    ring-1
                    ring-white/70
                    shadow-[0_10px_28px_rgba(0,0,0,.14)]
                    transition-shadow
                    duration-500
                    hover:shadow-[0_18px_42px_rgba(0,0,0,.18)]
                "
                style={{
                    background:
                        "linear-gradient(180deg,#fafafa,#f2f2f2)",
                    backgroundImage:
                        "radial-gradient(circle at top,#ffffff,#efefef)",
                }}
            >
                <Link
                    href={`/productos/${slug}`}
                    aria-label={`Ver ${name}`}
                    className="absolute inset-0 z-10"
                >
                    <span className="sr-only">
                        Ver detalles de {name}
                    </span>
                </Link>

                <ProductImage
                    imageUrl={imageUrl}
                    name={name}
                    agotado={agotado}
                />

                <ProductBadges
                    stockTotal={stockTotal}
                    price={price}
                    comparePrice={comparePrice}
                    isFeatured={isFeatured}
                    createdAt={createdAt}
                />

                <div className="relative z-30">
                    <FavoriteButton
                        productId={id}
                        initialFavorite={esFavorito}
                    />
                </div>

                <div
                    className="
                        absolute
                        bottom-4
                        left-3
                        right-3
                        z-30
                        hidden
                        translate-y-10
                        opacity-0
                        transition-all
                        duration-500
                        sm:block
                        sm:group-hover:translate-y-0
                        sm:group-hover:opacity-100
                    "
                >
                    <QuickViewButton
                        slug={slug}
                        agotado={agotado}
                    />
                </div>
            </motion.div>

            <div className="mt-4 space-y-1.5 px-1">
                {brand && (
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                        {brand}
                    </p>
                )}

                <Link
                    href={`/productos/${slug}`}
                    className="block"
                >
                    <h3
                        className="
                            line-clamp-2
                            text-[14px]
                            font-semibold
                            leading-5
                            tracking-tight
                            text-white
                            transition-colors
                            duration-300
                            group-hover:text-zinc-200
                            sm:text-[15px]
                            lg:text-base
                        "
                    >
                        {name}
                    </h3>
                </Link>

                <ProductPrice
                    price={price}
                    comparePrice={comparePrice}
                />
            </div>
        </article>
    );
}