import { describe, it, expect } from "vitest";
import { IdentidadeVisual } from "@/modules/loja/domain/vos/identidade-visual";
import { CorHex } from "@/modules/loja/domain/vos/cor-hex";
import { CorHexInvalida } from "@/modules/loja/domain/exceptions/cor-hex-invalida";
import { Fonte } from "@/modules/loja/domain/vos/fonte";

describe("CorHex", () => {
  it("normaliza #RGB para #RRGGBB", () => {
    expect(CorHex.of("#f00").getValue()).toBe("#FF0000");
  });

  it("rejeita formato inválido", () => {
    expect(() => CorHex.of("vermelho")).toThrow(CorHexInvalida);
    expect(() => CorHex.of("#GGGGGG")).toThrow(CorHexInvalida);
  });
});

describe("IdentidadeVisual", () => {
  it("cria tema padrão", () => {
    const tema = IdentidadeVisual.padrao();
    expect(tema.getCorPrimaria().getValue()).toBe("#1D4ED8");
    expect(tema.getFonte()).toBe(Fonte.SANS);
    expect(tema.getLogoUrl()).toBeNull();
  });

  it("mantém imutabilidade: with* retorna nova instância", () => {
    const tema = IdentidadeVisual.padrao();
    const alterado = tema.withCorPrimaria(CorHex.of("#00FF00"));

    expect(alterado.getCorPrimaria().getValue()).toBe("#00FF00");
    expect(tema.getCorPrimaria().getValue()).toBe("#1D4ED8");
    expect(alterado.equals(tema)).toBe(false);
  });

  it("compara por valor completo", () => {
    const a = IdentidadeVisual.of({
      corPrimaria: CorHex.of("#111111"),
      corSecundaria: CorHex.of("#222222"),
      corFundo: CorHex.of("#333333"),
      fonte: Fonte.MONO,
      logoUrl: null,
    });
    const b = IdentidadeVisual.of({
      corPrimaria: CorHex.of("#111111"),
      corSecundaria: CorHex.of("#222222"),
      corFundo: CorHex.of("#333333"),
      fonte: Fonte.MONO,
      logoUrl: null,
    });
    expect(a.equals(b)).toBe(true);
  });
});
