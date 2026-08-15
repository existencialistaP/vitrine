'use client'

import { Plus, Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { VitrineView } from '@/lib/vitrine-view'

type Produto = VitrineView['produtos'][number]

export function ProductCard({
  produto,
  onAdicionar,
}: {
  produto: Produto
  onAdicionar: (produto: Produto) => void
}) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square w-full overflow-hidden bg-muted">
        {produto.imagemUrl ? (
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
        )}
      </div>
      <CardContent className="flex flex-col gap-1.5 p-4">
        <h3 className="font-heading text-sm font-medium">{produto.nome}</h3>
        {produto.descricao && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {produto.descricao}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-heading text-base font-semibold tabular-nums">
            {produto.precoFormatado}
          </span>
          <Button
            size="sm"
            className="bg-(--vitrine-primary) text-white hover:bg-(--vitrine-primary)/90"
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
