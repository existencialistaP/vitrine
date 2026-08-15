import * as React from "react"
import { TriangleAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

function ErrorState({
  title = "Algo deu errado",
  description,
  onRetry,
  className,
  ...props
}: {
  title?: string
  description?: React.ReactNode
  onRetry?: () => void
} & React.ComponentProps<"div">) {
  return (
    <Alert variant="destructive" className={cn("w-full", className)} {...props}>
      <TriangleAlertIcon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      {onRetry && (
        <AlertAction>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        </AlertAction>
      )}
    </Alert>
  )
}

export { ErrorState }
