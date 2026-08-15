import { ProdutosManager } from '@/components/features/produtos/produtos-manager'
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '@/components/layout/page-header'
import { requireMinhaLoja } from '@/lib/loja'

export default async function ProdutosPage() {
  const loja = await requireMinhaLoja()

  const produtos = loja.getProdutos().map((produto) => ({
    id: produto.getId().toUUID(),
    nome: produto.getNome().getValue(),
    descricao: produto.getDescricao().getValue(),
    precoCents: produto.getPreco().getCents(),
    precoFormatado: produto.getPreco().formatarBRL(),
    categoriaId: produto.getCategoriaId()?.toUUID() ?? null,
    imagemUrl: produto.getImagemUrl()?.getValue() ?? null,
    disponivel: produto.getDisponibilidade().isDisponivel(),
  }))

  const categorias = loja.getCategorias().map((categoria) => ({
    id: categoria.getId().toUUID(),
    nome: categoria.getNome().getValue(),
  }))

  return (
    <>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Produtos</PageHeaderTitle>
          <PageHeaderDescription>
            Gerencie os itens exibidos na sua vitrine.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <ProdutosManager produtos={produtos} categorias={categorias} />
    </>
  )
}
