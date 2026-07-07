"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { MoreVertical, Trash2, Power, Pencil } from "lucide-react";
import {
    eliminarProducto,
    cambiarEstadoProducto,
} from "@/lib/actions/product-actions";
import { useRowMenuStore } from "@/store/row-menu-store";

export default function ProductRowActions({
    productId,
    isActive,
}: {
    productId: string;
    isActive: boolean;
}) {
    const router = useRouter();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const openId = useRowMenuStore((state) => state.openId);
    const setOpenId = useRowMenuStore((state) => state.setOpenId);
    const menuOpen = openId === productId;

    const [coords, setCoords] = useState({ top: 0, left: 0 });

    function abrirMenu() {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - 192,
            });
        }

        setOpenId(menuOpen ? null : productId);
    }

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

    async function handleEliminar() {
        if (
            !confirm(
                "¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer."
            )
        ) {
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

            {menuOpen &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{
                            position: "absolute",
                            top: coords.top,
                            left: coords.left,
                        }}
                        className="w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-[100]"
                    >
                        <button
                            onClick={() => {
                                router.push(`/admin/productos/${productId}/editar`);
                                setOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 text-left"
                        >
                            <Pencil size={15} />
                            Editar producto
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
        </>
    );
}