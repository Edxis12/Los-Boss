"use client";

import { Eye } from "lucide-react";
import { useQuickViewStore } from "@/store/quick-view-store";

type QuickViewButtonProps = {
    slug: string;
    agotado: boolean;
};

export default function QuickViewButton({
    slug,
    agotado,
}: QuickViewButtonProps) {
    const openQuickView = useQuickViewStore(
        (state) => state.openQuickView
    );

    return (
        <button
            type="button"
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                openQuickView(slug);
            }}
            className="
                flex
                w-full
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-white
                px-4
                py-3
                text-sm
                font-semibold
                text-black
                shadow-xl
                transition-all
                duration-300
                hover:bg-zinc-200
                hover:tracking-wide
            "
            aria-label={`Abrir vista rápida del producto`}
        >
            <Eye size={16} />

            {agotado ? "Ver producto agotado" : "Vista rápida"}
        </button>
    );
}