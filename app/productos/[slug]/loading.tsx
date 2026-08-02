import Skeleton from "@/components/ui/Skeleton";

export default function ProductoDetalleLoading() {
    return (
        <main className="min-h-screen bg-black">
            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center gap-2 overflow-hidden">
                    <Skeleton rounded="sm" className="h-4 w-14 shrink-0" />
                    <Skeleton rounded="sm" className="h-4 w-4 shrink-0" />
                    <Skeleton rounded="sm" className="h-4 w-24 shrink-0" />
                    <Skeleton rounded="sm" className="h-4 w-4 shrink-0" />
                    <Skeleton rounded="sm" className="h-4 w-36" />
                </div>

                <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,.85fr)] lg:gap-10 xl:gap-14">
                    {/* Galería */}
                    <section className="flex min-w-0 flex-col gap-3 lg:flex-row lg:gap-5">
                        <div className="order-2 flex gap-3 overflow-hidden lg:order-1 lg:flex-col">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    rounded="md"
                                    className="
                                        h-[72px]
                                        w-[72px]
                                        shrink-0
                                        sm:h-20
                                        sm:w-20
                                        lg:h-24
                                        lg:w-24
                                    "
                                />
                            ))}
                        </div>

                        <Skeleton
                            rounded="lg"
                            className="
                                order-1
                                h-[360px]
                                min-w-0
                                flex-1
                                min-[430px]:h-[430px]
                                sm:h-[560px]
                                lg:order-2
                                lg:h-[700px]
                                xl:h-[760px]
                            "
                        />
                    </section>

                    {/* Información */}
                    <aside className="min-w-0 lg:sticky lg:top-24">
                        <Skeleton rounded="sm" className="h-3 w-24" />

                        <Skeleton className="mt-4 h-10 w-[90%] sm:h-12" />
                        <Skeleton className="mt-2 h-10 w-[65%] sm:h-12" />

                        <div className="mt-6 flex items-end gap-3">
                            <Skeleton className="h-12 w-40" />
                            <Skeleton rounded="sm" className="h-6 w-24" />
                        </div>

                        <div className="mt-7 space-y-3">
                            <Skeleton rounded="sm" className="h-4 w-20" />

                            <div className="flex flex-wrap gap-3">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <Skeleton
                                        key={index}
                                        className="h-11 w-16"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-7 space-y-3">
                            <Skeleton rounded="sm" className="h-4 w-16" />

                            <div className="flex flex-wrap gap-3">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Skeleton
                                        key={index}
                                        className="h-11 w-14"
                                    />
                                ))}
                            </div>
                        </div>

                        <Skeleton rounded="sm" className="mt-7 h-5 w-40" />

                        <Skeleton
                            rounded="md"
                            className="mt-5 h-14 w-full"
                        />

                        <div className="mt-8 space-y-3 border-t border-white/10 pt-7">
                            <Skeleton rounded="sm" className="h-4 w-full" />
                            <Skeleton rounded="sm" className="h-4 w-[95%]" />
                            <Skeleton rounded="sm" className="h-4 w-[75%]" />
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    rounded="lg"
                                    className="h-20 w-full"
                                />
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}