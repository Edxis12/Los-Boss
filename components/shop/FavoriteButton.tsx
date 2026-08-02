"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { toggleFavorite } from "@/lib/actions/favorite-actions";
import { useFavoritesCountStore } from "@/store/favorites-count-store";

interface FavoriteButtonProps {
    productId: string;
    initialFavorite: boolean;
}

export default function FavoriteButton({
    productId,
    initialFavorite,
}: FavoriteButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();

    const [favorite, setFavorite] =
        useState(initialFavorite);

    const [loading, setLoading] =
        useState(false);

    const { increment, decrement } =
        useFavoritesCountStore();

    async function handleClick(
        e: React.MouseEvent<HTMLButtonElement>
    ) {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            router.push("/login");
            return;
        }

        try {
            setLoading(true);

            const result =
                await toggleFavorite(productId);

            if (!result.error) {
                const newState =
                    result.favorito ?? false;

                setFavorite(newState);

                if (newState) {
                    increment();
                } else {
                    decrement();
                }
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            aria-label={
                favorite
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
                bg-white/85
                border
                border-white/30
                text-black
                backdrop-blur-md
                transition-all
                duration-300
                hover:scale-105
                hover:bg-white
                shadow-[0_6px_18px_rgba(0,0,0,.18)]
                sm:h-11
                sm:w-11
                disabled:cursor-wait
                disabled:opacity-60
            "
        >
            <Heart
                size={18}
                className={`
                    transition-all
                    duration-300
                    ${
                        favorite
                            ? "scale-110 fill-red-500 text-red-500"
                            : "text-black"
                    }
                `}
            />
        </button>
    );
}