import * as React from "react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
} & React.ComponentProps<"div">) {
  return (
    <Empty className={className} {...props}>
      <EmptyHeader>
        {Icon && (
          <EmptyMedia variant="icon">
            <Icon aria-hidden="true" />
          </EmptyMedia>
        )}
        <EmptyContent>
          <EmptyTitle>{title}</EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
          {action}
        </EmptyContent>
      </EmptyHeader>
    </Empty>
  )
}

export { EmptyState }
