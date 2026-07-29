import { AlertTriangle } from "lucide-react";

interface StockMessageProps {
    stock: number;
    showOutOfStock?: boolean;
}

export default function StockMessage({
    stock,
    showOutOfStock = false,
}: StockMessageProps) {
    if (showOutOfStock) {
        return (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                <p className="text-sm text-red-300">
                    Este producto no tiene existencias en la variante seleccionada.
                </p>
            </div>
        );
    }

    if (stock > 0 && stock <= 3) {
        return (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
                <AlertTriangle size={16} />

                <span>
                    Solo quedan {stock} piezas disponibles
                </span>
            </div>
        );
    }

    return null;
}