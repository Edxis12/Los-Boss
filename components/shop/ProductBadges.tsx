import { Badge } from "@/components/ui";

interface ProductBadgesProps {
    stockTotal: number;
    price: number;
    comparePrice?: number | null;
    isFeatured: boolean;
    createdAt: string;
}

export default function ProductBadges({
    stockTotal,
    price,
    comparePrice,
    isFeatured,
    createdAt,
}: ProductBadgesProps) {
    const agotado = stockTotal <= 0;

    const pocoStock =
        stockTotal > 0 &&
        stockTotal <= 3;

    const enOferta =
        comparePrice != null &&
        comparePrice > price;

    const fecha = new Date(createdAt);

    const dias =
        (Date.now() - fecha.getTime()) /
        (1000 * 60 * 60 * 24);

    const esNuevo =
        !Number.isNaN(fecha.getTime()) &&
        dias <= 30;

    const badges: {
        label: string;
        className: string;
    }[] = [];

    if (agotado) {
        badges.push({
            label: "Agotado",
            className:
                "border-red-500/30 bg-red-500/90 text-white",
        });
    } else if (pocoStock) {
        badges.push({
            label: "Últimas piezas",
            className:
                "border-amber-500/30 bg-amber-400/95 text-black",
        });
    }

    if (enOferta) {
        badges.push({
            label: "Oferta",
            className:
                "border-red-500/30 bg-red-500/90 text-white",
        });
    }

    if (esNuevo) {
        badges.push({
            label: "Nuevo",
            className:
                "border-sky-500/30 bg-sky-500/90 text-white",
        });
    }

    if (isFeatured) {
        badges.push({
            label: "Destacado",
            className:
                "border-white/40 bg-white/95 text-black",
        });
    }

    if (badges.length === 0) {
        return null;
    }

    return (
        <div className="absolute left-4 top-4 z-10 flex max-w-[65%] flex-col items-start gap-2">
            {badges.map((badge) => (
                <Badge
                    key={badge.label}
                    className={badge.className}
                >
                    {badge.label}
                </Badge>
            ))}
        </div>
    );
}