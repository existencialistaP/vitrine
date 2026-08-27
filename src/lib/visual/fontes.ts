import { Fonte, type Fonte as FonteId } from "@/modules/loja/domain/vos/fonte";

export type FonteCatalogo = {
  id: FonteId;
  nome: string;
  descricao: string;
  /** Valor CSS usado na vitrine (através da variável do next/font). */
  css: string;
};

/** Fontes disponíveis para a identidade visual. */
export const FONTES: readonly FonteCatalogo[] = [
  {
    id: Fonte.SANS,
    nome: "Inter",
    descricao: "Sem serifa, moderna e neutra.",
    css: "var(--font-sans)",
  },
  {
    id: Fonte.MANROPE,
    nome: "Manrope",
    descricao: "Sem serifa, geométrica e acolhedora.",
    css: "var(--font-manrope)",
  },
  {
    id: Fonte.SERIF,
    nome: "Lora",
    descricao: "Serifada, elegante e leitura confortável.",
    css: "var(--font-lora)",
  },
  {
    id: Fonte.DISPLAY,
    nome: "Playfair Display",
    descricao: "Serifada de destaque, sofisticada.",
    css: "var(--font-display)",
  },
  {
    id: Fonte.MONO,
    nome: "Monospace",
    descricao: "Monoespaçada, técnica e distinta.",
    css: "var(--font-geist-mono)",
  },
] as const;

export function obterFonte(id: string | null | undefined): FonteCatalogo {
  return FONTES.find((f) => f.id === id) ?? FONTES.find((f) => f.id === Fonte.SANS)!;
}
