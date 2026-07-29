import {
    type ComponentPropsWithoutRef,
    type ElementType,
    type ReactNode,
} from "react";
import clsx from "clsx";

type CardVariant = "default" | "outline" | "glass";
type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps<T extends ElementType = "div"> = {
    as?: T;
    children: ReactNode;
    variant?: CardVariant;
    padding?: CardPadding;
    hover?: boolean;
    className?: string;
} & Omit<
    ComponentPropsWithoutRef<T>,
    | "as"
    | "children"
    | "className"
>;

const variantStyles: Record<CardVariant, string> = {
    default:
        "border-white/10 bg-[#111111] shadow-[0_20px_60px_rgba(0,0,0,.35)]",
    outline:
        "border-white/10 bg-transparent",
    glass:
        "border-white/10 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,.25)] backdrop-blur-xl",
};

const paddingStyles: Record<CardPadding, string> = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
};

export default function Card<T extends ElementType = "div">({
    as,
    children,
    variant = "default",
    padding = "md",
    hover = false,
    className,
    ...props
}: CardProps<T>) {
    const Component = as ?? "div";

    return (
        <Component
            className={clsx(
                "rounded-3xl border",
                variantStyles[variant],
                paddingStyles[padding],
                hover &&
                    "transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_28px_80px_rgba(0,0,0,.5)]",
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
}