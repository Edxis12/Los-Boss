"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCartStore, useCartUserKey } from "@/store/cart-store";
import { crearPedido } from "@/lib/actions/order-actions";

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const userKey = useCartUserKey(session?.user?.id);

    const items = useCartStore((state) => state.getItems(userKey));
    const totalPrice = useCartStore((state) => state.getTotalPrice(userKey));
    const clearCart = useCartStore((state) => state.clearCart);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("Tuxtla Gutiérrez");
    const [stateValue, setStateValue] = useState("Chiapas");
    const [postalCode, setPostalCode] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // No logueado: lo mandamos a login y luego de regreso aquí
    if (mounted && status === "unauthenticated") {
        return (
            <div className="max-w-md mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Inicia sesión para continuar
                </h1>
                <p className="text-zinc-400 mb-6">
                    Necesitas una cuenta para completar tu compra.
                </p>
                <Link
                    href="/login"
                    className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition"
                >
                    Iniciar sesión
                </Link>
            </div>
        );
    }

    if (!mounted || status === "loading") {
        return (
            <div className="max-w-3xl mx-auto px-4 py-24">
                <div className="h-8 w-48 bg-zinc-900 rounded animate-pulse mb-8" />
                <div className="h-64 bg-zinc-900 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="max-w-md mx-auto px-4 py-24 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">
                    Tu carrito está vacío
                </h1>
                <Link
                    href="/productos"
                    className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-zinc-200 transition mt-4"
                >
                    Ver productos
                </Link>
            </div>
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!fullName || !phone || !street || !city || !stateValue || !postalCode) {
            setError("Completa todos los campos de dirección");
            return;
        }

        setLoading(true);

        const resultado = await crearPedido(
            items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.price,
            })),
            { fullName, phone, street, city, state: stateValue, postalCode }
        );

        setLoading(false);

        if (resultado.error) {
            setError(resultado.error);
            return;
        }

        clearCart(userKey);
        router.push(`/cuenta/pedidos/confirmacion?orden=${resultado.orderNumber}`);
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-10">

                <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
                    FINALIZAR COMPRA
                </p>

                <h1 className="mt-2 text-5xl font-black tracking-tight text-white">
                    Checkout
                </h1>

                <p className="mt-3 text-zinc-400">
                    Completa tu información para finalizar tu pedido.
                </p>

            </div>

            <div className="grid lg:grid-cols-[1.8fr_420px] gap-12 items-start">
                {/* Formulario de dirección */}
                <form onSubmit={handleSubmit} className="md:col-span-2 rounded-3xl border border-white/10 bg-[#0d0d0d] p-8 shadow-[0_30px_80px_rgba(0,0,0,.35)] space-y-8">
                    <h2 className="text-2xl font-bold text-white">
                        Dirección de envío
                    </h2>

                    {error && (
                        <p className="bg-red-950 text-red-400 text-sm rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <div>
                        <label className="text-sm text-zinc-300">Nombre completo</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="
                                mt-2
                                w-full
                                rounded-xl
                                border
                                border-white/10
                                bg-black/20
                                px-4
                                py-3
                                text-white
                                outline-none
                                transition-all
                                duration-300
                                focus:border-white
                                focus:ring-4
                                focus:ring-white/10
                            "
                        />
                    </div>

                    <div>
                        <label className="text-sm text-zinc-300">Teléfono</label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="
                                mt-2
                                w-full
                                rounded-xl
                                border
                                border-white/10
                                bg-black/20
                                px-4
                                py-3
                                text-white
                                outline-none
                                transition-all
                                duration-300
                                focus:border-white
                                focus:ring-4
                                focus:ring-white/10
                            "
                            placeholder="961 123 4567"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-zinc-300">Calle y número</label>
                        <input
                            type="text"
                            required
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            className="
                                w-full
                                rounded-xl
                                border
                                border-white/10
                                bg-black/20
                                px-4
                                py-3
                                text-white
                                outline-none
                                transition-all
                                duration-300
                                ocus:border-white
                                focus:ring-4
                                focus:ring-white/10
                            "
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-zinc-300">Ciudad</label>
                            <input
                                type="text"
                                required
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-black/20
                                    px-4
                                    py-3
                                    text-white
                                    outline-none
                                    transition-all
                                    duration-300
                                    focus:border-white
                                    focus:ring-4
                                    focus:ring-white/10
                                "
                            />
                        </div>
                        <div>
                            <label className="text-sm text-zinc-300">Estado</label>
                            <input
                                type="text"
                                required
                                value={stateValue}
                                onChange={(e) => setStateValue(e.target.value)}
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-black/20
                                    px-4
                                    py-3
                                    text-white
                                    outline-none
                                    transition-all
                                    duration-300
                                    focus:border-white
                                    focus:ring-4
                                    focus:ring-white/10
                                "
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-zinc-300">Código postal</label>
                        <input
                            type="text"
                            required
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="
                                w-full
                                rounded-xl
                                border
                                border-white/10
                                bg-black/20
                                px-4
                                py-3
                                text-white
                                outline-none
                                transition-all
                                duration-300
                                focus:border-white
                                focus:ring-4
                                focus:ring-white/10
                            "
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                        w-full
                        h-14
                        rounded-2xl
                        bg-white
                        text-black
                        font-bold
                        text-base
                        transition-all
                        duration-300
                        hover:scale-[1.02]
                        hover:bg-zinc-200
                        shadow-[0_18px_40px_rgba(255,255,255,.15)]
                        disabled:opacity-50
                    "
                    >
                        {loading ? "Procesando..." : "Confirmar pedido"}
                    </button>

                    <p className="text-xs text-zinc-500 text-center">
                        Pago contra entrega / por transferencia. Te contactaremos para
                        coordinar.
                    </p>
                </form>

                {/* Resumen */}
                <div className="sitcky top-28 h-fit rounded-3xl border border-white/10 bg-[#0d0d0d] p-8 shadow-[0_30px_80px_rgba(0,0,0,.35)]">
                    <p className="text-xs uppercase tracking-[0.35em] text-zinc-500 mb-2">
                        TU PEDIDO
                    </p>
                    
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Resumen del pedido
                    </h2>

                    <div className="space-y-3 max-h-72 overflow-y-auto mb-4">
                        {items.map((item) => (
                            <div key={item.variantId} className="flex justify-between text-sm">
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-zinc-200 line-clamp-1">{item.name}</p>
                                    <p className="text-zinc-500">
                                        {[item.color, item.size].filter(Boolean).join(" / ")} ×{" "}
                                        {item.quantity}
                                    </p>
                                </div>
                                <p className="text-zinc-300 whitespace-nowrap">
                                    ${(item.price * item.quantity).toLocaleString("es-MX")}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-zinc-800 pt-4 flex justify-between font-semibold text-white">
                        <span>Total</span>
                        <span>${totalPrice.toLocaleString("es-MX")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}