import { createClient } from "@/lib/supabase/server"

export const BUCKET_IMAGENS = "vitrine-imagens"

const EXTENSOES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
}

export class ArquivoInvalido extends Error {}

function extensaoPara(tipo: string): string {
  const ext = EXTENSOES[tipo]
  if (!ext) {
    throw new ArquivoInvalido("Formato de imagem não suportado (use JPG, PNG, WEBP, GIF ou AVIF).")
  }
  return ext
}

const MAX_TAMANHO = 5 * 1024 * 1024 // 5 MB

function validarArquivo(arquivo: File): void {
  if (!arquivo.type.startsWith("image/")) {
    throw new ArquivoInvalido("Envie apenas arquivos de imagem.")
  }
  extensaoPara(arquivo.type)
  if (arquivo.size > MAX_TAMANHO) {
    throw new ArquivoInvalido("A imagem deve ter no máximo 5 MB.")
  }
}

/**
 * Envia uma imagem para o Storage e retorna a URL pública. O usuário deve estar
 * autenticado; os caminhos são isolados por loja.
 */
export async function enviarImagem(
  arquivo: File,
  pasta: "produtos" | "logos",
  lojaId: string
): Promise<{ url: string; caminho: string }> {
  validarArquivo(arquivo)
  const supabase = await createClient()

  const ext = extensaoPara(arquivo.type)
  const nome = `${crypto.randomUUID()}.${ext}`
  const caminho = `${pasta}/${lojaId}/${nome}`

  const { error } = await supabase.storage
    .from(BUCKET_IMAGENS)
    .upload(caminho, arquivo, { upsert: false, contentType: arquivo.type })

  if (error) {
    throw new Error(`Não foi possível enviar a imagem: ${error.message}`)
  }

  const { data } = supabase.storage.from(BUCKET_IMAGENS).getPublicUrl(caminho)
  return { url: data.publicUrl, caminho }
}
