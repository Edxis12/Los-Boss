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
}: ProductCardProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [favorito, setFavorito] = useState(esFavorito);
    const [cargando, setCargando] = useState(false);
    const { increment, decrement } = useFavoritesCountStore();

    async function handleToggleFavorite(e: React.MouseEvent) {
        e.preventDefault();

        if (!session) {
            router.push("/login");
            return;
        }

        setCargando(true);
        const resultado = await toggleFavorite(id);
        setCargando(false);

        if (!resultado.error) {
            setFavorito(resultado.favorito ?? false);
            if (resultado.favorito) {
                increment();
            } else {
                decrement();
            }
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
                    hover:shadow-[0_20px_50px_rgba(0,0,0,.22)]
                    transition-all
                    duration-500
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
                        className="
                            object-contain
                            p-5
                            transition-all
                            duration-700
                            ease-out 
                            group-hover:scale-110
                            group-hover:-translate-y-1
                        "
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
                        group-hover:opacity-100
                        transition-all
                        duration-500
                    "
                />

                <button
                    type="button"
                    onClick={handleToggleFavorite}
                    disabled={cargando}
                    aria-label="Agregar a favoritos"
                    className="
                        absolute 
                        top-4
                        right-4
                        h-10
                        w-10
                        flex
                        items-center
                        justify-center
                        rounded-full
                        bg-white/90
                        backdrop-blur-md
                        text-black
                        transition-all
                        duration-300
                        hover:scale-110 
                        hover:bg-white
                    "
                >
                    <Heart
                        size={18}
                        className={`
                                transition-all
                                duration-300
                                ${
                                    favorito
                                        ? "fill-red-500 text-red-500 scale-110"
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
                        group-hover:translate-y-0
                        group-hover:opacity-100
                        transition-all
                        duration-500
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
                        Ver detalles →
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