import type { HTMLAttributes } from "react";
import clsx from "clsx";

interface SkeletonProps
    extends HTMLAttributes<HTMLDivElement> {
    rounded?: "sm" | "md" | "lg" | "full";
}

const roundedStyles = {
    sm: "rounded-md",
    md: "rounded-xl",
    lg: "rounded-2xl",
    full: "rounded-full",
};

export default function Skeleton({
    rounded = "md",
    className,
    ...props
}: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={clsx(
                "animate-pulse bg-white/[0.08]",
                roundedStyles[rounded],
                className
            )}
            {...props}
        />
    );
}