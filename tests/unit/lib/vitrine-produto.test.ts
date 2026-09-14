import { describe, expect, it } from "vitest";

import {
  ehNaoEncontrado,
  selecionarProduto,
} from "@/lib/vitrine-produto";
import { VitrineNaoEncontrada } from "@/modules/catalogo/application/exceptions/vitrine-nao-encontrada";

describe("ehNaoEncontrado", () => {
  it("reconhece VitrineNaoEncontrada como 404", () => {
    expect(ehNaoEncontrado(new VitrineNaoEncontrada("doce-e-tal"))).toBe(true);
  });

  it("não trata outros erros como 404", () => {
    expect(ehNaoEncontrado(new Error("boom"))).toBe(false);
    expect(ehNaoEncontrado(null)).toBe(false);
  });
});

describe("selecionarProduto", () => {
  const produtos = [
    { id: "uuid-1", nome: "Bolo" },
    { id: "uuid-2", nome: "Torta" },
  ];

  it("encontra o produto por id", () => {
    expect(selecionarProduto(produtos, "uuid-2")).toEqual({ id: "uuid-2", nome: "Torta" });
  });

  it("retorna null quando o id não existe", () => {
    expect(selecionarProduto(produtos, "uuid-9")).toBeNull();
  });

  it("retorna null para lista vazia", () => {
    expect(selecionarProduto([], "uuid-1")).toBeNull();
  });
});
