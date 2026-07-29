"use client";

import type {
    ButtonHTMLAttributes,
    ReactNode,
} from "react";
import clsx from "clsx";
import LoadingSpinner from "./LoadingSpinner";

type ButtonVariant =
    | "primary"
    | "secondary"
    | "danger";

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    loading?: boolean;
    loadingText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    variant?: ButtonVariant;
    fullWidth?: boolean;
}

export default function Button({
    children,
    loading = false,
    loadingText = "Cargando...",
    leftIcon,
    rightIcon,
    variant = "primary",
    fullWidth = true,
    className,
    disabled,
    ...props
}: ButtonProps) {
    const variants: Record<ButtonVariant, string> = {
        primary:
            "bg-white text-black shadow-[0_18px_40px_rgba(255,255,255,.12)] hover:-translate-y-0.5 hover:bg-zinc-200",

        secondary:
            "border border-white/10 bg-white/[0.025] text-zinc-200 hover:border-white/25 hover:bg-white/[0.06] hover:text-white",

        danger:
            "bg-red-600 text-white hover:bg-red-700",
    };

    return (
        <button
            {...props}
            disabled={disabled || loading}
            className={clsx(
                "group flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:min-h-14 sm:rounded-2xl sm:text-base",
                fullWidth && "w-full",
                variants[variant],
                className
            )}
        >
            {loading ? (
                <>
                    <LoadingSpinner
                        size="sm"
                        className="mr-1"
                    />

                    {loadingText}
                </>
            ) : (
                <>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </>
            )}
        </button>
    );
}