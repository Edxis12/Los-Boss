import type { LucideIcon } from "lucide-react";

export type DashboardStat = {
    label: string;
    value: string | number;
    detail: string;
    icon: LucideIcon;
    alerta?: boolean;
};

type Props = {
    stats: DashboardStat[];
};

export default function DashboardStats({ stats }: Props) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <div
                        key={stat.label}
                        className={`rounded-2xl border bg-zinc-950 p-5 ${stat.alerta
                                ? "border-amber-500/40"
                                : "border-zinc-800"
                            }`}
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.alerta
                                        ? "bg-amber-500/10 text-amber-400"
                                        : "bg-white/5 text-zinc-300"
                                    }`}
                            >
                                <Icon size={20} />
                            </div>
                        </div>

                        <p className="text-3xl font-black text-white">
                            {stat.value}
                        </p>

                        <p className="mt-1 text-sm text-zinc-400">
                            {stat.label}
                        </p>

                        <p className="mt-2 text-xs text-zinc-600">
                            {stat.detail}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}