import {
  Estilo,
  type Estilo as EstiloId,
} from "@/modules/loja/domain/vos/identidade-visual";

export type EstiloCatalogo = {
  id: EstiloId;
  nome: string;
  descricao: string;
};

/** Estilos predefinidos que definem o tom visual da vitrine. */
export const ESTILOS: readonly EstiloCatalogo[] = [
  {
    id: Estilo.CLASSICO,
    nome: "Clássico",
    descricao: "Cartões com cantos médios e linhas sutis.",
  },
  {
    id: Estilo.MODERNO,
    nome: "Moderno",
    descricao: "Cantos generosos, sombras suaves e mais respiro.",
  },
  {
    id: Estilo.MINIMAL,
    nome: "Minimal",
    descricao: "Cantos pequenos, sem sombra, visual limpo.",
  },
  {
    id: Estilo.VIBRANTE,
    nome: "Vibrante",
    descricao: "Destaques cheios de cor e categorias em cápsulas.",
  },
] as const;

export const ESTILO_PADRAO_ID: EstiloId = Estilo.CLASSICO;

export function obterEstilo(id: string | null | undefined): EstiloCatalogo {
  return (
    ESTILOS.find((e) => e.id === id) ??
    ESTILOS.find((e) => e.id === ESTILO_PADRAO_ID)!
  );
}

/** Classes aplicadas ao card de produto conforme o estilo. */
export function classeEstiloCard(id: string): string {
  switch (id as EstiloId) {
    case Estilo.MODERNO:
      return "rounded-2xl shadow-sm";
    case Estilo.MINIMAL:
      return "rounded-md";
    case Estilo.VIBRANTE:
      return "rounded-xl ring-1 ring-foreground/10";
    case Estilo.CLASSICO:
    default:
      return "rounded-lg";
  }
}
