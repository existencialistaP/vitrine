import {
  FormatoCard,
  Layout,
  type FormatoCard as FormatoCardId,
  type Layout as LayoutId,
} from "@/modules/loja/domain/vos/identidade-visual";

export type FormatoCardCatalogo = {
  id: FormatoCardId;
  nome: string;
  descricao: string;
  /** Relação de aspecto do card, aplicada na vitrine. */
  aspecto: string;
};

export type LayoutCatalogo = {
  id: LayoutId;
  nome: string;
  descricao: string;
};

/** Formato (proporção) do card de produto. */
export const FORMATOS_CARD: readonly FormatoCardCatalogo[] = [
  {
    id: FormatoCard.QUADRADO,
    nome: "Quadrado",
    descricao: "Proporção 1:1, clássica e equilibrada.",
    aspecto: "aspect-square",
  },
  {
    id: FormatoCard.RETRATO,
    nome: "Retrato",
    descricao: "Proporção 3:4, mais alta e elegante.",
    aspecto: "aspect-[3/4]",
  },
  {
    id: FormatoCard.PANORAMICO,
    nome: "Panorâmico",
    descricao: "Proporção 4:3, imagem mais larga.",
    aspecto: "aspect-[4/3]",
  },
] as const;

/** Layout da grade de produtos na vitrine. */
export const LAYOUTS: readonly LayoutCatalogo[] = [
  {
    id: Layout.GRADE_DENSA,
    nome: "Grade densa",
    descricao: "Muitos produtos visíveis por vez.",
  },
  {
    id: Layout.GRADE_LARGA,
    nome: "Grade larga",
    descricao: "Cartões maiores, com destaque para a imagem.",
  },
  {
    id: Layout.LISTA,
    nome: "Lista",
    descricao: "Produtos em uma coluna, com texto ao lado.",
  },
  {
    id: Layout.DESTAQUE,
    nome: "Destaque",
    descricao: "O primeiro produto ocupa largura total.",
  },
] as const;

export const FORMATO_CARD_PADRAO_ID: FormatoCardId = FormatoCard.QUADRADO;
export const LAYOUT_PADRAO_ID: LayoutId = Layout.GRADE_DENSA;

export function obterFormatoCard(
  id: string | null | undefined
): FormatoCardCatalogo {
  return (
    FORMATOS_CARD.find((f) => f.id === id) ??
    FORMATOS_CARD.find((f) => f.id === FORMATO_CARD_PADRAO_ID)!
  );
}

export function obterLayout(id: string | null | undefined): LayoutCatalogo {
  return (
    LAYOUTS.find((l) => l.id === id) ??
    LAYOUTS.find((l) => l.id === LAYOUT_PADRAO_ID)!
  );
}

/** Classes de grade (mobile-first) para cada layout de produto. */
export function classeLayout(id: string): string {
  switch (id as LayoutId) {
    case Layout.GRADE_LARGA:
      return "grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";
    case Layout.LISTA:
      return "grid-cols-1 gap-4";
    case Layout.DESTAQUE:
      return "grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4";
    case Layout.GRADE_DENSA:
    default:
      return "grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4";
  }
}
