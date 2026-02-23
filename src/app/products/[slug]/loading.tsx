import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Image Gallery Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="aspect-square w-full rounded-xl" />
                    <div className="grid grid-cols-4 gap-4">
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                    </div>
                </div>

                {/* Product Info Skeleton */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-10 w-3/4" />
                    </div>

                    <div className="flex gap-2">
                        <Skeleton className="h-5 w-32" />
                    </div>

                    <Skeleton className="h-12 w-32" />

                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <Skeleton className="h-12 flex-1 rounded-lg" />
                        <Skeleton className="h-12 w-12 rounded-lg" />
                    </div>

                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}
