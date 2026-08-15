import { Skeleton } from "@/components/ui/skeleton"

export default function VitrineLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-9 w-64 self-center" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, indice) => (
          <Skeleton key={indice} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
