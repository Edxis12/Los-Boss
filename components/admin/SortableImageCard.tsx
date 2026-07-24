"use client";

import Image from "next/image";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Star, Trash2 } from "lucide-react";

type Props = {
    url: string;
    isPrincipal: boolean;
    onDelete: () => void;
};

export default function SortableImageCard({
    url,
    isPrincipal,
    onDelete,
}: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: url,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (!url?.trim()) {
        return null;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900"
        >
            <div className="relative aspect-square bg-zinc-800">
                <Image
                    src={url}
                    alt={
                        isPrincipal
                            ? "Imagen principal del producto"
                            : "Imagen del producto"
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 220px"
                />
            </div>

            <div className="flex items-center justify-between gap-2 px-3 py-2">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    aria-label="Reordenar imagen"
                    className="cursor-grab text-zinc-500 hover:text-white active:cursor-grabbing"
                >
                    <GripVertical size={18} />
                </button>

                {isPrincipal ? (
                    <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-amber-400">
                        <Star size={15} fill="currentColor" />
                        Principal
                    </span>
                ) : (
                    <span className="min-w-0 truncate text-xs text-zinc-500">
                        Arrastra para poner primero
                    </span>
                )}

                <button
                    type="button"
                    onClick={onDelete}
                    aria-label="Eliminar imagen"
                    className="text-red-400 hover:text-red-300"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}