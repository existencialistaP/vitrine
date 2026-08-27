import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground sm:px-16 sm:py-24">
          {/* Background decoration */}
          <div
            className="absolute inset-0 -z-10"
            aria-hidden="true"
          >
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary-foreground/5 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary-foreground/5 blur-3xl" />
          </div>

          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Sua vitrine esperando para ficar pronta
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-primary-foreground/80">
            Crie sua loja online em minutos. Personalize, adicione produtos e
            comece a receber pedidos. É grátis para começar.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              render={<Link href="/auth/sign-up" />}
            >
              Criar minha vitrine grátis
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              render={<Link href="/doce-e-tal" />}
            >
              Ver exemplo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}