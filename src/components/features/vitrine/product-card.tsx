'use client'

import { Plus, Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { VitrineView } from '@/lib/vitrine-view'

type Produto = VitrineView['produtos'][number]

export function ProductCard({
  produto,
  onAdicionar,
  aspecto = 'aspect-square',
  classeCard = 'rounded-lg',
  horizontal = false,
  destaque = false,
}: {
  produto: Produto
  onAdicionar: (produto: Produto) => void
  aspecto?: string
  classeCard?: string
  horizontal?: boolean
  destaque?: boolean
}) {
  const imagem = produto.imagemUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={produto.imagemUrl}
      alt={produto.nome}
      loading="lazy"
      className="size-full object-cover"
    />
  ) : (
    <div className="flex size-full items-center justify-center text-muted-foreground">
      <Store className="size-8" aria-hidden="true" />
    </div>
  )

  if (horizontal) {
    return (
      <Card className={cn('flex overflow-hidden', classeCard)}>
        <div className={cn('w-28 shrink-0 overflow-hidden bg-muted sm:w-40', aspecto)}>
          {imagem}
        </div>
        <CardContent className="flex flex-1 flex-col gap-1.5 p-4">
          <h3 className={cn('font-heading font-semibold tracking-tight', destaque ? 'text-lg' : 'text-sm')}>
            {produto.nome}
          </h3>
          {produto.descricao && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {produto.descricao}
            </p>
          )}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <span className="font-heading text-base font-semibold tabular-nums">
              {produto.precoFormatado}
            </span>
            <Button
              size={destaque ? 'default' : 'sm'}
              className="bg-(--vitrine-primary) text-white hover:bg-(--vitrine-primary)/90"
              onClick={() => onAdicionar(produto)}
            >
              <Plus data-icon="inline-start" />
              {destaque ? 'Adicionar ao pedido' : 'Adicionar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden', classeCard)}>
      <div className={cn('w-full overflow-hidden bg-muted', aspecto)}>
        {imagem}
      </div>
      <CardContent className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-heading text-sm font-medium">{produto.nome}</h3>
        {produto.descricao && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {produto.descricao}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-heading text-base font-semibold tabular-nums">
            {produto.precoFormatado}
          </span>
          <Button
            size="sm"
            className="shrink-0 bg-(--vitrine-primary) text-white hover:bg-(--vitrine-primary)/90"
            onClick={() => onAdicionar(produto)}
          >
            <Plus data-icon="inline-start" />
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
