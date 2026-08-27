import { Paintbrush, ShoppingCart, Store } from 'lucide-react'

const PASSOS = [
  {
    icone: Store,
    titulo: '1. Cadastre sua loja',
    descricao:
      'Informe o nome, telefone e uma breve descrição. Em menos de 2 minutos sua vitrine está criada.',
  },
  {
    icone: Paintbrush,
    titulo: '2. Personalize o visual',
    descricao:
      'Escolha cores, fonte e logotipo da sua marca. Tudo visualmente, sem precisar escrever uma linha de código.',
  },
  {
    icone: ShoppingCart,
    titulo: '3. Comece a vender',
    descricao:
      'Adicione seus produtos, compartilhe o link da vitrine e receba pedidos formatados direto no WhatsApp.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Como funciona
          </h2>
          <p className="mt-3 text-muted-foreground">
            Três passos simples para ter sua loja online no ar.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {PASSOS.map((passo, indice) => (
            <div
              key={passo.titulo}
              className="relative flex flex-col items-center gap-5 rounded-xl border bg-card p-8 text-center"
            >
              <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <passo.icone className="size-7" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-lg font-semibold tracking-tight">
                {passo.titulo}
              </h3>
              <p className="text-sm text-muted-foreground">{passo.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}