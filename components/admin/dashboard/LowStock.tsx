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
        <section className="h-full rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justift-center rounded-xl bg-amber-500/10 text-amber-400">
                    <AlertTriangle size={19} />
                </div>

                <div>
                    <h2 className="text-lg font-bold text-white">
                        Productos con poco stock
                    </h2>
                    <p className="text-sm text-zinc-500">
                        Variantes con 3 piezas o menos
                    </p>
                </div>
            </div>

            {variantes.length === 0 ? (
                <p className="text-sm text-zinc-500">
                    No hay productos con poco stock
                </p>
            ) : (
                <div className="space-y-1">
                    {variantes.map((variant) => (
                        <div
                            key={variant.id}
                            className="flex items-center justify-between gap-4 border-b border-zinc-800 py-3 last:border-0"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">
                                    {variant.product.name}
                                </p>

                                <p className="text-xs text-zinc-500">
                                    {[variant.color, variant.size]
                                        .filter(Boolean)
                                        .join(" / ") || "General"}
                                </p>
                            </div>

                            <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${variant.stock === 0
                                        ? "bg-red-500/10 text-red-400"
                                        : "bg-amber-500/10 text-amber-400"
                                    }`}
                            >

                                {variant.stock === 0
                                    ? "Agotado"
                                    : `${variant.stock} restantes`
                                }
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}