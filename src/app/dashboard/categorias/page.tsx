import { CategoriasManager } from '@/components/features/categorias/categorias-manager'
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '@/components/layout/page-header'
import { requireMinhaLoja } from '@/lib/loja'

export default async function CategoriasPage() {
  const loja = await requireMinhaLoja()

  const categorias = loja.getCategorias().map((categoria) => ({
    id: categoria.getId().toUUID(),
    nome: categoria.getNome().getValue(),
    ordem: categoria.getOrdem().getValue(),
  }))

  return (
    <>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Categorias</PageHeaderTitle>
          <PageHeaderDescription>
            Organize seus produtos em grupos para facilitar a navegação dos clientes.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <div className="max-w-2xl">
        <CategoriasManager categorias={categorias} />
      </div>
    </>
  )
}