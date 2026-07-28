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
        <div className="grid grid-cols-1 gap-4 min-[500px]:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <article
                        key={stat.label}
                        className={`
                            min-w-0
                            rounded-3xl
                            border
                            bg-zinc-950
                            p-4
                            shadow-[0_20px_60px_rgba(0,0,0,.2)]
                            transition
                            duration-300
                            hover:-translate-y-0.5
                            hover:bg-zinc-900/80
                            sm:p-5
                            ${stat.alerta
                                ? "border-amber-500/40"
                                : "border-zinc-800"
                            }
                        `}
                    >
                        <div className="mb-5 flex items-start justify-between gap-3">
                            <div
                                className={`
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    ${stat.alerta
                                        ? "bg-amber-500/10 text-amber-400"
                                        : "bg-white/5 text-zinc-300"
                                    }
                                `}
                            >
                                <Icon
                                    size={18}
                                    className="shrink-0"
                                />
                            </div>

                            {stat.alerta && (
                                <span className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-400">
                                    Atención
                                </span>
                            )}
                        </div>

                        <p className="break-words text-2xl font-black tracking-tight text-white sm:text-[32px]">
                            {stat.value}
                        </p>

                        <p className="mt-2 text-[15px] font-semibold text-zinc-300">
                            {stat.label}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-zinc-600">
                            {stat.detail}
                        </p>
                    </article>
                );
            })}
        </div>
    );
}