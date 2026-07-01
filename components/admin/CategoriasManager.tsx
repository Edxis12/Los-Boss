"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { crearCategoria, eliminarCategoria } from "@/lib/actions/category-actions";

type Categoria = {
    id: string;
    name: string;
    slug: string;
    _count: { products: number };
};

export default function CategoriasManager({
    categorias,
}: {
    categorias: Categoria[];
}) {
    const router = useRouter();
    const [nombre, setNombre] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleCrear(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!nombre.trim()) return;

        setLoading(true);
        const resultado = await crearCategoria(nombre);
        setLoading(false);

        if (resultado.error) {
            setError(resultado.error);
            return;
        }

        setNombre("");
        router.refresh();
    }

    async function handleEliminar(id: string) {
        if (!confirm("¿Eliminar esta categoría?")) return;

        const resultado = await eliminarCategoria(id);
        if (resultado.error) {
            alert(resultado.error);
            return;
        }
        router.refresh();
    }

    return (
        <div className="max-w-xl">
            <form onSubmit={handleCrear} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre de la categoría (ej. Jeans)"
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-white"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 bg-white text-black font-semibold px-4 py-2.5 rounded-lg hover:bg-zinc-200 transition text-sm disabled:opacity-50"
                >
                    <Plus size={16} />
                    Crear
                </button>
            </form>

            {error && (
                <p className="bg-red-950 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
                    {error}
                </p>
            )}

            <div className="space-y-2">
                {categorias.map((cat) => (
                    <div
                        key={cat.id}
                        className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
                    >
                        <div>
                            <p className="text-white text-sm font-medium">{cat.name}</p>
                            <p className="text-xs text-zinc-500">
                                {cat._count.products}{" "}
                                {cat._count.products === 1 ? "producto" : "productos"}
                            </p>
                        </div>
                        <button
                            onClick={() => handleEliminar(cat.id)}
                            className="text-zinc-500 hover:text-red-400 p-1.5"
                            aria-label="Eliminar categoría"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}