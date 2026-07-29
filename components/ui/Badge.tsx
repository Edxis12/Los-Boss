import { type HTMLAttributes } from "react";
import clsx from "clsx";

type BadgeVariant =
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info";

type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
}

const variants: Record<BadgeVariant, string> = {
    default:
        "border border-white/10 bg-zinc-800 text-zinc-300",

    primary:
        "border border-white/10 bg-white text-black",

    success:
        "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300",

    warning:
        "border border-yellow-500/20 bg-yellow-500/10 text-yellow-300",

    danger:
        "border border-red-500/20 bg-red-500/10 text-red-300",

    info:
        "border border-sky-500/20 bg-sky-500/10 text-sky-300",
};

const sizes: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
};

export default function Badge({
    variant = "default",
    size = "sm",
    className,
    children,
    ...props
}: BadgeProps) {
    return (
        <span
            className={clsx(
                "inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}