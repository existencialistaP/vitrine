'use client'

import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  Layers3,
  Lock,
  Plus,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  blockCatalog,
  blockTypeLabel,
  type BlocoExperiencia,
  type BlockType,
  type PaginaExperiencia,
} from '@/lib/experience'
import type { VitrineBase } from '@/lib/vitrine-view'
import { cn } from '@/lib/utils'

import { BlockForm } from './block-form'
import { useMediaQuery } from './use-media-query'

export function ConteudoPanel({
  paginas,
  paginaId,
  selectedId,
  onSelecionarBloco,
  onAtualizarBloco,
  onMoverBloco,
  onDuplicarBloco,
  onAlternarVisivel,
  onRemoverBloco,
  onAdicionarBloco,
  base,
  isSaving,
  maxBlocks,
  advanced,
}: {
  paginas: PaginaExperiencia[]
  paginaId: string
  selectedId: string | null
  onSelecionarBloco: (id: string | null) => void
  onAtualizarBloco: (id: string, valores: { label: string } & Record<string, unknown>) => void
  onMoverBloco: (id: string, direcao: -1 | 1) => void
  onDuplicarBloco: (id: string) => void
  onAlternarVisivel: (id: string) => void
  onRemoverBloco: (id: string) => void
  onAdicionarBloco: (tipo: BlockType) => void
  base: VitrineBase
  isSaving: boolean
  maxBlocks: number
  advanced: boolean
}) {
  const paginaAtiva = paginas.find((p) => p.id === paginaId) ?? paginas[0]
  const selected = paginaAtiva?.blocos.find((b) => b.id === selectedId) ?? null
  const ehDesktop = useMediaQuery('(min-width: 64rem)')
  const ehTablet = useMediaQuery('(min-width: 48rem)')

  const formulario = selected ? (
    <BlockForm
      key={selected.id}
      bloco={selected}
      produtos={base.produtos}
      categorias={base.categorias}
      onChange={(valores) => onAtualizarBloco(selected.id, valores)}
    />
  ) : null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <div className="flex items-center justify-between rounded-lg border bg-background p-3 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <Layers3 className="size-4 text-primary" aria-hidden="true" />
            Estrutura da página
          </span>
          <span className="text-muted-foreground">
            {paginaAtiva?.blocos.length ?? 0}/{maxBlocks} blocos
          </span>
        </div>

        {!paginaAtiva || paginaAtiva.blocos.length === 0 ? (
          <Empty>
            <EmptyTitle>Página vazia</EmptyTitle>
            <EmptyDescription>
              Adicione o primeiro bloco para começar a montar esta página.
            </EmptyDescription>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            {paginaAtiva.blocos.map((bloco, indice) => (
              <li key={bloco.id}>
                <ItemBloco
                  bloco={bloco}
                  indice={indice}
                  total={paginaAtiva.blocos.length}
                  selecionado={selectedId === bloco.id}
                  onSelecionar={() => onSelecionarBloco(bloco.id)}
                  onMover={(d) => onMoverBloco(bloco.id, d)}
                  onDuplicar={() => onDuplicarBloco(bloco.id)}
                  onAlternarVisivel={() => onAlternarVisivel(bloco.id)}
                  onRemover={() => onRemoverBloco(bloco.id)}
                />
                {!ehTablet && selectedId === bloco.id && (
                  <div
                    role="region"
                    aria-label="Propriedades do bloco"
                    className="mt-2 rounded-lg border bg-muted/30 p-3"
                  >
                    {formulario}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {ehDesktop && !selected && paginaAtiva && paginaAtiva.blocos.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Selecione um bloco para editar as propriedades.
          </p>
        )}

        <Separator />

        <CatalogoBlocos advanced={advanced} isSaving={isSaving} onAdicionar={onAdicionarBloco} />
      </div>

      {ehDesktop && selected && (
        <div className="hidden min-h-0 w-80 shrink-0 flex-col overflow-y-auto border-l p-4 lg:flex">
          <h3 className="mb-3 font-heading text-sm font-semibold">Propriedades</h3>
          {formulario}
        </div>
      )}

      {ehTablet && !ehDesktop && (
        <Sheet open={!!selected} onOpenChange={(aberto) => !aberto && onSelecionarBloco(null)}>
          <SheetContent side="right" className="w-full overflow-y-auto p-4 sm:max-w-md">
            <Button
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => onSelecionarBloco(null)}
            >
              <ChevronLeft data-icon="inline-start" />
              Voltar para a lista
            </Button>
            <SheetTitle>Propriedades do bloco</SheetTitle>
            {formulario}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

function ItemBloco({
  bloco,
  indice,
  total,
  selecionado,
  onSelecionar,
  onMover,
  onDuplicar,
  onAlternarVisivel,
  onRemover,
}: {
  bloco: BlocoExperiencia
  indice: number
  total: number
  selecionado: boolean
  onSelecionar: () => void
  onMover: (direcao: -1 | 1) => void
  onDuplicar: () => void
  onAlternarVisivel: () => void
  onRemover: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border p-2',
        selecionado ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-background'
      )}
    >
      <Button
        variant="ghost"
        className="min-w-0 flex-1 justify-start gap-3"
        aria-pressed={selecionado}
        onClick={onSelecionar}
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold"
          aria-hidden="true"
        >
          {bloco.type.slice(0, 1).toUpperCase()}
        </span>
        <span className="flex min-w-0 flex-col items-start">
          <span className="truncate font-medium">{bloco.label}</span>
          <span className="truncate text-xs text-muted-foreground">
            {blockTypeLabel(bloco.type)} · {bloco.visible ? 'Visível' : 'Oculto'}
          </span>
        </span>
      </Button>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Mover bloco para cima"
          disabled={indice === 0}
          onClick={() => onMover(-1)}
        >
          <ArrowUp aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Mover bloco para baixo"
          disabled={indice === total - 1}
          onClick={() => onMover(1)}
        >
          <ArrowDown aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Duplicar bloco" onClick={onDuplicar}>
          <Copy aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={bloco.visible ? 'Ocultar bloco' : 'Mostrar bloco'}
          onClick={onAlternarVisivel}
        >
          {bloco.visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Excluir bloco" onClick={onRemover}>
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

function CatalogoBlocos({
  advanced,
  isSaving,
  onAdicionar,
}: {
  advanced: boolean
  isSaving: boolean
  onAdicionar: (tipo: BlockType) => void
}) {
  const essenciais = blockCatalog.filter((item) => item.plan === 'ESSENCIAL')
  const avancados = blockCatalog.filter((item) => item.plan === 'LIVRE')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Essenciais
        </p>
        {essenciais.map((item) => (
          <Button
            key={item.type}
            variant="outline"
            className="justify-start"
            disabled={isSaving}
            onClick={() => onAdicionar(item.type)}
          >
            <Plus data-icon="inline-start" />
            {item.label}
          </Button>
        ))}
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Avançados
          </p>
          {!advanced && <Lock className="size-3.5 text-muted-foreground" aria-hidden="true" />}
        </div>
        {avancados.map((item) => (
          <Button
            key={item.type}
            variant="outline"
            className="justify-start"
            disabled={!advanced || isSaving}
            onClick={() => onAdicionar(item.type)}
          >
            {advanced ? <Plus data-icon="inline-start" /> : <Lock data-icon="inline-start" />}
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
