'use client'

import { MessageCircle, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ExperienceBlock } from '@/lib/experience'
import type { VitrineView } from '@/lib/vitrine-view'

export function ExperienceRenderer({ blocks, vitrine, onAdd }: { blocks: ExperienceBlock[]; vitrine: VitrineView; onAdd: (product: VitrineView['produtos'][number]) => void }) {
  return (
    <div className="flex flex-col gap-12">
      {blocks.filter((block) => block.visible).map((block) => {
        if (block.type === 'hero') return <section key={block.id} className="flex flex-col items-center gap-5 py-12 text-center sm:py-16"><div className="flex items-center gap-2 text-sm font-medium text-(--vitrine-primary)"><Sparkles aria-hidden="true" />Uma experiência feita para você</div><h1 className="max-w-2xl font-heading text-4xl font-bold tracking-tight sm:text-5xl">{String(block.props.title ?? vitrine.nome)}</h1><p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">{String(block.props.description ?? vitrine.descricao)}</p><a href={vitrine.whatsappLink} target="_blank" rel="noreferrer"><Button size="lg"><MessageCircle data-icon="inline-start" />Chamar no WhatsApp</Button></a></section>
        if (block.type === 'about' || block.type === 'richText') return <section key={block.id} className="mx-auto max-w-2xl py-4"><Card><CardHeader><CardTitle>{String(block.props.title ?? block.label)}</CardTitle></CardHeader><CardContent><p className="whitespace-pre-line text-muted-foreground leading-relaxed">{String(block.props.body ?? block.props.description ?? 'Conte a história da sua marca.')}</p></CardContent></Card></section>
        if (block.type === 'categoryCollection') return <section key={block.id} className="flex flex-wrap justify-center gap-2" aria-label="Categorias">{vitrine.categorias.map((category) => <Button key={category.id} variant="outline">{category.nome}</Button>)}</section>
        if (block.type === 'productCollection') return <section key={block.id} className="flex flex-col gap-4"><div><h2 className="font-heading text-2xl font-semibold">{String(block.props.title ?? 'Produtos em destaque')}</h2><p className="text-sm text-muted-foreground">Seleção manual e automática organizada para facilitar a descoberta.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{vitrine.produtos.slice(0, Number(block.props.limit ?? 8)).map((product) => <Card key={product.id}><CardContent className="flex flex-col gap-3 p-4"><div className="aspect-square rounded-lg bg-muted" /> <div><p className="font-medium">{product.nome}</p><p className="text-sm text-muted-foreground">{product.precoFormatado}</p></div><Button variant="outline" size="sm" onClick={() => onAdd(product)}>Adicionar</Button></CardContent></Card>)}</div></section>
        if (block.type === 'cta' || block.type === 'banner') return <section key={block.id} className="rounded-2xl bg-(--vitrine-primary) px-6 py-10 text-center text-primary-foreground"><h2 className="font-heading text-2xl font-semibold">{String(block.props.title ?? 'Fale com a nossa marca')}</h2><p className="mt-2 opacity-85">{String(block.props.description ?? 'Estamos prontos para ajudar você.')}</p></section>
        if (block.type === 'divider') return <hr key={block.id} className="border-border" />
        if (block.type === 'spacer') return <div key={block.id} className="h-8" aria-hidden="true" />
        return null
      })}
    </div>
  )
}
