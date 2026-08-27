import type { VitrineCatalogo } from "@/modules/catalogo/application/dto/catalogo-dto"
import { obterPaleta } from "@/lib/visual"

/** Representação serializável da vitrine para componentes client. */
export type VitrineView = {
  nome: string
  slug: string
  descricao: string
  whatsapp: string
  whatsappLink: string
  tema: {
    paleta: string
    estilo: string
    formatoCard: string
    layout: string
    fonte: "SANS" | "MANROPE" | "SERIF" | "DISPLAY" | "MONO"
    logoUrl: string | null
    corPrimaria: string
    corSecundaria: string
    corFundo: string
  }
  categorias: { id: string; nome: string }[]
  produtos: {
    id: string
    nome: string
    descricao: string
    precoCents: number
    precoFormatado: string
    imagemUrl: string | null
    categoriaId: string | null
  }[]
}

export function serializeVitrine(vitrine: VitrineCatalogo): VitrineView {
  const paleta = obterPaleta(vitrine.tema.getPaleta())
  return {
    nome: vitrine.nome.getValue(),
    slug: vitrine.slug.getValue(),
    descricao: vitrine.descricao.getValue(),
    whatsapp: vitrine.whatsapp.getE164(),
    whatsappLink: vitrine.whatsapp.getLink(),
    tema: {
      paleta: vitrine.tema.getPaleta(),
      estilo: vitrine.tema.getEstilo(),
      formatoCard: vitrine.tema.getFormatoCard(),
      layout: vitrine.tema.getLayout(),
      fonte: vitrine.tema.getFonte(),
      logoUrl: vitrine.tema.getLogoUrl()?.getValue() ?? null,
      corPrimaria: paleta.corPrimaria,
      corSecundaria: paleta.corSecundaria,
      corFundo: paleta.corFundo,
    },
    categorias: vitrine.categorias.map((categoria) => ({
      id: categoria.categoriaId.toUUID(),
      nome: categoria.nome.getValue(),
    })),
    produtos: vitrine.produtos.map((produto) => ({
      id: produto.produtoId.toUUID(),
      nome: produto.nome.getValue(),
      descricao: produto.descricao.getValue(),
      precoCents: produto.preco.getCents(),
      precoFormatado: produto.preco.formatarBRL(),
      imagemUrl: produto.imagemUrl?.getValue() ?? null,
      categoriaId: produto.categoriaId?.toUUID() ?? null,
    })),
  }
}
