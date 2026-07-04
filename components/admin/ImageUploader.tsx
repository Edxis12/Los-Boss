"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";

type ImageUploaderProps = {
    value: string;
    onChange: (url: string) => void;
};

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File) {
        if (!file) return;

        // Validar tipo
        if (!file.type.startsWith("image/")) {
            setError("Solo se permiten imágenes");
            return;
        }

        // Validar tamaño (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError("La imagen no puede pesar más de 10MB");
            return;
        }

        setError("");
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append(
                "upload_preset",
                process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
            );
            formData.append("folder", "los-boss");

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );

            if (!res.ok) throw new Error("Error al subir la imagen");

            const data = await res.json();
            onChange(data.secure_url);
        } catch (err) {
            setError("No se pudo subir la imagen. Intenta de nuevo.");
            console.error(err);
        } finally {
            setUploading(false);
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }

    function handleRemove() {
        onChange("");
        if (inputRef.current) inputRef.current.value = "";
    }

    return (
        <div>
            {value ? (
                // Preview de la imagen subida
                <div className="relative group">
                    <div className="relative w-full aspect-square max-w-xs bg-[#f5f5f5] rounded-xl overflow-hidden">
                        <Image
                            src={value}
                            alt="Imagen del producto"
                            fill
                            className="object-contain p-4"
                            sizes="320px"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded-full transition"
                        aria-label="Quitar imagen"
                    >
                        <X size={14} />
                    </button>
                    <p className="text-xs text-zinc-500 mt-2 truncate max-w-xs">
                        ✓ Imagen subida correctamente
                    </p>
                </div>
            ) : (
                // Zona de drop / selección
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${uploading
                            ? "border-zinc-600 bg-zinc-900/50"
                            : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/30 hover:bg-zinc-900/60"
                        }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <p className="text-sm text-zinc-400">Subiendo imagen...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center">
                                <ImageIcon size={22} className="text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white mb-1">
                                    <span className="text-zinc-300">
                                        Arrastra tu imagen aquí o{" "}
                                    </span>
                                    <span className="underline">selecciona un archivo</span>
                                </p>
                                <p className="text-xs text-zinc-500">
                                    PNG, JPG, WEBP · Máx. 10MB
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Upload size={14} className="text-zinc-500" />
                                <span className="text-xs text-zinc-500">
                                    También puedes subir desde tu teléfono
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className="text-red-400 text-xs mt-2">{error}</p>
            )}
        </div>
    );
}