import Link from 'next/link'
import { Check } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const PLANOS = [
  {
    nome: 'Grátis',
    preco: 'R$ 0',
    periodo: '/mês',
    descricao: 'Perfeito para começar e testar a plataforma.',
    destaque: false,
    recursos: [
      'Vitrine pública com slug personalizado',
      'Até 10 produtos',
      'Personalização visual (cores, fonte, logo)',
      'Pedidos via WhatsApp',
      'QR Code da vitrine',
    ],
    cta: 'Criar grátis',
    href: '/auth/sign-up',
  },
  {
    nome: 'Profissional',
    preco: 'R$ 29',
    periodo: '/mês',
    descricao: 'Para quem quer levar o negócio digital a sério.',
    destaque: true,
    recursos: [
      'Tudo do plano Grátis',
      'Produtos ilimitados',
      'Categorias ilimitadas',
      'Slug personalizado',
      'Remoção da marca Vitrine',
      'Prioridade no suporte',
    ],
    cta: 'Assinar agora',
    href: '/auth/sign-up',
  },
]

export function Pricing() {
  return (
    <section id="precos" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Preços que cabem no seu negócio
          </h2>
          <p className="mt-3 text-muted-foreground">
            Comece de graça e evolua quando precisar. Sem surpresas.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-2">
          {PLANOS.map((plano) => (
            <div
              key={plano.nome}
              className={cn(
                'relative flex flex-col rounded-xl border bg-card p-8',
                plano.destaque &&
                  'border-primary shadow-lg shadow-primary/10'
              )}
            >
              {plano.destaque && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  Mais popular
                </Badge>
              )}

              <div className="mb-5">
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  {plano.nome}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {plano.descricao}
                </p>
              </div>

              <div className="mb-5">
                <span className="font-heading text-3xl font-bold">
                  {plano.preco}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plano.periodo}
                </span>
              </div>

              <ul className="mb-8 flex flex-col gap-3" role="list">
                {plano.recursos.map((recurso) => (
                  <li
                    key={recurso}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{recurso}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Button
                  className="w-full"
                  variant={plano.destaque ? 'default' : 'outline'}
                  render={<Link href={plano.href} />}
                >
                  {plano.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}