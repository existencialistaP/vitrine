import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExperienceBuilder } from '@/components/features/aparencia/experience-builder'
import { TemaForm } from '@/components/features/aparencia/tema-form'
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
      <Tabs defaultValue="construtor">
        <TabsList>
          <TabsTrigger value="construtor">Construtor</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
        </TabsList>
        <TabsContent value="construtor">
          <ExperienceBuilder />
        </TabsContent>
        <TabsContent value="aparencia">
          <TemaForm />
        </TabsContent>
      </Tabs>
    </>
  )
}