import Skeleton from "../Skeleton";

export default function SectionHeaderSkeleton() {
    return (
        <div className="mb-8">
            <Skeleton
                rounded="sm"
                className="h-3 w-20"
            />

            <Skeleton
                rounded="md"
                className="mt-3 h-10 w-56 sm:h-12 sm:w-72"
            />

            <Skeleton
                rounded="sm"
                className="mt-3 h-4 w-full max-w-lg"
            />

            <Skeleton
                rounded="sm"
                className="mt-2 h-4 w-72"
            />
        </div>
    );
}