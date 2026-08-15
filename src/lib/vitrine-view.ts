import type { VitrineCatalogo } from "@/modules/catalogo/application/dto/catalogo-dto"

/** Representação serializável da vitrine para componentes client. */
export type VitrineView = {
  nome: string
  slug: string
  descricao: string
  whatsapp: string
  whatsappLink: string
  tema: {
    corPrimaria: string
    corSecundaria: string
    corFundo: string
    fonte: "SANS" | "SERIF" | "MONO"
    logoUrl: string | null
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
  return {
    nome: vitrine.nome.getValue(),
    slug: vitrine.slug.getValue(),
    descricao: vitrine.descricao.getValue(),
    whatsapp: vitrine.whatsapp.getE164(),
    whatsappLink: vitrine.whatsapp.getLink(),
    tema: {
      corPrimaria: vitrine.tema.getCorPrimaria().getValue(),
      corSecundaria: vitrine.tema.getCorSecundaria().getValue(),
      corFundo: vitrine.tema.getCorFundo().getValue(),
      fonte: vitrine.tema.getFonte(),
      logoUrl: vitrine.tema.getLogoUrl()?.getValue() ?? null,
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
