import { cache } from "react"
import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import { Lojista } from "@/modules/lojista/domain/lojista"
import { LojistaId } from "@/kernel/ids/lojista-id"
import { NomeLojista } from "@/modules/lojista/domain/vos/nome-lojista"
import { Email } from "@/kernel/vos/email"
import { AuthUserId } from "@/modules/lojista/domain/vos/auth-user-id"
import { Container } from "@/infrastructure/di/container"
import { CadastrarLojista } from "@/modules/lojista/application/commands/cadastrar-lojista"
import { VincularAutenticacao } from "@/modules/lojista/application/commands/vincular-autenticacao"
import type { Loja } from "@/modules/loja/domain/loja"

export const container = new Container()

/** Usuário autenticado no Supabase (ou null). */
export const getSessionUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return data.user
})

/** Exige sessão; redireciona para /auth/login quando ausente. */
export async function requireAuth(): Promise<User> {
  const user = await getSessionUser()
  if (!user) redirect("/auth/login")
  return user
}

/**
 * Resolve o lojista (registro em `usuarios`) vinculado ao usuário autenticado.
 * Cria o registro na primeira visita, reaproveitando os dados do Supabase
 * (`user_metadata.full_name`/`email`).
 */
export const getLojista = cache(async (user: User): Promise<Lojista | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("usuarios")
    .select('id, "authUserId", nome, email, telefone')
    .eq("authUserId", user.id)
    .maybeSingle()

  if (error) {
    console.error("[v0] Falha ao carregar perfil do lojista")
    return null
  }

  if (data) {
    try {
      return Lojista.reconstruir({
        id: LojistaId.fromString(data.id),
        authUserId: AuthUserId.of(data.authUserId),
        nome: NomeLojista.of(data.nome),
        email: Email.of(data.email),
        telefone: null,
        version: null,
      })
    } catch (erro) {
      console.error(
        "[v0] Perfil do lojista com dados inválidos; redirecionando",
        erro instanceof Error ? erro.message : erro
      )
      return null
    }
  }

  // Perfil já existe, mas vinculado a outro authUserId (por exemplo, após uma
  // troca de instância/ambiente): assume o perfil pelo e-mail em vez de
  // duplicar (que lançaria EmailJaCadastrado) e religa a autenticação.
  if (user.email) {
    try {
      const existente = await container.lojistaService.buscarPorEmail(
        Email.of(user.email)
      )
      if (existente) {
        const vinculado = await container.lojistaService
          .buscarPorAuthUserId(user.id)
        if (!vinculado) {
          await container.lojistaService.handleVincularAutenticacao(
            VincularAutenticacao.from({
              lojistaId: existente.getId().toUUID(),
              authUserId: user.id,
            })
          )
        }
        return existente
      }
    } catch {
      // fluxo abaixo tenta a criação normal
    }
  }

  const nome =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.email?.split("@")[0] ?? "Lojista")

  try {
    const criado = await container.lojistaService.handle(
      CadastrarLojista.from({
        nome,
        email: user.email ?? "",
        telefone: null,
        authUserId: user.id,
      })
    )
    return container.lojistaService.buscarPorId(criado)
  } catch {
    console.error("[v0] Falha ao criar perfil do lojista")
    return null
  }
})

/** Vitrine do lojista autenticado (ou null). */
export const getMinhaLoja = cache(async (): Promise<Loja | null> => {
  const user = await getSessionUser()
  if (!user) return null

  const lojista = await getLojista(user)
  if (!lojista) return null

  try {
    return container.lojaService.buscarPorLojistaId(lojista.getId().toUUID())
  } catch (erro) {
    console.error(
      "[v0] Vitrine com dados inválidos; redirecionando",
      erro instanceof Error ? erro.message : erro
    )
    return null
  }
})

/** Exige lojista; redireciona para /auth/login quando não autenticado. */
export async function requireLojista(): Promise<Lojista> {
  const user = await getSessionUser()
  if (!user) redirect("/auth/login")

  const lojista = await getLojista(user)
  if (!lojista) redirect("/auth/login")

  return lojista
}

/** Exige vitrine; redireciona para o onboarding quando o lojista não tem loja. */
export async function requireMinhaLoja(): Promise<Loja> {
  const loja = await getMinhaLoja()
  if (!loja) redirect("/dashboard/onboarding")
  return loja
}
