"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { SlidersHorizontal, X, } from "lucide-react";
import { motion } from "motion/react";

type Categoria = {
    name: string;
    slug: string;
};

type FilterSidebarProps = {
    categorias: Categoria[];
    marcas: string[];
    categoriaActiva?: string;
};

export default function FilterSidebar({
    categorias,
    marcas,
    categoriaActiva,
}: FilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [precioMin, setPrecioMin] = useState(
        searchParams.get("precioMin") ?? ""
    );
    const [precioMax, setPrecioMax] = useState(
        searchParams.get("precioMax") ?? ""
    );

    const [filtrosMovilAbiertos, setFiltrosMovilAbiertos] = useState(false);

    const ordenActual = searchParams.get("ordenar") ?? "";
    const marcaActual = searchParams.get("marca") ?? "";
    const disponibilidadActual = searchParams.get("disponibilidad") ?? "";

    const soloDestacados = searchParams.get("destacados") === "true";
    const soloOfertas = searchParams.get("ofertas") === "true";
    const soloNuevos = searchParams.get("nuevos") === "true";
    const cantidadFiltrosActivos = useMemo(() => {
        const filtros = [
            searchParams.get("categoria"),
            searchParams.get("marca"),
            searchParams.get("disponibilidad"),
            searchParams.get("precioMin"),
            searchParams.get("precioMax"),
            searchParams.get("destacados"),
            searchParams.get("ofertas"),
            searchParams.get("nuevos"),
        ];

        return filtros.filter(Boolean).length;
    }, [searchParams]);

    useEffect(() => {
        setPrecioMin(searchParams.get("precioMin") ?? "");
        setPrecioMax(searchParams.get("precioMax") ?? "");
    }, [searchParams]);

    function navegarConParametros(
        params: URLSearchParams
    ) {
        params.delete("page");

        const query = params.toString();

        router.push(
            query
                ? `/productos?${query}`
                : "/productos"
        );

        setFiltrosMovilAbiertos(false);
    }

    function actualizarParametro(
        nombre: string,
        valor?: string
    ) {
        const params = new URLSearchParams(searchParams.toString());

        if (valor) {
            params.set(nombre, valor);
        } else {
            params.delete(nombre);
        }

        navegarConParametros(params);
    }

    function alternarParametroBooleano(nombre: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (params.get(nombre) === "true") {
            params.delete(nombre);
        } else {
            params.set(nombre, "true");
        }

        navegarConParametros(params);
    }

    function aplicarFiltrosPrecio() {
        const params = new URLSearchParams(searchParams.toString());

        if (precioMin) {
            params.set("precioMin", precioMin);
        } else {
            params.delete("precioMin");
        }

        if (precioMax) {
            params.set("precioMax", precioMax);
        } else {
            params.delete("precioMax");
        }

        navegarConParametros(params);
    }

    function crearHrefCategoria(slug?: string) {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        if (slug) {
            params.set("categoria", slug);
        } else {
            params.delete("categoria");
        }

        params.delete("page");

        const query = params.toString();

        return query
            ? `/productos?${query}`
            : "/productos";
    }

    function limpiarFiltros() {
        const params = new URLSearchParams();

        const genero = searchParams.get("genero");

        if (genero) {
            params.set("genero", genero);
        }

        navegarConParametros(params);
        setPrecioMin("");
        setPrecioMax("");
    }

    const contenidoFiltros = (
        <>
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
                    Filtros
                </p>

                <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="text-xs text-zinc-500 transition hover:text-white"
                >
                    Limpiar
                </button>
            </div>

            <div className="border-t border-white/10" />

            {/* Categorías */}
            <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Categorías
                </h3>

                <nav className="flex flex-col gap-1">
                    <Link
                        href={crearHrefCategoria()}
                        className={`
                            rounded-xl
                            px-4
                            py-2.5
                            text-sm
                            transition-all
                            duration-300
                            ${!categoriaActiva
                                ? "bg-white font-semibold text-black shadow-md"
                                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                            }
                        `}
                    >
                        Todas
                    </Link>

                    {categorias.map((categoria) => (
                        <Link
                            key={categoria.slug}
                            href={crearHrefCategoria(categoria.slug)}
                            className={`
                                rounded-lg
                                px-3
                                py-2
                                text-sm
                                transition
                                ${categoriaActiva === categoria.slug
                                    ? "bg-white font-semibold text-black shadow-md"
                                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                }
                            `}
                        >
                            {categoria.name}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="border-t border-white/10" />

            {/* Marca */}
            <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Marca
                </h3>

                <select
                    value={marcaActual}
                    onChange={(event) =>
                        actualizarParametro("marca", event.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-zinc-700 bg-[#0d0d0d] px-4 text-sm text-white outline-none transition focus:border-white"
                >
                    <option value="">Todas las marcas</option>

                    {marcas.map((marca) => (
                        <option key={marca} value={marca}>
                            {marca}
                        </option>
                    ))}
                </select>
            </div>

            <div className="border-t border-white/10" />

            {/* Disponibilidad */}
            <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Disponibilidad
                </h3>

                <select
                    value={disponibilidadActual}
                    onChange={(event) =>
                        actualizarParametro(
                            "disponibilidad",
                            event.target.value
                        )
                    }
                    className="h-12 w-full rounded-xl border border-zinc-700 bg-[#0d0d0d] px-4 text-sm text-white outline-none transition focus:border-white"
                >
                    <option value="">Todos</option>
                    <option value="disponible">Disponible</option>
                    <option value="poco-stock">Últimas piezas</option>
                    <option value="agotado">Agotado</option>
                </select>
            </div>

            <div className="border-t border-white/10" />

            {/* Filtros rápidos */}
            <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Filtros rápidos
                </h3>

                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={() =>
                            alternarParametroBooleano("destacados")
                        }
                        className={`
                            w-full
                            rounded-xl
                            border
                            px-4
                            py-2.5
                            text-left
                            text-sm
                            transition
                            ${soloDestacados
                                ? "border-white bg-white font-semibold text-black"
                                : "border-zinc-800 bg-[#0d0d0d] text-zinc-400 hover:border-zinc-600 hover:text-white"
                            }
                        `}
                    >
                        Solo destacados
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            alternarParametroBooleano("ofertas")
                        }
                        className={`
                            w-full
                            rounded-xl
                            border
                            px-4
                            py-2.5
                            text-left
                            text-sm
                            transition
                            ${soloOfertas
                                ? "border-red-400 bg-red-500/10 font-semibold text-red-300"
                                : "border-zinc-800 bg-[#0d0d0d] text-zinc-400 hover:border-zinc-600 hover:text-white"
                            }
                        `}
                    >
                        Solo ofertas
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            alternarParametroBooleano("nuevos")
                        }
                        className={`
                            w-full
                            rounded-xl
                            border
                            px-4
                            py-2.5
                            text-left
                            text-sm
                            transition
                            ${soloNuevos
                                ? "border-sky-400 bg-sky-500/10 font-semibold text-sky-300"
                                : "border-zinc-800 bg-[#0d0d0d] text-zinc-400 hover:border-zinc-600 hover:text-white"
                            }
                        `}
                    >
                        Solo nuevos
                    </button>
                </div>
            </div>

            <div className="border-t border-white/10" />

            {/* Ordenar */}
            <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Ordenar por
                </h3>

                <select
                    value={ordenActual}
                    onChange={(event) =>
                        actualizarParametro(
                            "ordenar",
                            event.target.value
                        )
                    }
                    className="h-12 w-full rounded-xl border border-zinc-700 bg-[#0d0d0d] px-4 text-sm text-white outline-none transition focus:border-white"
                >
                    <option value="">Más recientes</option>
                    <option value="precio-asc">
                        Precio: menor a mayor
                    </option>
                    <option value="precio-desc">
                        Precio: mayor a menor
                    </option>
                </select>
            </div>

            <div className="border-t border-white/10" />

            {/* Precio */}
            <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Precio
                </h3>

                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min={0}
                        placeholder="Mín"
                        value={precioMin}
                        onChange={(event) =>
                            setPrecioMin(event.target.value)
                        }
                        className="h-12 w-full min-w-0 rounded-xl border border-zinc-700 bg-[#0d0d0d] px-3 text-sm text-white outline-none transition focus:border-white"
                    />

                    <span className="text-sm text-zinc-500">-</span>

                    <input
                        type="number"
                        min={0}
                        placeholder="Máx"
                        value={precioMax}
                        onChange={(event) =>
                            setPrecioMax(event.target.value)
                        }
                        className="h-12 w-full min-w-0 rounded-xl border border-zinc-700 bg-[#0d0d0d] px-3 text-sm text-white outline-none transition focus:border-white"
                    />
                </div>

                <button
                    type="button"
                    onClick={aplicarFiltrosPrecio}
                    className="
                        mt-3
                        h-12
                        w-full
                        rounded-xl
                        bg-white
                        font-semibold
                        text-black
                        shadow-[0_10px_30px_rgba(255,255,255,.12)]
                        transition-all
                        duration-300
                        hover:scale-[1.01]
                        hover:bg-zinc-200
                    "
                >
                    Aplicar precio
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Botón móvil */}
            <div className="lg:hidden">
                <button
                    type="button"
                    onClick={() =>
                        setFiltrosMovilAbiertos(true)
                    }
                    className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#111111]
                    px-4
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_15px_40px_rgba(0,0,0,.25)]
                    transition
                    hover:border-white/25
                "
                >
                    <span className="flex items-center gap-2">
                        <SlidersHorizontal size={17} />
                        Filtros y orden
                    </span>

                    {cantidadFiltrosActivos > 0 && (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-black">
                            {cantidadFiltrosActivos}
                        </span>
                    )}
                </button>
            </div>

            {/* Sidebar de escritorio */}
            <aside
                className="
                hidden
                h-fit
                w-[300px]
                shrink-0
                space-y-7
                rounded-3xl
                border
                border-white/10
                bg-[#111111]
                p-6
                shadow-[0_20px_60px_rgba(0,0,0,.35)]
                lg:sticky
                lg:top-24
                lg:block
            "
            >
                {contenidoFiltros}
            </aside>

            {/* Panel móvil */}
            {filtrosMovilAbiertos && (
                <div className="fixed inset-0 z-[200] lg:hidden">
                    <button
                        type="button"
                        aria-label="Cerrar filtros"
                        onClick={() =>
                            setFiltrosMovilAbiertos(false)
                        }
                        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{
                            y: 40,
                            opacity: 0,
                        }}
                        animate={{
                            y: 0,
                            opacity: 1,
                        }}
                        exit={{
                            y: 40,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.25,
                            ease: "easeOut",
                        }}
                        className="
                            absolute
                            inset-x-0
                            bottom-0
                            max-h-[90vh]
                            overflow-y-auto
                            rounded-t-[28px]
                            border-t
                            border-white/10
                            bg-[#0d0d0d]
                            p-5
                            shadow-[0_-30px_90px_rgba(0,0,0,.65)]
                            sm:left-auto
                            sm:right-0
                            sm:top-0
                            sm:h-full
                            sm:max-h-none
                            sm:w-[390px]
                            sm:rounded-none
                            sm:rounded-l-[28px]
                            sm:border-l
                            sm:border-t-0
                            sm:p-7
                        "
                    >
                        <div className="mb-7 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                                    Catálogo
                                </p>

                                <h2 className="mt-1 text-2xl font-black text-white">
                                    Filtros
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setFiltrosMovilAbiertos(false)
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                                aria-label="Cerrar filtros"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="space-y-7">
                            {contenidoFiltros}
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}