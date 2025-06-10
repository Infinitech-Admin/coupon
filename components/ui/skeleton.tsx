import { cn } from "@/libs/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties; // Add this line
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
        className,
      )}
    />
  );
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border p-4 shadow-sm", className)}>
      <Skeleton className="h-32 w-full rounded-md" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function PropertyCardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("rounded-lg border shadow-sm overflow-hidden", className)}
    >
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between mt-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-4 md:px-8 lg:px-12 py-8 md:py-12">
      {/* Title skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-2/3 mb-2" />
        <Skeleton className="h-5 w-1/3" />
      </div>

      {/* Image gallery skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
        <Skeleton className="lg:col-span-7 h-[500px] rounded-2xl" />
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[240px] rounded-xl" />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <div>
            <Skeleton className="h-8 w-48 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div>
            <Skeleton className="h-8 w-48 mb-3" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-[500px] rounded-lg" />
        </div>
      </div>

      {/* Gallery skeleton */}
      <div className="mt-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-1/4 mt-4" />
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
