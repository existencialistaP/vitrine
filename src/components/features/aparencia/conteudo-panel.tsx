'use client'

import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Layers3,
  Lock,
  Plus,
  Settings2,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
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

const BLOCOS_ESSENCIAIS = blockCatalog.filter((item) => item.plan === 'ESSENCIAL')
const BLOCOS_AVANCADOS = blockCatalog.filter((item) => item.plan === 'LIVRE')

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
  onAdicionarBloco: (tipo: BlockType) => string | null
  base: VitrineBase
  isSaving: boolean
  maxBlocks: number
  advanced: boolean
}) {
  const [adicionando, setAdicionando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const paginaAtiva = paginas.find((p) => p.id === paginaId) ?? paginas[0]
  const blocoEditando = editandoId
    ? (paginaAtiva?.blocos.find((b) => b.id === editandoId) ?? null)
    : null
  const cheio = !paginaAtiva || paginaAtiva.blocos.length >= maxBlocks

  function adicionar(tipo: BlockType) {
    const novoId = onAdicionarBloco(tipo)
    if (!novoId) return
    setAdicionando(false)
    setEditandoId(novoId)
  }

  function configurar(id: string) {
    onSelecionarBloco(id)
    setEditandoId(id)
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-3 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <Layers3 className="size-4 text-primary" aria-hidden="true" />
          Estrutura da página
        </span>
        <span className="flex items-center gap-3">
          <span className="text-muted-foreground">
            {paginaAtiva?.blocos.length ?? 0}/{maxBlocks} blocos
          </span>
          <Button size="sm" disabled={cheio} onClick={() => setAdicionando(true)}>
            <Plus data-icon="inline-start" />
            Adicionar bloco
          </Button>
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
                onConfigurar={() => configurar(bloco.id)}
                onAlternarVisivel={() => onAlternarVisivel(bloco.id)}
                onRemover={() => onRemoverBloco(bloco.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={adicionando} onOpenChange={setAdicionando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar bloco</DialogTitle>
            <DialogDescription>
              Comece por um bloco essencial ou expanda sua narrativa.
            </DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Essenciais
              </p>
              {BLOCOS_ESSENCIAIS.map((item) => (
                <Button
                  key={item.type}
                  variant="outline"
                  className="justify-start"
                  disabled={isSaving}
                  onClick={() => adicionar(item.type)}
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
              {BLOCOS_AVANCADOS.map((item) => (
                <Button
                  key={item.type}
                  variant="outline"
                  className="justify-start"
                  disabled={!advanced || isSaving}
                  onClick={() => adicionar(item.type)}
                >
                  {advanced ? (
                    <Plus data-icon="inline-start" />
                  ) : (
                    <Lock data-icon="inline-start" />
                  )}
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={blocoEditando !== null}
        onOpenChange={(aberto) => !aberto && setEditandoId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Propriedades do bloco</DialogTitle>
            <DialogDescription>
              {blocoEditando
                ? `Editando ${blocoEditando.label}`
                : 'Selecione um bloco para editar.'}
            </DialogDescription>
          </DialogHeader>
          {blocoEditando && (
            <div className="max-h-[50vh] overflow-y-auto pr-1">
              <BlockForm
                key={blocoEditando.id}
                bloco={blocoEditando}
                produtos={base.produtos}
                categorias={base.categorias}
                onChange={(valores) => onAtualizarBloco(blocoEditando.id, valores)}
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setEditandoId(null)}>Concluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  onConfigurar,
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
  onConfigurar: () => void
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
        aria-pressed={selecionado}
        onClick={onSelecionar}
        className="h-auto min-w-0 flex-1 shrink justify-start gap-3 py-1 text-left"
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold"
          aria-hidden="true"
        >
          {bloco.type.slice(0, 1).toUpperCase()}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
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
          aria-label="Configurar bloco"
          onClick={onConfigurar}
        >
          <Settings2 aria-hidden="true" />
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
