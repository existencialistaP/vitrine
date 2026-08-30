'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ShoppingBag,
  Store,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { VitrineView } from '@/lib/vitrine-view'
import { obterFonte } from '@/lib/visual'

import { ExperienceRenderer } from './experience-renderer'
import { OrderSheet } from './order-sheet'

type ItemCarrinho = {
  id: string
  nome: string
  precoCents: number
  precoFormatado: string
  quantidade: number
}

export function Storefront({ vitrine }: { vitrine: VitrineView }) {
  const [carrinho, setCarrinho] = useState<Record<string, ItemCarrinho>>({})
  const [sheetAberto, setSheetAberto] = useState(false)

  const cssFonte = obterFonte(vitrine.tema.fonte).css

  useEffect(() => {
    const raiz = document.documentElement
    raiz.style.setProperty('--vitrine-primary', vitrine.tema.corPrimaria)
    raiz.style.setProperty('--vitrine-secondary', vitrine.tema.corSecundaria)
    raiz.style.setProperty('--vitrine-bg', vitrine.tema.corFundo)
    return () => {
      raiz.style.removeProperty('--vitrine-primary')
      raiz.style.removeProperty('--vitrine-secondary')
      raiz.style.removeProperty('--vitrine-bg')
    }
  }, [vitrine.tema])

  const itensCarrinho = useMemo(
    () => Object.values(carrinho),
    [carrinho]
  )
  const totalItens = useMemo(
    () => itensCarrinho.reduce((soma, item) => soma + item.quantidade, 0),
    [itensCarrinho]
  )

  function adicionar(produto: VitrineView['produtos'][number]) {
    setCarrinho((anterior) => {
      const atual = anterior[produto.id]
      return {
        ...anterior,
        [produto.id]: {
          id: produto.id,
          nome: produto.nome,
          precoCents: produto.precoCents,
          precoFormatado: produto.precoFormatado,
          quantidade: (atual?.quantidade ?? 0) + 1,
        },
      }
    })
  }

  function alterarQuantidade(id: string, quantidade: number) {
    setCarrinho((anterior) => {
      const atual = anterior[id]
      if (!atual) return anterior
      if (quantidade <= 0) {
        const copia = { ...anterior }
        delete copia[id]
        return copia
      }
      return { ...anterior, [id]: { ...atual, quantidade } }
    })
  }

  return (
    <div
      className="min-h-svh bg-(--vitrine-bg)"
      style={{ fontFamily: cssFonte }}
    >
      {/* Header */}
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
              <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-(--vitrine-primary) text-white">
                <Store className="size-4" aria-hidden="true" />
              </div>
            )}
            <span className="truncate font-heading font-semibold tracking-tight">
              {vitrine.nome}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => setSheetAberto(true)}
            >
              <ShoppingBag aria-hidden="true" />
              Pedido
              {totalItens > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 size-4 p-0 text-[10px] tabular-nums">
                  {totalItens}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
        <ExperienceRenderer
          blocks={vitrine.paginas[0]?.blocos ?? []}
          vitrine={vitrine}
          onAdd={adicionar}
        />
      </main>

      <OrderSheet
        vitrine={vitrine}
        itens={itensCarrinho}
        aberto={sheetAberto}
        onOpenChange={setSheetAberto}
        onAlterarQuantidade={alterarQuantidade}
        onLimpar={() => setCarrinho({})}
      />
    </div>
  )
}
