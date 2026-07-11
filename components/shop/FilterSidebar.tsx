"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Categoria = { name: string; slug: string };

export default function FilterSidebar({
    categorias,
    categoriaActiva,
}: {
    categorias: Categoria[];
    categoriaActiva?: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [precioMin, setPrecioMin] = useState(
        searchParams.get("precioMin") ?? ""
    );
    const [precioMax, setPrecioMax] = useState(
        searchParams.get("precioMax") ?? ""
    );

    function aplicarFiltrosPrecio() {
        const params = new URLSearchParams(searchParams.toString());
        if (precioMin) params.set("precioMin", precioMin);
        else params.delete("precioMin");
        if (precioMax) params.set("precioMax", precioMax);
        else params.delete("precioMax");
        router.push(`/productos?${params.toString()}`);
    }

    function cambiarOrden(valor: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (valor) params.set("ordenar", valor);
        else params.delete("ordenar");
        router.push(`/productos?${params.toString()}`);
    }

    const ordenActual = searchParams.get("ordenar") ?? "";

    function crearHrefCategoria(slug?: string) {
        const params = new URLSearchParams(searchParams.toString());

        if (slug) {
            params.set("categoria", slug);
        } else {
            params.delete("categoria");
        }

        return `/productos?${params.toString()}`;
    }

    return (
        <aside className="
                w-full 
                md:w-72 
                shrink-0
                h-fit
                rounded-3xl
                border
                border-white/10
                bg-[#111111]
                p-7
                shadow-[0_20px_60px_rgba(0,0,0,.35)] 
                space-y-8">
            
            <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-zinc-500 font-semibold">
                    Filtros
                </p>

                <div className="mt-4 border-t border-white/10"/>
            </div>

            {/* Categorías */}
            <div>
                <h3 className="text-sm uppercase tracking-[0.18em] font-semibold text-zinc-400 mb-4">Categorías</h3>
                <nav className="flex flex-col gap-1">
                    <Link
                        href={crearHrefCategoria()}
                        className={`
                                px-4
                                py-3
                                rounded-xl
                                text-sm
                                transition-all
                                duration-300

                                ${
                                    !categoriaActiva
                                        ? "bg-white text-black font-semibold shadow-md"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                }
                            `}
                    >
                        Todas
                    </Link>
                    {categorias.map((cat) => (
                        <Link
                            key={cat.slug}
                            href={crearHrefCategoria(cat.slug)}
                            className={`text-sm px-3 py-2 rounded-lg transition ${categoriaActiva === cat.slug
                                    ? "bg-white text-black font-semibold shadow-md"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                }`}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="border-t border-white/10"/>

            {/* Ordenar */}
            <div>
                <h3 className="text-sm uppercase tracking-[0.18em] font-semibold text-zinc-400 mb-4">Ordenar por</h3>
                <select
                    value={ordenActual}
                    onChange={(e) => cambiarOrden(e.target.value)}
                    className="
                        w-full
                        h-12
                        rounded-xl 
                        bg-[#0d0d0d]
                        border
                        border-zinc-700
                        px-4
                        text-sm
                        text-white
                        outline-none
                        transition-all
                        focus:border-white

                    "
                >
                    <option value="">Más recientes</option>
                    <option value="precio-asc">Precio: menor a mayor</option>
                    <option value="precio-desc">Precio: mayor a menor</option>
                </select>
            </div>

            <div className="border-t border-white/10"/>

            {/* Precio */}
            <div>
                <h3 className="text-sm uppercase tracking-[0.18em] font-semibold text-zinc-400 mb-4">Precio</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min={0}
                        placeholder="Mín"
                        value={precioMin}
                        onChange={(e) => setPrecioMin(e.target.value)}
                        className="w-full h-12 rounded-xl bg-[#0d0d0d] border border-zinc-700 px-4 text-sm text-white outline-none transition-all focus:border-white"
                    />
                    <span className="text-zinc-500 text-sm">-</span>
                    <input
                        type="number"
                        min={0}
                        placeholder="Máx"
                        value={precioMax}
                        onChange={(e) => setPrecioMax(e.target.value)}
                        className="w-full h-12 rounded-xl bg-[#0d0d0d] border border-zinc-700 px-4 text-sm text-white outline-none transition-all focus:border-white"
                    />
                </div>
                <button
                    onClick={aplicarFiltrosPrecio}
                    className="
                        w-full
                        h-12
                        mt-4
                        rounded-xl
                        bg-white
                        text-black
                        font-semibold
                        transition-all
                        duration-300
                        hover:scale-[1.02]
                        hover:bg-zinc-200
                        shadow-[0_10px_30px_rgba(255,255,255,.12)]
                    "
                >
                    Aplicar
                </button>
            </div>
        </aside>
    );
}