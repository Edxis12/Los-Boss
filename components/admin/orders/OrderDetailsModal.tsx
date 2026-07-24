"use client";

import { X, Phone, Mail, MapPin, MessageCircle, Check } from "lucide-react";
import { actualizarNotasPedido } from "@/lib/actions/admin-order-actions";
import { useEffect, useState } from "react";
import OrderStatusBadge, {
    type OrderStatus,
} from "./OrderStatusBadge";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

type Props = {
    pedido: any;
    open: boolean;
    onClose: () => void;
};

export default function OrderDetailsModal({ pedido, open, onClose }: Props) {
    const [copiado, setCopiado] = useState("");
    const [notas, setNotas] = useState(pedido?.adminNotes ?? "");
    const [guardandoNotas, setGuardandoNotas] = useState(false);
    const [estadoActual, setEstadoActual] = useState<OrderStatus>(pedido?.status ?? "PENDING");

    useEffect(() => {
        setNotas(pedido?.adminNotes ?? "");

        setEstadoActual(
            pedido?.status ?? "PENDING"
        );
    }, [pedido?.id, pedido?.adminNotes, pedido?.status,]);

    useEffect(() => {
        if (!open || !pedido) return;

        const notasOriginales = pedido.adminNotes ?? "";

        if (notas === notasOriginales) return;

        setGuardandoNotas(true);

        const timeout = setTimeout(async () => {
            await actualizarNotasPedido(pedido.id, notas);
            setGuardandoNotas(false);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [notas, open, pedido]);

    useEffect(() => {
        if (!open) {
            return;
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        const overflowOriginal = document.body.style.overflow;

        document.body.style.overflow = overflowOriginal;
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = overflowOriginal;
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open, onClose])

    if (!open) return null;

    const direccion = `${pedido.address.street}, ${pedido.address.city}, ${pedido.address.state}, CP ${pedido.address.postalCode}`;
    const telefono = pedido.address.phone;
    const whatsappUrl = `https://wa.me/52${telefono.replace(/\D/g, "")}`;

    async function copiar(texto: string, tipo: string) {
        await navigator.clipboard.writeText(texto);

        setCopiado(tipo);

        setTimeout(() => {
            setCopiado("");
        }, 2000);
    }

    return (
        <div
            className="
                fixed
                inset-0
                z-[200]
                flex
                items-end
                justify-center
                bg-black/75
                backdrop-blur-sm
                sm:items-center
                sm:p-4  
            "
        >
            <button
                type="button"
                aria-label="Cerrar detalles del pedido"
                onClick={onClose}
                className="absolute inset-0"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-details-title"
                className="
                    relative
                    z-10
                    max-h-[94dvh]
                    w-full
                    overflow-y-auto
                    overscroll-contain
                    rounded-t-[2rem]
                    border
                    border-white/10
                    bg-zinc-950
                    p-4
                    shadow-[0_35px_100px_rgba(0,0,0,.65)]
                    min-[430px]:p-5
                    sm:max-h-[90vh]
                    sm:max-w-4xl
                    sm:rounded-3xl
                    sm:p-7
                "
            >
                <div className="mb-6 flex items-start justify-between gap-4" >
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Detalle del pedido
                        </p>

                        <h2 id="order-details-title" className="mt-2 break-words text-xl font-black tracking-tight text-white min-[430px]:text-2xl sm:text-3xl">
                            Pedido #{pedido.orderNumber}
                        </h2>

                        <div className="mt-3">
                            <OrderStatusBadge status={estadoActual} />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar modal"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2 md:gap-6">
                    <section>
                        <h3 className="text-sm font-semibold text-zinc-400 mb-2">Cliente</h3>
                        <p className="break-words font-medium text-white">
                            {pedido.address.fullName}
                        </p>

                        <p className="mt-1 break-all text-sm text-zinc-400">
                            {pedido.user.email}
                        </p>

                        <p className="mt-1 break-all text-sm text-zinc-400">
                            {telefono}
                        </p>

                        <div className="mt-5 grid gap-3 min-[430px]:grid-cols-2 sm:flex sm:flex-wrap">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                                    inline-flex
                                    min-h-11
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-emerald-600
                                    px-4
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-emerald-500
                                    sm:w-auto
                                "
                            >
                                <MessageCircle size={17} />
                                WhatsApp
                            </a>

                            <button
                                onClick={() => copiar(telefono, "telefono")}
                                className="
                                    inline-flex
                                    min-h-11
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-zinc-700
                                    px-4
                                    text-sm
                                    font-semibold
                                    text-zinc-200
                                    transition
                                    hover:bg-zinc-800
                                    sm:w-auto
                                "
                            >
                                {copiado === "telefono"
                                    ? <Check size={16} />
                                    : <Phone size={16} />
                                }

                                Teléfono
                            </button>

                            <button
                                onClick={() => copiar(pedido.user.email, "correo")}
                                className="
                                    inline-flex
                                    min-h-11
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-zinc-700
                                    px-4
                                    text-sm
                                    font-semibold
                                    text-zinc-200
                                    transition
                                    hover:bg-zinc-800
                                    sm:w-auto
                                "
                            >
                                {copiado === "correo"
                                    ? <Check size={16} />
                                    : <Mail size={16} />
                                }

                                Correo
                            </button>

                            <button
                                onClick={() => copiar(direccion, "direccion")}
                                className="
                                    inline-flex
                                    min-h-11
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-zinc-700
                                    px-4
                                    text-sm
                                    font-semibold
                                    text-zinc-200
                                    transition
                                    hover:bg-zinc-800
                                    sm:w-auto
                                "
                            >
                                {copiado === "direccion"
                                    ? <Check size={16} />
                                    : <MapPin size={16} />
                                }

                                Dirección
                            </button>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-semibold text-zinc-400 mb-2">Dirección</h3>
                        <p className="break-words text-sm leading-7 text-zinc-300 sm:text-base">
                            {direccion}
                        </p>
                    </section>
                </div>

                <div className="mt-7 border-t border-white/10 pt-7">
                    <div className="mb-6 flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
                                Seguimiento
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-white">
                                Historial del pedido
                            </h3>
                        </div>

                        <OrderStatusBadge status={estadoActual} />
                    </div>

                    {pedido.history?.length > 0 ? (
                        <div className="relative">
                            {pedido.history.map((registro: any, index: number) => {
                                const esUltimo =
                                    index === pedido.history.length - 1;

                                return (
                                    <div
                                        key={registro.id}
                                        className="relative flex gap-3 pb-7 last:pb-0 sm:gap-4"
                                    >
                                        {!esUltimo && (
                                            <div className="absolute left-[7px] top-4 h-full w-px bg-white/10" />
                                        )}

                                        <div
                                            className={`
                                relative
                                z-10
                                mt-1
                                h-[15px]
                                w-[15px]
                                shrink-0
                                rounded-full
                                border-4
                                border-zinc-950
                                ${registro.status === "CANCELLED"
                                                    ? "bg-red-400"
                                                    : esUltimo
                                                        ? "bg-white shadow-[0_0_16px_rgba(255,255,255,.65)]"
                                                        : "bg-zinc-600"
                                                }
                            `}
                                        />

                                        <div className="min-w-0 flex-1">
                                            <OrderStatusBadge status={registro.status} />

                                            <p className="mt-2 text-xs capitalize leading-5 text-zinc-500 sm:text-sm">
                                                {new Date(
                                                    registro.createdAt
                                                ).toLocaleDateString("es-MX", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </p>

                                            <p className="mt-0.5 text-xs text-zinc-600">
                                                {new Date(
                                                    registro.createdAt
                                                ).toLocaleTimeString("es-MX", {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 text-sm text-zinc-500">
                            Este pedido todavía no tiene historial registrado.
                        </p>
                    )}
                </div>

                <div className="mt-7 border-t border-white/10 pt-7">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-bold text-white">
                            Productos
                        </h3>

                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-500">
                            {pedido.items.reduce(
                                (total: number, item: any) =>
                                    total + item.quantity,
                                0
                            )}{" "}
                            piezas
                        </span>
                    </div>

                    <div className="space-y-3">
                        {pedido.items.map((item: any) => {
                            const imageUrl =
                                item.product?.images?.[0]?.url;

                            return (
                                <div
                                    key={item.id}
                                    className="
                                        grid
                                        gap-3
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-black/30
                                        p-3
                                        min-[430px]:grid-cols-[64px_minmax(0,1fr)_auto]
                                        min-[430px]:items-center
                                    "
                                >
                                    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900 min-[430px]:w-16">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={item.product?.name ?? "Producto"}
                                                className="h-full w-full object-contain p-1"
                                            />
                                        ) : (
                                            <div className="flex h-full min-h-40 w-full items-center justify-center text-[10px] text-zinc-600 min-[430px]:min-h-0">
                                                Sin imagen
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="break-words text-sm font-semibold text-white">
                                            {item.product?.name ?? "Producto eliminado"}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            {item.quantity}{" "}
                                            {item.quantity === 1 ? "pieza" : "piezas"} · $
                                            {Number(item.price).toLocaleString("es-MX")} c/u
                                        </p>
                                    </div>

                                    <p className="break-all text-sm font-bold text-white min-[430px]:shrink-0 min-[430px]:text-right">
                                        $
                                        {(
                                            Number(item.price) * item.quantity
                                        ).toLocaleString("es-MX")}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6 border-t border-zinc-800 pt-6">
                    <h3 className="text-sm font-semibold text-zinc-400 mb-3">
                        Notas internas
                    </h3>

                    <textarea
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        rows={4}
                        placeholder="Ej. Cliente contactado por WhatsApp, pagará por transferencia..."
                        className="
                            min-h-32
                            w-full
                            resize-y
                            rounded-xl
                            border
                            border-zinc-800
                            bg-black
                            px-4
                            py-3
                            text-sm
                            leading-6
                            text-white
                            outline-none
                            placeholder:text-zinc-700
                            focus:border-white
                        "
                    />

                    <p className="mt-2 text-xs text-zinc-500">
                        {guardandoNotas ? "Guardando cambios..." : "Guardado automáticamente"}
                    </p>
                </div>

                <div className="mt-6 flex flex-col gap-5 border-t border-zinc-800 pt-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm text-zinc-500">Total</p>
                        <p className="mt-1 break-all text-2xl font-black text-white min-[430px]:text-3xl">
                            ${Number(pedido.total).toLocaleString("es-MX")}
                        </p>
                    </div>

                    <div className="w-full sm:max-w-xs">
                        <OrderStatusSelect orderId={pedido.id} estadoActual={estadoActual} onUpdated={setEstadoActual} />
                    </div>
                </div>
            </div>
        </div>
    );
}