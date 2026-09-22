"use server"

import { revalidatePath } from "next/cache"

import { container, requireMinhaLoja } from "@/lib/loja"
import { SalvarExperiencia } from "@/modules/loja/application/commands/salvar-experiencia"

export type SalvarExperienciaResultado =
  | { ok: true }
  | { ok: false; error: string }

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message
  return "Ocorreu um erro inesperado."
}

/** Publica as páginas da vitrine construídas no editor unificado. */
export async function salvarExperienciaAction(
  paginas: unknown
): Promise<SalvarExperienciaResultado> {
  const loja = await requireMinhaLoja()
  try {
    await container.lojaService.handle(
      SalvarExperiencia.from({
        lojaId: loja.getId().toUUID(),
        paginas,
      })
    )
    const slug = loja.getSlug().getValue()
    revalidatePath("/dashboard/aparencia")
    revalidatePath(`/${slug}`)
    return { ok: true }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}
