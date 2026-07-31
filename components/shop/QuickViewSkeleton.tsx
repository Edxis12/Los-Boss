"use client";

export default function QuickViewSkeleton() {
    return (
        <div
            className="
                grid
                min-h-full
                gap-7
                p-4
                pb-12
                animate-pulse
                sm:p-7
                lg:grid-cols-[minmax(0,1.15fr)_minmax(400px,.85fr)]
                lg:gap-12
                lg:p-10
                xl:grid-cols-[minmax(0,1.2fr)_minmax(440px,.8fr)]
                xl:gap-16
                xl:p-12
            "
        >
            {/* Galería */}
            <div className="space-y-4">

                <div className="h-[380px] rounded-3xl bg-zinc-800 sm:h-[620px] lg:h-[820px]" />

                <div className="flex gap-3">
                    <div className="h-24 w-24 rounded-xl bg-zinc-800" />
                    <div className="h-24 w-24 rounded-xl bg-zinc-800" />
                    <div className="h-24 w-24 rounded-xl bg-zinc-800" />
                    <div className="h-24 w-24 rounded-xl bg-zinc-800" />
                </div>

            </div>

            {/* Información */}
            <div className="space-y-6">

                <div className="h-3 w-24 rounded bg-zinc-800" />

                <div className="space-y-3">
                    <div className="h-10 w-4/5 rounded bg-zinc-800" />
                    <div className="h-10 w-2/3 rounded bg-zinc-800" />
                </div>

                <div className="h-4 w-32 rounded bg-zinc-800" />

                <div className="h-12 w-44 rounded bg-zinc-800" />

                <div className="border-t border-white/10" />

                <div className="space-y-5">

                    <div className="h-11 rounded-xl bg-zinc-800" />

                    <div className="h-11 rounded-xl bg-zinc-800" />

                    <div className="h-14 rounded-xl bg-zinc-800" />

                </div>

                <div className="border-t border-white/10" />

                <div className="space-y-3">

                    <div className="h-3 w-28 rounded bg-zinc-800" />

                    <div className="h-3 w-full rounded bg-zinc-800" />
                    <div className="h-3 w-full rounded bg-zinc-800" />
                    <div className="h-3 w-5/6 rounded bg-zinc-800" />
                    <div className="h-3 w-3/5 rounded bg-zinc-800" />

                </div>

            </div>
        </div>
    );
}