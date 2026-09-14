import { describe, expect, it } from "vitest";

import {
  TETO_QUANTIDADE,
  VERSAO_CARRINHO,
  adicionarItem,
  alterarQuantidadeItem,
  parseCarrinho,
  serializarCarrinho,
  type ItemCarrinho,
} from "@/components/features/vitrine/use-carrinho";

const item = (sobre?: Partial<ItemCarrinho>): ItemCarrinho => ({
  id: "p1",
  nome: "Bolo de cenoura",
  precoCents: 1500,
  precoFormatado: "R$ 15,00",
  quantidade: 1,
  ...sobre,
});

describe("parseCarrinho", () => {
  it("retorna lista vazia para null ou string vazia", () => {
    expect(parseCarrinho(null)).toEqual([]);
    expect(parseCarrinho("")).toEqual([]);
  });

  it("desserializa um carrinho salvo (ida e volta)", () => {
    const itens = [
      item(),
      item({ id: "p2", nome: "Torta", precoCents: 2500, precoFormatado: "R$ 25,00", quantidade: 3 }),
    ];
    expect(parseCarrinho(serializarCarrinho(itens))).toEqual(itens);
  });

  it("descarta JSON quebrado", () => {
    expect(parseCarrinho("{não é json")).toEqual([]);
  });

  it("descarta estrutura inesperada", () => {
    expect(parseCarrinho(JSON.stringify([item()]))).toEqual([]);
    expect(parseCarrinho(JSON.stringify({ versao: 1, itens: "ops" }))).toEqual([]);
    expect(parseCarrinho("42")).toEqual([]);
  });

  it("descarta versão desconhecida", () => {
    const bruto = JSON.stringify({ versao: VERSAO_CARRINHO + 1, itens: [item()] });
    expect(parseCarrinho(bruto)).toEqual([]);
  });

  it("mantém apenas os itens com campos válidos", () => {
    const bruto = JSON.stringify({
      versao: VERSAO_CARRINHO,
      itens: [
        item(),
        { id: "", nome: "X", precoCents: 100, precoFormatado: "R$ 1,00", quantidade: 1 },
        { id: "p9", nome: "Y", precoCents: "cem", precoFormatado: "R$ 1,00", quantidade: 1 },
        { id: "p8", nome: "Z", precoCents: 100, precoFormatado: "R$ 1,00", quantidade: 0 },
        item({ id: "p7", quantidade: TETO_QUANTIDADE + 1 }),
      ],
    });
    expect(parseCarrinho(bruto)).toEqual([item()]);
  });
});

describe("adicionarItem", () => {
  const produto = { id: "p1", nome: "Bolo de cenoura", precoCents: 1500, precoFormatado: "R$ 15,00" };

  it("insere item novo com quantidade 1", () => {
    expect(adicionarItem([], produto)).toEqual([item()]);
  });

  it("incrementa item existente", () => {
    expect(adicionarItem([item({ quantidade: 2 })], produto)).toEqual([item({ quantidade: 3 })]);
  });

  it("não passa do teto de quantidade", () => {
    expect(adicionarItem([item({ quantidade: TETO_QUANTIDADE })], produto)).toEqual([
      item({ quantidade: TETO_QUANTIDADE }),
    ]);
  });
});

describe("alterarQuantidadeItem", () => {
  const itens = [item(), item({ id: "p2", nome: "Torta", precoCents: 2500, precoFormatado: "R$ 25,00" })];

  it("altera a quantidade", () => {
    expect(alterarQuantidadeItem(itens, "p1", 4)).toEqual([
      item({ quantidade: 4 }),
      itens[1],
    ]);
  });

  it("remove o item quando a quantidade é zero ou negativa", () => {
    expect(alterarQuantidadeItem(itens, "p1", 0)).toEqual([itens[1]]);
    expect(alterarQuantidadeItem(itens, "p2", -1)).toEqual([itens[0]]);
  });

  it("limita ao teto", () => {
    expect(alterarQuantidadeItem(itens, "p1", 500)).toEqual([
      item({ quantidade: TETO_QUANTIDADE }),
      itens[1],
    ]);
  });

  it("mantém a lista quando o id não existe", () => {
    expect(alterarQuantidadeItem(itens, "p9", 2)).toEqual(itens);
  });
});

describe("serializarCarrinho", () => {
  it("grava com a versão atual", () => {
    expect(JSON.parse(serializarCarrinho([item()]))).toEqual({
      versao: VERSAO_CARRINHO,
      itens: [item()],
    });
  });
});
