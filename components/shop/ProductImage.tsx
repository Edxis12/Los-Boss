"use client";

import Image from "next/image";

interface ProductImageProps {
    imageUrl?: string;
    name: string;
    agotado: boolean;
}

export default function ProductImage({
    imageUrl,
    name,
    agotado,
}: ProductImageProps) {
    return (
        <div className="absolute inset-0">
            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    loading="lazy"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw
"
                    className={`
                        object-contain
                        p-4
                        sm:p-5
                        transition-all
                        group-hover:scale-[1.03]
                        duration-500
                        ease-out
                        ${agotado
                            ? "opacity-50 grayscale"
                            : ""
                        }
                    `}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-zinc-500">
                    Sin imagen
                </div>
            )}

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/10
                    via-transparent
                    to-white/5
                    opacity-0
                    transition-all
                    duration-500
                    group-hover:opacity-80
                "
            />
        </div>
    );
}