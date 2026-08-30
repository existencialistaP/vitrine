'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Layers3,
  Lock,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

import {
  carregarBasePreviewAction,
  carregarExperienciaAction,
  salvarExperienciaAction,
} from '@/app/actions/experiencia'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyDescription, EmptyTitle } from '@/components/ui/empty'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import {
  blockCatalog,
  blockTypeLabel,
  createBlock,
  duplicateBlock,
  initialPages,
  moveBlock,
  planCapabilities,
  templates,
  type BlockType,
  type PaginaExperiencia,
  type StorePlan,
} from '@/lib/experience'
import type { VitrineBase } from '@/lib/vitrine-view'

import { BlockForm } from './block-form'
import { PreviewVitrine } from './preview-vitrine'

const icons: Record<BlockType, string> = {
  hero: 'H',
  richText: 'T',
  imageText: 'I',
  productCollection: 'P',
  categoryCollection: 'C',
  about: 'A',
  banner: 'B',
  cta: '→',
  testimonials: 'D',
  faq: '?',
  gallery: 'G',
  spacer: '↕',
  divider: '—',
}

const VITRINE_BASE_PADRAO: VitrineBase = {
  nome: 'Minha loja',
  slug: '',
  descricao: '',
  whatsapp: '',
  whatsappLink: '',
  tema: {
    paleta: 'OCEANO',
    estilo: 'CLASSICO',
    formatoCard: 'QUADRADO',
    layout: 'GRADE_DENSA',
    fonte: 'SANS',
    logoUrl: null,
    corPrimaria: '#2563EB',
    corSecundaria: '#F59E0B',
    corFundo: '#FFFFFF',
  },
  categorias: [],
  produtos: [],
}

