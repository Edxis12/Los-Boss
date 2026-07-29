interface AddToCartButtonProps {
    added: boolean;
    disabled: boolean;
    needsSelection: boolean;
    price: number;
    onClick: () => void;
}

export default function AddToCartButton({
    added,
    disabled,
    needsSelection,
    price,
    onClick,
}: AddToCartButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                h-14
                w-full
                rounded-xl
                font-semibold
                text-base
                transition-all
                duration-300
                ease-out
                hover:scale-[1.01]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-40
                disabled:hover:scale-100

                ${
                    added
                        ? "bg-emerald-500 text-white shadow-[0_20px_45px_rgba(34,197,94,.35)] hover:bg-emerald-400"
                        : "bg-white text-black shadow-[0_20px_45px_rgba(255,255,255,.15)] hover:bg-zinc-200 hover:shadow-[0_20px_55px_rgba(255,255,255,.22)]"
                }
            `}
        >
            {added
                ? "✓ Agregado al carrito"
                : disabled
                ? needsSelection
                    ? "Selecciona una opción"
                    : "Sin stock"
                : `Agregar al carrito • $${price.toLocaleString("es-MX")}`}
        </button>
    );
}