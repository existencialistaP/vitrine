import { describe, it, expect } from "vitest";
import { Loja } from "@/modules/loja/domain/loja";
import { Produto } from "@/modules/loja/domain/produto";
import { Categoria } from "@/modules/loja/domain/categoria";
import { StatusLoja } from "@/modules/loja/domain/status-loja";
import { LojaCriada } from "@/modules/loja/domain/events/loja-criada";
import { ProdutoAdicionado } from "@/modules/loja/domain/events/produto-adicionado";
import { ProdutoAtualizado } from "@/modules/loja/domain/events/produto-atualizado";
import { ProdutoRemovido } from "@/modules/loja/domain/events/produto-removido";
import { TemaAlterado } from "@/modules/loja/domain/events/tema-alterado";
import { ProdutoDuplicado } from "@/modules/loja/domain/exceptions/produto-duplicado";
import { ProdutoNaoEncontrado } from "@/modules/loja/domain/exceptions/produto-nao-encontrado";
import { CategoriaNaoEncontrada } from "@/modules/loja/domain/exceptions/categoria-nao-encontrada";
import { LojaId } from "@/kernel/ids/loja-id";
import { LojistaId } from "@/kernel/ids/lojista-id";
import { ProdutoId } from "@/kernel/ids/produto-id";
import { CategoriaId } from "@/kernel/ids/categoria-id";
import { NomeLoja } from "@/modules/loja/domain/vos/nome-loja";
import { NomeProduto } from "@/modules/loja/domain/vos/nome-produto";
import { NomeCategoria } from "@/modules/loja/domain/vos/nome-categoria";
import { Descricao } from "@/modules/loja/domain/vos/descricao";
import { Slug } from "@/modules/loja/domain/vos/slug";
import { Whatsapp } from "@/modules/loja/domain/vos/whatsapp";
import { Preco } from "@/modules/loja/domain/vos/preco";
import { Ordem } from "@/modules/loja/domain/vos/ordem";
import { IdentidadeVisual, Paleta } from "@/modules/loja/domain/vos/identidade-visual";
import { DisponibilidadeValue } from "@/modules/loja/domain/vos/disponibilidade";

function criarLoja(): Loja {
  return Loja.criar({
    id: LojaId.random(),
    lojistaId: LojistaId.random(),
    nome: NomeLoja.of("Café da Esquina"),
    slug: Slug.of("cafe-da-esquina"),
    descricao: Descricao.of("Cafés especiais"),
    whatsapp: Whatsapp.of("41999998888"),
  });
}

function criarProduto(id = ProdutoId.random()): Produto {
  return Produto.of({
    id,
    nome: NomeProduto.of("Café Arábica 250g"),
    descricao: Descricao.of("Torra média"),
    preco: Preco.of(3500),
  });
}

describe("Loja (agregado)", () => {
  it("cria vitrine com estado inicial e registra LojaCriada", () => {
    const loja = criarLoja();

    expect(loja.isAtiva()).toBe(true);
    expect(loja.getStatus()).toBe(StatusLoja.ATIVA);
    expect(loja.getProdutos()).toHaveLength(0);
    expect(loja.getVersion()).toBeNull();

    const eventos = loja.pullDomainEvents();
    expect(eventos).toHaveLength(1);
    expect(eventos[0]).toBeInstanceOf(LojaCriada);
    expect(loja.getRegisteredEvents()).toHaveLength(0);
  });

  it("adiciona produto e registra ProdutoAdicionado", () => {
    const loja = criarLoja();
    const produto = criarProduto();

    loja.adicionarProduto(produto);

    expect(loja.getProdutos()).toHaveLength(1);
    const eventos = loja.pullDomainEvents();
    expect(eventos.some((e) => e instanceof ProdutoAdicionado)).toBe(true);
  });

  it("rejeita produto duplicado", () => {
    const loja = criarLoja();
    const produto = criarProduto();

    loja.adicionarProduto(produto);
    expect(() => loja.adicionarProduto(produto)).toThrow(ProdutoDuplicado);
  });

  it("atualiza dados de produto existente", () => {
    const loja = criarLoja();
    const produto = criarProduto();
    loja.adicionarProduto(produto);

    loja.atualizarProduto(produto.getId(), { preco: Preco.of(4000) });

    const atualizado = loja.getProdutos()[0];
    expect(atualizado.getPreco().getCents()).toBe(4000);
    expect(
      loja.pullDomainEvents().some((e) => e instanceof ProdutoAtualizado)
    ).toBe(true);
  });

  it("rejeita atualizar produto inexistente", () => {
    const loja = criarLoja();
    expect(() => loja.atualizarProduto(ProdutoId.random(), {})).toThrow(
      ProdutoNaoEncontrado
    );
  });

  it("rejeita produto em categoria inexistente", () => {
    const loja = criarLoja();
    const produto = Produto.of({
      id: ProdutoId.random(),
      nome: NomeProduto.of("Produto"),
      descricao: Descricao.vazia(),
      preco: Preco.zero(),
      categoriaId: CategoriaId.random(),
    });

    expect(() => loja.adicionarProduto(produto)).toThrow(CategoriaNaoEncontrada);
  });

  it("remove produto e registra ProdutoRemovido", () => {
    const loja = criarLoja();
    const produto = criarProduto();
    loja.adicionarProduto(produto);

    loja.removerProduto(produto.getId());

    expect(loja.getProdutos()).toHaveLength(0);
    expect(
      loja.pullDomainEvents().some((e) => e instanceof ProdutoRemovido)
    ).toBe(true);
  });

  it("altera tema e registra TemaAlterado", () => {
    const loja = criarLoja();
    const novo = IdentidadeVisual.padrao().withPaleta(Paleta.BLUSH);

    loja.alterarTema(novo);

    expect(loja.getTema().getPaleta()).toBe("BLUSH");
    expect(loja.pullDomainEvents().some((e) => e instanceof TemaAlterado)).toBe(true);
  });

  it("não registra TemaAlterado quando o tema é igual", () => {
    const loja = criarLoja();
    loja.pullDomainEvents();

    loja.alterarTema(IdentidadeVisual.padrao());

    expect(loja.pullDomainEvents()).toHaveLength(0);
  });

  it("remove categoria e desvincula seus produtos", () => {
    const loja = criarLoja();
    const categoria = Categoria.of({
      id: CategoriaId.random(),
      nome: NomeCategoria.of("Cafés"),
      ordem: Ordem.primeira(),
    });
    loja.adicionarCategoria(categoria);

    const produto = Produto.of({
      id: ProdutoId.random(),
      nome: NomeProduto.of("Produto"),
      descricao: Descricao.vazia(),
      preco: Preco.zero(),
      categoriaId: categoria.getId(),
    });
    loja.adicionarProduto(produto);

    loja.removerCategoria(categoria.getId());

    expect(loja.getCategorias()).toHaveLength(0);
    expect(loja.getProdutos()[0].getCategoriaId()).toBeNull();
  });

  it("alterna disponibilidade de produto", () => {
    const loja = criarLoja();
    const produto = criarProduto();
    loja.adicionarProduto(produto);

    loja.alterarDisponibilidade(
      produto.getId(),
      DisponibilidadeValue.indisponivel()
    );

    expect(loja.getProdutos()[0].getDisponibilidade().isDisponivel()).toBe(false);
  });
});
