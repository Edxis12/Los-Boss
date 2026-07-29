import clsx from "clsx";
import { ReactNode } from "react";

type Variant =
    | "error"
    | "success"
    | "warning"
    | "info";

interface AlertProps {
    variant?: Variant;
    children: ReactNode;
    className?: string;
}

export default function Alert({
    variant = "error",
    children,
    className,
}: AlertProps) {
    const variants = {
        error:
            "border-red-500/20 bg-red-500/10 text-red-300",

        success:
            "border-green-500/20 bg-green-500/10 text-green-300",

        warning:
            "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",

        info:
            "border-blue-500/20 bg-blue-500/10 text-blue-300",
    };

    return (
        <div
            className={clsx(
                "rounded-xl border p-4 text-sm",
                variants[variant],
                className
            )}
        >
            {children}
        </div>
    );
}