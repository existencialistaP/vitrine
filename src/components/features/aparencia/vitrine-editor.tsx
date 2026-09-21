'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Pencil, Plus, Save, Trash2 } from 'lucide-react'

import { salvarExperienciaAction } from '@/app/actions/experiencia'
import { alterarTemaAction } from '@/app/actions/loja'
import type { TemaView } from '@/app/actions/tema'
import { PageHeaderTitle } from '@/components/layout/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/toast'
import {
  createBlock,
  duplicateBlock,
  moveBlock,
  planCapabilities,
  templates,
  type BlockType,
  type PaginaExperiencia,
} from '@/lib/experience'
import { obterPaleta } from '@/lib/visual'
import type { VitrineBase, VitrineView } from '@/lib/vitrine-view'

import { AparenciaPanel } from './aparencia-panel'
import { ConteudoPanel } from './conteudo-panel'
import { limparSujo, marcarSujo, sujeiraInicial, temAlteracoes } from './editor-estado'
import { PreviewPanel } from './preview-panel'
import { useEditorPreferencias } from './use-editor-preferencias'

const CAPACIDADES = planCapabilities.LIVRE

export function VitrineEditor({
  paginasIniciais,
  base,
  temaInicial,
}: {
  paginasIniciais: PaginaExperiencia[]
  base: VitrineBase
  temaInicial: TemaView
}) {
  const { prefs, atualizar } = useEditorPreferencias()
  const [modo, setModo] = useState<'conteudo' | 'aparencia'>('conteudo')
  const [paginas, setPaginas] = useState<PaginaExperiencia[]>(paginasIniciais)
  const [tema, setTema] = useState<TemaView>(temaInicial)
  const [paginaId, setPaginaId] = useState(paginasIniciais[0]?.id ?? '')
  const [selectedId, setSelectedId] = useState<string | null>(
    paginasIniciais[0]?.blocos[0]?.id ?? null
  )
  const [sujeira, setSujeira] = useState(sujeiraInicial)
  const [isSaving, setIsSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  // Revisão do rascunho: distingue edições feitas durante o envio (RF-9).
  const revisao = useRef(0)

  const vitrinePreview: VitrineView = useMemo(() => {
    const paleta = obterPaleta(tema.paleta)
    return {
      ...base,
      tema: {
        ...base.tema,
        paleta: tema.paleta,
        estilo: tema.estilo,
        formatoCard: tema.formatoCard,
        layout: tema.layout,
        fonte: tema.fonte,
        logoUrl: tema.logoUrl,
        corPrimaria: paleta.corPrimaria,
        corSecundaria: paleta.corSecundaria,
        corFundo: paleta.corFundo,
      },
      paginas,
    }
  }, [base, paginas, tema])

  useEffect(() => {
    if (!temAlteracoes(sujeira)) return
    const avisar = (evento: BeforeUnloadEvent) => {
      evento.preventDefault()
      evento.returnValue = ''
    }
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [sujeira])

  // Navegação client-side não dispara `beforeunload`: intercepta cliques em links
  // internos para confirmar o descarte do rascunho (RF-9).
  useEffect(() => {
    if (!temAlteracoes(sujeira)) return
    const aoClicar = (evento: MouseEvent) => {
      if (evento.defaultPrevented) return
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return
      const alvo = evento.target
      if (!(alvo instanceof Element)) return
      const link = alvo.closest('a')
      if (!(link instanceof HTMLAnchorElement)) return
      if (link.target && link.target !== '_self') return
      if (link.hasAttribute('download')) return
      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      const confirmar = window.confirm('Há alterações não salvas. Sair e descartar?')
      if (!confirmar) {
        evento.preventDefault()
        evento.stopPropagation()
        return
      }
      setSujeira(sujeiraInicial())
    }
    document.addEventListener('click', aoClicar, true)
    return () => document.removeEventListener('click', aoClicar, true)
  }, [sujeira])

  function atualizarPagina(atualiza: (pagina: PaginaExperiencia) => PaginaExperiencia) {
    revisao.current += 1
    setPaginas((atuais) => atuais.map((p) => (p.id === paginaId ? atualiza(p) : p)))
    setSujeira((s) => marcarSujo(s, 'conteudo'))
  }

  function onAtualizarBloco(id: string, valores: { label: string } & Record<string, unknown>) {
    const { label, ...props } = valores
    atualizarPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b) => (b.id === id ? { ...b, label, props } : b)),
    }))
  }

  function onMoverBloco(id: string, direcao: -1 | 1) {
    atualizarPagina((p) => ({ ...p, blocos: moveBlock(p.blocos, id, direcao) }))
  }

  function onDuplicarBloco(id: string) {
    atualizarPagina((p) => ({ ...p, blocos: duplicateBlock(p.blocos, id) }))
  }

  function onAlternarVisivel(id: string) {
    atualizarPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)),
    }))
  }

  function onRemoverBloco(id: string) {
    atualizarPagina((p) => ({ ...p, blocos: p.blocos.filter((b) => b.id !== id) }))
  }

  function onAdicionarBloco(tipo: BlockType): string | null {
    const pagina = paginas.find((p) => p.id === paginaId)
    if (!pagina || pagina.blocos.length >= CAPACIDADES.maxBlocks) return null
    const bloco = createBlock(tipo)
    atualizarPagina((p) => ({ ...p, blocos: [...p.blocos, bloco] }))
    setSelectedId(bloco.id)
    return bloco.id
  }

  function adicionarPagina(template: ReturnType<typeof templates>[number]) {
    if (paginas.length >= CAPACIDADES.maxPages) return
    revisao.current += 1
    const origem = template.paginas[0]
    const pagina: PaginaExperiencia = {
      ...origem,
      id: `pagina-${Date.now()}`,
      ordem: paginas.length,
      blocos: origem.blocos.map((b) => ({ ...b, id: `${b.type}-${Date.now()}-${Math.random()}` })),
    }
    setPaginas((atuais) => [...atuais, pagina])
    setSujeira((s) => marcarSujo(s, 'conteudo'))
    setPaginaId(pagina.id)
    setSelectedId(pagina.blocos[0]?.id ?? null)
  }

  function renomearPagina(id: string, rotulo: string) {
    revisao.current += 1
    setPaginas((atuais) => atuais.map((p) => (p.id === id ? { ...p, rotulo } : p)))
    setSujeira((s) => marcarSujo(s, 'conteudo'))
  }

  function removerPagina(id: string) {
    revisao.current += 1
    setPaginas((atuais) => {
      if (atuais.length <= 1) return atuais
      const restantes = atuais.filter((p) => p.id !== id)
      setPaginaId(restantes[0].id)
      setSelectedId(restantes[0].blocos[0]?.id ?? null)
      return restantes
    })
    setSujeira((s) => marcarSujo(s, 'conteudo'))
  }

  async function salvar() {
    setIsSaving(true)
    setErro(null)
    const revisaoEnviada = revisao.current
    const paginasEnviadas = paginas
    const temaEnviado = tema
    try {
      if (sujeira.conteudo) {
        const resultado = await salvarExperienciaAction(paginasEnviadas)
        if (!resultado.ok) {
          setErro(resultado.error)
          return
        }
        setSujeira((s) =>
          revisao.current === revisaoEnviada ? limparSujo(s, 'conteudo') : s
        )
      }
      if (sujeira.aparencia) {
        const resultado = await alterarTemaAction(temaEnviado)
        if (!resultado.ok) {
          setErro(resultado.error)
          return
        }
        setSujeira((s) =>
          revisao.current === revisaoEnviada ? limparSujo(s, 'aparencia') : s
        )
      }
      toast.add({ title: 'Vitrine publicada', type: 'success' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex h-[calc(100dvh-var(--header-height)-3rem)] min-h-0 flex-col gap-4 overflow-hidden">
      <BarraEditor
        paginas={paginas}
        paginaId={paginaId}
        temPendencia={temAlteracoes(sujeira)}
        isSaving={isSaving}
        podeRemoverPagina={paginas.length > 1}
        onTrocarPagina={setPaginaId}
        onAdicionarPagina={adicionarPagina}
        onRenomearPagina={renomearPagina}
        onRemoverPagina={removerPagina}
        onSalvar={salvar}
        acoes={
          <PreviewPanel
            vitrine={vitrinePreview}
            prefs={prefs}
            onAtualizar={atualizar}
            paginaId={paginaId}
            onTrocarPagina={setPaginaId}
          />
        }
      />

      {erro && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível salvar</AlertTitle>
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <Tabs value={modo} onValueChange={(v) => setModo(v as 'conteudo' | 'aparencia')}>
          <div className="border-b p-2">
            <TabsList>
              <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
              <TabsTrigger value="aparencia">Aparência</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        {modo === 'conteudo' ? (
          <ConteudoPanel
            paginas={paginas}
            paginaId={paginaId}
            selectedId={selectedId}
            onSelecionarBloco={setSelectedId}
            onAtualizarBloco={onAtualizarBloco}
            onMoverBloco={onMoverBloco}
            onDuplicarBloco={onDuplicarBloco}
            onAlternarVisivel={onAlternarVisivel}
            onRemoverBloco={onRemoverBloco}
            onAdicionarBloco={onAdicionarBloco}
            base={base}
            isSaving={isSaving}
            maxBlocks={CAPACIDADES.maxBlocks}
            advanced={CAPACIDADES.advanced}
          />
        ) : (
          <AparenciaPanel
            tema={tema}
            onChange={(patch) => {
              revisao.current += 1
              setTema((atual) => ({ ...atual, ...patch }))
              setSujeira((s) => marcarSujo(s, 'aparencia'))
            }}
            modoAvancado={prefs.modoAvancado}
            onModoAvancadoChange={(ativo) => atualizar({ modoAvancado: ativo })}
          />
        )}
      </div>
    </div>
  )
}

function BarraEditor({
  paginas,
  paginaId,
  temPendencia,
  isSaving,
  podeRemoverPagina,
  onTrocarPagina,
  onAdicionarPagina,
  onRenomearPagina,
  onRemoverPagina,
  onSalvar,
  acoes,
}: {
  paginas: PaginaExperiencia[]
  paginaId: string
  temPendencia: boolean
  isSaving: boolean
  podeRemoverPagina: boolean
  onTrocarPagina: (id: string) => void
  onAdicionarPagina: (template: ReturnType<typeof templates>[number]) => void
  onRenomearPagina: (id: string, rotulo: string) => void
  onRemoverPagina: (id: string) => void
  onSalvar: () => void
  acoes: ReactNode
}) {
  const paginaAtiva = paginas.find((p) => p.id === paginaId) ?? paginas[0]
  const [renomeando, setRenomeando] = useState(false)
  const [novoRotulo, setNovoRotulo] = useState(paginaAtiva?.rotulo ?? '')

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <PageHeaderTitle className="shrink-0">Editor da vitrine</PageHeaderTitle>
        <Tabs value={paginaId} onValueChange={onTrocarPagina} className="min-w-0 flex-1">
          <TabsList variant="line" className="h-9 w-full justify-start">
            {paginas.map((pagina) => (
              <TabsTrigger key={pagina.id} value={pagina.id}>
                {pagina.rotulo}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Dialog
          open={renomeando}
          onOpenChange={(aberto) => {
            setRenomeando(aberto)
            if (aberto) setNovoRotulo(paginaAtiva?.rotulo ?? '')
          }}
        >
          <DialogTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Renomear página" disabled={!paginaAtiva}>
                <Pencil aria-hidden="true" />
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renomear página</DialogTitle>
              <DialogDescription>Dê um nome curto que apareça nas abas.</DialogDescription>
            </DialogHeader>
            <Input
              value={novoRotulo}
              onChange={(e) => setNovoRotulo(e.target.value)}
              aria-label="Nome da página"
            />
            <DialogFooter>
              <Button
                onClick={() => {
                  if (novoRotulo.trim()) onRenomearPagina(paginaAtiva.id, novoRotulo.trim())
                  setRenomeando(false)
                }}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remover página"
                disabled={!podeRemoverPagina}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover página?</AlertDialogTitle>
              <AlertDialogDescription>
                A página “{paginaAtiva?.rotulo}” e todos os seus blocos serão removidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => onRemoverPagina(paginaAtiva.id)}>
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog>
          <DialogTrigger
            render={
              <Button variant="outline" size="sm" disabled={paginas.length >= CAPACIDADES.maxPages}>
                <Plus data-icon="inline-start" />
                Página
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar página</DialogTitle>
              <DialogDescription>Comece por um modelo pronto e personalize depois.</DialogDescription>
            </DialogHeader>
            <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
              {templates().map((template) => (
                <div key={template.id} className="flex flex-col gap-1 rounded-lg border p-3">
                  <span className="font-medium">{template.label}</span>
                  <span className="text-sm text-muted-foreground">{template.description}</span>
                  <Button variant="outline" size="sm" className="mt-2 self-start" onClick={() => onAdicionarPagina(template)}>
                    Usar modelo
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {temPendencia && <Badge variant="secondary">Alterações não salvas</Badge>}
        {acoes}
        <Button size="sm" onClick={onSalvar} disabled={isSaving}>
          {isSaving ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
          {isSaving ? 'Salvando...' : 'Publicar'}
        </Button>
      </div>
    </div>
  )
}
