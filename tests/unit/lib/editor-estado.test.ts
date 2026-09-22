import { describe, expect, it } from "vitest";

import {
  limparSujo,
  marcarSujo,
  sujeiraInicial,
  temAlteracoes,
} from "@/components/features/aparencia/editor-estado";

describe("sujeira do editor", () => {
  it("começa limpa", () => {
    expect(sujeiraInicial()).toEqual({ conteudo: false, aparencia: false });
    expect(temAlteracoes(sujeiraInicial())).toBe(false);
  });

  it("marca apenas o domínio informado", () => {
    const s = marcarSujo(sujeiraInicial(), "conteudo");
    expect(s).toEqual({ conteudo: true, aparencia: false });
    expect(temAlteracoes(s)).toBe(true);
  });

  it("limpar um domínio não afeta o outro", () => {
    const s = limparSujo(marcarSujo(marcarSujo(sujeiraInicial(), "conteudo"), "aparencia"), "conteudo");
    expect(s).toEqual({ conteudo: false, aparencia: true });
  });
});
