'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  MessageCircle,
  ShoppingBag,
  Store,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import type { VitrineView } from '@/lib/vitrine-view'

import { OrderSheet } from './order-sheet'
import { ProductCard } from './product-card'

type ItemCarrinho = {
  id: string
  nome: string
  precoCents: number
  precoFormatado: string
  quantidade: number
}

const FONTES: Record<VitrineView['tema']['fonte'], string> = {
  SANS: 'var(--font-sans)',
  SERIF: "Georgia, 'Times New Roman', serif",
  MONO: 'var(--font-geist-mono)',
}

export function Storefront({ vitrine }: { vitrine: VitrineView }) {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todas')
  const [carrinho, setCarrinho] = useState<Record<string, ItemCarrinho>>({})
  const [sheetAberto, setSheetAberto] = useState(false)

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

  const produtosFiltrados = useMemo(() => {
    if (categoriaAtiva === 'todas') return vitrine.produtos
    return vitrine.produtos.filter(
      (produto) => produto.categoriaId === categoriaAtiva
    )
  }, [categoriaAtiva, vitrine.produtos])

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
      style={{ fontFamily: FONTES[vitrine.tema.fonte] }}
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

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
        {/* Hero */}
        <section className="flex flex-col items-center gap-3 py-10 text-center sm:py-14">
          <h1 className="max-w-2xl font-heading text-3xl font-bold tracking-tight sm:text-5xl">
            {vitrine.nome}
          </h1>
          {vitrine.descricao && (
            <p className="max-w-xl text-balance text-muted-foreground">
              {vitrine.descricao}
            </p>
          )}
          <a
            href={vitrine.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="mt-2"
          >
            <Button
              variant="outline"
              className="bg-background/50"
            >
              <MessageCircle data-icon="inline-start" />
              Chamar no WhatsApp
            </Button>
          </a>
        </section>

        {/* Categorias */}
        {vitrine.categorias.length > 0 && (
          <ToggleGroup
            className="mb-8 flex-wrap justify-center"
            spacing={1}
            value={[categoriaAtiva]}
            onValueChange={(valores) => {
              setCategoriaAtiva(valores[0] ?? 'todas')
            }}
          >
            <ToggleGroupItem value="todas">Todas</ToggleGroupItem>
            {vitrine.categorias.map((categoria) => (
              <ToggleGroupItem key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}

        {/* Produtos */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {produtosFiltrados.map((produto) => (
            <ProductCard
              key={produto.id}
              produto={produto}
              onAdicionar={adicionar}
            />
          ))}
        </div>
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
