"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";

type ProductCardProps = {
    slug: string;
    name: string;
    price: number;
    imageUrl?: string;
    brand?: string | null;
};

export default function ProductCard({
    slug,
    name,
    price,
    imageUrl,
    brand,
}: ProductCardProps) {
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
                    onClick={(e) => {
                        e.preventDefault();
                        // Aquí conectamos la lógica real de favoritos más adelante
                    }}
                    aria-label="Agregar a favoritos"
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition"
                >
                    <Heart size={16} />
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