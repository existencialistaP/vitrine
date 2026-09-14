'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Plus, Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { classeEstiloCard, obterFormatoCard } from '@/lib/visual'
import type { VitrineBase, VitrineView } from '@/lib/vitrine-view'
import { cn } from '@/lib/utils'

import { OrderSheet } from './order-sheet'
import { estiloTema } from './tema-vitrine'
import { useCarrinho } from './use-carrinho'
import { VitrineHeader } from './vitrine-header'

export function ProdutoDetalhe({
  vitrine,
  produto,
}: {
  vitrine: VitrineBase
  produto: VitrineView['produtos'][number]
}) {
  const [sheetAberto, setSheetAberto] = useState(false)
  const { itens, totalItens, adicionar, alterarQuantidade, limpar, adicionadoId } =
    useCarrinho(vitrine.slug)
  const adicionado = adicionadoId === produto.id

  return (
    <div className="min-h-svh bg-(--vitrine-bg)" style={estiloTema(vitrine.tema)}>
      <VitrineHeader
        vitrine={vitrine}
        totalItens={totalItens}
        onAbrirPedido={() => setSheetAberto(true)}
      />

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6">
        <Link
          href={`/${vitrine.slug}`}
          aria-label={`Voltar para a vitrine ${vitrine.nome}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" />
          Voltar para {vitrine.nome}
        </Link>

        <Card
          className={cn(
            'mt-4 overflow-hidden',
            classeEstiloCard(vitrine.tema.estilo)
          )}
        >
          <div
            className={cn(
              'w-full overflow-hidden bg-muted',
              obterFormatoCard(vitrine.tema.formatoCard).aspecto
            )}
          >
            {produto.imagemUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={produto.imagemUrl}
                alt={produto.nome}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <Store className="size-12" aria-hidden="true" />
              </div>
            )}
          </div>
          <CardContent className="flex flex-col gap-3 p-6">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {produto.nome}
            </h1>
            <p className="font-heading text-xl font-semibold tabular-nums">
              {produto.precoFormatado}
            </p>
            {produto.descricao && (
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                {produto.descricao}
              </p>
            )}
            <Button
              size="lg"
              variant={adicionado ? 'outline' : 'default'}
              className={
                adicionado
                  ? undefined
                  : 'bg-(--vitrine-primary) text-white hover:bg-(--vitrine-primary)/90'
              }
              aria-label={
                adicionado
                  ? 'Adicionado ao pedido'
                  : `Adicionar ${produto.nome} ao pedido`
              }
              onClick={() => adicionar(produto)}
            >
              {adicionado ? (
                <Check data-icon="inline-start" />
              ) : (
                <Plus data-icon="inline-start" />
              )}
              {adicionado ? 'Adicionado ✓' : 'Adicionar ao pedido'}
            </Button>
          </CardContent>
        </Card>
      </main>

      <OrderSheet
        vitrine={vitrine}
        itens={itens}
        aberto={sheetAberto}
        onOpenChange={setSheetAberto}
        onAlterarQuantidade={alterarQuantidade}
        onLimpar={limpar}
      />
    </div>
  )
}
