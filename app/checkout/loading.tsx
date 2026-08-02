import Skeleton from "@/components/ui/Skeleton";

function AddressCardSkeleton() {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
            <div className="flex items-start gap-4">
                <Skeleton
                    rounded="full"
                    className="h-9 w-9 shrink-0"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Skeleton
                            rounded="sm"
                            className="h-3 w-24"
                        />

                        <Skeleton
                            rounded="full"
                            className="h-5 w-20"
                        />
                    </div>

                    <Skeleton
                        rounded="sm"
                        className="mt-4 h-5 w-44"
                    />

                    <Skeleton
                        rounded="sm"
                        className="mt-2 h-4 w-28"
                    />

                    <div className="mt-4 space-y-2">
                        <Skeleton
                            rounded="sm"
                            className="h-4 w-full max-w-sm"
                        />

                        <Skeleton
                            rounded="sm"
                            className="h-4 w-52"
                        />

                        <Skeleton
                            rounded="sm"
                            className="h-4 w-40"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrderItemSkeleton() {
    return (
        <div className="flex gap-3 border-b border-white/10 pb-5 last:border-0 last:pb-0 min-[430px]:gap-4">
            <Skeleton
                rounded="md"
                className="h-16 w-16 shrink-0 min-[430px]:h-20 min-[430px]:w-20"
            />

            <div className="min-w-0 flex-1">
                <Skeleton
                    rounded="sm"
                    className="h-4 w-[85%]"
                />

                <Skeleton
                    rounded="sm"
                    className="mt-2 h-3 w-24"
                />

                <div className="mt-4 flex flex-col gap-2 min-[430px]:flex-row min-[430px]:items-end min-[430px]:justify-between">
                    <Skeleton
                        rounded="sm"
                        className="h-3 w-28"
                    />

                    <Skeleton
                        rounded="sm"
                        className="h-4 w-20"
                    />
                </div>
            </div>
        </div>
    );
}

export default function CheckoutLoading() {
    return (
        <main className="min-h-screen bg-black">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
                {/* Encabezado */}
                <div className="mb-6 sm:mb-10">
                    <Skeleton
                        rounded="sm"
                        className="h-4 w-32"
                    />

                    <Skeleton
                        rounded="sm"
                        className="mt-5 h-3 w-36"
                    />

                    <Skeleton
                        rounded="md"
                        className="mt-3 h-9 w-44 min-[430px]:h-10 sm:h-12 sm:w-56"
                    />

                    <Skeleton
                        rounded="sm"
                        className="mt-3 h-4 w-full max-w-xl"
                    />

                    <Skeleton
                        rounded="sm"
                        className="mt-2 h-4 w-[75%] max-w-md"
                    />
                </div>

                <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(340px,390px)] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-12">
                    {/* Formulario */}
                    <section className="space-y-6 rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 shadow-[0_30px_80px_rgba(0,0,0,.35)] min-[430px]:space-y-7 min-[430px]:rounded-3xl min-[430px]:p-5 sm:p-6 lg:p-7 xl:p-8">
                        <div className="flex items-start gap-4">
                            <Skeleton
                                rounded="md"
                                className="h-10 w-10 shrink-0"
                            />

                            <div className="min-w-0 flex-1">
                                <Skeleton
                                    rounded="sm"
                                    className="h-6 w-52 sm:h-7"
                                />

                                <Skeleton
                                    rounded="sm"
                                    className="mt-2 h-4 w-full max-w-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between">
                                <div>
                                    <Skeleton
                                        rounded="sm"
                                        className="h-4 w-44"
                                    />

                                    <Skeleton
                                        rounded="sm"
                                        className="mt-2 h-3 w-64 max-w-full"
                                    />
                                </div>

                                <Skeleton
                                    rounded="full"
                                    className="h-7 w-24"
                                />
                            </div>

                            <AddressCardSkeleton />
                            <AddressCardSkeleton />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Skeleton
                                rounded="md"
                                className="h-12 w-full"
                            />

                            <Skeleton
                                rounded="md"
                                className="h-12 w-full"
                            />
                        </div>

                        <Skeleton
                            rounded="lg"
                            className="h-24 w-full"
                        />

                        <Skeleton
                            rounded="md"
                            className="h-12 w-full sm:h-14"
                        />
                    </section>

                    {/* Resumen */}
                    <aside className="h-fit rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 shadow-[0_30px_80px_rgba(0,0,0,.35)] min-[430px]:rounded-3xl min-[430px]:p-5 sm:p-6 lg:sticky lg:top-24 xl:p-7">
                        <Skeleton
                            rounded="sm"
                            className="h-3 w-24"
                        />

                        <div className="mt-3 flex items-center justify-between gap-4">
                            <Skeleton
                                rounded="sm"
                                className="h-7 w-28"
                            />

                            <Skeleton
                                rounded="full"
                                className="h-7 w-20"
                            />
                        </div>

                        <div className="my-6 space-y-5">
                            {Array.from({ length: 3 }).map(
                                (_, index) => (
                                    <OrderItemSkeleton key={index} />
                                )
                            )}
                        </div>

                        <div className="space-y-3 border-t border-white/10 pt-5">
                            <div className="flex items-center justify-between gap-4">
                                <Skeleton
                                    rounded="sm"
                                    className="h-4 w-20"
                                />

                                <Skeleton
                                    rounded="sm"
                                    className="h-4 w-24"
                                />
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <Skeleton
                                    rounded="sm"
                                    className="h-4 w-16"
                                />

                                <Skeleton
                                    rounded="sm"
                                    className="h-4 w-40"
                                />
                            </div>

                            <div className="flex items-end justify-between gap-4 border-t border-white/10 pt-5">
                                <Skeleton
                                    rounded="sm"
                                    className="h-5 w-14"
                                />

                                <Skeleton
                                    rounded="sm"
                                    className="h-9 w-32"
                                />
                            </div>
                        </div>

                        <div className="mt-7 space-y-4 border-t border-white/10 pt-6">
                            {Array.from({ length: 3 }).map(
                                (_, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3"
                                    >
                                        <Skeleton
                                            rounded="sm"
                                            className="h-4 w-4 shrink-0"
                                        />

                                        <Skeleton
                                            rounded="sm"
                                            className="h-3 w-52 max-w-full"
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}