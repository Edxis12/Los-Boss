"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "motion/react";

type ProductImage = {
    id: string;
    url: string;
    altText: string | null;
};

type Props = {
    images: ProductImage[];
    productName: string;
};

export default function ProductGallery({
    images,
    productName,
}: Props) {
    const [selected, setSelected] = useState(0);

    useEffect(() => {
        if (selected >= images.length) {
            setSelected(0);
        }
    }, [images, selected]);

    const current = images[selected];

    const handleSelect = useCallback((index:number)=>{setSelected(index)}, []);

    if (!current) {
        return (
            <div className="aspect-square rounded-xl border border-zinc-800 bg-[#111] flex items-center justify-center text-zinc-500">
                Sin imagen
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-5 animate-fade-in">

            {/* Miniaturas */}

            <div
                className="
                    order-2
                    flex
                    justify-center
                    gap-3
                    scrollbar-hide
                    pb-2
                    lg:order-1
                    lg:flex-col
                    lg:justify-start
                    lg:overflow-visible
                "
            >

                {images.map((img, index) => (
                    <button
                        key={img.id}
                        onClick={() => handleSelect(index)}
                        className={`
                        relative
                        h-[72px]
                        w-[72px]
                        rounded-xl
                        overflow-hidden 
                        bg-white
                        border
                        shadow-sm
                        transition-colors
                        duration-150
                        sm:h-20
                        sm:w-20
                        lg:h-24
                        lg:w-24
                        cursor-pointer
                        ${selected === index
                                ? "border-black ring-2 ring-black scale-105 shadow-xl"
                                : "border-zinc-300 hover:border-black hover:shadow-md"
                            }
                        `}
                    >
                        <Image
                            src={img.url}
                            alt={img.altText ?? productName}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                    </button>
                ))}

            </div>

            {/* Imagen principal */}

            <div className="order-1 lg:order-2 flex-1">

                <div className="
                        group
                        relative
                        will-change-transform
                        overflow-hidden
                        rounded-2xl
                        border
                        border-zinc-200
                        ring-black/10
                        shadow-[0_24px_60px_rgba(0,0,0,0.16)]
                        bg-[linear-gradient(180deg,#fcfcfc_0%,#f7f7f7_45%,#efefef_100%)]
                        before:absolute
                        before:inset-0
                        before:bg-[radial-gradient(circle_at_top,#ffffff_0%,transparent_70%)]
                        before:pointer-events-none
                        h-[360px]
                        min-[430px]:h-[430px]
                        sm:h-[560px]
                        lg:h-[700px]
                        xl:h-[760px]
                        2xl:h-[820px]
                    "
                >

                    <Image
                        src={current.url}
                        alt={current.altText ?? productName}
                        fill
                        priority={selected === 0}
                        fetchPriority={selected === 0 ? "high" : "auto"}
                        sizes="
                        (max-width:640px) 100vw,
                        (max-width:1024px) 80vw,
                        60vw"
                        className="
                            object-contain
                            p-0
                            transition-all
                            duration-400
                            animate-fade-in
                            ease-out
                            group-hover:scale-[1.03]
                            drop-shadow-[0_28px_42px_rgba(0,0,0,0.18)]
                        "
                    />

                    <div className="
                        absolute
                        inset-0
                        bg-gradient-to-tr
                        from-transparent
                        via-white/5
                        to-white/12
                        pointer-events-none
                    "/>

                </div>

            </div>

        </div>
    );
}