'use client'

import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Pencil, Plus, Save, Trash2 } from 'lucide-react'

import { salvarExperienciaAction } from '@/app/actions/experiencia'
import { alterarTemaAction } from '@/app/actions/loja'
import type { TemaView } from '@/app/actions/tema'
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
import { resolverLargura } from './preview-dispositivos'
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
  const [previewMobileAberto, setPreviewMobileAberto] = useState(false)
  // Último estado confirmado no servidor: base do descarte de rascunho (RF-10).
  const [ultimoSalvo, setUltimoSalvo] = useState<{
    paginas: PaginaExperiencia[]
    tema: TemaView
  }>({ paginas: paginasIniciais, tema: temaInicial })

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

  function trocarModo(proximo: 'conteudo' | 'aparencia') {
    if (proximo === modo) return
    if (sujeira[modo]) {
      const confirmar = window.confirm(
        'Há alterações não salvas neste modo. Descartar e trocar?'
      )
      if (!confirmar) return
      setSujeira((s) => limparSujo(s, modo))
      restaurarRascunho(modo)
    }
    setModo(proximo)
  }

  // Ao descartar, restaura o estado do domínio a partir do último estado salvo.
  function restaurarRascunho(dominio: 'conteudo' | 'aparencia') {
    if (dominio === 'conteudo') {
      setPaginas(ultimoSalvo.paginas)
      setPaginaId(ultimoSalvo.paginas[0]?.id ?? '')
      setSelectedId(ultimoSalvo.paginas[0]?.blocos[0]?.id ?? null)
    } else {
      setTema(ultimoSalvo.tema)
    }
  }

  function atualizarPagina(atualiza: (pagina: PaginaExperiencia) => PaginaExperiencia) {
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

  function onAdicionarBloco(tipo: BlockType) {
    let novoId = ''
    atualizarPagina((p) => {
      if (p.blocos.length >= CAPACIDADES.maxBlocks) return p
      const bloco = createBlock(tipo)
      novoId = bloco.id
      return { ...p, blocos: [...p.blocos, bloco] }
    })
    if (novoId) setSelectedId(novoId)
  }

  function adicionarPagina(template: ReturnType<typeof templates>[number]) {
    if (paginas.length >= CAPACIDADES.maxPages) return
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
    setPaginas((atuais) => atuais.map((p) => (p.id === id ? { ...p, rotulo } : p)))
    setSujeira((s) => marcarSujo(s, 'conteudo'))
  }

  function removerPagina(id: string) {
    setPaginas((atuais) => {
      if (atuais.length <= 1) return atuais
      const restantes = atuais.filter((p) => p.id !== id)
      setPaginaId(restantes[0].id)
      setSelectedId(restantes[0].blocos[0]?.id ?? null)
      return restantes
    })
    setSujeira((s) => marcarSujo(s, 'conteudo'))
  }

  async function salvarConteudo() {
    setIsSaving(true)
    setErro(null)
    try {
      const resultado = await salvarExperienciaAction(paginas)
      if (!resultado.ok) {
        setErro(resultado.error)
        return
      }
      setUltimoSalvo((atual) => ({ ...atual, paginas }))
      setSujeira((s) => limparSujo(s, 'conteudo'))
      toast.add({ title: 'Vitrine publicada', description: 'Suas páginas foram atualizadas.', type: 'success' })
    } finally {
      setIsSaving(false)
    }
  }

  async function salvarAparencia() {
    setIsSaving(true)
    setErro(null)
    try {
      const resultado = await alterarTemaAction(tema)
      if (!resultado.ok) {
        setErro(resultado.error)
        return
      }
      setUltimoSalvo((atual) => ({ ...atual, tema }))
      setSujeira((s) => limparSujo(s, 'aparencia'))
      toast.add({ title: 'Aparência salva', description: 'Sua vitrine já reflete o novo visual.', type: 'success' })
    } finally {
      setIsSaving(false)
    }
  }

  function redimensionar(evento: ReactPointerEvent<HTMLDivElement>) {
    evento.preventDefault()
    const inicio = evento.clientX
    const larguraInicial = prefs.largura ?? 640
    const aoMover = (movimento: PointerEvent) => {
      atualizar({ largura: resolverLargura(larguraInicial + (inicio - movimento.clientX)) })
    }
    const aoSoltar = () => {
      window.removeEventListener('pointermove', aoMover)
      window.removeEventListener('pointerup', aoSoltar)
    }
    window.addEventListener('pointermove', aoMover)
    window.addEventListener('pointerup', aoSoltar)
  }

  return (
    <div className="flex h-[calc(100dvh-var(--header-height)-3rem)] min-h-0 flex-col gap-4 overflow-hidden">
      <BarraEditor
        paginas={paginas}
        paginaId={paginaId}
        temPendencia={temAlteracoes(sujeira)}
        isSaving={isSaving}
        modo={modo}
        podeRemoverPagina={paginas.length > 1}
        onTrocarPagina={setPaginaId}
        onAdicionarPagina={adicionarPagina}
        onRenomearPagina={renomearPagina}
        onRemoverPagina={removerPagina}
        onSalvar={modo === 'conteudo' ? salvarConteudo : salvarAparencia}
      />

      {erro && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível salvar</AlertTitle>
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
          <Tabs value={modo} onValueChange={(v) => trocarModo(v as 'conteudo' | 'aparencia')}>
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
                setTema((atual) => ({ ...atual, ...patch }))
                setSujeira((s) => marcarSujo(s, 'aparencia'))
              }}
              modoAvancado={prefs.modoAvancado}
              onModoAvancadoChange={(ativo) => atualizar({ modoAvancado: ativo })}
            />
          )}
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Redimensionar prévia"
          onPointerDown={redimensionar}
          className="hidden w-1 shrink-0 cursor-col-resize self-stretch rounded-full bg-border transition-colors hover:bg-primary/40 lg:block"
        />

        <PreviewPanel
          vitrine={vitrinePreview}
          prefs={prefs}
          onAtualizar={atualizar}
          abertoMobile={previewMobileAberto}
          onAbertoMobileChange={setPreviewMobileAberto}
        />
      </div>
    </div>
  )
}

function BarraEditor({
  paginas,
  paginaId,
  temPendencia,
  isSaving,
  modo,
  podeRemoverPagina,
  onTrocarPagina,
  onAdicionarPagina,
  onRenomearPagina,
  onRemoverPagina,
  onSalvar,
}: {
  paginas: PaginaExperiencia[]
  paginaId: string
  temPendencia: boolean
  isSaving: boolean
  modo: 'conteudo' | 'aparencia'
  podeRemoverPagina: boolean
  onTrocarPagina: (id: string) => void
  onAdicionarPagina: (template: ReturnType<typeof templates>[number]) => void
  onRenomearPagina: (id: string, rotulo: string) => void
  onRemoverPagina: (id: string) => void
  onSalvar: () => void
}) {
  const paginaAtiva = paginas.find((p) => p.id === paginaId) ?? paginas[0]
  const [renomeando, setRenomeando] = useState(false)
  const [novoRotulo, setNovoRotulo] = useState(paginaAtiva?.rotulo ?? '')

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-2">
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
        <Button size="sm" onClick={onSalvar} disabled={isSaving}>
          {isSaving ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
          {isSaving ? 'Salvando...' : modo === 'conteudo' ? 'Publicar' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}
