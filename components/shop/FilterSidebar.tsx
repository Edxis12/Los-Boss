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

    return (
        <aside className="w-full md:w-56 shrink-0 space-y-8">
            {/* Categorías */}
            <div>
                <h3 className="text-sm font-semibold text-white mb-3">Categorías</h3>
                <nav className="flex flex-col gap-1">
                    <Link
                        href="/productos"
                        className={`text-sm px-3 py-2 rounded-lg transition ${!categoriaActiva
                                ? "bg-white text-black font-medium"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                            }`}
                    >
                        Todas
                    </Link>
                    {categorias.map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/productos?categoria=${cat.slug}`}
                            className={`text-sm px-3 py-2 rounded-lg transition ${categoriaActiva === cat.slug
                                    ? "bg-white text-black font-medium"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                                }`}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Ordenar */}
            <div>
                <h3 className="text-sm font-semibold text-white mb-3">Ordenar por</h3>
                <select
                    value={ordenActual}
                    onChange={(e) => cambiarOrden(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white"
                >
                    <option value="">Más recientes</option>
                    <option value="precio-asc">Precio: menor a mayor</option>
                    <option value="precio-desc">Precio: mayor a menor</option>
                </select>
            </div>

            {/* Precio */}
            <div>
                <h3 className="text-sm font-semibold text-white mb-3">Precio</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min={0}
                        placeholder="Mín"
                        value={precioMin}
                        onChange={(e) => setPrecioMin(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-white outline-none focus:border-white"
                    />
                    <span className="text-zinc-500 text-sm">-</span>
                    <input
                        type="number"
                        min={0}
                        placeholder="Máx"
                        value={precioMax}
                        onChange={(e) => setPrecioMax(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-white outline-none focus:border-white"
                    />
                </div>
                <button
                    onClick={aplicarFiltrosPrecio}
                    className="w-full mt-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-1.5 transition"
                >
                    Aplicar
                </button>
            </div>
        </aside>
    );
}