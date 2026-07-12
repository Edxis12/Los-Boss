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
        <section className="h-full rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                    <Trophy size={19}/>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-white">
                        Productos más vendidos
                    </h2>
                    <p className="text-sm text-zinc-500">
                        Ranking por piezas vendidas
                    </p>
                </div>
            </div>

            {productos.length === 0 ? (
                <p className="text-sm text-zinc-500">
                    Aún no hay ventas registradas.
                </p>
            ) : (
                <div className="space-y-2">
                    {productos.map((producto) =>(
                        <div
                            key={producto.id}
                            className="flex items-center justify-between gap-3 rounded-xl p-2 transition hover:bg-white/[0.03]"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                                    {producto.imagen ? (
                                        <Image 
                                            src={producto.imagen}
                                            alt={producto.nombre}
                                            fill
                                            className="object-cover"
                                            sizes="48px"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[9px] text-zinc-600">
                                            Sin imagen
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-white">
                                        {producto.nombre}
                                    </p>
                                    
                                    <p className="text-xs text-zinc-500">
                                        {producto.vendidos}{" "}
                                        {producto.vendidos === 1
                                            ? "pieza vendida"
                                            : "piezas vendidas"}
                                    </p>
                                </div>
                            </div>

                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-black text-xs font-bold text-white">
                                {producto.posicion}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}