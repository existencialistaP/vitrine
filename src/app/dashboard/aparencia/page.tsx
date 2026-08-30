import { ExperienceBuilder } from '@/components/features/aparencia/experience-builder'
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '@/components/layout/page-header'

export default function AparenciaPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Construtor da vitrine</PageHeaderTitle>
          <PageHeaderDescription>
            Crie páginas completas com blocos de conteúdo, coleções e histórias da sua marca.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <ExperienceBuilder />
    </>
  )
}
