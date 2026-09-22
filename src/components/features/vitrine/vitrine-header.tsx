'use client'

import { ShoppingBag, Store } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { VitrineBase } from '@/lib/vitrine-view'

export function VitrineHeader({
  vitrine,
  totalItens,
  onAbrirPedido,
}: {
  vitrine: VitrineBase
  totalItens: number
  onAbrirPedido?: () => void
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-(--vitrine-bg)/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {vitrine.tema.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vitrine.tema.logoUrl}
              alt={`Logo de ${vitrine.nome}`}
              className="size-8 rounded-full object-cover"
            />
          ) : (
            <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-(--vitrine-primary) text-primary-foreground">
              <Store className="size-4" aria-hidden="true" />
            </div>
          )}
          <span className="truncate font-heading font-semibold tracking-tight">
            {vitrine.nome}
          </span>
        </div>
        {onAbrirPedido && (
          <div className="flex shrink-0 items-center gap-2">
            <span className="sr-only" aria-live="polite">
              {totalItens > 0
                ? `${totalItens} ${totalItens === 1 ? 'item' : 'itens'} no pedido`
                : null}
            </span>
            <Button variant="ghost" size="sm" className="relative" onClick={onAbrirPedido}>
              <ShoppingBag aria-hidden="true" />
              Pedido
              {totalItens > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 size-4 p-0 text-xs tabular-nums">
                  {totalItens}
                </Badge>
              )}
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
