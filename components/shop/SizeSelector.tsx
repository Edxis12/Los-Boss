interface SizeSelectorProps {
    sizes: string[];
    selectedSize: string | null;
    selectedColor: string | null;
    variants: {
        size: string | null;
        color: string | null;
        stock: number;
    }[];
    onSelect: (size: string) => void;
}

export default function SizeSelector({
    sizes,
    selectedSize,
    selectedColor,
    variants,
    onSelect,
}: SizeSelectorProps) {
    if (sizes.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-400">
                    Talla
                </p>

                {selectedSize && (
                    <span className="text-sm text-zinc-500">
                        {selectedSize}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {sizes.map((size) => {
                    const available = variants.some(
                        (variant) =>
                            variant.size === size &&
                            (
                                !selectedColor ||
                                variant.color === selectedColor
                            ) &&
                            variant.stock > 0
                    );

                    return (
                        <button
                            key={size}
                            disabled={!available}
                            onClick={() => onSelect(size)}
                            className={`
                                h-14
                                rounded-lg
                                border
                                font-medium
                                transition-all
                                duration-300

                                ${
                                    selectedSize === size
                                        ? "bg-white text-black border-white scale-105 shadow-[0_8px_30px_rgba(255,255,255,.18)]"
                                        : available
                                            ? "bg-[#0d0d0d] border-zinc-700 text-zinc-300 hover:border-white hover:bg-[#181818]"
                                            : "bg-[#090909] border-zinc-800 text-zinc-700 cursor-not-allowed"
                                }
                            `}
                        >
                            {size}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}