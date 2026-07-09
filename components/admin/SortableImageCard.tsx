"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Star, Trash2 } from "lucide-react";
import Image from "next/image";

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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900"
        >
            <div className="relative aspect-square bg-zinc-800">
                <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                />
            </div>

            <div className="flex items-center justify-between px-3 py-2">

                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="text-zinc-500 hover:text-white cursor-grab active:cursor-grabbing"
                >
                    <GripVertical size={18} />
                </button>

                {isPrincipal ? (
                    <span className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                        <Star size={15} fill="currentColor" />
                        Principal
                    </span>
                ) : (
                    <span className="text-xs text-zinc-500">
                        Arrastra para poner primero
                    </span>
                )}

                <button
                    type="button"
                    onClick={onDelete}
                    className="text-red-400 hover:text-red-300"
                >
                    <Trash2 size={16} />
                </button>

            </div>
        </div>
    );
}