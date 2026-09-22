'use client'

import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

/** Padrão único de cartão selecionável para opções de aparência (RF-8). */
export function OptionCard({
  selecionado,
  aoSelecionar,
  label,
  titulo,
  children,
}: {
  selecionado: boolean
  aoSelecionar: () => void
  label: string
  titulo: string
  children?: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selecionado}
      aria-label={label}
      onClick={aoSelecionar}
      className={cn(
        'group relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left outline-none transition-colors',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        selecionado ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted'
      )}
    >
      {children}
      <span className="text-xs font-medium leading-tight">{titulo}</span>
      {selecionado && (
        <span
          className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <Check className="size-3" />
        </span>
      )}
    </button>
  )
}
