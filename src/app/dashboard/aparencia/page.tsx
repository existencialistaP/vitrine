import { TemaForm } from '@/components/features/aparencia/tema-form'
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '@/components/layout/page-header'
import { requireMinhaLoja } from '@/lib/loja'

export default async function AparenciaPage() {
  const loja = await requireMinhaLoja()
  const tema = loja.getTema()

  return (
    <>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Aparência</PageHeaderTitle>
          <PageHeaderDescription>
            Escolha um visual predefinido para a sua vitrine — cores, fonte, layout e formato dos cards.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <TemaForm
        tema={{
          paleta: tema.getPaleta(),
          estilo: tema.getEstilo(),
          formatoCard: tema.getFormatoCard(),
          layout: tema.getLayout(),
          fonte: tema.getFonte(),
          logoUrl: tema.getLogoUrl()?.getValue() ?? null,
        }}
      />
    </>
  )
}