import { notFound } from "next/navigation"

import { Storefront } from "@/components/features/vitrine/storefront"
import { container } from "@/lib/loja"
import { serializeVitrine } from "@/lib/vitrine-view"

export default async function VitrinePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const vitrine = await container.catalogoService
    .listarPorSlug(slug)
    .catch(() => null)

  if (!vitrine) notFound()

  return <Storefront vitrine={serializeVitrine(vitrine)} />
}
