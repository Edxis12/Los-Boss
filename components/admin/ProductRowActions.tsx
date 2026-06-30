"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { MoreVertical, Trash2, Power, PackageSearch } from "lucide-react";
import {
    actualizarStock,
    eliminarProducto,
    cambiarEstadoProducto,
} from "@/lib/actions/product-actions";
import { useRowMenuStore } from "@/store/row-menu-store";

type Variant = {
    id: string;
    size: string | null;
    color: string | null;
    stock: number;
};

export default function ProductRowActions({
    productId,
    isActive,
    variants,
}: {
    productId: string;
    isActive: boolean;
    variants: Variant[];
}) {
    const router = useRouter();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const openId = useRowMenuStore((state) => state.openId);
    const setOpenId = useRowMenuStore((state) => state.setOpenId);
    const menuOpen = openId === productId;

    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [stockOpen, setStockOpen] = useState(false);
    const [stocks, setStocks] = useState(
        Object.fromEntries(variants.map((v) => [v.id, v.stock]))
    );

    // Calcula la posicion del menu segun donde este el boton en pantalla
    function abrirMenu() {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - 192, // 192px = ancho del menu (w-48)
            });
        }
        setOpenId(menuOpen ? null : productId);
    }

    // Cierra el menu si haces clic afuera
    useEffect(() => {
        function handleClickFuera(e: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setOpenId(null);
            }
        }
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickFuera);
        }
        return () => document.removeEventListener("mousedown", handleClickFuera);
    }, [menuOpen, setOpenId]);

    async function guardarStock() {
        for (const variant of variants) {
            const nuevo = stocks[variant.id];
            if (nuevo !== variant.stock) {
                await actualizarStock(variant.id, nuevo);
            }
        }
        setStockOpen(false);
        router.refresh();
    }

    async function handleEliminar() {
        if (!confirm("¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.")) {
            return;
        }
        await eliminarProducto(productId);
        router.refresh();
    }

    async function handleToggleActivo() {
        await cambiarEstadoProducto(productId, !isActive);
        router.refresh();
    }

    return (
        <>
            <button
                ref={buttonRef}
                onClick={abrirMenu}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800"
                aria-label="Más acciones"
            >
                <MoreVertical size={18} />
            </button>

            {/* Porta: el menu se renderiza directo en <body>, asi que nunca se corta
            por el overflow-hidden de la tabla, y siempre queda arriba de todo */}
            {menuOpen &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{ position: "absolute", top: coords.top, left: coords.left }}
                        className="w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-[100]"
                    >
                        <button
                            onClick={() => {
                                setStockOpen(true);
                                setOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 text-left"
                        >
                            <PackageSearch size={15} />
                            Editar stock
                        </button>
                        <button
                            onClick={() => {
                                handleToggleActivo();
                                setOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 text-left"
                        >
                            <Power size={15} />
                            {isActive ? "Desactivar" : "Activar"}
                        </button>
                        <button
                            onClick={() => {
                                handleEliminar();
                                setOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 text-left"
                        >
                            <Trash2 size={15} />
                            Eliminar
                        </button>
                    </div>,
                    document.body
                )}
            {/* Modal de edicion de stock (tambien via portal, por la misma razon) */}
            {stockOpen &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z[200]"
                        onClick={() => setStockOpen(false)}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm"
                        >
                            <h3 className="text-white font-semibold mb-4">
                                Editar stock por variante
                            </h3>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {variants.map((v) => (
                                    <div
                                        key={v.id}
                                        className="flex items-center justify-between gap-3"
                                    >
                                        <span className="text-sm text-zinc-300">
                                            {[v.color, v.size].filter(Boolean).join(" / ") ||
                                                "General"}
                                        </span>
                                        <input
                                            type="number"
                                            min={0}
                                            value={stocks[v.id]}
                                            onChange={(e) => setStocks((prev) => ({
                                                ...prev,
                                                [v.id]: Number(e.target.value),
                                            }))
                                            }
                                            className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-white  text-sm text-right"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-5">
                                <button
                                    onClick={() => setStockOpen(false)}
                                    className="flex-1 border border-zinc-700 text-zinc-300 rounded-lg py-2 text-sm hover:bg-zinc-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={guardarStock}
                                    className="flex-1 bg-white text-black font-semibold rounded-lg py-2 text-sm hover:bg-zinc-200"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
