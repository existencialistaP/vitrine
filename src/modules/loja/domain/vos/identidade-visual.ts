import type { ValueObject } from "@/kernel/ddd/value-object";
import { Fonte, type Fonte as FonteTipo, parseFonte } from "./fonte";
import { Url } from "./url";
import { OpcaoVisualInvalida } from "../exceptions/opcao-visual-invalida";

/** Combos de cor predefinidos disponíveis. */
export const Paleta = {
  OCEANO: "OCEANO",
  ESMERALDA: "ESMERALDA",
  BLUSH: "BLUSH",
  TERRA: "TERRA",
  LILAS: "LILAS",
  CARVAO: "CARVAO",
} as const;
export type Paleta = (typeof Paleta)[keyof typeof Paleta];

/** Estilos predefinidos (tom visual). */
export const Estilo = {
  CLASSICO: "CLASSICO",
  MODERNO: "MODERNO",
  MINIMAL: "MINIMAL",
  VIBRANTE: "VIBRANTE",
} as const;
export type Estilo = (typeof Estilo)[keyof typeof Estilo];

/** Formato (proporção) do card de produto. */
export const FormatoCard = {
  QUADRADO: "QUADRADO",
  RETRATO: "RETRATO",
  PANORAMICO: "PANORAMICO",
} as const;
export type FormatoCard = (typeof FormatoCard)[keyof typeof FormatoCard];

/** Layout da grade de produtos. */
export const Layout = {
  GRADE_DENSA: "GRADE_DENSA",
  GRADE_LARGA: "GRADE_LARGA",
  LISTA: "LISTA",
  DESTAQUE: "DESTAQUE",
} as const;
export type Layout = (typeof Layout)[keyof typeof Layout];

function parserDeEnum<
  T extends Readonly<Record<string, string>>,
>(enumeracao: T, nome: string) {
  return (valor: unknown): T[keyof T] | null => {
    if (valor === null || valor === undefined) return null;
    const chave = String(valor).toUpperCase();
    const registrado = (Object.values(enumeracao) as string[]).find(
      (v) => v === chave
    );
    if (!registrado) throw new OpcaoVisualInvalida(nome, valor);
    return registrado as T[keyof T];
  };
}

export const parsePaleta = parserDeEnum(Paleta, "Paleta");
export const parseEstilo = parserDeEnum(Estilo, "Estilo");
export const parseFormatoCard = parserDeEnum(FormatoCard, "Formato do card");
export const parseLayout = parserDeEnum(Layout, "Layout");

export const PALETA_PADRAO: Paleta = Paleta.OCEANO;
export const ESTILO_PADRAO: Estilo = Estilo.CLASSICO;
export const FORMATO_CARD_PADRAO: FormatoCard = FormatoCard.QUADRADO;
export const LAYOUT_PADRAO: Layout = Layout.GRADE_DENSA;

/**
 * Identidade visual da vitrine (customização assistida, RF-004).
 *
 * Objeto de valor imutável: em vez de cores livres, armazena identificadores de
 * combos predefinidos (paleta, estilo, formato do card e layout) cujas cores são
 * resolvidas na camada de apresentação, além da fonte e do logotipo opcional.
 */
export class IdentidadeVisual implements ValueObject {
  private constructor(
    private readonly paleta: Paleta,
    private readonly estilo: Estilo,
    private readonly formatoCard: FormatoCard,
    private readonly layout: Layout,
    private readonly fonte: FonteTipo,
    private readonly logoUrl: Url | null
  ) {}

  /** Identidade visual padrão, usada na criação de novas vitrines. */
  static padrao(): IdentidadeVisual {
    return new IdentidadeVisual(
      PALETA_PADRAO,
      ESTILO_PADRAO,
      FORMATO_CARD_PADRAO,
      LAYOUT_PADRAO,
      Fonte.SANS,
      null
    );
  }

  static of(params: {
    paleta?: Paleta | string | null;
    estilo?: Estilo | string | null;
    formatoCard?: FormatoCard | string | null;
    layout?: Layout | string | null;
    fonte?: FonteTipo | string | null;
    logoUrl?: Url | null;
  }): IdentidadeVisual {
    const paleta =
      typeof params.paleta === "string"
        ? (parsePaleta(params.paleta) ?? PALETA_PADRAO)
        : (params.paleta ?? PALETA_PADRAO);
    const estilo =
      typeof params.estilo === "string"
        ? (parseEstilo(params.estilo) ?? ESTILO_PADRAO)
        : (params.estilo ?? ESTILO_PADRAO);
    const formatoCard =
      typeof params.formatoCard === "string"
        ? (parseFormatoCard(params.formatoCard) ?? FORMATO_CARD_PADRAO)
        : (params.formatoCard ?? FORMATO_CARD_PADRAO);
    const layout =
      typeof params.layout === "string"
        ? (parseLayout(params.layout) ?? LAYOUT_PADRAO)
        : (params.layout ?? LAYOUT_PADRAO);
    const fonte =
      typeof params.fonte === "string"
        ? parseFonte(params.fonte)
        : (params.fonte ?? null);
    return new IdentidadeVisual(
      paleta,
      estilo,
      formatoCard,
      layout,
      fonte ?? Fonte.SANS,
      params.logoUrl ?? null
    );
  }

  getPaleta(): Paleta {
    return this.paleta;
  }

  getEstilo(): Estilo {
    return this.estilo;
  }

  getFormatoCard(): FormatoCard {
    return this.formatoCard;
  }

  getLayout(): Layout {
    return this.layout;
  }

  getFonte(): FonteTipo {
    return this.fonte;
  }

  getLogoUrl(): Url | null {
    return this.logoUrl;
  }

  withPaleta(paleta: Paleta): IdentidadeVisual {
    return new IdentidadeVisual(
      paleta,
      this.estilo,
      this.formatoCard,
      this.layout,
      this.fonte,
      this.logoUrl
    );
  }

  withEstilo(estilo: Estilo): IdentidadeVisual {
    return new IdentidadeVisual(
      this.paleta,
      estilo,
      this.formatoCard,
      this.layout,
      this.fonte,
      this.logoUrl
    );
  }

  withFormatoCard(formatoCard: FormatoCard): IdentidadeVisual {
    return new IdentidadeVisual(
      this.paleta,
      this.estilo,
      formatoCard,
      this.layout,
      this.fonte,
      this.logoUrl
    );
  }

  withLayout(layout: Layout): IdentidadeVisual {
    return new IdentidadeVisual(
      this.paleta,
      this.estilo,
      this.formatoCard,
      layout,
      this.fonte,
      this.logoUrl
    );
  }

  withFonte(fonte: FonteTipo): IdentidadeVisual {
    return new IdentidadeVisual(
      this.paleta,
      this.estilo,
      this.formatoCard,
      this.layout,
      fonte,
      this.logoUrl
    );
  }

  withLogoUrl(logoUrl: Url | null): IdentidadeVisual {
    return new IdentidadeVisual(
      this.paleta,
      this.estilo,
      this.formatoCard,
      this.layout,
      this.fonte,
      logoUrl
    );
  }

  equals(other: unknown): boolean {
    if (!(other instanceof IdentidadeVisual)) return false;
    const logosIguais =
      this.logoUrl === null
        ? other.logoUrl === null
        : other.logoUrl !== null && other.logoUrl.equals(this.logoUrl);
    return (
      other.paleta === this.paleta &&
      other.estilo === this.estilo &&
      other.formatoCard === this.formatoCard &&
      other.layout === this.layout &&
      other.fonte === this.fonte &&
      logosIguais
    );
  }
}