export function ExperienceBuilder({ plan = 'LIVRE' }: { plan?: StorePlan }) {
  const router = useRouter()
  const capabilities = planCapabilities[plan]

  const [paginas, setPaginas] = useState<PaginaExperiencia[]>(initialPages)
  const [paginaId, setPaginaId] = useState(initialPages[0].id)
  const [selectedId, setSelectedId] = useState<string | null>(
    initialPages[0].blocos[0]?.id ?? null
  )
  const [base, setBase] = useState<VitrineBase | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewAberto, setPreviewAberto] = useState(false)
  const paginaSeq = useRef(0)
  const [renomeandoId, setRenomeandoId] = useState<string | null>(null)
  const [novoRotulo, setNovoRotulo] = useState('')
  const [adicionandoPagina, setAdicionandoPagina] = useState(false)

  const paginaAtiva = paginas.find((p) => p.id === paginaId) ?? paginas[0]
  const selected =
    paginaAtiva?.blocos.find((b) => b.id === selectedId) ?? paginaAtiva?.blocos[0]
  const grouped = useMemo(
    () => ({
      essential: blockCatalog.filter((block) => block.plan === 'ESSENCIAL'),
      advanced: blockCatalog.filter((block) => block.plan === 'LIVRE'),
    }),
    []
  )

  useEffect(() => {
    let ativo = true
    Promise.all([carregarExperienciaAction(), carregarBasePreviewAction()])
      .then(([r1, r2]) => {
        if (!ativo) return
        if (r1.ok) {
          const carregadas = r1.paginas.length > 0 ? r1.paginas : initialPages
          setPaginas(carregadas)
          setPaginaId(carregadas[0].id)
          setSelectedId(carregadas[0].blocos[0]?.id ?? null)
        }
        if (r2.ok) setBase(r2.base)
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })
    return () => {
      ativo = false
    }
  }, [])

  function atualizarPagina(atualiza: (pagina: PaginaExperiencia) => PaginaExperiencia) {
    setPaginas((atuais) => atuais.map((p) => (p.id === paginaId ? atualiza(p) : p)))
  }

  function mudarBloco(id: string, props: Record<string, unknown>) {
    atualizarPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b) => (b.id === id ? { ...b, props } : b)),
    }))
  }

  function mudarLabel(id: string, label: string) {
    atualizarPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b) => (b.id === id ? { ...b, label } : b)),
    }))
  }

  function adicionar(tipo: BlockType) {
    let novoId = ''
    atualizarPagina((p) => {
      if (p.blocos.length >= capabilities.maxBlocks) return p
      const bloco = createBlock(tipo)
      novoId = bloco.id
      return { ...p, blocos: [...p.blocos, bloco] }
    })
    if (novoId) setSelectedId(novoId)
  }

  function adicionarPagina(template: ReturnType<typeof templates>[number]) {
    if (paginas.length >= capabilities.maxPages) return
    const origem = template.paginas[0]
    const pagina: PaginaExperiencia = {
      ...origem,
      id: `pagina-${paginaSeq.current++}`,
      ordem: paginas.length,
    }
    setPaginas((atuais) =>
      atuais.length >= capabilities.maxPages ? atuais : [...atuais, pagina]
    )
    setPaginaId(pagina.id)
    setSelectedId(pagina.blocos[0]?.id ?? null)
    setAdicionandoPagina(false)
  }

  function removerPagina(id: string) {
    setPaginas((atuais) => {
      if (atuais.length <= 1) return atuais
      const rest = atuais.filter((p) => p.id !== id)
      setPaginaId(rest[0].id)
      setSelectedId(rest[0].blocos[0]?.id ?? null)
      return rest
    })
  }

  function confirmarRenomear() {
    if (!renomeandoId) return
    const rotulo = novoRotulo.trim()
    if (rotulo) {
      setPaginas((atuais) =>
        atuais.map((p) => (p.id === renomeandoId ? { ...p, rotulo } : p))
      )
    }
    setRenomeandoId(null)
    setNovoRotulo('')
  }

  async function publicar() {
    setIsSaving(true)
    setError(null)
    try {
      const resultado = await salvarExperienciaAction(paginas)
      if (!resultado.ok) {
        setError(resultado.error)
        return
      }
      toast.add({
        title: 'Vitrine publicada',
        description: 'Suas páginas foram atualizadas.',
        type: 'success',
      })
      router.refresh()
    } finally {
      setIsSaving(false)
    }
  }

  const indiceAtiva = paginas.indexOf(paginaAtiva)
  const paginaRemovivel = indiceAtiva > 0

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">Páginas em camadas</Badge>
                  <Badge variant={isSaving ? 'secondary' : 'outline'}>
                    {isSaving ? 'Salvando...' : 'Rascunho'}
                  </Badge>
                </div>
                <CardTitle className="text-xl">Construtor da vitrine</CardTitle>
                <CardDescription>
                  Organize cada camada da sua loja em blocos personalizáveis.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={publicar} disabled={isLoading || isSaving}>
                  {isSaving ? <Spinner data-icon="inline-start" /> : null}
                  {isSaving ? 'Publicando...' : 'Publicar'}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Tabs value={paginaId} onValueChange={setPaginaId} className="min-w-0 flex-1">
                <TabsList variant="line" className="h-10 w-full justify-start">
                  {paginas.map((pagina) => (
                    <TabsTrigger key={pagina.id} value={pagina.id}>
                      {pagina.rotulo}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="flex shrink-0 gap-1.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Renomear página"
                  onClick={() => {
                    setNovoRotulo(paginaAtiva.rotulo)
                    setRenomeandoId(paginaAtiva.id)
                  }}
                >
                  <Pencil />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button variant="ghost" size="icon-sm" disabled={!paginaRemovivel}>
                        <Trash2 />
                        <span className="sr-only">Remover página</span>
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover página?</AlertDialogTitle>
                      <AlertDialogDescription>
                        A página “{paginaAtiva.rotulo}” e todos os seus blocos serão removidos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => removerPagina(paginaAtiva.id)}
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Dialog
                  open={adicionandoPagina}
                  onOpenChange={setAdicionandoPagina}
                >
                  <DialogTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={paginas.length >= capabilities.maxPages}
                      >
                        <Plus data-icon="inline-start" />Página
                      </Button>
                    }
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar página</DialogTitle>
                      <DialogDescription>
                        Comece por um modelo pronto e personalize depois.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
                      {templates().map((template) => (
                        <div
                          key={template.id}
                          className="flex flex-col gap-1 rounded-lg border p-3"
                        >
                          <span className="font-medium">{template.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {template.description}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 self-start"
                            onClick={() => adicionarPagina(template)}
                          >
                            Usar modelo
                          </Button>
                        </div>
                      ))}
                    </div>
                    <DialogFooter />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          {error && (
            <div className="border-b bg-destructive/5 px-6 py-3">
              <Alert variant="destructive">
                <AlertTitle>Não foi possível publicar</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {isLoading ? (
            <CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Spinner data-icon="inline-start" /> Carregando sua vitrine...
            </CardContent>
          ) : (
            <CardContent className="grid gap-3 p-4 sm:p-6">
              <div className="flex items-center justify-between rounded-lg border bg-background p-3 text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <Layers3 className="size-4 text-primary" />
                  Estrutura da página
                </span>
                <span className="text-muted-foreground">
                  {paginaAtiva.blocos.length}/{capabilities.maxBlocks} blocos ·{' '}
                  {paginas.length}/{capabilities.maxPages} páginas
                </span>
              </div>

              {paginaAtiva.blocos.length === 0 ? (
                <Empty>
                  <EmptyTitle>Página vazia</EmptyTitle>
                  <EmptyDescription>
                    Adicione o primeiro bloco para começar a montar esta camada.
                  </EmptyDescription>
                </Empty>
              ) : (
                paginaAtiva.blocos.map((block, index) => (
                  <div
                    key={block.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(block.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setSelectedId(block.id)
                      }
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selected?.id === block.id &&
                        'border-primary bg-primary/5 ring-1 ring-primary'
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted font-heading text-sm font-semibold">
                      {icons[block.type]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{block.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {blockTypeLabel(block.type)} ·{' '}
                        {block.visible ? 'Visível' : 'Oculto'}
                      </span>
                    </span>
                    <span
                      className="flex shrink-0 items-center gap-1"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Mover bloco para cima"
                        disabled={index === 0}
                        onClick={() =>
                          setPaginas((atuais) =>
                            atuais.map((p) =>
                              p.id === paginaId
                                ? { ...p, blocos: moveBlock(p.blocos, block.id, -1) }
                                : p
                            )
                          )
                        }
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Mover bloco para baixo"
                        disabled={index === paginaAtiva.blocos.length - 1}
                        onClick={() =>
                          setPaginas((atuais) =>
                            atuais.map((p) =>
                              p.id === paginaId
                                ? { ...p, blocos: moveBlock(p.blocos, block.id, 1) }
                                : p
                            )
                          )
                        }
                      >
                        <ArrowDown />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Duplicar bloco"
                        onClick={() =>
                          setPaginas((atuais) =>
                            atuais.map((p) =>
                              p.id === paginaId
                                ? { ...p, blocos: duplicateBlock(p.blocos, block.id) }
                                : p
                            )
                          )
                        }
                      >
                        <Copy />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={block.visible ? 'Ocultar bloco' : 'Mostrar bloco'}
                        onClick={() =>
                          setPaginas((atuais) =>
                            atuais.map((p) =>
                              p.id === paginaId
                                ? {
                                    ...p,
                                    blocos: p.blocos.map((item) =>
                                      item.id === block.id
                                        ? { ...item, visible: !item.visible }
                                        : item
                                    ),
                                  }
                                : p
                            )
                          )
                        }
                      >
                        {block.visible ? <EyeOff /> : <Eye />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Excluir bloco"
                        onClick={() =>
                          setPaginas((atuais) =>
                            atuais.map((p) =>
                              p.id === paginaId
                                ? {
                                    ...p,
                                    blocos: p.blocos.filter((item) => item.id !== block.id),
                                  }
                                : p
                            )
                          )
                        }
                      >
                        <Trash2 />
                      </Button>
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          )}
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Adicionar bloco</CardTitle>
              <CardDescription>
                Comece por um bloco essencial ou expanda sua narrativa.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Essenciais
                </p>
                {grouped.essential.map((item) => (
                  <Button
                    key={item.type}
                    variant="outline"
                    className="justify-start"
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Avançados
                  </p>
                  {!capabilities.advanced && (
                    <Lock className="size-3.5 text-muted-foreground" />
                  )}
                </div>
                {grouped.advanced.map((item) => (
                  <Button
                    key={item.type}
                    variant="outline"
                    className="justify-start"
                    disabled={!capabilities.advanced}
                    onClick={() => adicionar(item.type)}
                  >
                    {capabilities.advanced ? (
                      <Plus data-icon="inline-start" />
                    ) : (
                      <Lock data-icon="inline-start" />
                    )}
                    {item.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Propriedades</CardTitle>
              <CardDescription>
                {selected
                  ? `Editando ${selected.label}`
                  : 'Selecione um bloco para editar.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selected ? (
                <BlockForm
                  key={selected.id}
                  bloco={selected}
                  produtos={base?.produtos ?? []}
                  categorias={base?.categorias ?? []}
                  onChange={(props) => mudarBloco(selected.id, props)}
                  onLabelChange={(label) => mudarLabel(selected.id, label)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Adicione um bloco para começar a personalizar o conteúdo.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PreviewVitrine
        base={base ?? VITRINE_BASE_PADRAO}
        paginas={paginas}
        aberto={previewAberto}
        onAbrirChange={setPreviewAberto}
      />

      <Dialog open={renomeandoId !== null} onOpenChange={(aberto) => !aberto && setRenomeandoId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear página</DialogTitle>
            <DialogDescription>Dê um nome curto que apareça nas abas.</DialogDescription>
          </DialogHeader>
          <Input
            value={novoRotulo}
            onChange={(e) => setNovoRotulo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmarRenomear()
            }}
            aria-label="Nome da página"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenomeandoId(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarRenomear}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}