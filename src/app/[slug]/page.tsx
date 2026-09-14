import { notFound } from "next/navigation"

import { Storefront } from "@/components/features/vitrine/storefront"
import { container } from "@/lib/loja"
import { ehNaoEncontrado } from "@/lib/vitrine-produto"
import { serializeVitrine } from "@/lib/vitrine-view"

export default async function VitrinePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const vitrine = await container.catalogoService.listarPorSlug(slug).catch((erro) => {
    if (ehNaoEncontrado(erro)) notFound()
    throw erro
  })

  return <Storefront vitrine={serializeVitrine(vitrine)} />
}
