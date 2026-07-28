import { AlertTriangle } from "lucide-react";

export type LowStockVariant = {
    id: string;
    stock: number;
    size: string | null;
    color: string | null;
    product: {
        name: string;
    };
};

type Props = {
    variantes: LowStockVariant[];
};

export default function LowStock({ variantes }: Props) {
    return (
        <section className="h-full rounded-3xl border border-zinc-800 bg-zinc-950 p-4 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:p-6">
            <div className="mb-6 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                    <AlertTriangle
                        size={20}
                        className="shrink-0"
                    />
                </div>

                <div className="min-w-0">
                    <h2 className="text-lg font-bold leading-tight text-white">
                        Productos con poco stock
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-zinc-500">
                        Variantes con 3 piezas o menos
                    </p>
                </div>
            </div>

            {variantes.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-white">
                        Inventario estable
                    </p>

                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                        No hay productos con poco stock.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {variantes.map((variant) => {
                        const descripcionVariante =
                            [variant.color, variant.size]
                                .filter(Boolean)
                                .join(" / ") || "General";

                        return (
                            <article
                                key={variant.id}
                                className="
                                    flex
                                    min-w-0
                                    flex-col
                                    gap-3
                                    rounded-2xl
                                    border
                                    border-zinc-800
                                    bg-black/20
                                    p-4
                                    transition
                                    hover:border-zinc-700
                                    min-[430px]:flex-row
                                    min-[430px]:items-center
                                    min-[430px]:justify-between
                                "
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">
                                        {variant.product.name}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-zinc-500">
                                        {descripcionVariante}
                                    </p>
                                </div>

                                <span
                                    className={`
                                        inline-flex
                                        w-fit
                                        shrink-0
                                        items-center
                                        rounded-full
                                        border
                                        px-3
                                        py-1.5
                                        text-[11px]
                                        font-bold
                                        leading-none
                                        ${variant.stock === 0
                                            ? "border-red-500/20 bg-red-500/10 text-red-400"
                                            : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                        }
                                    `}
                                >
                                    {variant.stock === 0
                                        ? "Agotado"
                                        : `${variant.stock} ${variant.stock === 1
                                            ? "pieza restante"
                                            : "piezas restantes"
                                        }`}
                                </span>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}