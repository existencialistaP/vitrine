import type { ValueObject } from "@/kernel/ddd/value-object";
import { Fonte, type Fonte as FonteTipo, parseFonte } from "./fonte";
import { CorHex } from "./cor-hex";
import { Url } from "./url";

/**
 * Identidade visual da vitrine (módulo de customização assistida, RF-004).
 *
 * Objeto de valor imutável: qualquer alteração gera uma nova instância (padrão
 * {@code with*} do {@code PeriodoViagem}). Cores são {@link CorHex} e a
 * logotipia opcional é uma {@link Url}.
 */
export class IdentidadeVisual implements ValueObject {
  private constructor(
    private readonly corPrimaria: CorHex,
    private readonly corSecundaria: CorHex,
    private readonly corFundo: CorHex,
    private readonly fonte: FonteTipo,
    private readonly logoUrl: Url | null
  ) {}

  /** Identidade visual padrão, usada na criação de novas vitrines. */
  static padrao(): IdentidadeVisual {
    return new IdentidadeVisual(
      CorHex.of("#1D4ED8"),
      CorHex.of("#F59E0B"),
      CorHex.of("#FFFFFF"),
      Fonte.SANS,
      null
    );
  }

  static of(params: {
    corPrimaria: CorHex;
    corSecundaria: CorHex;
    corFundo: CorHex;
    fonte: FonteTipo | string | null;
    logoUrl: Url | null;
  }): IdentidadeVisual {
    const fonte = typeof params.fonte === "string" ? parseFonte(params.fonte) : (params.fonte ?? Fonte.SANS);
    return new IdentidadeVisual(
      params.corPrimaria,
      params.corSecundaria,
      params.corFundo,
      fonte ?? Fonte.SANS,
      params.logoUrl
    );
  }

  getCorPrimaria(): CorHex {
    return this.corPrimaria;
  }

  getCorSecundaria(): CorHex {
    return this.corSecundaria;
  }

  getCorFundo(): CorHex {
    return this.corFundo;
  }

  getFonte(): FonteTipo {
    return this.fonte;
  }

  getLogoUrl(): Url | null {
    return this.logoUrl;
  }

  withCorPrimaria(cor: CorHex): IdentidadeVisual {
    return new IdentidadeVisual(cor, this.corSecundaria, this.corFundo, this.fonte, this.logoUrl);
  }

  withCorSecundaria(cor: CorHex): IdentidadeVisual {
    return new IdentidadeVisual(this.corPrimaria, cor, this.corFundo, this.fonte, this.logoUrl);
  }

  withCorFundo(cor: CorHex): IdentidadeVisual {
    return new IdentidadeVisual(this.corPrimaria, this.corSecundaria, cor, this.fonte, this.logoUrl);
  }

  withFonte(fonte: FonteTipo): IdentidadeVisual {
    return new IdentidadeVisual(this.corPrimaria, this.corSecundaria, this.corFundo, fonte, this.logoUrl);
  }

  withLogoUrl(logoUrl: Url | null): IdentidadeVisual {
    return new IdentidadeVisual(this.corPrimaria, this.corSecundaria, this.corFundo, this.fonte, logoUrl);
  }

  equals(other: unknown): boolean {
    if (!(other instanceof IdentidadeVisual)) return false;
    const logosIguais =
      this.logoUrl === null
        ? other.logoUrl === null
        : other.logoUrl !== null && other.logoUrl.equals(this.logoUrl);
    return (
      other.corPrimaria.equals(this.corPrimaria) &&
      other.corSecundaria.equals(this.corSecundaria) &&
      other.corFundo.equals(this.corFundo) &&
      other.fonte === this.fonte &&
      logosIguais
    );
  }
}
