import {
  Paleta,
  type Paleta as PaletaId,
} from "@/modules/loja/domain/vos/identidade-visual";

export type PaletaCatalogo = {
  id: PaletaId;
  nome: string;
  descricao: string;
  corPrimaria: string;
  corSecundaria: string;
  corFundo: string;
};

/**
 * Combos de cor predefinidos. O lojista escolhe um combo em vez de escolher
 * cores livremente; cada paleta foi balanceada para contraste AA.
 */
export const PALETAS: readonly PaletaCatalogo[] = [
  {
    id: Paleta.OCEANO,
    nome: "Oceano",
    descricao: "Azul confiável com acentos âmbar.",
    corPrimaria: "#2563EB",
    corSecundaria: "#F59E0B",
    corFundo: "#FFFFFF",
  },
  {
    id: Paleta.ESMERALDA,
    nome: "Esmeralda",
    descricao: "Verde fresco e acolhedor.",
    corPrimaria: "#059669",
    corSecundaria: "#84CC16",
    corFundo: "#F6FBF8",
  },
  {
    id: Paleta.BLUSH,
    nome: "Blush",
    descricao: "Rosa delicado com toque violeta.",
    corPrimaria: "#DB2777",
    corSecundaria: "#7C3AED",
    corFundo: "#FFF9FB",
  },
  {
    id: Paleta.TERRA,
    nome: "Terra",
    descricao: "Terracota quente e natural.",
    corPrimaria: "#B45309",
    corSecundaria: "#4D7C0F",
    corFundo: "#FFF9F0",
  },
  {
    id: Paleta.LILAS,
    nome: "Lilás",
    descricao: "Violeta criativo com rosa.",
    corPrimaria: "#7C3AED",
    corSecundaria: "#DB2777",
    corFundo: "#FAF8FF",
  },
  {
    id: Paleta.CARVAO,
    nome: "Carvão",
    descricao: "Preto elegante com dourado.",
    corPrimaria: "#1F2937",
    corSecundaria: "#D97706",
    corFundo: "#FFFFFF",
  },
] as const;

export const PALETA_PADRAO_ID: PaletaId = Paleta.OCEANO;

export function obterPaleta(id: string | null | undefined): PaletaCatalogo {
  return (
    PALETAS.find((p) => p.id === id) ??
    PALETAS.find((p) => p.id === PALETA_PADRAO_ID)!
  );
}
