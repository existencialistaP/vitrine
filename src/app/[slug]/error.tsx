'use client'

import { ErrorState } from '@/components/patterns/error-state'

export default function VitrineErro({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <ErrorState
        title="Não foi possível carregar esta vitrine"
        description="Ocorreu um problema inesperado. Tente novamente em instantes."
        onRetry={reset}
      />
    </div>
  )
}
