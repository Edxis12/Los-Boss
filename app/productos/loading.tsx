import ProductCardSkeleton from "@/components/ui/skeletons/ProductCardSkeleton";
import SectionHeaderSkeleton from "@/components/ui/skeletons/SectionHeaderSkeleton";
import FilterSidebarSkeleton from "@/components/ui/skeletons/FilterSidebarSkeleton";
import Skeleton from "@/components/ui/Skeleton";

export default function ProductosLoading() {
    return (
        <main className="min-h-screen bg-black">
            <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 xl:px-10">
                <SectionHeaderSkeleton />

                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
                    <FilterSidebarSkeleton />

                    <section className="min-w-0 flex-1">
                        <div className="mb-5 flex items-center justify-between lg:hidden">
                            <Skeleton
                                rounded="md"
                                className="h-11 w-28"
                            />

                            <Skeleton
                                rounded="sm"
                                className="h-5 w-24"
                            />
                        </div>

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-x-3
                                gap-y-7
                                min-[390px]:grid-cols-2
                                min-[390px]:gap-x-4
                                sm:gap-x-5
                                sm:gap-y-9
                                lg:grid-cols-3
                                lg:gap-x-6
                                xl:grid-cols-4
                                xl:gap-x-7
                                xl:gap-y-12
                            "
                        >
                            {Array.from({ length: 8 }).map(
                                (_, index) => (
                                    <ProductCardSkeleton
                                        key={index}
                                    />
                                )
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}