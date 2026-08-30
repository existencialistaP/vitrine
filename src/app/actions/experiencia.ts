"use server"

import { revalidatePath } from "next/cache"

import { container, requireMinhaLoja } from "@/lib/loja"
import { initialPages, type PaginaExperiencia } from "@/lib/experience"
import { SalvarExperiencia } from "@/modules/loja/application/commands/salvar-experiencia"
import { serializeVitrineBase } from "@/lib/vitrine-view"

export type CarregarExperienciaResultado =
  | { ok: true; paginas: PaginaExperiencia[] }
  | { ok: false; error: string }

export type SalvarExperienciaResultado =
  | { ok: true }
  | { ok: false; error: string }

export type CarregarBasePreviewResultado =
  | { ok: true; base: ReturnType<typeof serializeVitrineBase> }
  | { ok: false; error: string }

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message
  return "Ocorreu um erro inesperado."
}

/** Carrega as páginas publicadas da vitrine (ou o template inicial). */
export async function carregarExperienciaAction(): Promise<CarregarExperienciaResultado> {
  try {
    const loja = await requireMinhaLoja()
    const paginas = loja.getExperiencia().getPaginas()
    return {
      ok: true,
      paginas: (paginas.length > 0 ? paginas : initialPages) as Pick<PaginaExperiencia, "id" | "rotulo" | "ordem" | "blocos">[],
    }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

/** Publica as páginas da vitrine construídas no construtor. */
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

/** Carrega os dados (tema, produtos, categorias, identidade) para a preview ao vivo. */
export async function carregarBasePreviewAction(): Promise<CarregarBasePreviewResultado> {
  try {
    const loja = await requireMinhaLoja()
    const vitrine = await container.catalogoService.listarPorId(loja.getId().toUUID())
    return { ok: true, base: serializeVitrineBase(vitrine) }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}