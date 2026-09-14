# Vitrine Pública (Spec A) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a spec `docs/superpowers/specs/2026-09-13-vitrine-publica-spec.md`: página de produto dedicada, erros honestos (404 ≠ falha), tema SSR-safe com opções renderizadas e carrinho persistente com feedback.

**Architecture:** Rota server-component nova `/{slug}/produto/[id]` reusando `catalogoService.listarPorSlug`; carrinho em hook client com funções puras testáveis + `localStorage` versionado por loja; tema aplicado via `style` inline (SSR-safe) no wrapper; helpers de tema já existentes em `src/lib/visual` passam a ser consumidos pela coleção de produtos; boundaries de erro com o padrão `ErrorState`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Vitest (environment node, sem Testing Library).

**Spec:** `docs/superpowers/specs/2026-09-13-vitrine-publica-spec.md`

## Global Constraints

- npm (nunca pnpm). Comandos de verificação: `npm run typecheck`, `npm run lint`, `npm test`.
- Tailwind v4 com tokens semânticos — nunca `bg-[#...]`, nunca `space-x-*`/`space-y-*` (usar `flex` + `gap-*`), dimensões iguais com `size-*`.
- Ícones em botões via `data-icon="inline-start"/"inline-end"`, nunca `className="size-*"` no ícone.
- Primitives `@base-ui/react` (não Radix). Compor componentes `src/components/ui` existentes.
- `<img>` raw é o padrão atual da vitrine (com `// eslint-disable-next-line @next/next/no-img-element`) — não migrar para `next/image` nesta fase (fora de escopo, spec §3).
- Sem `dark:` manual; sem cores raw (`text-emerald-500` etc.).
- Testes Vitest rodam em ambiente `node` (`vitest.config.ts`: `environment: "node"`, `include: ["tests/**/*.test.ts"]`) — nenhum teste de DOM; a lógica de UI testável vive em funções puras.
- Vitest aliases: `@` → `src`, `@tests` → `tests`.
- Commits no estilo do repo: prefixo conventional + descrição pt-BR (ex.: `feat: ...`).

---

### Task 1: Módulo do carrinho — funções puras + hook

**Files:**
- Create: `src/components/features/vitrine/use-carrinho.ts`
- Test: `tests/unit/lib/carrinho.test.ts`

**Interfaces:**
- Consumes: nada (módulo folha; importa só `react` e o tipo `VitrineView`).
- Produces (usados pelas Tasks 2 e 3):
  - `type ItemCarrinho = { id: string; nome: string; precoCents: number; precoFormatado: string; quantidade: number }`
  - `parseCarrinho(bruto: string | null): ItemCarrinho[]`
  - `serializarCarrinho(itens: ItemCarrinho[]): string`
  - `adicionarItem(itens: ItemCarrinho[], produto: Pick<VitrineView["produtos"][number], "id" | "nome" | "precoCents" | "precoFormatado">): ItemCarrinho[]`
  - `alterarQuantidadeItem(itens: ItemCarrinho[], id: string, quantidade: number): ItemCarrinho[]`
  - `TETO_QUANTIDADE = 99`, `VERSAO_CARRINHO = 1`
  - `useCarrinho(slug: string, opcoes?: { habilitado?: boolean }): { itens: ItemCarrinho[]; totalItens: number; adicionar(produto): void; alterarQuantidade(id, quantidade): void; limpar(): void; adicionadoId: string | null }`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/lib/carrinho.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  TETO_QUANTIDADE,
  VERSAO_CARRINHO,
  adicionarItem,
  alterarQuantidadeItem,
  parseCarrinho,
  serializarCarrinho,
  type ItemCarrinho,
} from "@/components/features/vitrine/use-carrinho";

const item = (sobre?: Partial<ItemCarrinho>): ItemCarrinho => ({
  id: "p1",
  nome: "Bolo de cenoura",
  precoCents: 1500,
  precoFormatado: "R$ 15,00",
  quantidade: 1,
  ...sobre,
});

