"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, MapPin, PackageCheck, Phone, ShieldCheck, Truck } from "lucide-react";
import { useCartStore, useCartUserKey } from "@/store/cart-store";
import { crearPedido } from "@/lib/actions/order-actions";
import { City, State as CountryState, } from "country-state-city"

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
    const [stateCode, setStateCode] = useState("");
    const [city, setCity] = useState("");
    const [stateValue, setStateValue] = useState("");
    const [postalCode, setPostalCode] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const estadosMexico = useMemo(() => {
        return CountryState.getStatesOfCountry("MX").sort(
            (estadoA, estadoB) => estadoA.name.localeCompare(estadoB.name, "es")
        );
    }, []);

    const ciudadesEstado = useMemo(() => {
        if (!stateCode) {
            return [];
        }

        return City.getCitiesOfState("MX", stateCode).sort(
            (ciudadA, ciudadB) => ciudadA.name.localeCompare(ciudadB.name, "es")
        );
    }, [stateCode]);

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

        if (phone.length !== 10) {
            setError("El teléfono debe contener 10 números");
            return;
        }

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
        <main className="min-h-screen bg-black">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                {/* Encabezado */}
                <div className="mb-10">
                    <Link
                        href="/carrito"
                        className="mb-5 inline-flex text-sm text-zinc-500 transition hover:text-white"
                    >
                        ← Volver al carrito
                    </Link>

                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                        Finalizar compra
                    </p>

                    <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
                        Checkout
                    </h1>

                    <p className="mt-3 max-w-xl text-zinc-400">
                        Revisa tu pedido y completa los datos para coordinar la
                        entrega.
                    </p>
                </div>

                <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
                    {/* Formulario */}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-8 rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-[0_30px_80px_rgba(0,0,0,.35)] sm:p-8"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                                <MapPin size={20} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-white sm:text-2xl">
                                    Dirección de entrega
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Ingresa la información de la persona que recibirá
                                    el pedido.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="text-sm font-medium text-zinc-300">
                                    Nombre completo
                                </label>

                                <input
                                    type="text"
                                    required
                                    autoComplete="name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Nombre de quien recibe"
                                    className="
                                    mt-2
                                    h-13
                                    w-full
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-black/30
                                    px-4
                                    py-3.5
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-zinc-700
                                    focus:border-white
                                    focus:ring-4
                                    focus:ring-white/10
                                "
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-sm font-medium text-zinc-300">
                                    Teléfono
                                </label>

                                <div className="relative mt-2">
                                    <Phone
                                        size={17}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                                    />

                                    <input
                                        type="tel"
                                        required
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        pattern="[0-9]{10}"
                                        minLength={10}
                                        maxLength={10}
                                        value={phone}
                                        onChange={(event) => {
                                            const soloNumeros = event.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 10);
                                            setPhone(soloNumeros);
                                        }}
                                        placeholder="961 123 4567"
                                        className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-black/30
                                        py-3.5
                                        pl-11
                                        pr-4
                                        text-white
                                        outline-none
                                        transition
                                        placeholder:text-zinc-700
                                        focus:border-white
                                        focus:ring-4
                                        focus:ring-white/10
                                    "
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-sm font-medium text-zinc-300">
                                    Calle, número y colonia
                                </label>

                                <input
                                    type="text"
                                    required
                                    autoComplete="street-address"
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                    placeholder="Ej. Av. Central 123, Col. Centro"
                                    className="
                                    mt-2
                                    w-full
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-black/30
                                    px-4
                                    py-3.5
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-zinc-700
                                    focus:border-white
                                    focus:ring-4
                                    focus:ring-white/10
                                "
                                />
                            </div>
                                        
                            
                            <div>
                                <label className="text-sm font-medium text-zinc-300">Estado</label>

                                <select 
                                    required
                                    value={stateCode}
                                    onChange={(event) => {
                                        const nuevoCodigo = event.target.value;

                                        const estadoSeleccionado = estadosMexico.find(
                                            (estado) => estado.isoCode === nuevoCodigo
                                        );

                                        setStateCode(nuevoCodigo);
                                        setStateValue(estadoSeleccionado?.name ?? "");
                                        // Reinicia la ciuadad cuando cambia el estado.
                                        setCity("");
                                    }}
                                    className="
                                        mt-2
                                        w-full
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-[#090909]
                                        px-4
                                        py-3.5
                                        text-white
                                        outline-none
                                        transition
                                        focus:border-white
                                        focus:ring-4
                                        focus:ring-white/10
                                    "
                                >
                                    <option value="">Selecciona un estado</option>

                                    {estadosMexico.map((estado) => (
                                        <option 
                                            key={estado.isoCode}
                                            value={estado.isoCode}
                                        >
                                            {estado.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-zinc-300">Ciudad</label>

                                <select 
                                    required
                                    value={city}
                                    disabled={!stateCode}
                                    onChange={(event) => setCity(event.target.value)}
                                    className="
                                        mt-2
                                        w-full
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-[#090909]
                                        px-4
                                        py-3.5
                                        text-white
                                        outline-none
                                        transition
                                        focus:border-white
                                        focus:ring-4
                                        focus:ring-white/10
                                        disabled:cursor-not-allowed
                                        disabled-opacity-40
                                    "
                                >
                                    <option value="">
                                        {stateCode
                                            ? "Selecciona una ciudad"
                                            : "Primero selecciona un estado"}
                                    </option>

                                    {ciudadesEstado.map((ciudad, index) => (
                                        <option 
                                            key={`${ciudad.name}-${index}`}
                                            value={ciudad.name}
                                        >
                                            {ciudad.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-sm font-medium text-zinc-300">
                                    Código postal
                                </label>

                                <input
                                    type="text"
                                    required
                                    inputMode="numeric"
                                    autoComplete="postal-code"
                                    maxLength={5}
                                    value={postalCode}
                                    onChange={(e) =>
                                        setPostalCode(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    placeholder="29000"
                                    className="
                                    mt-2
                                    w-full
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-black/30
                                    px-4
                                    py-3.5
                                    text-white
                                    outline-none
                                    transition
                                    placeholder:text-zinc-700
                                    focus:border-white
                                    focus:ring-4
                                    focus:ring-white/10
                                "
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                            <div className="flex items-start gap-3">
                                <CheckCircle2
                                    size={19}
                                    className="mt-0.5 shrink-0 text-emerald-400"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        Confirmación del pedido
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                                        Después de confirmar, nos pondremos en contacto
                                        contigo para coordinar el pago y la entrega.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                            h-14
                            w-full
                            rounded-2xl
                            bg-white
                            text-base
                            font-bold
                            text-black
                            shadow-[0_18px_40px_rgba(255,255,255,.15)]
                            transition-all
                            duration-300
                            hover:scale-[1.01]
                            hover:bg-zinc-200
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            disabled:hover:scale-100
                        "
                        >
                            {loading
                                ? "Confirmando pedido..."
                                : `Confirmar pedido · $${totalPrice.toLocaleString(
                                    "es-MX"
                                )}`}
                        </button>
                    </form>

                    {/* Resumen */}
                    <aside className="h-fit rounded-3xl border border-white/10 bg-[#0d0d0d] p-5 shadow-[0_30px_80px_rgba(0,0,0,.35)] sm:p-7 lg:sticky lg:top-28">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
                            Tu pedido
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">
                                Resumen
                            </h2>

                            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
                                {items.reduce(
                                    (total, item) => total + item.quantity,
                                    0
                                )}{" "}
                                {items.reduce(
                                    (total, item) => total + item.quantity,
                                    0
                                ) === 1
                                    ? "pieza"
                                    : "piezas"}
                            </span>
                        </div>

                        <div className="my-6 max-h-[420px] space-y-5 overflow-y-auto pr-1">
                            {items.map((item) => (
                                <div
                                    key={item.variantId}
                                    className="flex gap-4 border-b border-white/10 pb-5 last:border-0 last:pb-0"
                                >
                                    <Link
                                        href={`/productos/${item.slug}`}
                                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100"
                                    >
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-2"
                                                sizes="80px"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                                                Sin imagen
                                            </div>
                                        )}
                                    </Link>

                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/productos/${item.slug}`}
                                            className="line-clamp-2 text-sm font-semibold leading-5 text-white transition hover:text-zinc-300"
                                        >
                                            {item.name}
                                        </Link>

                                        {(item.color || item.size) && (
                                            <p className="mt-1 text-xs text-zinc-500">
                                                {[item.color, item.size]
                                                    .filter(Boolean)
                                                    .join(" / ")}
                                            </p>
                                        )}

                                        <div className="mt-3 flex items-end justify-between gap-3">
                                            <p className="text-xs text-zinc-500">
                                                ${item.price.toLocaleString("es-MX")} ×{" "}
                                                {item.quantity}
                                            </p>

                                            <p className="shrink-0 text-sm font-bold text-white">
                                                $
                                                {(
                                                    item.price * item.quantity
                                                ).toLocaleString("es-MX")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 border-t border-white/10 pt-5">
                            <div className="flex justify-between text-sm text-zinc-400">
                                <span>Subtotal</span>
                                <span>
                                    ${totalPrice.toLocaleString("es-MX")}
                                </span>
                            </div>

                            <div className="flex justify-between gap-5 text-sm text-zinc-400">
                                <span>Entrega</span>
                                <span className="text-right text-zinc-500">
                                    Se coordina después del pedido
                                </span>
                            </div>

                            <div className="flex items-end justify-between border-t border-white/10 pt-5">
                                <span className="font-semibold text-white">
                                    Total
                                </span>

                                <span className="text-3xl font-black tracking-tight text-white">
                                    ${totalPrice.toLocaleString("es-MX")}
                                </span>
                            </div>
                        </div>

                        <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                <ShieldCheck
                                    size={17}
                                    className="shrink-0 text-zinc-300"
                                />
                                Información protegida
                            </div>

                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                <PackageCheck
                                    size={17}
                                    className="shrink-0 text-zinc-300"
                                />
                                Productos cuidadosamente revisados
                            </div>

                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                <Truck
                                    size={17}
                                    className="shrink-0 text-zinc-300"
                                />
                                Entrega personal o envío nacional
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}