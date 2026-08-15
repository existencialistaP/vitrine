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
            Personalize a identidade visual da sua vitrine.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <TemaForm
        tema={{
          corPrimaria: tema.getCorPrimaria().getValue(),
          corSecundaria: tema.getCorSecundaria().getValue(),
          corFundo: tema.getCorFundo().getValue(),
          fonte: tema.getFonte(),
          logoUrl: tema.getLogoUrl()?.getValue() ?? null,
        }}
      />
    </>
  )
}
