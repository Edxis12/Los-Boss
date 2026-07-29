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
        <>
            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    sizes="(max-width:768px) 50vw, 25vw"
                    className={`
                        object-contain
                        p-5
                        transition-all
                        duration-700
                        ease-out
                        group-hover:scale-110
                        group-hover:-translate-y-1
                        ${
                            agotado
                                ? "opacity-55 grayscale"
                                : ""
                        }
                    `}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-zinc-600">
                    Sin imagen
                </div>
            )}

            <div
                className="
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
        </>
    );
}