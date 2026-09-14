'use client'

import { ErrorState } from '@/components/patterns/error-state'

export default function ErroGlobal({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <ErrorState
        title="Algo deu errado"
        description="Ocorreu um erro inesperado. Tente novamente."
        onRetry={reset}
      />
    </div>
  )
}
