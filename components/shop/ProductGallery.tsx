"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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

    if (!current) {
        return (
            <div className="aspect-square rounded-xl border border-zinc-800 bg-[#111] flex items-center justify-center text-zinc-500">
                Sin imagen
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-4 animate-fade-in">

            {/* Miniaturas */}

            <div
                className="
                    order-2
                    flex
                    justify-center
                    gap-3
                    overflow-x-auto
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
                        onClick={() => setSelected(index)}
                        className={`
                        relative
                        h-20
                        w-20
                        rounded-xl
                        overflow-hidden
                        bg-white
                        border
                        shadow-sm
                        transition-all
                        duration-300
                        sm:h-24
                        sm:w-24
                        cursor-pointer
                        ${selected === index
                                ? "border-black ring-2 ring-black scale-105 shadow-lg"
                                : "border-zinc-300 hover:border-black hover:scale-105"
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
                overflow-hidden 
                rounded-2xl 
                border 
                border-zinc-200 
                ring-1
                ring-black/15
                shadow-[0_40px_100px_rgba(0,0,0,0.18)] 
                bg-[linear-gradient(180deg,#fcfcfc_0%,#f7f7f7_45%,#efefef_100%)]
                before:absolute
                before:inset-0
                before:bg-[radial-gradient(circle_at_top,#ffffff_0%,transparent_70%)]
                before:pointer-events-none
                h-[380px]
                min-[430px]:h-[460px]
                sm:h-[620px]
                lg:h-[820px]
            ">

                    <Image
                        key={current.id}
                        src={current.url}
                        alt={current.altText ?? productName}
                        fill
                        priority
                        sizes="
                        (max-width:640px) 100vw,
                        (max-width:1024px) 80vw,
                        60vw"
                        className="
                            object-contain
                            p-0
                            transition-all
                            duration-500
                            animate-fade-in
                            ease-out
                            group-hover:scale-105
                            drop-shadow-[0_45px_60px_rgba(0,0,0,0.22)]
                        "
                    />

                    <div className="
                        absolute
                        inset-0
                        bg-gradient-to-tr
                        from-transparent
                        via-white/5
                        to-white/20
                        pointer-events-none
                    "/>

                </div>

            </div>

        </div>
    );
}