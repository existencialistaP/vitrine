'use client'

import { Check, Plus, Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { VitrineView } from '@/lib/vitrine-view'

type Produto = VitrineView['produtos'][number]

function AcaoAdicionar({
  produto,
  onAdicionar,
  adicionado,
  tamanho,
}: {
  produto: Produto
  onAdicionar?: (produto: Produto) => void
  adicionado: boolean
  tamanho: 'default' | 'sm'
}) {
  if (!onAdicionar) return null
  return (
    <Button
      variant={adicionado ? 'outline' : 'default'}
      size={tamanho}
      className={
        adicionado
          ? undefined
          : 'bg-(--vitrine-primary) text-white hover:bg-(--vitrine-primary)/90'
      }
      aria-label={`Adicionar ${produto.nome} ao pedido`}
      onClick={() => onAdicionar(produto)}
    >
      {adicionado ? (
        <Check data-icon="inline-start" />
      ) : (
        <Plus data-icon="inline-start" />
      )}
      {adicionado ? 'Adicionado ✓' : tamanho === 'default' ? 'Adicionar ao pedido' : 'Adicionar'}
    </Button>
  )
}

export function ProductCard({
  produto,
  onAdicionar,
  adicionado = false,
  aspecto = 'aspect-square',
  classeCard = 'rounded-lg',
  horizontal = false,
  destaque = false,
  className,
}: {
  produto: Produto
  onAdicionar?: (produto: Produto) => void
  adicionado?: boolean
  aspecto?: string
  classeCard?: string
  horizontal?: boolean
  destaque?: boolean
  className?: string
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
      <Card className={cn('flex overflow-hidden', classeCard, className)}>
        <div className={cn('w-28 shrink-0 overflow-hidden bg-muted sm:w-40', aspecto)}>
          {imagem}
        </div>
        <CardContent className="flex flex-1 flex-col gap-1.5 p-4">
          <h3
            className={cn(
              'font-heading font-semibold tracking-tight',
              destaque ? 'text-lg' : 'text-sm'
            )}
          >
            {produto.nome}
          </h3>
          {produto.descricao && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{produto.descricao}</p>
          )}
          <div className="relative z-10 mt-auto flex items-center justify-between gap-2 pt-2">
            <span className="font-heading text-base font-semibold tabular-nums">
              {produto.precoFormatado}
            </span>
            <AcaoAdicionar
              produto={produto}
              onAdicionar={onAdicionar}
              adicionado={adicionado}
              tamanho={destaque ? 'default' : 'sm'}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden', classeCard, className)}>
      <div className={cn('w-full overflow-hidden bg-muted', aspecto)}>{imagem}</div>
      <CardContent className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-heading text-sm font-medium">{produto.nome}</h3>
        {produto.descricao && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {produto.descricao}
          </p>
        )}
        <div className="relative z-10 mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-heading text-base font-semibold tabular-nums">
            {produto.precoFormatado}
          </span>
          <AcaoAdicionar
            produto={produto}
            onAdicionar={onAdicionar}
            adicionado={adicionado}
            tamanho="sm"
          />
        </div>
      </CardContent>
    </Card>
  )
}
