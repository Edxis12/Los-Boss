interface DividerProps {
    children: React.ReactNode;
}

export default function Divider({
    children,
}: DividerProps) {
    return (
        <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />

            <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600 whitespace-nowrap">
                {children}
            </span>

            <div className="h-px flex-1 bg-white/10" />
        </div>
    );
}