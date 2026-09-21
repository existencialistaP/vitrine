import { VitrineEditor } from '@/components/features/aparencia/vitrine-editor'
import { initialPages, type PaginaExperiencia } from '@/lib/experience'
import { container, requireMinhaLoja } from '@/lib/loja'
import { serializeVitrineBase } from '@/lib/vitrine-view'

export default async function AparenciaPage() {
  const loja = await requireMinhaLoja()

  const paginas = loja.getExperiencia().getPaginas()
  const tema = loja.getTema()
  const vitrine = await container.catalogoService.listarPorId(loja.getId().toUUID())

  return (
    <VitrineEditor
      paginasIniciais={(paginas.length > 0 ? [...paginas] : initialPages) as PaginaExperiencia[]}
      base={serializeVitrineBase(vitrine)}
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
