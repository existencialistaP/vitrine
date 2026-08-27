"use server"

import { requireMinhaLoja } from "@/lib/loja"
import { enviarImagem } from "@/lib/supabase/storage"

export type UploadImagemResultado =
  | { ok: true; url: string; caminho: string }
  | { ok: false; error: string }

/**
 * Recebe um arquivo enviado pelo formulário, valida e faz upload para o
 * Supabase Storage, isolado por loja. Retorna a URL pública para persistência.
 */
export async function uploadImagemAction(
  formData: FormData
): Promise<UploadImagemResultado> {
  const loja = await requireMinhaLoja()
  const arquivo = formData.get("arquivo")
  const tipo = formData.get("tipo")

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, error: "Nenhuma imagem foi selecionada." }
  }
  if (tipo !== "produto" && tipo !== "logo") {
    return { ok: false, error: "Tipo de imagem inválido." }
  }

  try {
    const { url, caminho } = await enviarImagem(
      arquivo,
      tipo === "logo" ? "logos" : "produtos",
      loja.getId().toUUID()
    )
    return { ok: true, url, caminho }
  } catch (erro) {
    return { ok: false, error: erro instanceof Error ? erro.message : "Erro ao enviar imagem." }
  }
}
