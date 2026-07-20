"use client";

import { X, Phone, Mail, MapPin, MessageCircle, Check } from "lucide-react";
import { actualizarNotasPedido } from "@/lib/actions/admin-order-actions";
import { useEffect, useState } from "react";
import OrderStatusBadge from "./OrderStatusBadge";
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

    useEffect(() => {
        setNotas(pedido?.adminNotes ?? "");
    }, [pedido?.id, pedido?.adminNotes]);

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
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-5 shadow-[0_35px_100px_rgba(0,0,0,.55)] sm:p-7">
                <div className="flex items-center justify-between mb-6" >
                    <div>
                        <h2 className="text-2xl font-black text-white">
                            Pedido #{pedido.orderNumber}
                        </h2>
                        <OrderStatusBadge status={pedido.status} />
                    </div>

                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X size={22} />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <section>
                        <h3 className="text-sm font-semibold text-zinc-400 mb-2">Cliente</h3>
                        <p className="text-white">{pedido.address.fullName}</p>
                        <p className="text-zinc-400">{pedido.user.email}</p>
                        <p className="text-zinc-400">{telefono}</p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                                    flex
                                    items-center
                                    gap-2 
                                    rounded-lg
                                    bg-emerald-600
                                    px-4
                                    py-2
                                    text-white
                                    hover:bg-emerald-500
                                    transition
                                "
                            >
                                <MessageCircle size={17} />
                                WhatsApp
                            </a>

                            <button
                                onClick={() => copiar(telefono, "telefono")}
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-zinc-700
                                    px-4
                                    py-2
                                    hover:bg-zinc-800
                                    transition
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
                                    flex
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-zinc-700
                                    px-4
                                    py-2
                                    hover:bg-zinc-800
                                    transition
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
                                    flex
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-zinc-700
                                    px-4
                                    py-2
                                    hover:bg-zinc-800
                                    transition
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
                        <p className="text-zinc-300">{direccion}</p>
                    </section>
                </div>

                <div className="mt-7 border-t border-white/10 pt-7">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
                                Seguimiento
                            </p>

                            <h3 className="mt-1 text-lg font-bold text-white">
                                Historial del pedido
                            </h3>
                        </div>

                        <OrderStatusBadge status={pedido.status} />
                    </div>

                    {pedido.history?.length > 0 ? (
                        <div className="relative">
                            {pedido.history.map((registro: any, index: number) => {
                                const esUltimo =
                                    index === pedido.history.length - 1;

                                return (
                                    <div
                                        key={registro.id}
                                        className="relative flex gap-4 pb-7 last:pb-0"
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

                                            <p className="mt-2 text-sm capitalize text-zinc-500">
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
                    <div className="mb-4 flex items-center justify-between">
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
                                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-3"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={
                                                        item.product?.name ??
                                                        "Producto"
                                                    }
                                                    className="h-full w-full object-contain p-1"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-600">
                                                    Sin imagen
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-white">
                                                {item.product?.name ??
                                                    "Producto eliminado"}
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-500">
                                                {item.quantity}{" "}
                                                {item.quantity === 1
                                                    ? "pieza"
                                                    : "piezas"}{" "}
                                                · $
                                                {Number(
                                                    item.price
                                                ).toLocaleString("es-MX")}{" "}
                                                c/u
                                            </p>
                                        </div>
                                    </div>

                                    <p className="shrink-0 text-sm font-bold text-white">
                                        $
                                        {(
                                            Number(item.price) *
                                            item.quantity
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
                        className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white"
                    />

                    <p className="mt-2 text-xs text-zinc-500">
                        {guardandoNotas ? "Guardando cambios..." : "Guardado automáticamente"}
                    </p>
                </div>

                <div className="mt-6 border-t border-zinc-800 pt-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-zinc-500">Total</p>
                        <p className="text-2xl font-black text-white">
                            ${Number(pedido.total).toLocaleString("es-MX")}
                        </p>
                    </div>

                    <OrderStatusSelect orderId={pedido.id} estadoActual={pedido.status} />
                </div>
            </div>
        </div>
    )
}