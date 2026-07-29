"use client";

import { useState, InputHTMLAttributes } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import clsx from "clsx";

interface PasswordInputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function PasswordInput({
    label,
    error,
    className,
    id,
    ...props
}: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <label
                htmlFor={id}
                className="text-sm font-medium text-zinc-300"
            >
                {label}
            </label>

            <div className={label ? "relative mt-2" : "relative"}>

                <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                    id={id}
                    {...props}
                    type={visible ? "text" : "password"}
                    className={clsx(
                        "h-14 w-full rounded-xl border border-white/10 bg-black/30 pl-11 pr-12 text-white outline-none transition placeholder:text-zinc-700 focus:border-white focus:ring-4 focus:ring-white/10",
                        error &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        className
                    )}
                />

                <button
                    type="button"
                    onClick={() => setVisible(!visible)}
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white"
                    aria-label={
                        visible
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                    }
                >
                    {visible ? (
                        <EyeOff size={18} />
                    ) : (
                        <Eye size={18} />
                    )}
                </button>

            </div>

            {error && (
                <p className="mt-2 text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}