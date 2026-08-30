"use server"

import { revalidatePath } from "next/cache"

import type { ExperienceBlock } from "@/lib/experience"
import { initialBlocks } from "@/lib/experience"
import { container, requireMinhaLoja } from "@/lib/loja"
import { SalvarExperiencia } from "@/modules/loja/application/commands/salvar-experiencia"

export type CarregarExperienciaResultado =
  | { ok: true; blocos: ExperienceBlock[] }
  | { ok: false; error: string }

export type SalvarExperienciaResultado =
  | { ok: true }
  | { ok: false; error: string }

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message
  return "Ocorreu um erro inesperado."
}

/** Carrega a experiência publicada da vitrine (ou o template inicial). */
export async function carregarExperienciaAction(): Promise<CarregarExperienciaResultado> {
  try {
    const loja = await requireMinhaLoja()
    const blocos = loja.getExperiencia().getBlocos()
    return {
      ok: true,
      blocos: (
        blocos.length > 0 ? blocos : initialBlocks
      ) as ExperienceBlock[],
    }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

/** Publica a página da vitrine construída no construtor. */
export async function salvarExperienciaAction(
  blocos: unknown
): Promise<SalvarExperienciaResultado> {
  const loja = await requireMinhaLoja()
  try {
    await container.lojaService.handle(
      SalvarExperiencia.from({
        lojaId: loja.getId().toUUID(),
        blocos,
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