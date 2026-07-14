"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { toggleFavorite } from "@/lib/actions/favorite-actions";
import { useFavoritesCountStore } from "@/store/favorites-count-store";

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

type Badge = {
    label: string;
    className: string;
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
    const { data: session } = useSession();
    const router = useRouter();

    const [favorito, setFavorito] = useState(esFavorito);
    const [cargando, setCargando] = useState(false);

    const { increment, decrement } = useFavoritesCountStore();

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

    const badges: Badge[] = [];

    if (agotado) {
        badges.push({
            label: "Agotado",
            className:
                "border-red-500/30 bg-red-500/90 text-white",
        });
    } else if (pocoStock) {
        badges.push({
            label: "Últimas piezas",
            className:
                "border-amber-500/30 bg-amber-400/95 text-black"
        });
    }

    if (enOferta) {
        badges.push({
            label: "Oferta",
            className:
                "border-red-500/30 bg-red-500/90 text-white",
        });
    }

    if (esNuevo) {
        badges.push({
            label: "Nuevo",
            className:
                "border-sky-500/30 bg-sky-500/90 text-white"
        });
    }

    if (isFeatured) {
        badges.push({
            label: "Destacado",
            className:
                "border-white/40 bg-white/95 text-black",
        });
    }

    async function handleToggleFavorite(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            router.push("/login");
            return;
        }

        setCargando(true);

        try {
            const resultado = await toggleFavorite(id);

            if (!resultado.error) {
                const nuevoEstado = resultado.favorito ?? false;

                setFavorito(nuevoEstado);

                if (nuevoEstado) {
                    increment();
                } else {
                    decrement();
                }
            }
        } finally {
            setCargando(false);
        }
    }

    return (
        <Link href={`/productos/${slug}`} className="group block animate-fade-in transition-all duration-500 ease-out hover:-translate-y-2">
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
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className={`
                            object-contain
                            p-5
                            transition-all
                            duration-700
                            ease-out 
                            group-hover:scale-110
                            group-hover:-translate-y-1
                            ${agotado ? "opacity-55 grayscale" : ""}                            
                        `}
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
                        Sin imagen
                    </div>
                )}
                <div className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/20
                        via-transparent
                        to-white/10
                        opacity-0
                        transition-all
                        duration-500
                        group-hover:opacity-100
                    "
                />

                {/* Badges automaticos */}
                {badges.length > 0 && (
                    <div className="absolute left-4 top-4 z-10 flex max-w-[65%] flex-col items-start gap-2">
                        {badges.map((badge) => (
                            <span
                                key={badge.label}
                                className={`
                                        rounded-full
                                        border
                                        px-3
                                        py-1.5
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-[0.16em]
                                        shadow-lg
                                        backdrop-blur-md
                                        ${badge.className}
                                    `}
                            >
                                {badge.label}
                            </span>
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleToggleFavorite}
                    disabled={cargando}
                    aria-label={
                        favorito
                            ? "Quitar de favoritos"
                            : "Agregar a favoritos"
                    }
                    className="
                        absolute 
                        right-4
                        top-4
                        z-20
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-white/90
                        text-black
                        backdrop-blur-md
                        transition-all
                        duration-300
                        hover:scale-110 
                        hover:bg-white
                        disabled:cursor-wait
                        disabled:opacity-60
                    "
                >
                    <Heart
                        size={18}
                        className={`
                                transition-all
                                duration-300
                                ${favorito
                                ? "scale-110 fill-red-500 text-red-500"
                                : "text-black"
                            }
                            `}
                    />
                </button>
                
                <div className="
                        absolute
                        bottom-5
                        left-4
                        right-4
                        translate-y-10
                        opacity-0
                        transition-all
                        duration-500
                        group-hover:translate-y-0
                        group-hover:opacity-100
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
                <h3 className="text-base font-semibold tracking-tight text-white leading-6 line-clamp-2 transition-all duration-300 group-hover:text-zinc-200">
                    {name}
                </h3>
                <div>
                    {comparePrice && comparePrice > price && (
                        <p className="text-sm text-red-400 line-through">
                            ${comparePrice.toLocaleString("es-MX")}
                        </p>
                    )}

                    <p className="text-2xl font-black tracking-tight text-white">
                        ${price.toLocaleString("es-MX")}
                    </p>
                </div>
            </div>
        </Link>
    );
}