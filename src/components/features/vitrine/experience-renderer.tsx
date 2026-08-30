'use client'

import type { ReactNode } from 'react'
import { MessageCircle, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { resolveProductSection, type BlocoExperiencia } from '@/lib/experience'
import type { VitrineView } from '@/lib/vitrine-view'

function Envolver({
  bloco,
  preview,
  children,
}: {
  bloco: BlocoExperiencia
  preview?: boolean
  children: ReactNode
}) {
  if (!bloco.visible) {
    if (!preview) return null
    return (
      <div
        className="rounded-xl opacity-40 ring-1 ring-dashed ring-border"
        aria-label={`Bloco oculto: ${bloco.label}`}
      >
        {children}
      </div>
    )
  }
  return <>{children}</>
}

export function ExperienceRenderer({
  blocks,
  vitrine,
  onAdd,
  preview = false,
}: {
  blocks: BlocoExperiencia[]
  vitrine: VitrineView
  onAdd?: (product: VitrineView['produtos'][number]) => void
  preview?: boolean
}) {
  return (
    <div className="flex flex-col gap-12">
      {blocks.map((block) => (
        <Envolver key={block.id} bloco={block} preview={preview}>
          {renderizar(block, vitrine, onAdd)}
        </Envolver>
      ))}
    </div>
  )
}

function renderizar(
  block: BlocoExperiencia,
  vitrine: VitrineView,
  onAdd?: (product: VitrineView['produtos'][number]) => void
) {
  const texto = (chave: string, fallback: string) => String(block.props[chave] ?? fallback)

  switch (block.type) {
    case 'hero':
      return (
        <section className="flex flex-col items-center gap-5 py-12 text-center sm:py-16">
          <div className="flex items-center gap-2 text-sm font-medium text-(--vitrine-primary)">
            <Sparkles aria-hidden="true" />
            Uma experiência feita para você
          </div>
          <h1 className="max-w-2xl font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            {texto('title', vitrine.nome)}
          </h1>
          <p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            {texto('description', vitrine.descricao)}
          </p>
          {block.props.buttonVisible !== false && (
            <a href={vitrine.whatsappLink} target="_blank" rel="noreferrer">
              <Button size="lg">
                <MessageCircle data-icon="inline-start" />
                {texto('action', 'Vamos conversar')}
              </Button>
            </a>
          )}
        </section>
      )

    case 'richText':
    case 'about':
      return (
        <section
          className={`mx-auto max-w-2xl py-4 ${block.props.align === 'center' ? 'text-center' : ''}`}
        >
          <Card>
            <CardHeader>
              <CardTitle>{texto('title', block.label)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {texto('body', texto('description', 'Conte a história da sua marca.'))}
              </p>
            </CardContent>
          </Card>
        </section>
      )

    case 'imageText': {
      const lado = block.props.imageSide === 'left'
      const imagemUrl = typeof block.props.imageUrl === 'string' ? block.props.imageUrl : null
      return (
        <section className="flex flex-col gap-6 py-6 md:grid md:grid-cols-2 md:items-center">
          {lado && imagemUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagemUrl} alt={texto('title', '')} className="aspect-[4/3] w-full rounded-lg object-cover" />
          )}
          <div className={lado ? '' : 'md:order-2'}>
            <h2 className="font-heading text-2xl font-semibold">{texto('title', '')}</h2>
            <p className="mt-2 whitespace-pre-line text-muted-foreground leading-relaxed">
              {texto('body', '')}
            </p>
          </div>
          {!lado && imagemUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagemUrl} alt={texto('title', '')} className="aspect-[4/3] w-full rounded-lg object-cover md:order-1" />
          )}
        </section>
      )
    }

    case 'productCollection': {
      const produtos = resolveProductSection(vitrine.produtos, block.props)
      return (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-semibold">
            {texto('title', 'Produtos em destaque')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {produtos.map((product) => (
              <Card key={product.id}>
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                    {product.imagemUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imagemUrl} alt={product.nome} className="size-full object-cover" />
                    ) : null}
                  </div>
                  <p className="font-medium">{product.nome}</p>
                  <p className="text-sm text-muted-foreground">{product.precoFormatado}</p>
                  {onAdd && (
                    <Button variant="outline" size="sm" onClick={() => onAdd(product)}>
                      Adicionar
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )
    }

    case 'categoryCollection': {
      const limite = typeof block.props.limit === 'number' ? Math.max(1, block.props.limit) : 6
      return (
        <section className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-heading text-2xl font-semibold">
            {texto('title', 'Explore por categoria')}
          </h2>
          <div className="flex flex-wrap justify-center gap-2" aria-label="Categorias">
            {vitrine.categorias.slice(0, limite).map((category) => (
              <Button key={category.id} variant="outline">
                {category.nome}
              </Button>
            ))}
          </div>
        </section>
      )
    }

    case 'banner':
    case 'cta':
      return (
        <section className="rounded-2xl bg-(--vitrine-primary) px-6 py-10 text-center text-primary-foreground">
          <h2 className="font-heading text-2xl font-semibold">
            {texto('title', 'Fale com a nossa marca')}
          </h2>
          <p className="mt-2 opacity-85">{texto('description', 'Estamos prontos para ajudar você.')}</p>
          {block.props.action ? (
            <a href={vitrine.whatsappLink} target="_blank" rel="noreferrer" className="mt-4 inline-block">
              <Button variant="secondary" size="lg">
                <MessageCircle data-icon="inline-start" />
                {texto('action', 'Chamar no WhatsApp')}
              </Button>
            </a>
          ) : null}
        </section>
      )

    case 'testimonials': {
      const items = Array.isArray(block.props.items)
        ? (block.props.items as Array<{ nome?: unknown; texto?: unknown }>)
        : []
      return (
        <section className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-heading text-2xl font-semibold">
            {texto('title', 'O que dizem nossos clientes')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items
              .filter((item) => item.texto)
              .map((item, i) => (
                <Card key={i}>
                  <CardContent className="flex flex-col gap-2 p-4">
                    <p className="text-muted-foreground leading-relaxed">“{String(item.texto)}”</p>
                    <p className="text-sm font-medium">{String(item.nome ?? '')}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>
      )
    }

    case 'faq': {
      const items = Array.isArray(block.props.items)
        ? (block.props.items as Array<{ pergunta?: unknown; resposta?: unknown }>)
        : []
      return (
        <section className="mx-auto max-w-2xl py-4">
          <h2 className="mb-4 text-center font-heading text-2xl font-semibold">
            {texto('title', 'Perguntas frequentes')}
          </h2>
          <div className="flex flex-col gap-3">
            {items
              .filter((item) => item.pergunta)
              .map((item, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <p className="font-medium">{String(item.pergunta)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{String(item.resposta ?? '')}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>
      )
    }

    case 'gallery': {
      const images = Array.isArray(block.props.images)
        ? block.props.images.filter((url): url is string => typeof url === 'string')
        : []
      return (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-semibold">{texto('title', 'Galeria')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" className="aspect-square w-full rounded-lg object-cover" />
            ))}
          </div>
        </section>
      )
    }

    case 'divider':
      return <hr className="border-border" />

    case 'spacer':
      return (
        <div
          className="h-8"
          aria-hidden="true"
          style={typeof block.props.height === 'number' ? { height: block.props.height } : undefined}
        />
      )

    default:
      return null
  }
}