"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";
import {
    useRouter,
    useSearchParams,
} from "next/navigation";
import {
    Search,
    X,
} from "lucide-react";

type Categoria = {
    id: string;
    name: string;
    slug: string;
};

type EstadoProducto =
    | "TODOS"
    | "ACTIVOS"
    | "INACTIVOS";

type Props = {
    categorias: Categoria[];
    busquedaActual: string;
    categoriaActual: string;
    estadoActual: EstadoProducto;
};

export default function AdminProductsFilters({
    categorias,
    busquedaActual,
    categoriaActual,
    estadoActual,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [busqueda, setBusqueda] =
        useState(busquedaActual);

    useEffect(() => {
        setBusqueda(busquedaActual);
    }, [busquedaActual]);

    function navegar(
        cambios: Record<
            string,
            string | undefined
        >
    ) {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        Object.entries(cambios).forEach(
            ([nombre, valor]) => {
                if (valor) {
                    params.set(nombre, valor);
                } else {
                    params.delete(nombre);
                }
            }
        );

        // Cada nuevo filtro regresa a la primera página.
        params.delete("page");

        const query = params.toString();

        router.push(
            query
                ? `/admin/productos?${query}`
                : "/admin/productos"
        );
    }

    function buscar(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        navegar({
            search:
                busqueda.trim() || undefined,
        });
    }

    function limpiarBusqueda() {
        setBusqueda("");

        navegar({
            search: undefined,
        });
    }

    const tieneFiltros =
        Boolean(busquedaActual) ||
        Boolean(categoriaActual) ||
        estadoActual !== "TODOS";

    return (
        <section className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 sm:p-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_190px_auto]">
                <form
                    onSubmit={buscar}
                    className="flex min-w-0 gap-2"
                >
                    <div className="relative min-w-0 flex-1">
                        <Search
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        />

                        <input
                            type="search"
                            value={busqueda}
                            onChange={(event) =>
                                setBusqueda(
                                    event.target.value
                                )
                            }
                            placeholder="Buscar nombre, marca o slug..."
                            className="h-11 w-full rounded-xl border border-zinc-800 bg-black pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-white"
                        />

                        {busqueda && (
                            <button
                                type="button"
                                onClick={
                                    limpiarBusqueda
                                }
                                aria-label="Limpiar búsqueda"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="h-11 shrink-0 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
                    >
                        Buscar
                    </button>
                </form>

                <select
                    value={categoriaActual}
                    onChange={(event) =>
                        navegar({
                            categoria:
                                event.target.value ||
                                undefined,
                        })
                    }
                    className="h-11 w-full rounded-xl border border-zinc-800 bg-black px-4 text-sm text-white outline-none transition focus:border-white"
                >
                    <option value="">
                        Todas las categorías
                    </option>

                    {categorias.map(
                        (categoria) => (
                            <option
                                key={categoria.id}
                                value={
                                    categoria.slug
                                }
                            >
                                {categoria.name}
                            </option>
                        )
                    )}
                </select>

                <select
                    value={estadoActual}
                    onChange={(event) =>
                        navegar({
                            estado:
                                event.target.value ===
                                "TODOS"
                                    ? undefined
                                    : event.target.value,
                        })
                    }
                    className="h-11 w-full rounded-xl border border-zinc-800 bg-black px-4 text-sm text-white outline-none transition focus:border-white"
                >
                    <option value="TODOS">
                        Todos los estados
                    </option>

                    <option value="ACTIVOS">
                        Activos
                    </option>

                    <option value="INACTIVOS">
                        Inactivos
                    </option>
                </select>

                {tieneFiltros && (
                    <button
                        type="button"
                        onClick={() => {
                            setBusqueda("");

                            router.push(
                                "/admin/productos"
                            );
                        }}
                        className="h-11 rounded-xl border border-zinc-700 px-4 text-sm font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-white"
                    >
                        Limpiar
                    </button>
                )}
            </div>
        </section>
    );
}