import Link from 'next/link'
import { ArrowRight, Store } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
          <span className="size-2 rounded-full bg-success" aria-hidden="true" />
          Uma presença digital que trabalha por você
        </div>
        {/* Badge */}
        <Badge variant="secondary" className="gap-1.5 px-4 py-1.5 text-sm font-medium">
          <Store className="size-3.5" aria-hidden="true" />
          Feito para pequenos negócios
        </Badge>

        {/* Headline */}
        <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Sua loja online em{' '}
          <span className="text-primary">minutos</span>, sem
          precisar saber programar
        </h1>

        {/* Subtext */}
        <p className="max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
          Crie uma vitrine digital com a identidade da sua marca, personalize
          cores e logo, e receba pedidos direto no WhatsApp. Tudo isso por um
          preço que cabe no seu negócio.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            className="h-10 px-5 text-base"
            render={<Link href="/auth/sign-up" />}
          >
            Criar minha vitrine grátis
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-10 px-5 text-base"
            render={<Link href="/doce-e-tal" />}
          >
            Ver exemplo
          </Button>
        </div>

        {/* Stats / social proof */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-flex size-2 rounded-full bg-success" />
            Painel do lojista
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex size-2 rounded-full bg-success" />
            Pedidos via WhatsApp
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex size-2 rounded-full bg-success" />
            Personalização visual
          </span>
        </div>
      </div>
    </section>
  )
}
