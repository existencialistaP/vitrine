import { notFound } from "next/navigation"

import { ProdutoDetalhe } from "@/components/features/vitrine/produto-detalhe"
import { container } from "@/lib/loja"
import { ehNaoEncontrado, selecionarProduto } from "@/lib/vitrine-produto"
import { serializeVitrineBase } from "@/lib/vitrine-view"

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>
}) {
  const { slug, id } = await params

  const vitrine = await container.catalogoService.listarPorSlug(slug).catch((erro) => {
    if (ehNaoEncontrado(erro)) notFound()
    throw erro
  })

  const base = serializeVitrineBase(vitrine)
  const produto = selecionarProduto(base.produtos, id)
  if (!produto) notFound()

  return <ProdutoDetalhe vitrine={base} produto={produto} />
}
