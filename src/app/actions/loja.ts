"use server"

import { revalidatePath } from "next/cache"

import {
  container,
  requireLojista,
  requireMinhaLoja,
} from "@/lib/loja"
import { CriarLoja } from "@/modules/loja/application/commands/criar-loja"
import { AdicionarProduto } from "@/modules/loja/application/commands/adicionar-produto"
import { AtualizarProduto } from "@/modules/loja/application/commands/atualizar-produto"
import { RemoverProduto } from "@/modules/loja/application/commands/remover-produto"
import { AlterarDisponibilidade } from "@/modules/loja/application/commands/alterar-disponibilidade"
import { AlterarTema } from "@/modules/loja/application/commands/alterar-tema"
import { AdicionarCategoria } from "@/modules/loja/application/commands/adicionar-categoria"
import { RenomearCategoria } from "@/modules/loja/application/commands/renomear-categoria"
import { ReposicionarCategoria } from "@/modules/loja/application/commands/reposicionar-categoria"
import { RemoverCategoria } from "@/modules/loja/application/commands/remover-categoria"
import { AlterarDadosLoja } from "@/modules/loja/application/commands/alterar-dados-loja"

export type ActionState =
  | { ok: true }
  | { ok: false; error: string }

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message
  return "Ocorreu um erro inesperado."
}

/** Consulta a disponibilidade de um slug (para o onboarding). */
export async function verificarSlugAction(slug: string): Promise<boolean> {
  try {
    return await container.lojaService.slugDisponivel(slug)
  } catch {
    return false
  }
}

/** Cria a vitrine do lojista autenticado (onboarding). */
export async function criarLojaAction(input: {
  nome: string
  descricao?: string
  whatsapp: string
  slug?: string
}): Promise<ActionState> {
  const lojista = await requireLojista()
  try {
    await container.lojaService.handle(
      CriarLoja.from({
        ...input,
        lojistaId: lojista.getId().toUUID(),
      })
    )
    revalidatePath("/dashboard")
    return { ok: true }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

export async function adicionarProdutoAction(input: {
  nome: string
  descricao?: string
  precoCents: number
  categoriaId?: string | null
  imagemUrl?: string | null
  disponivel?: boolean
}): Promise<ActionState> {
  const loja = await requireMinhaLoja()
  try {
    await container.lojaService.handle(
      AdicionarProduto.from({
        ...input,
        lojaId: loja.getId().toUUID(),
      })
    )
    revalidatePath("/dashboard/produtos")
    return { ok: true }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

export async function atualizarProdutoAction(input: {
  produtoId: string
  nome: string
  descricao?: string
  precoCents: number
  categoriaId?: string | null
  imagemUrl?: string | null
}): Promise<ActionState> {
  const loja = await requireMinhaLoja()
  try {
    await container.lojaService.handle(
      AtualizarProduto.from({
        ...input,
        lojaId: loja.getId().toUUID(),
      })
    )
    revalidatePath("/dashboard/produtos")
    return { ok: true }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

export async function removerProdutoAction(
  produtoId: string
): Promise<ActionState> {
  const loja = await requireMinhaLoja()
  try {
    await container.lojaService.handle(
      RemoverProduto.from({
        lojaId: loja.getId().toUUID(),
        produtoId,
      })
    )
    revalidatePath("/dashboard/produtos")
    return { ok: true }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

export async function alterarDisponibilidadeAction(
  produtoId: string,
  disponivel: boolean
): Promise<ActionState> {
  const loja = await requireMinhaLoja()
  try {
    await container.lojaService.handle(
      AlterarDisponibilidade.from({
        lojaId: loja.getId().toUUID(),
        produtoId,
        disponivel,
      })
    )
    revalidatePath("/dashboard/produtos")
    return { ok: true }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

export async function alterarTemaAction(input: {
  corPrimaria: string
  corSecundaria: string
  corFundo: string
  fonte?: "SANS" | "SERIF" | "MONO"
  logoUrl?: string | null
}): Promise<ActionState> {
  const loja = await requireMinhaLoja()
  try {
    await container.lojaService.handle(
      AlterarTema.from({
        ...input,
        lojaId: loja.getId().toUUID(),
      })
    )
    revalidatePath("/dashboard/aparencia")
    return { ok: true }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

export async function adicionarCategoriaAction(input: {
  nome: string
}): Promise<ActionState> {
  const loja = await requireMinhaLoja()
  try {
    await container.lojaService.handle(
      AdicionarCategoria.from({
        ...input,
        lojaId: loja.getId().toUUID(),
      })
    )
    revalidatePath("/dashboard/categorias")
    revalidatePath("/dashboard/produtos")
    return { ok: true }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

export async function renomearCategoriaAction(input: {
  categoriaId: string
  nome: string
}): Promise<ActionState> {
  const loja = await requireMinhaLoja()
  try {
    await container.lojaService.handle(
      RenomearCategoria.from({
        ...input,
        lojaId: loja.getId().toUUID(),
      })
    )
    revalidatePath("/dashboard/categorias")
    revalidatePath("/dashboard/produtos")
    return { ok: true }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

export async function reposicionarCategoriaAction(input: {
  categoriaId: string
  ordem: number
}): Promise<ActionState> {
  const loja = await requireMinhaLoja()
  try {
    await container.lojaService.handle(
      ReposicionarCategoria.from({
        ...input,
        lojaId: loja.getId().toUUID(),
      })
    )
    revalidatePath("/dashboard/categorias")
    return { ok: true }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

export async function alterarDadosLojaAction(input: {
  nome: string
  descricao: string
  whatsapp: string
  status: "ATIVA" | "INATIVA"
}): Promise<ActionState> {
  const loja = await requireMinhaLoja()
  try {
    await container.lojaService.handle(
      AlterarDadosLoja.from({
        ...input,
        lojaId: loja.getId().toUUID(),
      })
    )
    revalidatePath("/dashboard/configuracoes")
    return { ok: true }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

export async function removerCategoriaAction(
  categoriaId: string
): Promise<ActionState> {
  const loja = await requireMinhaLoja()
  try {
    await container.lojaService.handle(
      RemoverCategoria.from({
        lojaId: loja.getId().toUUID(),
        categoriaId,
      })
    )
    revalidatePath("/dashboard/categorias")
    revalidatePath("/dashboard/produtos")
    return { ok: true }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}
