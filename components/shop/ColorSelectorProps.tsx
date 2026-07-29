interface ColorSelectorProps {
    colors: string[];
    selectedColor: string | null;
    onSelect: (color: string) => void;
}

export default function ColorSelector({
    colors,
    selectedColor,
    onSelect,
}: ColorSelectorProps) {
    if (colors.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-400">
                    Color
                </p>

                {selectedColor && (
                    <span className="text-sm text-zinc-500">
                        {selectedColor}
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                    <button
                        key={color}
                        onClick={() => onSelect(color)}
                        className={`
                            min-h-11
                            min-w-[70px]
                            rounded-lg
                            border
                            px-5
                            text-sm
                            transition-all
                            duration-300
                            ease-out

                            ${
                                selectedColor === color
                                    ? "border-white bg-white text-black shadow-[0_8px_30px_rgba(255,255,255,.18)]"
                                    : "border-zinc-700 bg-[#0d0d0d] text-zinc-300 hover:border-white hover:bg-[#181818] active:scale-95"
                            }
                        `}
                    >
                        {color}
                    </button>
                ))}
            </div>
        </div>
    );
}