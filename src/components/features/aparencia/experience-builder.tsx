'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Layers3, Lock, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { blockCatalog, blockTypeLabel, createBlock, duplicateBlock, initialBlocks, moveBlock, planCapabilities, type BlockType, type ExperienceBlock, type StorePlan } from '@/lib/experience'

const icons: Record<BlockType, string> = {
  hero: 'H', richText: 'T', imageText: 'I', productCollection: 'P', categoryCollection: 'C', about: 'A', banner: 'B', cta: '→', testimonials: 'D', faq: '?', gallery: 'G', spacer: '↕', divider: '—',
}

export function ExperienceBuilder({ plan = 'LIVRE' }: { plan?: StorePlan }) {
  const [blocks, setBlocks] = useState<ExperienceBlock[]>(initialBlocks)
  const [selectedId, setSelectedId] = useState(initialBlocks[0].id)
  const [published, setPublished] = useState(false)
  const capabilities = planCapabilities[plan]
  const selected = blocks.find((block) => block.id === selectedId)
  const grouped = useMemo(() => ({ essential: blockCatalog.filter((block) => block.plan === 'ESSENCIAL'), advanced: blockCatalog.filter((block) => block.plan === 'LIVRE') }), [])

  function add(type: BlockType) {
    if (blocks.length >= capabilities.maxBlocks) return
    const block = createBlock(type)
    setBlocks((current) => [...current, block])
    setSelectedId(block.id)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2"><Badge variant="outline">Página inicial</Badge><Badge variant={published ? 'secondary' : 'outline'}>{published ? 'Publicado' : 'Rascunho'}</Badge></div>
              <CardTitle className="text-xl">Home de catálogo</CardTitle>
              <CardDescription>Organize a experiência da sua loja em blocos.</CardDescription>
            </div>
            <div className="flex gap-2"><Button variant="outline" size="sm"><Eye data-icon="inline-start" />Preview</Button><Button size="sm" onClick={() => setPublished(true)}>Publicar</Button></div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 p-4 sm:p-6">
          <div className="flex items-center justify-between rounded-lg border bg-background p-3 text-sm"><span className="flex items-center gap-2 font-medium"><Layers3 className="size-4 text-primary" />Estrutura da página</span><span className="text-muted-foreground">{blocks.length}/{capabilities.maxBlocks} blocos</span></div>
          {blocks.map((block, index) => (
            <button key={block.id} type="button" onClick={() => setSelectedId(block.id)} className={cn('flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/60', selectedId === block.id && 'border-primary bg-primary/5 ring-1 ring-primary')}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted font-heading text-sm font-semibold">{icons[block.type]}</span>
              <span className="min-w-0 flex-1"><span className="block font-medium">{block.label}</span><span className="block truncate text-xs text-muted-foreground">{blockTypeLabel(block.type)} · {block.visible ? 'Visível' : 'Oculto'}</span></span>
              <span className="flex shrink-0 items-center gap-1" onClick={(event) => event.stopPropagation()}>
                <Button variant="ghost" size="icon-sm" aria-label="Mover bloco para cima" disabled={index === 0} onClick={() => setBlocks((current) => moveBlock(current, block.id, -1))}><ArrowUp /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Mover bloco para baixo" disabled={index === blocks.length - 1} onClick={() => setBlocks((current) => moveBlock(current, block.id, 1))}><ArrowDown /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Duplicar bloco" onClick={() => setBlocks((current) => duplicateBlock(current, block.id))}><Copy /></Button>
                <Button variant="ghost" size="icon-sm" aria-label={block.visible ? 'Ocultar bloco' : 'Mostrar bloco'} onClick={() => setBlocks((current) => current.map((item) => item.id === block.id ? { ...item, visible: !item.visible } : item))}>{block.visible ? <EyeOff /> : <Eye />}</Button>
                <Button variant="ghost" size="icon-sm" aria-label="Excluir bloco" onClick={() => setBlocks((current) => current.filter((item) => item.id !== block.id))}><Trash2 /></Button>
              </span>
            </button>
          ))}
        </CardContent>
      </Card>
      <div className="flex flex-col gap-6">
        <Card><CardHeader><CardTitle className="text-base">Adicionar bloco</CardTitle><CardDescription>Comece por um bloco essencial ou expanda sua narrativa.</CardDescription></CardHeader><CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Essenciais</p>{grouped.essential.map((item) => <Button key={item.type} variant="outline" className="justify-start" onClick={() => add(item.type)}><Plus data-icon="inline-start" />{item.label}</Button>)}</div>
          <Separator />
          <div className="flex flex-col gap-2"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avançados</p>{!capabilities.advanced && <Lock className="size-3.5 text-muted-foreground" />}</div>{grouped.advanced.map((item) => <Button key={item.type} variant="outline" className="justify-start" disabled={!capabilities.advanced} onClick={() => add(item.type)}>{capabilities.advanced ? <Plus data-icon="inline-start" /> : <Lock data-icon="inline-start" />}{item.label}</Button>)}</div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Propriedades</CardTitle><CardDescription>{selected ? `Editando ${selected.label}` : 'Selecione um bloco para editar.'}</CardDescription></CardHeader><CardContent className="flex flex-col gap-3"><label className="flex flex-col gap-2 text-sm font-medium">Nome do bloco<input className="h-9 rounded-md border bg-background px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" value={selected?.label ?? ''} onChange={(event) => setBlocks((current) => current.map((item) => item.id === selectedId ? { ...item, label: event.target.value } : item))} /></label><p className="text-xs leading-5 text-muted-foreground">Cada bloco terá seu próprio formulário de conteúdo na próxima etapa. A estrutura já está pronta para páginas Sobre nós, campanhas e coleções híbridas.</p></CardContent></Card>
      </div>
    </div>
  )
}
