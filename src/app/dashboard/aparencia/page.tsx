import { VitrineEditor } from '@/components/features/aparencia/vitrine-editor'
import { initialPages, type PaginaExperiencia } from '@/lib/experience'
import { container, requireMinhaLoja } from '@/lib/loja'
import { obterPaleta } from '@/lib/visual'
import { serializeVitrineBase, type VitrineBase } from '@/lib/vitrine-view'
import type { Loja } from '@/modules/loja/domain/loja'

/**
 * Base de prévia construída direto do agregado, usada quando o catálogo não
 * pode ser consultado (ex.: vitrine INATIVA, filtrada pelo repositório).
 */
function baseDaFonte(loja: Loja): VitrineBase {
  const tema = loja.getTema()
  const paleta = obterPaleta(tema.getPaleta())
  return {
    nome: loja.getNome().getValue(),
    slug: loja.getSlug().getValue(),
    descricao: loja.getDescricao().getValue(),
    whatsapp: loja.getWhatsapp().getE164(),
    whatsappLink: loja.getWhatsapp().getLink(),
    tema: {
      paleta: tema.getPaleta(),
      estilo: tema.getEstilo(),
      formatoCard: tema.getFormatoCard(),
      layout: tema.getLayout(),
      fonte: tema.getFonte(),
      logoUrl: tema.getLogoUrl()?.getValue() ?? null,
      corPrimaria: paleta.corPrimaria,
      corSecundaria: paleta.corSecundaria,
      corFundo: paleta.corFundo,
    },
    categorias: loja.getCategorias().map((categoria) => ({
      id: categoria.getId().toUUID(),
      nome: categoria.getNome().getValue(),
    })),
    produtos: loja.getProdutos().map((produto) => ({
      id: produto.getId().toUUID(),
      nome: produto.getNome().getValue(),
      descricao: produto.getDescricao().getValue(),
      precoCents: produto.getPreco().getCents(),
      precoFormatado: produto.getPreco().formatarBRL(),
      imagemUrl: produto.getImagemUrl()?.getValue() ?? null,
      categoriaId: produto.getCategoriaId()?.toUUID() ?? null,
    })),
  }
}

export default async function AparenciaPage() {
  const loja = await requireMinhaLoja()

  const paginas = loja.getExperiencia().getPaginas()
  const tema = loja.getTema()

  let base: VitrineBase
  try {
    const vitrine = await container.catalogoService.listarPorId(loja.getId().toUUID())
    base = serializeVitrineBase(vitrine)
  } catch {
    base = baseDaFonte(loja)
  }

  return (
    <VitrineEditor
      paginasIniciais={(paginas.length > 0 ? [...paginas] : initialPages) as PaginaExperiencia[]}
      base={base}
      temaInicial={{
        paleta: tema.getPaleta(),
        estilo: tema.getEstilo(),
        formatoCard: tema.getFormatoCard(),
        layout: tema.getLayout(),
        fonte: tema.getFonte(),
        logoUrl: tema.getLogoUrl()?.getValue() ?? null,
      }}
    />
  )
}