describe("parseCarrinho", () => {
  it("retorna lista vazia para null ou string vazia", () => {
    expect(parseCarrinho(null)).toEqual([]);
    expect(parseCarrinho("")).toEqual([]);
  });

  it("desserializa um carrinho salvo (ida e volta)", () => {
    const itens = [
      item(),
      item({ id: "p2", nome: "Torta", precoCents: 2500, precoFormatado: "R$ 25,00", quantidade: 3 }),
    ];
    expect(parseCarrinho(serializarCarrinho(itens))).toEqual(itens);
  });

  it("descarta JSON quebrado", () => {
    expect(parseCarrinho("{não é json")).toEqual([]);
  });

  it("descarta estrutura inesperada", () => {
    expect(parseCarrinho(JSON.stringify([item()]))).toEqual([]);
    expect(parseCarrinho(JSON.stringify({ versao: 1, itens: "ops" }))).toEqual([]);
    expect(parseCarrinho("42")).toEqual([]);
  });

  it("descarta versão desconhecida", () => {
    const bruto = JSON.stringify({ versao: VERSAO_CARRINHO + 1, itens: [item()] });
    expect(parseCarrinho(bruto)).toEqual([]);
  });

  it("mantém apenas os itens com campos válidos", () => {
    const bruto = JSON.stringify({
      versao: VERSAO_CARRINHO,
      itens: [
        item(),
        { id: "", nome: "X", precoCents: 100, precoFormatado: "R$ 1,00", quantidade: 1 },
        { id: "p9", nome: "Y", precoCents: "cem", precoFormatado: "R$ 1,00", quantidade: 1 },
        { id: "p8", nome: "Z", precoCents: 100, precoFormatado: "R$ 1,00", quantidade: 0 },
        item({ id: "p7", quantidade: TETO_QUANTIDADE + 1 }),
      ],
    });
    expect(parseCarrinho(bruto)).toEqual([item()]);
  });
});

describe("adicionarItem", () => {
  const produto = { id: "p1", nome: "Bolo de cenoura", precoCents: 1500, precoFormatado: "R$ 15,00" };

  it("insere item novo com quantidade 1", () => {
    expect(adicionarItem([], produto)).toEqual([item()]);
  });

  it("incrementa item existente", () => {
    expect(adicionarItem([item({ quantidade: 2 })], produto)).toEqual([item({ quantidade: 3 })]);
  });

  it("não passa do teto de quantidade", () => {
    expect(adicionarItem([item({ quantidade: TETO_QUANTIDADE })], produto)).toEqual([
      item({ quantidade: TETO_QUANTIDADE }),
    ]);
  });
});

describe("alterarQuantidadeItem", () => {
  const itens = [item(), item({ id: "p2", nome: "Torta", precoCents: 2500, precoFormatado: "R$ 25,00" })];

  it("altera a quantidade", () => {
    expect(alterarQuantidadeItem(itens, "p1", 4)).toEqual([
      item({ quantidade: 4 }),
      itens[1],
    ]);
  });

  it("remove o item quando a quantidade é zero ou negativa", () => {
    expect(alterarQuantidadeItem(itens, "p1", 0)).toEqual([itens[1]]);
    expect(alterarQuantidadeItem(itens, "p2", -1)).toEqual([itens[0]]);
  });

  it("limita ao teto", () => {
    expect(alterarQuantidadeItem(itens, "p1", 500)).toEqual([
      item({ quantidade: TETO_QUANTIDADE }),
      itens[1],
    ]);
  });

  it("mantém a lista quando o id não existe", () => {
    expect(alterarQuantidadeItem(itens, "p9", 2)).toEqual(itens);
  });
});

