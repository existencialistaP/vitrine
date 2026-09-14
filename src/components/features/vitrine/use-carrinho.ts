'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import type { VitrineView } from '@/lib/vitrine-view'

/** Item do pedido no cliente — fonte única (spec RF-A5; antes duplicado). */
export type ItemCarrinho = {
  id: string
  nome: string
  precoCents: number
  precoFormatado: string
  quantidade: number
}

type ProdutoVitrine = Pick<VitrineView['produtos'][number], 'id' | 'nome' | 'precoCents' | 'precoFormatado'>

/** Teto defensivo por item (o VO Quantidade não tem máximo — spec §7). */
export const TETO_QUANTIDADE = 99
/** Versão do formato salvo no localStorage; desconhecida → descarta. */
export const VERSAO_CARRINHO = 1

const DURACAO_FEEDBACK_MS = 1500

type CarrinhoSalvo = { versao: number; itens: ItemCarrinho[] }

function chaveCarrinho(slug: string): string {
  return `vitrine:carrinho:${slug}`
}

export function serializarCarrinho(itens: ItemCarrinho[]): string {
  return JSON.stringify({ versao: VERSAO_CARRINHO, itens } satisfies CarrinhoSalvo)
}

function ehItemValido(valor: unknown): valor is ItemCarrinho {
  if (typeof valor !== 'object' || valor === null) return false
  const item = valor as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.nome === 'string' &&
    item.nome.length > 0 &&
    typeof item.precoCents === 'number' &&
    Number.isFinite(item.precoCents) &&
    item.precoCents >= 0 &&
    typeof item.precoFormatado === 'string' &&
    typeof item.quantidade === 'number' &&
    Number.isInteger(item.quantidade) &&
    item.quantidade >= 1 &&
    item.quantidade <= TETO_QUANTIDADE
  )
}

/** Lê o carrinho salvo; entrada inválida → descartada silenciosamente (spec RF-A5). */
export function parseCarrinho(bruto: string | null): ItemCarrinho[] {
  if (!bruto) return []
  try {
    const dado: unknown = JSON.parse(bruto)
    if (typeof dado !== 'object' || dado === null) return []
    const { versao, itens } = dado as { versao?: unknown; itens?: unknown }
    if (versao !== VERSAO_CARRINHO || !Array.isArray(itens)) return []
    return itens.filter(ehItemValido)
  } catch {
    return []
  }
}

export function adicionarItem(itens: ItemCarrinho[], produto: ProdutoVitrine): ItemCarrinho[] {
  const atual = itens.find((item) => item.id === produto.id)
  const quantidade = Math.min((atual?.quantidade ?? 0) + 1, TETO_QUANTIDADE)
  const novo: ItemCarrinho = {
    id: produto.id,
    nome: produto.nome,
    precoCents: produto.precoCents,
    precoFormatado: produto.precoFormatado,
    quantidade,
  }
  return atual ? itens.map((item) => (item.id === produto.id ? novo : item)) : [...itens, novo]
}

export function alterarQuantidadeItem(
  itens: ItemCarrinho[],
  id: string,
  quantidade: number
): ItemCarrinho[] {
  const atual = itens.find((item) => item.id === id)
  if (!atual) return itens
  if (quantidade <= 0) return itens.filter((item) => item.id !== id)
  const limitada = Math.min(quantidade, TETO_QUANTIDADE)
  return itens.map((item) => (item.id === id ? { ...item, quantidade: limitada } : item))
}

/**
 * Estado do carrinho da vitrine, persistido por loja no localStorage
 * (`vitrine:carrinho:{slug}`). Com `habilitado: false` (preview do builder),
 * não lê nem escreve storage (spec RF-A5).
 */
export function useCarrinho(
  slug: string,
  { habilitado = true }: { habilitado?: boolean } = {}
) {
  const [itens, setItens] = useState<ItemCarrinho[]>([])
  const [pronto, setPronto] = useState(false)
  const [adicionadoId, setAdicionadoId] = useState<string | null>(null)

  // Reidratação só depois do mount: o SSR sempre pinta carrinho vazio,
  // sem mismatch de hidratação (spec RF-A5).
  useEffect(() => {
    if (!habilitado) return
    try {
      setItens(parseCarrinho(window.localStorage.getItem(`vitrine:carrinho:${slug}`)))
    } catch {
      // storage indisponível (quota/privado): segue em memória
    }
    setPronto(true)
  }, [slug, habilitado])

  // Persistência em sincronia com o estado, apenas após reidratado.
  useEffect(() => {
    if (!habilitado || !pronto) return
    try {
      window.localStorage.setItem(`vitrine:carrinho:${slug}`, serializarCarrinho(itens))
    } catch {
      // sem persistência: estado em memória continua funcionando
    }
  }, [itens, pronto, slug, habilitado])

  // Feedback "Adicionado ✓" expira sozinho (spec RF-A6).
  useEffect(() => {
    if (!adicionadoId) return
    const timer = setTimeout(() => setAdicionadoId(null), DURACAO_FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [adicionadoId])

  const adicionar = useCallback((produto: ProdutoVitrine) => {
    setItens((atual) => adicionarItem(atual, produto))
    setAdicionadoId(produto.id)
  }, [])

  const alterarQuantidade = useCallback((id: string, quantidade: number) => {
    setItens((atual) => alterarQuantidadeItem(atual, id, quantidade))
  }, [])

  const limpar = useCallback(() => setItens([]), [])

  const totalItens = useMemo(
    () => itens.reduce((soma, item) => soma + item.quantidade, 0),
    [itens]
  )

  return { itens, totalItens, adicionar, alterarQuantidade, limpar, adicionadoId }
}
