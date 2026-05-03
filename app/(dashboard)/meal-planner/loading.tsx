import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-48" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-10 rounded-lg" />
            {Array.from({ length: 3 }).map((_, j) => <Skeleton key={j} className="h-20 rounded-lg" />)}
          </div>
        ))}
      </div>
    </div>
  );
}
