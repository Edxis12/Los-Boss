"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { crearProducto } from "@/lib/actions/product-actions";

type Categoria = { id: string; name: string };

type VarianteForm = { size: string; color: string; stock: number };

function slugify(texto: string) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quita acentos
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

export default function NuevoProductoForm({
    categorias,
}: {
    categorias: Categoria[];
}) {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [brand, setBrand] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [gender, setGender] = useState<"HOMBRE" | "MUJER" | "UNISEX">("UNISEX");
    const [variantes, setVariantes] = useState<VarianteForm[]>([
        { size: "", color: "", stock: 1 },
    ]);

    function actualizarVariante(
        index: number,
        campo: keyof VarianteForm,
        valor: string | number
    ) {
        setVariantes((prev) =>
            prev.map((v, i) => (i === index ? { ...v, [campo]: valor } : v))
        );
    }

    function agregarVariante() {
        setVariantes((prev) => [...prev, { size: "", color: "", stock: 1 }]);
    }

    function quitarVariante(index: number) {
        setVariantes((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!name || !categoryId || !price) {
            setError("Nombre, categoría y precio son obligatorios");
            return;
        }

        setLoading(true);

        const resultado = await crearProducto({
            name,
            slug: slugify(name),
            description,
            price: Number(price),
            brand,
            categoryId,
            imageUrl,
            isFeatured,
            gender,
            variantes: variantes.map((v) => ({
                size: v.size || undefined,
                color: v.color || undefined,
                stock: v.stock,
            })),
        });

        setLoading(false);

        if (resultado.error) {
            setError(resultado.error);
            return;
        }

        router.push("/admin/productos");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <p className="bg-red-950 text-red-400 text-sm rounded-lg px-3 py-2">
                    {error}
                </p>
            )}

            <div>
                <label className="text-sm text-zinc-300">Nombre del producto</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
                    placeholder="Ej. Hoodie Oversized Negra"
                />
                {name && (
                    <p className="text-xs text-zinc-500 mt-1">
                        URL: /productos/{slugify(name)}
                    </p>
                )}
            </div>

            <div>
                <label className="text-sm text-zinc-300">Descripción</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
                    placeholder="Describe el producto..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm text-zinc-300">Precio (MXN)</label>
                    <input
                        type="number"
                        required
                        min={0}
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
                        placeholder="1500"
                    />
                </div>

                <div>
                    <label className="text-sm text-zinc-300">Marca (opcional)</label>
                    <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
                        placeholder="Los Boss Originals"
                    />
                </div>
            </div>

            <div>
                <label className="text-sm text-zinc-300">Categoría</label>
                <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
                >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-sm text-zinc-300">URL de imagen</label>
                <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
                    placeholder="https://..."
                />
                <p className="text-xs text-zinc-500 mt-1">
                    Si el dominio de la imagen no está autorizado, recuerda agregarlo en{" "}
                    <code className="text-zinc-400">next.config.ts</code>.
                </p>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-white"
                />
                Marcar como producto destacado
            </label>

            <div>
                <label className="text-sm text-zinc-300">Género</label>
                <select
                    value={gender}
                    onChange={(e) =>
                        setGender(e.target.value as "HOMBRE" | "MUJER" | "UNISEX")
                    }
                    className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
                >
                    <option value="UNISEX">Unisex</option>
                    <option value="HOMBRE">Hombre</option>
                    <option value="MUJER">Mujer</option>
                </select>
            </div>

            {/* Variantes */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-zinc-300">
                        Tallas / colores y stock
                    </label>
                    <button
                        type="button"
                        onClick={agregarVariante}
                        className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white border border-zinc-700 rounded-lg px-2.5 py-1"
                    >
                        <Plus size={13} />
                        Agregar variante
                    </button>
                </div>

                <div className="space-y-2">
                    {variantes.map((v, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <input
                                type="text"
                                placeholder="Talla (opcional)"
                                value={v.size}
                                onChange={(e) =>
                                    actualizarVariante(i, "size", e.target.value)
                                }
                                className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white text-sm outline-none focus:border-white"
                            />
                            <input
                                type="text"
                                placeholder="Color (opcional)"
                                value={v.color}
                                onChange={(e) =>
                                    actualizarVariante(i, "color", e.target.value)
                                }
                                className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white text-sm outline-none focus:border-white"
                            />
                            <input
                                type="number"
                                min={0}
                                placeholder="Stock"
                                value={v.stock}
                                onChange={(e) =>
                                    actualizarVariante(i, "stock", Number(e.target.value))
                                }
                                className="w-24 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white text-sm outline-none focus:border-white"
                            />
                            {variantes.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => quitarVariante(i)}
                                    className="text-zinc-500 hover:text-red-400 p-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                    Si tu producto no tiene tallas ni colores (ej. perfumes, accesorios
                    únicos), deja esos campos vacíos y solo pon el stock.
                </p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-semibold rounded-lg py-3 hover:bg-zinc-200 transition disabled:opacity-50"
            >
                {loading ? "Guardando..." : "Crear producto"}
            </button>
        </form>
    );
}