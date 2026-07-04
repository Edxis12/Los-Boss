"use client";

import { useState } from "react";
import Image from "next/image";

type ImagenProducto = { id: string; url: string };

export default function ProductGallery({
    images,
    productName,
}: {
    images: ImagenProducto[];
    productName: string;
}) {
    const [activo, setActivo] = useState(0);

    if (images.length === 0) {
        return (
            <div className="relative aspect-[4/5] bg-[#f5f5f5] rounded-2xl flex items-center justify-center text-zinc-400 text-sm">
                Sin imagen
            </div>
        );
    }

    const imagenActiva = images[activo];

    return (
        <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:max-h-[600px] pb-1 md:pb-0 md:pr-0.5 scrollbar-thin">
                    {images.map((img, i) => (
                        <button
                            key={img.id}
                            onClick={() => setActivo(i)}
                            aria-label={`Ver imagen ${i + 1} de ${productName}`}
                            aria-current={i === activo}
                            className={`relative shrink-0 w-16 h-16 md:w-[72px] md:h-[72px] rounded-lg overflow-hidden bg-[#f5f5f5] transition
                ${i === activo
                                    ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                                    : "opacity-60 hover:opacity-100 ring-1 ring-zinc-800"
                                }`}
                        >
                            <Image
                                src={img.url}
                                alt=""
                                fill
                                className="object-contain p-1.5"
                                sizes="72px"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Imagen principal */}
            <div className="relative flex-1 aspect-[4/5] bg-[#f5f5f5] rounded-2xl overflow-hidden group">
                <Image
                    key={imagenActiva.id}
                    src={imagenActiva.url}
                    alt={productName}
                    fill
                    className="object-contain p-8 md:p-10 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />

                {images.length > 1 && (
                    <span className="absolute bottom-4 right-4 text-[11px] tracking-wide bg-black/70 text-white px-2 py-1 rounded-full">
                        {activo + 1} / {images.length}
                    </span>
                )}
            </div>
        </div>
    );
}