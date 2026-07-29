import type { ReactNode } from "react";
import clsx from "clsx";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={clsx(
                "flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#111111] px-8 py-14 text-center",
                className
            )}
        >
            {icon && (
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-zinc-400">
                    {icon}
                </div>
            )}

            <h2 className="text-xl font-bold text-white">
                {title}
            </h2>

            {description && (
                <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
                    {description}
                </p>
            )}

            {action && (
                <div className="mt-8">
                    {action}
                </div>
            )}
        </div>
    );
}