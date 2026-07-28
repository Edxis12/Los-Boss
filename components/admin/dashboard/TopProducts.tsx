import Image from "next/image";
import { Trophy } from "lucide-react";

export type TopProduct = {
    id: string;
    nombre: string;
    imagen: string | null;
    vendidos: number;
    posicion: number;
};

type Props = {
    productos: TopProduct[];
};

export default function TopProducts({ productos }: Props) {
    return (
        <section className="h-full rounded-3xl border border-zinc-800 bg-zinc-950 p-4 shadow-[0_20px_60px_rgba(0,0,0,.2)] sm:p-6">
            <div className="mb-6 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-zinc-300">
                    <Trophy
                        size={20}
                        className="shrink-0"
                    />
                </div>

                <div className="min-w-0">
                    <h2 className="text-lg font-bold leading-tight text-white">
                        Productos más vendidos
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-zinc-500">
                        Ranking por piezas vendidas
                    </p>
                </div>
            </div>

            {productos.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-white">
                        Sin ventas registradas
                    </p>

                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                        Los productos más vendidos aparecerán aquí.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {productos.map((producto) => (
                        <article
                            key={producto.id}
                            className="
                                grid
                                min-w-0
                                grid-cols-[48px_minmax(0,1fr)_32px]
                                items-center
                                gap-3
                                rounded-2xl
                                border
                                border-zinc-800
                                bg-black/20
                                p-3
                                transition
                                hover:border-zinc-700
                                min-[430px]:grid-cols-[56px_minmax(0,1fr)_36px]
                                min-[430px]:p-4
                            "
                        >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 min-[430px]:h-14 min-[430px]:w-14">
                                {producto.imagen ? (
                                    <Image
                                        src={producto.imagen}
                                        alt={producto.nombre}
                                        fill
                                        className="object-contain p-1"
                                        sizes="56px"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center px-1 text-center text-[9px] leading-3 text-zinc-600">
                                        Sin imagen
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                    {producto.nombre}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                    {producto.vendidos}{" "}
                                    {producto.vendidos === 1
                                        ? "pieza vendida"
                                        : "piezas vendidas"}
                                </p>
                            </div>

                            <span
                                aria-label={`Posición ${producto.posicion}`}
                                className="
                                    flex
                                    h-8
                                    w-8
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-zinc-800
                                    bg-black
                                    text-xs
                                    font-bold
                                    text-white
                                    min-[430px]:h-9
                                    min-[430px]:w-9
                                "
                            >
                                {producto.posicion}
                            </span>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}