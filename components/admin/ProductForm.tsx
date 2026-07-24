"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, } from "lucide-react";
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
    const [subiendoImagenes, setSubiendoImagenes] = useState(false);

    const [name, setName] = useState(producto?.name ?? "");
    const [description, setDescription] = useState(producto?.description ?? "");
    const [price, setPrice] = useState(producto ? String(producto.price) : "");
    const [comparePrice, setComparePrice] = useState(
        producto?.comparePrice ? String(producto.comparePrice) : ""
    );
    const [brand, setBrand] = useState(producto?.brand ?? "");
    const [categoryId, setCategoryId] = useState(producto?.categoryId ?? "");
    const [imageUrls, setImageUrls] = useState<string[]>(
        producto?.imageUrls?.filter(Boolean) ?? []
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

        setSubiendoImagenes(true);

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
        setSubiendoImagenes(false);
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

    function normalizarMarca(valor: string) {
        return valor
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ")
            .replace(/\b\w/g, (letra) => letra.toUpperCase());
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
            brand: brand.trim() ? normalizarMarca(brand) : undefined,
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

        if ("error" in resultado) {
            setError(resultado.error);
            return;
        }

        router.push("/admin/productos");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
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

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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
                <div className="mb-3 flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between">
                    <label className="text-sm text-zinc-300">Imágenes del producto</label>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => subirImagenesCloudinary(e.target.files)}
                    className=" 
                        block
                        w-full
                        text-sm
                        text-zinc-400

                        file:w-full
                        file:min-h-12
                        file:rounded-xl
                        file:border-0
                        file:bg-white
                        file:px-4
                        file:py-3
                        file:font-semibold
                        file:text-black

                        sm:file:w-auto

                        hover:file:bg-zinc-200
                    "
                />

                {subiendoImagenes && (
                    <p className="mt-3 animate-pulse text-sm text-zinc-400">
                        Subiendo imágenes...
                    </p>
                )}

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={imageUrls.filter(Boolean)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="grid grid-cols-1 min-[430px]:grid-cols-2 lg:grid-cols-3 gap-4">
                            {imageUrls
                                .filter((url) => url.trim() !== "")
                                .map((url, index) => (
                                    <SortableImageCard
                                        key={url}
                                        url={url}
                                        isPrincipal={index === 0}
                                        onDelete={() =>
                                            setImageUrls((prev) =>
                                                prev.filter((item) => item !== url)
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
                <div className="mb-3 flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between">
                    <label className="text-sm text-zinc-300">
                        Tallas / colores y stock
                    </label>
                    <button
                        type="button"
                        onClick={agregarVariante}
                        className="
                            inline-flex
                            min-h-12
                            w-full
                            items-center
                            justify-center
                            gap-1.5
                            rounded-xl
                            border
                            border-zinc-700
                            px-3
                            text-sm
                            font-medium
                            text-zinc-300
                            transition
                            hover:border-zinc-500
                            hover:text-white
                            min-[430px]:w-auto
                        "
                    >
                        <Plus size={13} />
                        Agregar variante
                    </button>
                </div>

                <div className="space-y-2">
                    {variantes.map((v, i) => (
                        <div
                            key={i}
                            className="
                                grid
                                min-w-0
                                gap-3
                                rounded-2xl
                                border
                                border-white/10
                                bg-black/20
                                p-3
                                min-[430px]:grid-cols-2
                                sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_110px_auto]
                                sm:items-end
                                sm:gap-4
                                sm:p-0
                                sm:border-0
                                sm:bg-transparent
                            "
                        >
                            <div className="min-w-0">
                                <label className="mb-1.5 block text-xs font-medium text-zinc-500 sm:hidden">
                                    Talla
                                </label>

                                <input
                                    type="text"
                                    placeholder="Talla"
                                    value={v.size}
                                    onChange={(e) =>
                                        actualizarVariante(
                                            i,
                                            "size",
                                            e.target.value
                                        )
                                    }
                                    className="
                                        h-11
                                        w-full
                                        min-w-0
                                        rounded-xl
                                        border
                                        border-zinc-700
                                        bg-zinc-900
                                        px-3
                                        text-sm
                                        text-white
                                        outline-none
                                        placeholder:text-zinc-600
                                        focus:border-white
                                    "
                                />
                            </div>

                            <div className="min-w-0">
                                <label className="mb-1.5 block text-xs font-medium text-zinc-500 sm:hidden">
                                    Color
                                </label>

                                <input
                                    type="text"
                                    placeholder="Color"
                                    value={v.color}
                                    onChange={(e) =>
                                        actualizarVariante(
                                            i,
                                            "color",
                                            e.target.value
                                        )
                                    }
                                    className="
                                        h-11
                                        w-full
                                        min-w-0
                                        rounded-xl
                                        border
                                        border-zinc-700
                                        bg-zinc-900
                                        px-3
                                        text-sm
                                        text-white
                                        outline-none
                                        placeholder:text-zinc-600
                                        focus:border-white
                                    "
                                />
                            </div>

                            <div className="min-w-0 min-[430px]:col-span-2 sm:col-span-1">
                                <label className="mb-1.5 block text-xs font-medium text-zinc-500 sm:hidden">
                                    Stock
                                </label>

                                <input
                                    type="number"
                                    min={0}
                                    placeholder="Stock"
                                    value={v.stock}
                                    onChange={(e) =>
                                        actualizarVariante(
                                            i,
                                            "stock",
                                            Number(e.target.value)
                                        )
                                    }
                                    className="
                                        h-11
                                        w-full
                                        min-w-0
                                        rounded-xl
                                        border
                                        border-zinc-700
                                        bg-zinc-900
                                        px-3
                                        text-sm
                                        text-white
                                        outline-none
                                        placeholder:text-zinc-600
                                        focus:border-white
                                        sm:w-[110px]
                                    "
                                />
                            </div>

                            {variantes.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => quitarVariante(i)}
                                    aria-label="Eliminar variante"
                                    className="
                                        flex
                                        h-11
                                        w-full
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        border-red-500/20
                                        text-red-400
                                        transition
                                        hover:bg-red-500/10
                                        min-[430px]:col-span-2
                                        sm:col-span-1
                                        sm:w-11
                                    "
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
                disabled={loading || subiendoImagenes}
                className="
                w-full
                min-h-14
                rounded-2xl
                bg-white
                font-bold
                text-black
                transition
                hover:bg-zinc-200
                disabled:opacity-50
                "
            >
                {subiendoImagenes
                    ? "Subiendo imágenes..."
                    : loading
                        ? "Guardando..."
                        : esEdicion
                            ? "Guardar cambios"
                            : "Crear producto"}
            </button>
        </form>
    );
}