import Skeleton from "../Skeleton";

export default function FilterSidebarSkeleton() {
    return (
        <aside className="hidden w-[300px] shrink-0 lg:block">
            <div className="space-y-7 rounded-3xl border border-white/10 bg-[#0d0d0d] p-6">
                <div className="flex items-center justify-between">
                    <Skeleton
                        rounded="sm"
                        className="h-4 w-24"
                    />

                    <Skeleton
                        rounded="full"
                        className="h-8 w-20"
                    />
                </div>

                <div className="space-y-3">
                    <Skeleton
                        rounded="sm"
                        className="h-3 w-24"
                    />

                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            rounded="md"
                            className="h-11 w-full"
                        />
                    ))}
                </div>

                <div className="space-y-3">
                    <Skeleton
                        rounded="sm"
                        className="h-3 w-20"
                    />

                    <Skeleton
                        rounded="md"
                        className="h-11 w-full"
                    />
                </div>

                <div className="space-y-3">
                    <Skeleton
                        rounded="sm"
                        className="h-3 w-24"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Skeleton
                            rounded="md"
                            className="h-11"
                        />

                        <Skeleton
                            rounded="md"
                            className="h-11"
                        />
                    </div>

                    <Skeleton
                        rounded="md"
                        className="h-11 w-full"
                    />
                </div>
            </div>
        </aside>
    );
}