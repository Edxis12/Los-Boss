"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Star, GripVertical } from "lucide-react";
import { crearProducto, actualizarProducto } from "@/lib/actions/product-actions";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableImageCard from "@/components/admin/SortableImageCard";



type Categoria = {
    id: string;
    name: string;
};

type VarianteForm = {
    id?: string;
    size: string;
    color: string;
    stock: number;
};

type ProductoFormData = {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    comparePrice: number | null;
    brand: string | null;
    categoryId: string;
    imageUrls: string[];
    isFeatured: boolean;
    gender: "HOMBRE" | "MUJER" | "UNISEX";
    variantes: VarianteForm[];
};

function slugify(texto: string) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

export default function ProductForm({
    categorias,
    producto,
}: {
    categorias: Categoria[];
    producto?: ProductoFormData;
}) {
    const router = useRouter();
    const esEdicion = Boolean(producto);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState(producto?.name ?? "");
    const [description, setDescription] = useState(producto?.description ?? "");
    const [price, setPrice] = useState(producto ? String(producto.price) : "");
    const [comparePrice, setComparePrice] = useState(
        producto?.comparePrice ? String(producto.comparePrice) : ""
    );
    const [brand, setBrand] = useState(producto?.brand ?? "");
    const [categoryId, setCategoryId] = useState(producto?.categoryId ?? "");
    const [imageUrls, setImageUrls] = useState<string[]>(
        producto?.imageUrls?.length ? producto.imageUrls : [""]
    );
    const [isFeatured, setIsFeatured] = useState(producto?.isFeatured ?? false);
    const [gender, setGender] = useState<"HOMBRE" | "MUJER" | "UNISEX">(
        producto?.gender ?? "UNISEX"
    );

    const [variantes, setVariantes] = useState<VarianteForm[]>(
        producto?.variantes?.length
            ? producto.variantes
            : [{ size: "", color: "", stock: 1 }]
    );

    const sensors = useSensors(
        useSensor(PointerSensor)
    );

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

    async function subirImagenesCloudinary(files: FileList | null) {
        if (!files || files.length === 0) return;

        setLoading(true);

        const urls: string[] = [];

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append(
                "upload_preset",
                process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
            );

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();

            if (data.secure_url) {
                urls.push(data.secure_url);
            }
        }

        setImageUrls((prev) => [...prev.filter(Boolean), ...urls]);
        setLoading(false);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setImageUrls((items) => {
            const oldIndex = items.indexOf(String(active.id));
            const newIndex = items.indexOf(String(over.id));

            return arrayMove(items, oldIndex, newIndex);
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!name || !categoryId || !price) {
            setError("Nombre, categoría y precio son obligatorios");
            return;
        }

        setLoading(true);

        const payload = {
            name,
            slug: slugify(name),
            description,
            price: Number(price),
            comparePrice: comparePrice ? Number(comparePrice) : null,
            brand,
            categoryId,
            imageUrls: imageUrls.filter((url) => url.trim() !== ""),
            isFeatured,
            gender,
            variantes: variantes.map((v) => ({
                id: v.id,
                size: v.size || undefined,
                color: v.color || undefined,
                stock: Number(v.stock),
            })),
        };

        const resultado = esEdicion
            ? await actualizarProducto({
                productId: producto!.id,
                ...payload,
            })
            : await crearProducto(payload);

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="text-sm text-zinc-300">Precio actual (MXN)</label>
                    <input
                        type="number"
                        required
                        min={0}
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
                        placeholder="1200"
                    />
                </div>

                <div>
                    <label className="text-sm text-zinc-300">Precio antes / oferta</label>
                    <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={comparePrice}
                        onChange={(e) => setComparePrice(e.target.value)}
                        className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
                        placeholder="1600"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                        Déjalo vacío si no está en oferta.
                    </p>
                </div>

                <div>
                    <label className="text-sm text-zinc-300">Marca</label>
                    <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-white"
                        placeholder="Hugo Boss"
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
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-zinc-300">Imágenes del producto</label>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => subirImagenesCloudinary(e.target.files)}
                    className="mb-3 block w-full text-sm text-zinc-400
                    file:mr-4 file:rounded-lg file:border-0
                    file:bg-white file:px-4 file:py-2
                    file:text-sm file:font-semibold file:text-black
                    hover:file:bg-zinc-200"
                />

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={imageUrls}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {imageUrls.map((url, index) => (
                                <SortableImageCard
                                    key={url}
                                    url={url}
                                    isPrincipal={index === 0}
                                    onDelete={() =>
                                        setImageUrls((prev) =>
                                            prev.filter((_, i) => i !== index)
                                        )
                                    }
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <p className="text-xs text-zinc-500 mt-2">
                    La primera imagen será la imagen principal del producto.
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
                                placeholder="Talla"
                                value={v.size}
                                onChange={(e) => actualizarVariante(i, "size", e.target.value)}
                                className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-white text-sm outline-none focus:border-white"
                            />
                            <input
                                type="text"
                                placeholder="Color"
                                value={v.color}
                                onChange={(e) => actualizarVariante(i, "color", e.target.value)}
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
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-semibold rounded-lg py-3 hover:bg-zinc-200 transition disabled:opacity-50"
            >
                {loading
                    ? "Guardando..."
                    : esEdicion
                        ? "Guardar cambios"
                        : "Crear producto"}
            </button>
        </form>
    );
}