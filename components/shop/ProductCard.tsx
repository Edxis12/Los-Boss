"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react";
import { toggleFavorite } from "@/lib/actions/favorite-actions";
import { useFavoritesCountStore } from "@/store/favorites-count-store";

type ProductCardProps = {
    id: string;
    slug: string;
    name: string;
    price: number;
    imageUrl?: string;
    brand?: string | null;
    esFavorito?: boolean;
    comparePrice?: number | null;
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
            if (resultado.favorito) increment();
            else decrement();
        }
    }

    const descuento =
        comparePrice && comparePrice > price
            ? Math.round((1 - price / comparePrice) * 100)
            : null;

    return (
        <Link href={`/productos/${slug}`} className="group block">
            {/* Imagen */}
            <div className="relative aspect-[3/4] bg-zinc-900 rounded-xl overflow-hidden">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-500 ease-out"
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 text-sm">
                        Sin imagen
                    </div>
                )}

                {/* Overlay sutil al hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300" />

                {/* Badge descuento */}
                {descuento && (
                    <span className="absolute top-3 left-3 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{descuento}%
                    </span>
                )}

                {/* Botones superiores */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={handleToggleFavorite}
                        disabled={cargando}
                        aria-label="Agregar a favoritos"
                        className="bg-black/60 hover:bg-black/90 backdrop-blur-sm text-white p-2 rounded-full transition disabled:opacity-50"
                    >
                        <Heart
                            size={15}
                            className={favorito ? "fill-white text-white" : "text-white"}
                        />
                    </button>
                </div>

                {/* Quick add al hover */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition duration-300">
                    <div className="bg-white text-black text-xs font-semibold text-center py-2.5 rounded-lg flex items-center justify-center gap-1.5">
                        <ShoppingBag size={13} />
                        Ver producto
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="mt-3 px-0.5">
                {brand && (
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">
                        {brand}
                    </p>
                )}
                <h3 className="text-sm font-medium text-zinc-100 line-clamp-1 group-hover:text-white transition">
                    {name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-semibold text-white">
                        ${price.toLocaleString("es-MX")}
                    </p>
                    {comparePrice && comparePrice > price && (
                        <p className="text-xs text-zinc-500 line-through">
                            ${comparePrice.toLocaleString("es-MX")}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}