"use server"

import { requireMinhaLoja } from "@/lib/loja"

export type TemaView = {
  paleta: string
  estilo: string
  formatoCard: string
  layout: string
  fonte: "SANS" | "MANROPE" | "SERIF" | "DISPLAY" | "MONO"
  logoUrl: string | null
}

export type CarregarTemaResultado =
  | { ok: true; tema: TemaView }
  | { ok: false; error: string }

export async function carregarTemaAction(): Promise<CarregarTemaResultado> {
  try {
    const loja = await requireMinhaLoja()
    const tema = loja.getTema()
    return {
      ok: true,
      tema: {
        paleta: tema.getPaleta(),
        estilo: tema.getEstilo(),
        formatoCard: tema.getFormatoCard(),
        layout: tema.getLayout(),
        fonte: tema.getFonte(),
        logoUrl: tema.getLogoUrl()?.getValue() ?? null,
      },
    }
  } catch (erro) {
    return {
      ok: false,
      error: erro instanceof Error ? erro.message : "Erro ao carregar o tema.",
    }
  }
}