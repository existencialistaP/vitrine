import {
  Brush,
  MessageCircle,
  Paintbrush,
  Palette,
  QrCode,
  ShoppingBag,
  Store,
  Zap,
} from 'lucide-react'

const FEATURES = [
  {
    icone: Paintbrush,
    titulo: 'Personalização visual',
    descricao:
      'Escolha paletas de cores, fontes e logotipo. Sua marca com a cara do seu negócio, sem código.',
  },
  {
    icone: MessageCircle,
    titulo: 'Pedidos via WhatsApp',
    descricao:
      'O cliente monta o pedido e tudo é enviado formatado direto para o seu WhatsApp.',
  },
  {
    icone: Store,
    titulo: 'Painel do lojista',
    descricao:
      'Gerencie produtos, categorias e preços em uma interface simples e intuitiva.',
  },
  {
    icone: QrCode,
    titulo: 'QR Code da vitrine',
    descricao:
      'Imprima o QR Code e coloque no balcão. Clientes escaneiam e acessam sua loja na hora.',
  },
  {
    icone: Zap,
    titulo: 'Rápido de configurar',
    descricao:
      'Da criação ao primeiro pedido em menos de 5 minutos. Sem burocracia.',
  },
  {
    icone: ShoppingBag,
    titulo: 'Carrinho simplificado',
    descricao:
      'Cliente adiciona itens, ajusta quantidades e finaliza sem precisar criar conta.',
  },
]

export function Features() {
  return (
    <section id="funcionalidades" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo que você precisa para vender online
          </h2>
          <p className="mt-3 text-muted-foreground">
            Funcionalidades pensadas para o pequeno empreendedor.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.titulo}
              className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icone className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-base font-semibold tracking-tight">
                {feature.titulo}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}