import { LojaConfigForm } from '@/components/features/configuracoes/loja-config-form'
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '@/components/layout/page-header'
import { requireMinhaLoja } from '@/lib/loja'

export default async function ConfiguracoesPage() {
  const loja = await requireMinhaLoja()

  return (
    <>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Configurações da loja</PageHeaderTitle>
          <PageHeaderDescription>
            Dados cadastrais e status da sua vitrine.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <div className="mx-auto w-full max-w-2xl">
        <LojaConfigForm
          dados={{
            nome: loja.getNome().getValue(),
            whatsapp: loja.getWhatsapp().getE164(),
            descricao: loja.getDescricao().getValue(),
            status: loja.getStatus(),
          }}
        />
      </div>
    </>
  )
}
