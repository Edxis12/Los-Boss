"use client";

import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "./FavoriteButton";
import ProductPrice from "./ProductPriceProps";
import ProductBadges from "./ProductBadges";
import ProductImage from "./ProductImage";

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
    const pocoStock = stockTotal > 0 && stockTotal <= 3;
    const enOferta =
        comparePrice !== null &&
        comparePrice !== undefined &&
        comparePrice > price;

    const fechaCreacion = new Date(createdAt);
    const ahora = new Date();

    const diferenciaDias =
        (ahora.getTime() - fechaCreacion.getTime()) /
        (1000 * 60 * 60 * 24);

    const esNuevo =
        !Number.isNaN(fechaCreacion.getTime()) &&
        diferenciaDias >= 0 &&
        diferenciaDias <= 30;

    return (
        <Link
            href={`/productos/${slug}`}
            aria-label={`Ver ${name}`}
            className="group block animate-fade-in transition-all duration-500 ease-out hover:-translate-y-2">
            <div className="
                    relative 
                    aspect-[3/4] 
                    overflow-hidden 
                    rounded-3xl
                    border
                    border-zinc-200
                    ring-1
                    ring-white/70 
                    shadow-[0_12px_35px_rgba(0,0,0,.15)] 
                    transition-all
                    duration-500
                    hover:shadow-[0_20px_50px_rgba(0,0,0,.22)]
                "
                style={{
                    background:
                        "linear-gradient(180deg,#fafafa,#f2f2f2)",
                    backgroundImage:
                        "radial-gradient(circle at top,#ffffff,#efefef)"

                }}
            >
                <ProductImage
                    imageUrl={imageUrl}
                    name={name}
                    agotado={agotado}
                />

                {/* Badges automaticos */}
                <ProductBadges
                    stockTotal={stockTotal}
                    price={price}
                    comparePrice={comparePrice}
                    isFeatured={isFeatured}
                    createdAt={createdAt}
                />

                <FavoriteButton
                    productId={id}
                    initialFavorite={esFavorito}
                />

                <div
                    className="
                        absolute
                        bottom-5
                        left-4
                        right-4
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
                    <div className="
                            rounded-xl
                            bg-white
                            py-3
                            text-center
                            text-sm
                            font-semibold
                            text-black
                            shadow-xl
                            transition-all
                            duration-300
                            group-hover:tracking-wide
                        "
                    >
                        {agotado ? "Ver producto agotado" : "Ver detalles →"}
                    </div>

                </div>
            </div>

            <div className="mt-5 space-y-2 px-1">
                {brand && (
                    <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 font-medium">
                        {brand}
                    </p>
                )}
                <h3 className="
                        line-clamp-2
                        text-[15px]
                        font-semibold
                        leading-6
                        tracking-tight
                        text-white
                        transition-all
                        duration-300
                        group-hover:text-zinc-200
                        sm:text-base
                    ">
                    {name}
                </h3>
                <ProductPrice
                    price={price}
                    comparePrice={comparePrice}
                />
            </div>
        </Link>
    );
}