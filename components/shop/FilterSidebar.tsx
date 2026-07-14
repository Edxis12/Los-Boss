"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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

    const ordenActual = searchParams.get("ordenar") ?? "";
    const marcaActual = searchParams.get("marca") ?? "";
    const disponibilidadActual =
        searchParams.get("disponibilidad") ?? "";

    const soloDestacados =
        searchParams.get("destacados") === "true";

    const soloOfertas =
        searchParams.get("ofertas") === "true";

    const soloNuevos =
        searchParams.get("nuevos") === "true";

    useEffect(() => {
        setPrecioMin(searchParams.get("precioMin") ?? "");
        setPrecioMax(searchParams.get("precioMax") ?? "");
    }, [searchParams]);

    function navegarConParametros(params: URLSearchParams) {
        const query = params.toString();

        router.push(query ? `/productos?${query}` : "/productos");
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
        const params = new URLSearchParams(searchParams.toString());

        if (slug) {
            params.set("categoria", slug);
        } else {
            params.delete("categoria");
        }

        const query = params.toString();

        return query ? `/productos?${query}` : "/productos";
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

    return (
        <aside
            className="
                h-fit
                w-full
                shrink-0
                space-y-8
                rounded-3xl
                border
                border-white/10
                bg-[#111111]
                p-7
                shadow-[0_20px_60px_rgba(0,0,0,.35)]
                md:w-72
            "
        >
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
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
                            py-3
                            text-sm
                            transition-all
                            duration-300
                            ${
                                !categoriaActiva
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
                                ${
                                    categoriaActiva === categoria.slug
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
                            py-3
                            text-left
                            text-sm
                            transition
                            ${
                                soloDestacados
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
                            py-3
                            text-left
                            text-sm
                            transition
                            ${
                                soloOfertas
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
                            py-3
                            text-left
                            text-sm
                            transition
                            ${
                                soloNuevos
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
                        mt-4
                        h-12
                        w-full
                        rounded-xl
                        bg-white
                        font-semibold
                        text-black
                        shadow-[0_10px_30px_rgba(255,255,255,.12)]
                        transition-all
                        duration-300
                        hover:scale-[1.02]
                        hover:bg-zinc-200
                    "
                >
                    Aplicar precio
                </button>
            </div>
        </aside>
    );
}