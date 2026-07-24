"use client";

import Image from "next/image";
import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
    type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    Edit3,
    ImageIcon,
    LoaderCircle,
    Plus,
    Save,
    Trash2,
    UploadCloud,
    X,
} from "lucide-react";

import {
    actualizarCategoria,
    crearCategoria,
    eliminarCategoria,
} from "@/lib/actions/category-actions";

type Categoria = {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    _count: {
        products: number;
    };
};

type CategoriaEditando = {
    id: string;
    name: string;
    imageUrl: string;
};

type ImageUploaderProps = {
    imageUrl: string;
    nombre: string;
    subiendo: boolean;
    disabled?: boolean;
    onImageChange: (url: string) => void;
    onUploadingChange: (subiendo: boolean) => void;
    onError: (mensaje: string) => void;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

async function subirACloudinary(file: File) {
    const cloudName =
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error(
            "Faltan las variables de configuración de Cloudinary"
        );
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const respuesta = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok || !resultado.secure_url) {
        throw new Error(
            resultado.error?.message ??
            "No se pudo subir la imagen"
        );
    }

    return resultado.secure_url as string;
}

function ImageUploader({
    imageUrl,
    nombre,
    subiendo,
    disabled = false,
    onImageChange,
    onUploadingChange,
    onError,
}: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [arrastrando, setArrastrando] = useState(false);

    async function procesarArchivo(file?: File) {
        if (!file) {
            return;
        }

        onError("");

        if (!file.type.startsWith("image/")) {
            onError("Selecciona un archivo de imagen válido");
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            onError("La imagen no debe superar los 5 MB");
            return;
        }

        try {
            onUploadingChange(true);

            const url = await subirACloudinary(file);

            onImageChange(url);
        } catch (error) {
            console.error("Error al subir imagen:", error);

            onError(
                error instanceof Error
                    ? error.message
                    : "No se pudo subir la imagen"
            );
        } finally {
            onUploadingChange(false);

            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    }

    function handleFileChange(
        event: ChangeEvent<HTMLInputElement>
    ) {
        void procesarArchivo(event.target.files?.[0]);
    }

    function handleDragOver(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();

        if (!disabled && !subiendo) {
            setArrastrando(true);
        }
    }

    function handleDragLeave(
        event: DragEvent<HTMLDivElement>
    ) {
        event.preventDefault();
        setArrastrando(false);
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setArrastrando(false);

        if (disabled || subiendo) {
            return;
        }

        void procesarArchivo(event.dataTransfer.files?.[0]);
    }

    if (imageUrl) {
        return (
            <div className="space-y-3">
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-black">
                    <Image
                        src={imageUrl}
                        alt={
                            nombre.trim()
                                ? `Imagen de ${nombre}`
                                : "Imagen de categoría"
                        }
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 700px"
                    />

                    {subiendo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                            <div className="flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-sm text-white">
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                                Subiendo imagen...
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid gap-3 min-[430px]:grid-cols-2">
                    <button
                        type="button"
                        disabled={disabled || subiendo}
                        onClick={() => inputRef.current?.click()}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-zinc-300 transition hover:border-white/25 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <UploadCloud size={16} />
                        Reemplazar imagen
                    </button>

                    <button
                        type="button"
                        disabled={disabled || subiendo}
                        onClick={() => onImageChange("")}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        Quitar imagen
                    </button>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={disabled || subiendo}
                    className="hidden"
                />
            </div>
        );
    }

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                onClick={() => {
                    if (!disabled && !subiendo) {
                        inputRef.current?.click();
                    }
                }}
                onKeyDown={(event) => {
                    if (
                        (event.key === "Enter" ||
                            event.key === " ") &&
                        !disabled &&
                        !subiendo
                    ) {
                        event.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    flex
                    min-h-52
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-dashed
                    px-5
                    text-center
                    transition
                    ${arrastrando
                        ? "border-white bg-white/[0.07]"
                        : "border-white/15 bg-black/20 hover:border-white/30 hover:bg-white/[0.03]"
                    }
                    ${disabled || subiendo
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }
                `}
            >
                <div>
                    {subiendo ? (
                        <LoaderCircle
                            size={30}
                            className="mx-auto animate-spin text-white"
                        />
                    ) : (
                        <UploadCloud
                            size={30}
                            className="mx-auto text-zinc-500"
                        />
                    )}

                    <p className="mt-4 text-sm font-semibold text-white">
                        {subiendo
                            ? "Subiendo imagen..."
                            : "Arrastra una imagen aquí"}
                    </p>

                    {!subiendo && (
                        <>
                            <p className="mt-2 text-xs text-zinc-600">
                                o haz clic para seleccionarla
                            </p>

                            <p className="mt-3 text-[11px] text-zinc-700">
                                JPG, PNG o WEBP · Máximo 5 MB
                            </p>
                        </>
                    )}
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={disabled || subiendo}
                className="hidden"
            />
        </>
    );
}

export default function CategoriasManager({
    categorias,
}: {
    categorias: Categoria[];
}) {
    const router = useRouter();

    const formularioEdicionRef = useRef<HTMLElement>(null);

    const [nombre, setNombre] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const [categoriaEditando, setCategoriaEditando] =
        useState<CategoriaEditando | null>(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [guardando, setGuardando] = useState(false);
    const [subiendoImagen, setSubiendoImagen] = useState(false);

    const [subiendoImagenEdicion, setSubiendoImagenEdicion] = useState(false);

    const [eliminandoId, setEliminandoId] = useState<string | null>(null);

    useEffect(() => {
        if (!categoriaEditando) {
            return;
        }

        const timeout = window.setTimeout(() => {
            formularioEdicionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 100);

        return () => window.clearTimeout(timeout);
    }, [categoriaEditando]);

    function limpiarMensajes() {
        setError("");
        setSuccess("");
    }

    function iniciarEdicion(categoria: Categoria) {
        limpiarMensajes();

        setCategoriaEditando({
            id: categoria.id,
            name: categoria.name,
            imageUrl: categoria.imageUrl ?? "",
        });
    }

    function cancelarEdicion() {
        setCategoriaEditando(null);
        limpiarMensajes();
    }

    async function handleCrear(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        limpiarMensajes();

        const nombreLimpio = nombre.trim();

        if (!nombreLimpio) {
            setError("Escribe el nombre de la categoría");
            return;
        }

        if (subiendoImagen) {
            setError(
                "Espera a que termine de subir la imagen"
            );
            return;
        }

        try {
            setGuardando(true);

            const resultado = await crearCategoria(
                nombreLimpio,
                imageUrl
            );

            if (!resultado.success) {
                setError(resultado.error);
                return;
            }

            setNombre("");
            setImageUrl("");

            setSuccess(
                resultado.message ?? "Categoría creada correctamente"
            );

            router.refresh();
        } catch (error) {
            console.error("Error al crear categoría:", error);

            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo crear la categoría"
            );
        } finally {
            setGuardando(false);
        }
    }

    async function handleActualizar(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();
        limpiarMensajes();

        if (!categoriaEditando) {
            return;
        }

        const nombreLimpio =
            categoriaEditando.name.trim();

        if (!nombreLimpio) {
            setError("Escribe el nombre de la categoría");
            return;
        }

        if (subiendoImagenEdicion) {
            setError(
                "Espera a que termine de subir la imagen"
            );
            return;
        }

        try {
            setGuardando(true);

            const resultado = await actualizarCategoria(
                categoriaEditando.id,
                nombreLimpio,
                categoriaEditando.imageUrl
            );

            if ("error" in resultado) {
                setError(resultado.error);
                return;
            }

            setCategoriaEditando(null);

            setSuccess(
                resultado.message ??
                "Categoría actualizada correctamente"
            );

            router.refresh();
        } catch (error) {
            console.error(
                "Error al actualizar categoría:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo actualizar la categoría"
            );
        } finally {
            setGuardando(false);
        }
    }

    async function handleEliminar(categoria: Categoria) {
        const confirmado = window.confirm(
            `¿Eliminar la categoría "${categoria.name}"?`
        );

        if (!confirmado) {
            return;
        }

        limpiarMensajes();

        try {
            setEliminandoId(categoria.id);

            const resultado = await eliminarCategoria(
                categoria.id
            );

            if ("error" in resultado) {
                setError(resultado.error);
                return;
            }

            if (categoriaEditando?.id === categoria.id) {
                setCategoriaEditando(null);
            }

            setSuccess(
                resultado.message ??
                "Categoría eliminada correctamente"
            );

            router.refresh();
        } catch (error) {
            console.error(
                "Error al eliminar categoría:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo eliminar la categoría"
            );
        } finally {
            setEliminandoId(null);
        }
    }

    return (
        <div className="max-w-5xl space-y-6">
            {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <p className="text-sm text-red-300">
                        {error}
                    </p>
                </div>
            )}

            {success && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                    <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-emerald-400"
                    />

                    <p className="text-sm text-emerald-300">
                        {success}
                    </p>
                </div>
            )}

            <section className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-4 shadow-[0_25px_70px_rgba(0,0,0,.25)] sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
                    Nueva categoría
                </p>

                <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                    Agregar categoría
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                    Agrega el nombre y una imagen para mostrar la
                    categoría en la tienda.
                </p>

                <form
                    onSubmit={handleCrear}
                    className="mt-6 grid gap-5"
                >
                    <div>
                        <label
                            htmlFor="category-name"
                            className="text-sm font-medium text-zinc-300"
                        >
                            Nombre
                        </label>

                        <input
                            id="category-name"
                            type="text"
                            required
                            maxLength={60}
                            value={nombre}
                            disabled={guardando}
                            onChange={(event) =>
                                setNombre(event.target.value)
                            }
                            placeholder="Ej. Playeras"
                            className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-white focus:ring-4 focus:ring-white/10 disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-medium text-zinc-300">
                            Imagen de la categoría
                        </p>

                        <ImageUploader
                            imageUrl={imageUrl}
                            nombre={nombre}
                            subiendo={subiendoImagen}
                            disabled={guardando}
                            onImageChange={setImageUrl}
                            onUploadingChange={
                                setSubiendoImagen
                            }
                            onError={setError}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={
                            guardando ||
                            subiendoImagen ||
                            !nombre.trim()
                        }
                        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-fit"
                    >
                        {guardando ? (
                            <LoaderCircle
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <Plus size={17} />
                        )}

                        {guardando
                            ? "Creando..."
                            : "Crear categoría"}
                    </button>
                </form>
            </section>

            {categoriaEditando && (
                <section
                    ref={formularioEdicionRef}
                    className="scroll-mt-28 rounded-3xl border border-white/20 bg-[#111111] p-4 shadow-[0_25px_70px_rgba(0,0,0,.35)] sm:p-6"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
                                Edición
                            </p>

                            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                                Editar categoría
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={cancelarEdicion}
                            disabled={guardando}
                            aria-label="Cerrar edición"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <form
                        onSubmit={handleActualizar}
                        className="mt-6 grid gap-5"
                    >
                        <div>
                            <label
                                htmlFor="edit-category-name"
                                className="text-sm font-medium text-zinc-300"
                            >
                                Nombre
                            </label>

                            <input
                                id="edit-category-name"
                                type="text"
                                required
                                maxLength={60}
                                disabled={guardando}
                                value={categoriaEditando.name}
                                onChange={(event) =>
                                    setCategoriaEditando(
                                        (actual) =>
                                            actual
                                                ? {
                                                    ...actual,
                                                    name: event
                                                        .target
                                                        .value,
                                                }
                                                : null
                                    )
                                }
                                className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none transition focus:border-white focus:ring-4 focus:ring-white/10 disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-zinc-300">
                                Imagen de la categoría
                            </p>

                            <ImageUploader
                                imageUrl={
                                    categoriaEditando.imageUrl
                                }
                                nombre={
                                    categoriaEditando.name
                                }
                                subiendo={
                                    subiendoImagenEdicion
                                }
                                disabled={guardando}
                                onImageChange={(url) =>
                                    setCategoriaEditando(
                                        (actual) =>
                                            actual
                                                ? {
                                                    ...actual,
                                                    imageUrl: url,
                                                }
                                                : null
                                    )
                                }
                                onUploadingChange={
                                    setSubiendoImagenEdicion
                                }
                                onError={setError}
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={cancelarEdicion}
                                disabled={guardando}
                                className="min-h-12 w-full rounded-xl border border-white/10 px-5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50 sm:w-auto"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    guardando ||
                                    subiendoImagenEdicion ||
                                    !categoriaEditando.name.trim()
                                }
                                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                {guardando ? (
                                    <LoaderCircle
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Save size={16} />
                                )}

                                {guardando
                                    ? "Guardando..."
                                    : "Guardar cambios"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <section>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-600">
                            Registradas
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                            Categorías de la tienda
                        </h2>
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-500">
                        {categorias.length}{" "}
                        {categorias.length === 1
                            ? "categoría"
                            : "categorías"}
                    </span>
                </div>

                {categorias.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] px-5 py-12 text-center">
                        <ImageIcon
                            size={26}
                            className="mx-auto text-zinc-600"
                        />

                        <h3 className="mt-5 text-xl font-bold text-white">
                            No hay categorías
                        </h3>

                        <p className="mt-2 text-sm text-zinc-500">
                            Crea la primera categoría para organizar
                            tus productos.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {categorias.map((categoria) => {
                            const eliminando =
                                eliminandoId === categoria.id;

                            return (
                                <article
                                    key={categoria.id}
                                    className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] shadow-[0_20px_60px_rgba(0,0,0,.25)] transition hover:border-white/20"
                                >
                                    <div className="grid min-[430px]:grid-cols-[130px_minmax(0,1fr)]">
                                        <div className="relative aspect-[16/9] bg-zinc-950 min-[430px]:aspect-auto min-[430px]:min-h-[170px]">
                                            {categoria.imageUrl ? (
                                                <Image
                                                    src={
                                                        categoria.imageUrl
                                                    }
                                                    alt={
                                                        categoria.name
                                                    }
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 429px) 100vw, 130px"
                                                />
                                            ) : (
                                                <div className="flex h-full min-h-36 items-center justify-center">
                                                    <ImageIcon
                                                        size={25}
                                                        className="text-zinc-700"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex min-w-0 flex-col p-4 sm:p-5">
                                            <div className="min-w-0">
                                                <p className="truncate text-lg font-bold text-white">
                                                    {categoria.name}
                                                </p>

                                                <p className="mt-1 truncate text-xs text-zinc-600">
                                                    /{categoria.slug}
                                                </p>

                                                <p className="mt-4 text-sm text-zinc-500">
                                                    {
                                                        categoria
                                                            ._count
                                                            .products
                                                    }{" "}
                                                    {categoria
                                                        ._count
                                                        .products ===
                                                        1
                                                        ? "producto"
                                                        : "productos"}
                                                </p>
                                            </div>

                                            <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        guardando ||
                                                        eliminando
                                                    }
                                                    onClick={() =>
                                                        iniciarEdicion(
                                                            categoria
                                                        )
                                                    }
                                                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                                                >
                                                    <Edit3
                                                        size={15}
                                                    />
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        guardando ||
                                                        eliminando
                                                    }
                                                    onClick={() =>
                                                        handleEliminar(
                                                            categoria
                                                        )
                                                    }
                                                    aria-label={`Eliminar ${categoria.name}`}
                                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-12 sm:px-0"
                                                >
                                                    {eliminando ? (
                                                        <LoaderCircle
                                                            size={16}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Trash2
                                                            size={16}
                                                        />
                                                    )}

                                                    <span className="sm:hidden">
                                                        {eliminando
                                                            ? "Eliminando..."
                                                            : "Eliminar"}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}