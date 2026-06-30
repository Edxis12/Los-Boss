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
        <Link href={`/productos/${slug}`} className="group block">
            <div className="relative aspect-square bg-zinc-900 rounded-xl overflow-hidden">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
                        Sin imagen
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleToggleFavorite}
                    disabled={cargando}
                    aria-label="Agregar a favoritos"
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition disabled:opacity-50"
                >
                    <Heart
                        size={16}
                        className={favorito ? "fill-white text-white" : "text-white"}
                    />
                </button>
            </div>

            <div className="mt-3">
                {brand && (
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">
                        {brand}
                    </p>
                )}
                <h3 className="text-sm font-medium text-white mt-0.5 line-clamp-1">
                    {name}
                </h3>
                <p className="text-sm font-semibold text-zinc-300 mt-1">
                    ${price.toLocaleString("es-MX")}
                </p>
            </div>
        </Link>
    );
}