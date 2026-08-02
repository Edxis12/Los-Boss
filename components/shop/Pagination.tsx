import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

type PaginationProps = {
    paginaActual: number;
    totalPaginas: number;
    searchParams: Record<
        string,
        string | undefined
    >;
};

type ElementoPaginacion =
    | number
    | "inicio-puntos"
    | "fin-puntos";

function generarPaginas(
    paginaActual: number,
    totalPaginas: number
): ElementoPaginacion[] {
    if (totalPaginas <= 7) {
        return Array.from(
            { length: totalPaginas },
            (_, index) => index + 1
        );
    }

    if (paginaActual <= 4) {
        return [
            1,
            2,
            3,
            4,
            5,
            "fin-puntos",
            totalPaginas,
        ];
    }

    if (paginaActual >= totalPaginas - 3) {
        return [
            1,
            "inicio-puntos",
            totalPaginas - 4,
            totalPaginas - 3,
            totalPaginas - 2,
            totalPaginas - 1,
            totalPaginas,
        ];
    }

    return [
        1,
        "inicio-puntos",
        paginaActual - 1,
        paginaActual,
        paginaActual + 1,
        "fin-puntos",
        totalPaginas,
    ];
}

function crearHref(
    pagina: number,
    searchParams: Record<
        string,
        string | undefined
    >
) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(
        ([nombre, valor]) => {
            if (
                nombre !== "page" &&
                typeof valor === "string" &&
                valor.length > 0
            ) {
                params.set(nombre, valor);
            }
        }
    );

    if (pagina > 1) {
        params.set("page", String(pagina));
    }

    const query = params.toString();

    return query
        ? `/productos?${query}`
        : "/productos";
}

export default function Pagination({
    paginaActual,
    totalPaginas,
    searchParams,
}: PaginationProps) {
    if (totalPaginas <= 1) {
        return null;
    }

    const paginas = generarPaginas(
        paginaActual,
        totalPaginas
    );

    return (
        <nav
            aria-label="Paginación de productos"
            className="
            mt-10
            border-t
            border-white/10
            pt-7
            sm:mt-12
            lg:mt-14
        "
        >
            <div
                className="
        flex
        w-full
        flex-wrap
        items-center
        justify-center
        gap-2
        sm:gap-3
    "
            >
                {paginaActual > 1 ? (
                    <Link
                        href={crearHref(
                            paginaActual - 1,
                            searchParams
                        )}
                        scroll
                        className="
                        inline-flex
                        h-11
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-white/10
                        px-4
                        text-sm
                        font-semibold
                        text-zinc-300
                        transition
                        hover:border-white/30
                        hover:bg-white/[0.05]
                        hover:text-white
                    "
                    >
                        <ChevronLeft size={17} />
                        <span className="hidden sm:inline">
                            Anterior
                        </span>
                    </Link>
                ) : (
                    <span
                        aria-disabled="true"
                        className="
                        inline-flex
                        h-11
                        shrink-0
                        cursor-not-allowed
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-white/5
                        px-4
                        text-sm
                        font-semibold
                        text-zinc-700
                    "
                    >
                        <ChevronLeft size={17} />
                        <span className="hidden min-[390px]:inline">
                            Anterior
                        </span>
                    </span>
                )}

                <div className="flex shrink-0 items-center justify-center gap-2">
                    {paginas.map((elemento) => {
                        if (
                            elemento === "inicio-puntos" ||
                            elemento === "fin-puntos"
                        ) {
                            return (
                                <span
                                    key={elemento}
                                    className="
                                    flex
                                    h-10
                                    min-w-8
                                    shrink-0
                                    items-center
                                    justify-center
                                    text-sm
                                    text-zinc-600
                                "
                                >
                                    …
                                </span>
                            );
                        }

                        const activa =
                            elemento === paginaActual;

                        return (
                            <Link
                                key={elemento}
                                href={crearHref(
                                    elemento,
                                    searchParams
                                )}
                                aria-current={
                                    activa
                                        ? "page"
                                        : undefined
                                }
                                className={`
                                flex
                                h-10
                                min-w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                border
                                px-3
                                text-sm
                                font-bold
                                transition
                                ${activa
                                        ? "border-white bg-white text-black"
                                        : "border-white/10 text-zinc-400 hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                                    }
                            `}
                            >
                                {elemento}
                            </Link>
                        );
                    })}
                </div>

                {paginaActual < totalPaginas ? (
                    <Link
                        href={crearHref(
                            paginaActual + 1,
                            searchParams
                        )}
                        scroll
                        className="
                        inline-flex
                        h-11
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-white/10
                        px-4
                        text-sm
                        font-semibold
                        text-zinc-300
                        transition
                        hover:border-white/30
                        hover:bg-white/[0.05]
                        hover:text-white
                    "
                    >
                        <span className="hidden min-[390px]:inline">
                            Siguiente
                        </span>
                        <ChevronRight size={17} />
                    </Link>
                ) : (
                    <span
                        aria-disabled="true"
                        className="
                        inline-flex
                        h-11
                        shrink-0
                        cursor-not-allowed
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-white/5
                        px-4
                        text-sm
                        font-semibold
                        text-zinc-700
                    "
                    >
                        <span className="hidden min-[390px]:inline">
                            Siguiente
                        </span>
                        <ChevronRight size={17} />
                    </span>
                )}
            </div>

            <p className="mt-3 text-center text-xs text-zinc-600 sm:text-sm">
                Página {paginaActual} de {totalPaginas}
            </p>
        </nav>
    );
}