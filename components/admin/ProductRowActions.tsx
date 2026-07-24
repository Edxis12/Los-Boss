"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    MoreVertical,
    Pencil,
    Power,
    Trash2,
    X,
} from "lucide-react";

import {
    cambiarEstadoProducto,
    eliminarProducto,
} from "@/lib/actions/product-actions";
import { useRowMenuStore } from "@/store/row-menu-store";

export default function ProductRowActions({
    productId,
    isActive,
    menuKey
}: {
    productId: string;
    isActive: boolean;
    menuKey: string;
}) {
    const router = useRouter();

    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const openId = useRowMenuStore(
        (state) => state.openId
    );

    const setOpenId = useRowMenuStore(
        (state) => state.setOpenId
    );

    const menuOpen = openId === menuKey;

    const [coords, setCoords] = useState({
        top: 0,
        left: 0,
    });

    const [procesando, setProcesando] = useState(false);
    const [esMovil, setEsMovil] = useState(false);

    useEffect(() => {
        function detectarPantalla() {
            setEsMovil(window.innerWidth < 640);
        }

        detectarPantalla();

        window.addEventListener(
            "resize",
            detectarPantalla
        );

        return () => {
            window.removeEventListener(
                "resize",
                detectarPantalla
            );
        };
    }, []);

    function actualizarPosicionMenu() {
        if (!buttonRef.current) {
            return;
        }

        const rect =
            buttonRef.current.getBoundingClientRect();

        const anchoMenu = 208;
        const margen = 12;

        const left = Math.min(
            Math.max(
                rect.right +
                window.scrollX -
                anchoMenu,
                margen
            ),
            window.innerWidth -
            anchoMenu -
            margen +
            window.scrollX
        );

        setCoords({
            top: rect.bottom + window.scrollY + 6,
            left,
        });
    }

    function abrirMenu() {
        if (menuOpen) {
            setOpenId(null);
            return;
        }

        actualizarPosicionMenu();
        setOpenId(menuKey);
    }

    function cerrarMenu() {
        setOpenId(null);
    }

    useEffect(() => {
        function handleClickFuera(
            event: MouseEvent
        ) {
            const target = event.target as Node;

            if (
                menuRef.current &&
                !menuRef.current.contains(target) &&
                buttonRef.current &&
                !buttonRef.current.contains(target)
            ) {
                cerrarMenu();
            }
        }

        function handleEscape(
            event: KeyboardEvent
        ) {
            if (event.key === "Escape") {
                cerrarMenu();
            }
        }

        function handleReposicionar() {
            if (menuOpen && !esMovil) {
                actualizarPosicionMenu();
            }
        }

        if (menuOpen) {
            document.addEventListener(
                "mousedown",
                handleClickFuera
            );

            document.addEventListener(
                "keydown",
                handleEscape
            );

            window.addEventListener(
                "scroll",
                handleReposicionar,
                true
            );

            window.addEventListener(
                "resize",
                handleReposicionar
            );
        }

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickFuera
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );

            window.removeEventListener(
                "scroll",
                handleReposicionar,
                true
            );

            window.removeEventListener(
                "resize",
                handleReposicionar
            );
        };
    }, [menuOpen, esMovil]);

    async function handleEliminar() {
        const confirmado = window.confirm(
            "¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer."
        );

        if (!confirmado) {
            return;
        }

        try {
            setProcesando(true);

            const resultado =
                await eliminarProducto(productId);

            if ("error" in resultado) {
                window.alert(resultado.error);
                return;
            }

            cerrarMenu();
            router.refresh();
        } catch (error) {
            console.error(
                "Error al eliminar producto:",
                error
            );

            window.alert(
                "No se pudo eliminar el producto"
            );
        } finally {
            setProcesando(false);
        }
    }

    async function handleToggleActivo() {
        try {
            setProcesando(true);

            const resultado =
                await cambiarEstadoProducto(
                    productId,
                    !isActive
                );

            if ("error" in resultado) {
                window.alert(resultado.error);
                return;
            }

            cerrarMenu();
            router.refresh();
        } catch (error) {
            console.error(
                "Error al cambiar estado:",
                error
            );

            window.alert(
                "No se pudo cambiar el estado del producto"
            );
        } finally {
            setProcesando(false);
        }
    }

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={abrirMenu}
                disabled={procesando}
                aria-label="Más acciones"
                aria-expanded={menuOpen}
                className="
                    inline-flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/10
                    text-zinc-400
                    transition
                    hover:border-white/20
                    hover:bg-white/[0.05]
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            >
                <MoreVertical size={18} />
            </button>

            {menuOpen &&
                typeof document !== "undefined" &&
                createPortal(
                    esMovil ? (
                        <div className="fixed inset-0 z-[200]">
                            <button
                                type="button"
                                aria-label="Cerrar acciones"
                                onClick={cerrarMenu}
                                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                            />

                            <div
                                ref={menuRef}
                                className="
                                    absolute
                                    inset-x-0
                                    bottom-0
                                    rounded-t-[2rem]
                                    border-t
                                    border-white/10
                                    bg-[#0d0d0d]
                                    p-4
                                    shadow-[0_-30px_90px_rgba(0,0,0,.65)]
                                "
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
                                            Producto
                                        </p>

                                        <h2 className="mt-1 text-xl font-bold text-white">
                                            Acciones
                                        </h2>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={cerrarMenu}
                                        aria-label="Cerrar"
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="grid gap-2">
                                    <Link
                                        href={`/admin/productos/${productId}/editar`}
                                        onClick={() => setOpenId(null)}
                                        className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-white/10 px-4 text-left text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] disabled:opacity-50"
                                    >
                                        <Pencil size={17} />
                                        Editar producto
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={
                                            handleToggleActivo
                                        }
                                        disabled={procesando}
                                        className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-white/10 px-4 text-left text-sm font-medium text-zinc-200 transition hover:bg-white/[0.05] disabled:opacity-50"
                                    >
                                        <Power size={17} />
                                        {isActive
                                            ? "Desactivar producto"
                                            : "Activar producto"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleEliminar}
                                        disabled={procesando}
                                        className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-red-500/20 px-4 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                                    >
                                        <Trash2 size={17} />
                                        Eliminar producto
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            ref={menuRef}
                            style={{
                                position: "absolute",
                                top: coords.top,
                                left: coords.left,
                            }}
                            className="
                                z-[200]
                                w-52
                                overflow-hidden
                                rounded-xl
                                border
                                border-zinc-800
                                bg-zinc-900
                                p-1.5
                                shadow-[0_20px_60px_rgba(0,0,0,.55)]
                            "
                        >
                            <Link
                                href={`/admin/productos/${productId}/editar`}
                                onClick={() => setOpenId(null)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
                            >
                                <Pencil size={15} />
                                Editar producto
                            </Link>

                            <button
                                type="button"
                                onClick={
                                    handleToggleActivo
                                }
                                disabled={procesando}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
                            >
                                <Power size={15} />
                                {isActive
                                    ? "Desactivar"
                                    : "Activar"}
                            </button>

                            <div className="my-1 border-t border-white/10" />

                            <button
                                type="button"
                                onClick={handleEliminar}
                                disabled={procesando}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                            >
                                <Trash2 size={15} />
                                Eliminar
                            </button>
                        </div>
                    ),
                    document.body
                )}
        </>
    );
}