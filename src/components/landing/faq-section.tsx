'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

const FAQ_ITEMS = [
  {
    pergunta: 'Preciso saber programar para usar o Vitrine?',
    resposta:
      'Não. O Vitrine foi feito especialmente para quem não tem conhecimento técnico. A personalização visual é feita inteiramente por cliques, sem precisar escrever código.',
  },
  {
    pergunta: 'Quanto custa para criar minha vitrine?',
    resposta:
      'O plano Grátis permite criar sua vitrine sem custo nenhum. Para quem precisa de mais recursos, como produtos ilimitados, temos o plano Profissional por R$ 29/mês.',
  },
  {
    pergunta: 'Como recebo os pedidos dos clientes?',
    resposta:
      'Os pedidos são enviados formatados diretamente para o seu WhatsApp. Você não precisa instalar nada — só ter um número ativo no WhatsApp.',
  },
  {
    pergunta: 'Posso personalizar as cores e a logo?',
    resposta:
      'Sim! Você pode escolher paletas de cores predefinidas, fontes, formato dos cards e fazer upload da sua logo. Tudo visualmente, sem código.',
  },
  {
    pergunta: 'Preciso de um domínio próprio?',
    resposta:
      'Não. Sua vitrine ganha um endereço automaticamente (ex.: vitrine.app/sua-loja). Se quiser um domínio personalizado futuramente, é possível configurar.',
  },
  {
    pergunta: 'Quanto tempo leva para colocar a loja no ar?',
    resposta:
      'Em menos de 5 minutos. Basta criar sua conta, configurar o visual e adicionar os primeiros produtos.',
  },
]

export function FaqSection() {
  const [aberto, setAberto] = useState<number | null>(null)

  function toggle(indice: number) {
    setAberto(aberto === indice ? null : indice)
  }

  return (
    <section id="faq" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Perguntas frequentes
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tire suas dúvidas sobre o Vitrine.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, indice) => (
            <div
              key={indice}
              className="rounded-xl border bg-card overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(indice)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-expanded={aberto === indice}
              >
                <span className="font-heading text-sm font-semibold tracking-tight">
                  {item.pergunta}
                </span>
                <ChevronDown
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-transform',
                    aberto === indice && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              </button>
              {aberto === indice && (
                <div className="border-t px-6 py-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.resposta}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}