describe("serializarCarrinho", () => {
  it("grava com a versão atual", () => {
    expect(JSON.parse(serializarCarrinho([item()]))).toEqual({
      versao: VERSAO_CARRINHO,
      itens: [item()],
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/lib/carrinho.test.ts`
Expected: FAIL — módulo `@/components/features/vitrine/use-carrinho` não existe.

- [ ] **Step 3: Write minimal implementation**

Create `src/components/features/vitrine/use-carrinho.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/lib/carrinho.test.ts`
Expected: PASS (todas as asserções).

- [ ] **Step 5: Commit**

```bash
git add src/components/features/vitrine/use-carrinho.ts tests/unit/lib/carrinho.test.ts
git commit -m "feat(vitrine): módulo do carrinho com persistência e feedback"
```

---

### Task 2: Tema SSR-safe + coleção com ProductCard + feedback "Adicionado ✓"

**Files:**
- Create: `src/components/features/vitrine/tema-vitrine.ts`
- Modify: `src/components/features/vitrine/storefront.tsx` (linhas 1–53: estado/tema; linhas 147–156: props do renderer)
- Modify: `src/components/features/vitrine/order-sheet.tsx:33-39` (remove tipo duplicado)
- Modify: `src/components/features/vitrine/experience-renderer.tsx` (imports + caso `productCollection`)
- Modify: `src/components/features/vitrine/product-card.tsx` (arquivo inteiro — deixa de ser código morto)

**Interfaces:**
- Consumes: da Task 1 — `useCarrinho`, `ItemCarrinho`.
- Produces (usados pela Task 3):
  - `estiloTema(tema: VitrineView["tema"]): React.CSSProperties` (fonte + `--vitrine-primary/secondary/bg`)
  - `ProductCard` com props `{ produto, onAdicionar?, adicionado?, aspecto?, classeCard?, horizontal?, destaque?, className? }`
  - `ExperienceRenderer` com prop nova `adicionadoId?: string | null`
  - `OrderSheet` com prop `itens: ItemCarrinho[]` (tipo importado do módulo do carrinho)

- [ ] **Step 1: Criar helper de tema (mata o FOUC — spec RF-A3)**

Create `src/components/features/vitrine/tema-vitrine.ts`:

```ts
import type { CSSProperties } from 'react'

import { obterFonte } from '@/lib/visual'
import type { VitrineView } from '@/lib/vitrine-view'

/** Estilo inline com as CSS vars do tema — SSR-safe, sem useEffect (spec RF-A3). */
export function estiloTema(tema: VitrineView['tema']): CSSProperties {
  return {
    fontFamily: obterFonte(tema.fonte).css,
    '--vitrine-primary': tema.corPrimaria,
    '--vitrine-secondary': tema.corSecundaria,
    '--vitrine-bg': tema.corFundo,
  } as CSSProperties
}
```

- [ ] **Step 2: Atualizar `product-card.tsx` (botão opcional + estado "Adicionado")**

Substituir `src/components/features/vitrine/product-card.tsx` por:

```tsx
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
```

Notas: `relative z-10` na linha de preço/ação prepara o card para o link esticado da Task 3 (sobrepor o link). `onAdicionar` virou opcional — no preview (sem `onAdd`) o botão some, igual ao comportamento atual do card inline.

- [ ] **Step 3: Atualizar `experience-renderer.tsx` (coleção usa ProductCard com o tema — spec RF-A4)**

Em `src/components/features/vitrine/experience-renderer.tsx`:

1. Substituir os imports por:

```tsx
import type { ReactNode } from 'react'
import { MessageCircle, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { resolveProductSection, type BlocoExperiencia } from '@/lib/experience'
import { classeEstiloCard, classeLayout, obterFormatoCard } from '@/lib/visual'
import type { VitrineView } from '@/lib/vitrine-view'
import { Layout } from '@/modules/loja/domain/vos/identidade-visual'

import { ProductCard } from './product-card'
```

2. Trocar a assinatura dos dois pontos que repassam props:

```tsx
export function ExperienceRenderer({
  blocks,
  vitrine,
  onAdd,
  adicionadoId,
  preview = false,
}: {
  blocks: BlocoExperiencia[]
  vitrine: VitrineView
  onAdd?: (product: VitrineView['produtos'][number]) => void
  adicionadoId?: string | null
  preview?: boolean
}) {
  return (
    <div className="flex flex-col gap-12">
      {blocks.map((block) => (
        <Envolver key={block.id} bloco={block} preview={preview}>
          {renderizar(block, vitrine, onAdd, adicionadoId)}
        </Envolver>
      ))}
    </div>
  )
}

function renderizar(
  block: BlocoExperiencia,
  vitrine: VitrineView,
  onAdd?: (product: VitrineView['produtos'][number]) => void,
  adicionadoId?: string | null
) {
```

3. Substituir integralmente o caso `productCollection` (atual linhas 130–160) por:

```tsx
    case 'productCollection': {
      const produtos = resolveProductSection(vitrine.produtos, block.props)
      const aspecto = obterFormatoCard(vitrine.tema.formatoCard).aspecto
      const destaquePrimeiro = vitrine.tema.layout === Layout.DESTAQUE
      return (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-semibold">
            {texto('title', 'Produtos em destaque')}
          </h2>
          <div className={cn('grid', classeLayout(vitrine.tema.layout))}>
            {produtos.map((product, indice) => {
              const emDestaque = destaquePrimeiro && indice === 0
              return (
                <ProductCard
                  key={product.id}
                  produto={product}
                  onAdicionar={onAdd}
                  adicionado={adicionadoId === product.id}
                  aspecto={aspecto}
                  classeCard={classeEstiloCard(vitrine.tema.estilo)}
                  horizontal={vitrine.tema.layout === Layout.LISTA || emDestaque}
                  destaque={emDestaque}
                  className={emDestaque ? 'col-span-full' : undefined}
                />
              )
            })}
          </div>
        </section>
      )
    }
```

4. Adicionar o import do `cn` junto aos demais:

```tsx
import { cn } from '@/lib/utils'
```

(O helper `classeLayout` devolve só as colunas — o `grid` base vem do `cn('grid', ...)`.)

- [ ] **Step 4: Atualizar `order-sheet.tsx` (fonte única do tipo)**

Em `src/components/features/vitrine/order-sheet.tsx`, remover o bloco duplicado (linhas 33–39):

```tsx
type ItemCarrinho = {
  id: string
  nome: string
  precoCents: number
  precoFormatado: string
  quantidade: number
}
```

e importar do módulo do carrinho:

```tsx
import { type ItemCarrinho } from '@/components/features/vitrine/use-carrinho'
```

- [ ] **Step 5: Atualizar `storefront.tsx` (hook + tema inline)**

Substituir `src/components/features/vitrine/storefront.tsx` por:

```tsx
'use client'

import { useState } from 'react'
import { ShoppingBag, Store } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { VitrineView } from '@/lib/vitrine-view'

import { ExperienceRenderer } from './experience-renderer'
import { OrderSheet } from './order-sheet'
import { estiloTema } from './tema-vitrine'
import { useCarrinho } from './use-carrinho'

export function Storefront({
  vitrine,
  preview = false,
}: {
  vitrine: VitrineView
  preview?: boolean
}) {
  const [sheetAberto, setSheetAberto] = useState(false)
  const [paginaId, setPaginaId] = useState(vitrine.paginas[0]?.id ?? '')
  const { itens, totalItens, adicionar, alterarQuantidade, limpar, adicionadoId } =
    useCarrinho(vitrine.slug, { habilitado: !preview })

  const paginaAtiva = vitrine.paginas.find((p) => p.id === paginaId) ?? vitrine.paginas[0]

  return (
    <div
      className="min-h-svh bg-(--vitrine-bg)"
      style={estiloTema(vitrine.tema)}
    >
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
          {!preview && (
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
          )}
        </div>
      </header>

      {vitrine.paginas.length > 1 && (
        <div className="sticky top-14 z-30 border-b border-border/60 bg-(--vitrine-bg)/90 backdrop-blur-md">
          <Tabs
            value={paginaId}
            onValueChange={setPaginaId}
            className="mx-auto max-w-5xl px-4 sm:px-6"
          >
            <TabsList variant="line" className="h-10 w-full">
              {vitrine.paginas.map((pagina) => (
                <TabsTrigger key={pagina.id} value={pagina.id}>
                  {pagina.rotulo}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
        {paginaAtiva ? (
          <ExperienceRenderer
            blocks={paginaAtiva.blocos}
            vitrine={vitrine}
            onAdd={preview ? undefined : adicionar}
            adicionadoId={adicionadoId}
            preview={preview}
          />
        ) : null}
      </main>

      {!preview && (
        <OrderSheet
          vitrine={vitrine}
          itens={itens}
          aberto={sheetAberto}
          onOpenChange={setSheetAberto}
          onAlterarQuantidade={alterarQuantidade}
          onLimpar={limpar}
        />
      )}
    </div>
  )
}
```

(O trecho de header/abas acima é idêntico ao atual de `storefront.tsx:89-145` — apenas estado e estilo mudam.)

- [ ] **Step 6: Verificar**

Run: `npm run typecheck && npm run lint && npm test`
Expected: tudo PASS, sem novos warnings.

- [ ] **Step 7: Commit**

```bash
git add src/components/features/vitrine/
git commit -m "feat(vitrine): tema SSR-safe, coleção com ProductCard e feedback de adição"
```

---

### Task 3: Página de produto + header extraído + cards linkados

**Files:**
- Create: `src/lib/vitrine-produto.ts` (funções puras de decisão de rota — exigidas pelo §9 da spec)
- Create: `src/app/[slug]/produto/[id]/page.tsx`
- Create: `src/components/features/vitrine/produto-detalhe.tsx`
- Create: `src/components/features/vitrine/vitrine-header.tsx`
- Modify: `src/components/features/vitrine/experience-renderer.tsx` (prop `href` no card)
- Modify: `src/components/features/vitrine/product-card.tsx` (link esticado no card)
- Modify: `src/components/features/vitrine/storefront.tsx` (usa `VitrineHeader`)
- Modify: `src/components/features/vitrine/order-sheet.tsx` (prop `vitrine` alargada para `VitrineBase`)
- Modify: `src/lib/supabase/middleware.ts:66-73` (heurística da vitrine passa a aceitar `/{slug}/produto/{id}`)
- Test: `tests/unit/lib/vitrine-produto.test.ts`

**Interfaces:**
- Consumes: da Task 1 (`useCarrinho`, `ItemCarrinho`), da Task 2 (`estiloTema`, `ProductCard`), e do código existente (`serializeVitrineBase`, `container.catalogoService.listarPorSlug`, `NotFoundError`).
- Produces:
  - `ehNaoEncontrado(erro: unknown): boolean` — true só para `NotFoundError` do kernel
  - `selecionarProduto<T extends { id: string }>(produtos: readonly T[], id: string): T | null`
  - `VitrineHeader({ vitrine, totalItens, onAbrirPedido? })` com `vitrine: VitrineBase`
  - Rota pública `/{slug}/produto/{id}` (server component) renderizando `ProdutoDetalhe({ vitrine: VitrineBase, produto })`

- [ ] **Step 1: Write the failing test (decisão de rota — spec RF-A7)**

Create `tests/unit/lib/vitrine-produto.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  ehNaoEncontrado,
  selecionarProduto,
} from "@/lib/vitrine-produto";
import { VitrineNaoEncontrada } from "@/modules/catalogo/application/exceptions/vitrine-nao-encontrada";

describe("ehNaoEncontrado", () => {
  it("reconhece VitrineNaoEncontrada como 404", () => {
    expect(ehNaoEncontrado(new VitrineNaoEncontrada("doce-e-tal"))).toBe(true);
  });

  it("não trata outros erros como 404", () => {
    expect(ehNaoEncontrado(new Error("boom"))).toBe(false);
    expect(ehNaoEncontrado(null)).toBe(false);
  });
});

describe("selecionarProduto", () => {
  const produtos = [
    { id: "uuid-1", nome: "Bolo" },
    { id: "uuid-2", nome: "Torta" },
  ];

  it("encontra o produto por id", () => {
    expect(selecionarProduto(produtos, "uuid-2")).toEqual({ id: "uuid-2", nome: "Torta" });
  });

  it("retorna null quando o id não existe", () => {
    expect(selecionarProduto(produtos, "uuid-9")).toBeNull();
  });

  it("retorna null para lista vazia", () => {
    expect(selecionarProduto([], "uuid-1")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/lib/vitrine-produto.test.ts`
Expected: FAIL — módulo `@/lib/vitrine-produto` não existe.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/vitrine-produto.ts`:

```ts
import { NotFoundError } from "@/kernel/errors/domain-error";

/**
 * Classifica erros da vitrine (spec RF-A7): somente "não encontrado" vira 404;
 * qualquer outra falha de infraestrutura deve propagar para o boundary de erro.
 */
export function ehNaoEncontrado(erro: unknown): boolean {
  return erro instanceof NotFoundError;
}

/** Localiza um produto do catálogo serializado pelo id (UUID da URL). */
export function selecionarProduto<T extends { id: string }>(
  produtos: readonly T[],
  id: string
): T | null {
  return produtos.find((produto) => produto.id === id) ?? null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/lib/vitrine-produto.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit parcial**

```bash
git add src/lib/vitrine-produto.ts tests/unit/lib/vitrine-produto.test.ts
git commit -m "feat(vitrine): decisão de rota pura (404 vs erro)"
```

- [ ] **Step 6: Middleware — liberar a rota de produto para visitantes anônimos**

Em `src/lib/supabase/middleware.ts`, substituir a condição `isVitrineSlug` (linhas 66–73) por:

```ts
  // Também são públicas: slug da vitrine (ex.: /minha-loja), sua página de
  // produto (/minha-loja/produto/<id>), /api/health e assets
  const isVitrineSlug =
    !isPublicRoute &&
    !pathname.startsWith('/dashboard') &&
    !pathname.startsWith('/protected') &&
    !pathname.startsWith('/settings') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/api') &&
    (pathname.split('/').length <= 2 ||
      /^\/[^/]+\/produto\/[^/]+$/.test(pathname))
```

Sem isso, `/doce-e-tal/produto/<id>` (4 segmentos) cai no redirect para `/auth/login` de visitantes anônimos — quebrando o caso de uso principal (link compartilhado no WhatsApp).

- [ ] **Step 7: Criar `VitrineHeader`**

Create `src/components/features/vitrine/vitrine-header.tsx`:

```tsx
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
            <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-(--vitrine-primary) text-white">
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
                <Badge className="absolute -top-1.5 -right-1.5 size-4 p-0 text-[10px] tabular-nums">
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
```

- [ ] **Step 8: Criar `ProdutoDetalhe`**

Create `src/components/features/vitrine/produto-detalhe.tsx`:

```tsx
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
              aria-label={`Adicionar ${produto.nome} ao pedido`}
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
```

- [ ] **Step 9: Criar a rota de produto (server component)**

Create `src/app/[slug]/produto/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation"

import { ProdutoDetalhe } from "@/components/features/vitrine/produto-detalhe"
import { container } from "@/lib/loja"
import { ehNaoEncontrado, selecionarProduto } from "@/lib/vitrine-produto"
import { serializeVitrineBase } from "@/lib/vitrine-view"

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params

  const vitrine = await container.catalogoService.listarPorSlug(slug).catch((erro) => {
    if (ehNaoEncontrado(erro)) notFound()
    throw erro
  })

  const base = serializeVitrineBase(vitrine)
  const produto = selecionarProduto(base.produtos, id)
  if (!produto) notFound()

  return <ProdutoDetalhe vitrine={base} produto={produto} />
}
```

- [ ] **Step 10: Alargar a prop `vitrine` do `OrderSheet`**

Em `src/components/features/vitrine/order-sheet.tsx`: trocar `import type { VitrineView } from '@/lib/vitrine-view'` por `import type { VitrineBase } from '@/lib/vitrine-view'` e, na assinatura, `vitrine: VitrineView` → `vitrine: VitrineBase`. (O componente usa só `nome`, `whatsapp` e `whatsappLink` — todos presentes em `VitrineBase`.)

- [ ] **Step 11: Linkar os cards na vitrine (spec RF-A2)**

Em `src/components/features/vitrine/experience-renderer.tsx`, adicionar a prop `href` ao `ProductCard` do caso `productCollection`:

```tsx
                <ProductCard
                  key={product.id}
                  produto={product}
                  onAdicionar={onAdd}
                  adicionado={adicionadoId === product.id}
                  aspecto={aspecto}
                  classeCard={classeEstiloCard(vitrine.tema.estilo)}
                  horizontal={vitrine.tema.layout === Layout.LISTA || emDestaque}
                  destaque={emDestaque}
                  className={emDestaque ? 'col-span-full' : undefined}
                  href={preview ? undefined : `/${vitrine.slug}/produto/${product.id}`}
                />
```

Em `src/components/features/vitrine/product-card.tsx`:

1. Importar `Link` do `next/link`.
2. Adicionar `href?: string` às props (após `onAdicionar`).
3. Adicionar `relative` ao `Card` das duas variantes:

```tsx
      <Card className={cn('relative flex overflow-hidden', classeCard, className)}>
```
```tsx
      <Card className={cn('relative overflow-hidden', classeCard, className)}>
```

4. Extrair o título num helper com link esticado (padrão stretched-link: o link cobre o card inteiro via `after`; a linha de preço/ação já tem `relative z-10` da Task 2 e fica clicável acima do link):

```tsx
function TituloProduto({
  produto,
  href,
  className,
}: {
  produto: Produto
  href?: string
  className?: string
}) {
  return (
    <h3 className={className}>
      {href ? (
        <Link
          href={href}
          className="outline-none after:absolute after:inset-0 after:content-['']"
        >
          {produto.nome}
        </Link>
      ) : (
        produto.nome
      )}
    </h3>
  )
}
```

5. Usar nas duas variantes (o texto do h3 vira o componente):

Variante horizontal:
```tsx
          <TituloProduto
            produto={produto}
            href={href}
            className={cn(
              'font-heading font-semibold tracking-tight',
              destaque ? 'text-lg' : 'text-sm'
            )}
          />
```

Variante vertical:
```tsx
        <TituloProduto
          produto={produto}
          href={href}
          className="font-heading text-sm font-medium"
        />
```

- [ ] **Step 12: Usar `VitrineHeader` no `storefront.tsx`**

Em `src/components/features/vitrine/storefront.tsx`:

1. Remover os imports que só serviam ao header: `ShoppingBag`, `Store`, `Badge`, `Button`.
2. Adicionar `import { VitrineHeader } from './vitrine-header'`.
3. Substituir o `<header>` inteiro (do `<header className="sticky top-0 ..."` até o `</header>` de fechamento) por:

```tsx
      <VitrineHeader
        vitrine={vitrine}
        totalItens={totalItens}
        onAbrirPedido={preview ? undefined : () => setSheetAberto(true)}
      />
```

- [ ] **Step 13: Verificar**

Run: `npm run typecheck && npm run lint && npm test`
Expected: tudo PASS.

- [ ] **Step 14: Commit**

```bash
git add src/app/[slug] src/components/features/vitrine src/lib/vitrine-produto.ts src/lib/supabase/middleware.ts tests/unit/lib/vitrine-produto.test.ts
git commit -m "feat(vitrine): página de produto dedicada com carrinho compartilhado"
```

---

### Task 4: Boundaries de erro (404 ≠ falha — spec RF-A7)

**Files:**
- Modify: `src/app/[slug]/page.tsx` (catch restrito a `NotFoundError`)
- Create: `src/app/[slug]/error.tsx`
- Create: `src/app/error.tsx`

**Interfaces:**
- Consumes: da Task 3 — `ehNaoEncontrado` (`@/lib/vitrine-produto`), `ErrorState` (`@/components/patterns/error-state`).
- Produces: boundary de erro para a sub-árvore `[slug]` (vitrine + produto) e boundary global do app.

- [ ] **Step 1: Corrigir o catch da vitrine**

Substituir `src/app/[slug]/page.tsx` por:

```tsx
import { notFound } from "next/navigation"

import { Storefront } from "@/components/features/vitrine/storefront"
import { container } from "@/lib/loja"
import { ehNaoEncontrado } from "@/lib/vitrine-produto"
import { serializeVitrine } from "@/lib/vitrine-view"

export default async function VitrinePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const vitrine = await container.catalogoService.listarPorSlug(slug).catch((erro) => {
    if (ehNaoEncontrado(erro)) notFound()
    throw erro
  })

  return <Storefront vitrine={serializeVitrine(vitrine)} />
}
```

(O `.catch(() => null)` + `if (!vitrine)` atuais somem: o handler Decide 404 ou repassa o erro.)

- [ ] **Step 2: Boundary da sub-árvore `[slug]`**

Create `src/app/[slug]/error.tsx`:

```tsx
'use client'

import { ErrorState } from '@/components/patterns/error-state'

export default function VitrineErro({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <ErrorState
        title="Não foi possível carregar esta vitrine"
        description="Ocorreu um problema inesperado. Tente novamente em instantes."
        onRetry={reset}
      />
    </div>
  )
}
```

- [ ] **Step 3: Boundary global**

Create `src/app/error.tsx`:

```tsx
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
```

- [ ] **Step 4: Verificar**

Run: `npm run typecheck && npm run lint && npm test`
Expected: tudo PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/[slug]/page.tsx src/app/[slug]/error.tsx src/app/error.tsx
git commit -m "feat(vitrine): boundaries de erro (404 distinto de falha)"
```

---

### Task 5: Verificação final e critério de qualidade

**Files:** nenhum (apenas verificação).

- [ ] **Step 1: Suíte completa**

Run: `npm run typecheck && npm run lint && npm test`
Expected: zero erros, zero testes falhando.

- [ ] **Step 2: QA manual (PRINCIPLES §9 — requer `npm run dev` + `npm run db:seed`)**

Checklist contra a spec:
1. Primeiro paint da vitrine já sai com as cores/fonte da loja (sem flash) — RF-A3.
2. Trocar layout/formato/estilo no builder reflete na vitrine publicada — RF-A4.
3. Card de produto navega para `/{slug}/produto/{id}`; botão "Adicionar" não navega — RF-A1/A2.
4. Página do produto: foto grande, descrição, preço, "Adicionar ao pedido", voltar — RF-A1.
5. Adicionar item: botão "Adicionado ✓" por ~1,5s; badge cresce; refresh mantém carrinho — RF-A5/A6.
6. Carrinho de uma loja não vaza para outra (chave por slug).
7. Slug inexistente → 404; produto inexistente em loja existente → 404 — RF-A7.
8. Visitante anônimo consegue abrir `/{slug}/produto/{id}` (middleware) — RF-A1.
9. Navegação por teclado nas duas rotas; leitor de tela anuncia contagem do pedido.
10. Preview do builder: sem botão de pedido, cards não navegam, não toca localStorage.

- [ ] **Step 3: Commit (se o QA gerar ajustes)**

```bash
git add -A
git commit -m "fix(vitrine): ajustes do QA manual"
```
