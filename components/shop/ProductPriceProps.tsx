interface ProductPriceProps {
    price: number;
    comparePrice?: number | null;
}

export default function ProductPrice({
    price,
    comparePrice,
}: ProductPriceProps) {
    const hasDiscount =
        comparePrice !== null &&
        comparePrice !== undefined &&
        comparePrice > price;

    return (
        <div>
            {hasDiscount && (
                <p className="text-sm text-red-400 line-through">
                    ${comparePrice.toLocaleString("es-MX")}
                </p>
            )}

            <p className="text-[26px] font-black tracking-tight text-white sm:text-3xl">
                ${price.toLocaleString("es-MX")}
            </p>
        </div>
    );
}