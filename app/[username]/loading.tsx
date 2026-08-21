import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export default function UserLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      {/* Author Header Skeleton */}
      <div className="mb-12 border-b border-zinc-200 pb-10 dark:border-zinc-800">
        <div className="flex flex-col items-center sm:flex-row sm:gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="mt-4 sm:mt-0 space-y-2 flex flex-col items-center sm:items-start">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-4 w-96" />
          </div>
        </div>
      </div>

      {/* Posts list skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-36" />
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-7 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-32" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
