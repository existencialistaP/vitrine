import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

function LoadingState({
  className,
  rows = 3,
  ...props
}: React.ComponentProps<"div"> & { rows?: number }) {
  return (
    <div
      className={cn("flex w-full flex-col gap-4", className)}
      aria-busy="true"
      aria-label="Carregando"
      {...props}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full" />
      ))}
    </div>
  )
}

export { LoadingState }
