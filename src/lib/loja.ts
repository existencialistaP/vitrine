import { cache } from "react"
import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import { Container } from "@/infrastructure/di/container"
import { CadastrarLojista } from "@/modules/lojista/application/commands/cadastrar-lojista"
import type { Lojista } from "@/modules/lojista/domain/lojista"
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
  const existente = await container.lojistaService.buscarPorAuthUserId(user.id)
  if (existente) return existente

  const nome =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.email?.split("@")[0] ?? "Lojista")

  const criado = await container.lojistaService.handle(
    CadastrarLojista.from({
      nome,
      email: user.email ?? "",
      telefone: null,
      authUserId: user.id,
    })
  )

  return container.lojistaService.buscarPorId(criado)
})

/** Vitrine do lojista autenticado (ou null). */
export const getMinhaLoja = cache(async (): Promise<Loja | null> => {
  const user = await getSessionUser()
  if (!user) return null

  const lojista = await getLojista(user)
  if (!lojista) return null

  return container.lojaService.buscarPorLojistaId(lojista.getId().toUUID())
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
