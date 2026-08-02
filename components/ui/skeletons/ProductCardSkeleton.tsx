import Skeleton from "../Skeleton";

export default function ProductCardSkeleton() {
    return (
        <article aria-hidden="true">
            <Skeleton
                rounded="lg"
                className="aspect-[3/4] w-full"
            />

            <div className="mt-5 space-y-2 px-1">
                <Skeleton
                    rounded="sm"
                    className="h-3 w-20"
                />

                <Skeleton
                    rounded="sm"
                    className="h-5 w-[85%]"
                />

                <Skeleton
                    rounded="sm"
                    className="h-5 w-24"
                />
            </div>
        </article>
    );
}