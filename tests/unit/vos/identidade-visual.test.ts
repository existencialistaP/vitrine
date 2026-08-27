import { describe, it, expect } from "vitest";
import {
  IdentidadeVisual,
  Paleta,
  Estilo,
  FormatoCard,
  Layout,
} from "@/modules/loja/domain/vos/identidade-visual";
import { Fonte } from "@/modules/loja/domain/vos/fonte";

describe("IdentidadeVisual", () => {
  it("cria tema padrão", () => {
    const tema = IdentidadeVisual.padrao();
    expect(tema.getPaleta()).toBe(Paleta.OCEANO);
    expect(tema.getEstilo()).toBe(Estilo.CLASSICO);
    expect(tema.getFormatoCard()).toBe(FormatoCard.QUADRADO);
    expect(tema.getLayout()).toBe(Layout.GRADE_DENSA);
    expect(tema.getFonte()).toBe(Fonte.SANS);
    expect(tema.getLogoUrl()).toBeNull();
  });

  it("mantém imutabilidade: with* retorna nova instância", () => {
    const tema = IdentidadeVisual.padrao();
    const alterado = tema.withPaleta(Paleta.BLUSH);

    expect(alterado.getPaleta()).toBe(Paleta.BLUSH);
    expect(tema.getPaleta()).toBe(Paleta.OCEANO);
    expect(alterado.equals(tema)).toBe(false);
  });

  it("compara por valor completo", () => {
    const a = IdentidadeVisual.of({
      paleta: "terrA",
      estilo: "moderno",
      formatoCard: "retrato",
      layout: "lista",
      fonte: Fonte.MONO,
      logoUrl: null,
    });
    const b = IdentidadeVisual.of({
      paleta: Paleta.TERRA,
      estilo: Estilo.MODERNO,
      formatoCard: FormatoCard.RETRATO,
      layout: Layout.LISTA,
      fonte: Fonte.MONO,
      logoUrl: null,
    });
    expect(a.equals(b)).toBe(true);
  });

  it("rejeita combo desconhecido", () => {
    expect(() =>
      IdentidadeVisual.of({ paleta: "MARCIANO" as never })
    ).toThrow();
  });
});
