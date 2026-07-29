"use client";

import { InputHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
}

export default function Input({
    label,
    icon: Icon,
    error,
    className,
    id,
    ...props
}: InputProps) {
    return (
        <div>
            <label
                htmlFor={id}
                className="text-sm font-medium text-zinc-300"
            >
                {label}
            </label>

            <div className="relative mt-2">

                {Icon && (
                    <Icon
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                    />
                )}

                <input
                    id={id}
                    {...props}
                    className={clsx(
                        "h-14 w-full rounded-xl border border-white/10 bg-black/30 text-white outline-none transition placeholder:text-zinc-700 focus:border-white focus:ring-4 focus:ring-white/10",
                        Icon ? "pl-11 pr-4" : "px-4",
                        error &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                        className
                    )}
                />

            </div>

            {error && (
                <p className="mt-2 text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}