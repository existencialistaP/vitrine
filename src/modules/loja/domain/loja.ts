import type { LojaId } from "@/kernel/ids/loja-id";
import type { LojistaId } from "@/kernel/ids/lojista-id";
import type { ProdutoId } from "@/kernel/ids/produto-id";
import type { CategoriaId } from "@/kernel/ids/categoria-id";
import { AggregateRoot } from "@/kernel/ddd/aggregate-root";
import { ProdutoNaoEncontrado } from "./exceptions/produto-nao-encontrado";
import { CategoriaNaoEncontrada } from "./exceptions/categoria-nao-encontrada";
import { ProdutoDuplicado } from "./exceptions/produto-duplicado";
import { CategoriaDuplicada } from "./exceptions/categoria-duplicada";
import { LojaCriada } from "./events/loja-criada";
import { ProdutoAdicionado } from "./events/produto-adicionado";
import { ProdutoAtualizado } from "./events/produto-atualizado";
import { ProdutoRemovido } from "./events/produto-removido";
import { TemaAlterado } from "./events/tema-alterado";
import { Produto } from "./produto";
import { Categoria } from "./categoria";
import type { StatusLoja } from "./status-loja";
import { StatusLoja as Status } from "./status-loja";
import type { NomeLoja } from "./vos/nome-loja";
import type { Descricao } from "./vos/descricao";
import type { Slug } from "./vos/slug";
import type { Whatsapp } from "./vos/whatsapp";
import { IdentidadeVisual } from "./vos/identidade-visual";
import type { NomeCategoria } from "./vos/nome-categoria";
import type { Ordem } from "./vos/ordem";
import { DisponibilidadeValue } from "./vos/disponibilidade";

/**
 * Raiz do agregado central do Vitrine: a vitrine (loja).
 *
 * Garante os invariantes do conjunto (produtos/categorias únicos, categoria
 * referenciada existente, exclusividade de vínculo com o lojista) e registra os
 * eventos de domínio a serem publicados após a persistência.
 */
export class Loja extends AggregateRoot<LojaId> {
  private lojistaId: LojistaId;
  private nome: NomeLoja;
  private slug: Slug;
  private descricao: Descricao;
  private whatsapp: Whatsapp;
  private status: StatusLoja;
  private tema: IdentidadeVisual;
  private readonly produtos: Produto[] = [];
  private readonly categorias: Categoria[] = [];

  private constructor(params: {
    id: LojaId;
    lojistaId: LojistaId;
    nome: NomeLoja;
    slug: Slug;
    descricao: Descricao;
    whatsapp: Whatsapp;
    status?: StatusLoja;
    tema?: IdentidadeVisual;
    produtos?: Produto[];
    categorias?: Categoria[];
    version?: number | null;
  }) {
    super(params.id, params.version ?? null);
    this.lojistaId = params.lojistaId;
    this.nome = params.nome;
    this.slug = params.slug;
    this.descricao = params.descricao;
    this.whatsapp = params.whatsapp;
    this.status = params.status ?? Status.ATIVA;
    this.tema = params.tema ?? IdentidadeVisual.padrao();
    if (params.produtos) this.produtos.push(...params.produtos);
    if (params.categorias) this.categorias.push(...params.categorias);
  }

  /**
   * Cria uma nova vitrine (vínculo de exclusividade com o lojista é garantido
   * pela camada de aplicação + constraint {@code @unique} no banco).
   */
  static criar(params: {
    id: LojaId;
    lojistaId: LojistaId;
    nome: NomeLoja;
    slug: Slug;
    descricao: Descricao;
    whatsapp: Whatsapp;
  }): Loja {
    const loja = new Loja(params);
    loja.registerEvent(LojaCriada.from(loja));
    return loja;
  }

  /** Reconstrói uma vitrine persistida (apenas para a infraestrutura). */
  static reconstruir(params: {
    id: LojaId;
    lojistaId: LojistaId;
    nome: NomeLoja;
    slug: Slug;
    descricao: Descricao;
    whatsapp: Whatsapp;
    status: StatusLoja;
    tema: IdentidadeVisual;
    produtos: Produto[];
    categorias: Categoria[];
    version: number | null;
  }): Loja {
    return new Loja(params);
  }

  getLojistaId(): LojistaId {
    return this.lojistaId;
  }

  getNome(): NomeLoja {
    return this.nome;
  }

  getSlug(): Slug {
    return this.slug;
  }

  getDescricao(): Descricao {
    return this.descricao;
  }

  getWhatsapp(): Whatsapp {
    return this.whatsapp;
  }

  getStatus(): StatusLoja {
    return this.status;
  }

  getTema(): IdentidadeVisual {
    return this.tema;
  }

  getProdutos(): readonly Produto[] {
    return Object.freeze([...this.produtos]);
  }

  getCategorias(): readonly Categoria[] {
    return Object.freeze([...this.categorias]);
  }

  isAtiva(): boolean {
    return this.status === Status.ATIVA;
  }

  /** Atualiza os dados cadastrais da vitrine. */
  alterarDados(params: {
    nome?: NomeLoja;
    descricao?: Descricao;
    whatsapp?: Whatsapp;
  }): void {
    if (params.nome !== undefined) this.nome = params.nome;
    if (params.descricao !== undefined) this.descricao = params.descricao;
    if (params.whatsapp !== undefined) this.whatsapp = params.whatsapp;
  }

  /** Adiciona um produto à vitrine (invariante: não duplicar por ID). */
  adicionarProduto(produto: Produto): void {
    if (this.produtos.some((p) => p.getId().equals(produto.getId()))) {
      throw this.duplicarProduto(produto.getId());
    }
    this.validarCategoriaExiste(produto.getCategoriaId());
    this.produtos.push(produto);
    this.registerEvent(ProdutoAdicionado.from(this, produto.getId()));
  }

  /** Atualiza um produto existente (invariante: produto deve existir). */
  atualizarProduto(
    produtoId: ProdutoId,
    alteracoes: Parameters<Produto["alterarDados"]>[0]
  ): void {
    const produto = this.buscarProduto(produtoId);
    if (alteracoes.categoriaId !== undefined) {
      this.validarCategoriaExiste(alteracoes.categoriaId);
    }
    produto.alterarDados(alteracoes);
    this.registerEvent(ProdutoAtualizado.from(this, produtoId));
  }

  /** Altera a disponibilidade de um produto. */
  alterarDisponibilidade(
    produtoId: ProdutoId,
    disponibilidade: DisponibilidadeValue
  ): void {
    const produto = this.buscarProduto(produtoId);
    produto.alterarDisponibilidade(disponibilidade);
    this.registerEvent(ProdutoAtualizado.from(this, produtoId));
  }

  /** Remove um produto da vitrine. */
  removerProduto(produtoId: ProdutoId): void {
    const indice = this.produtos.findIndex((p) => p.getId().equals(produtoId));
    if (indice === -1) throw new ProdutoNaoEncontrado(produtoId.toUUID());
    this.produtos.splice(indice, 1);
    this.registerEvent(ProdutoRemovido.from(this, produtoId));
  }

  /** Altera a identidade visual da vitrine (RF-004). */
  alterarTema(tema: IdentidadeVisual): void {
    if (tema.equals(this.tema)) return;
    this.tema = tema;
    this.registerEvent(TemaAlterado.from(this, tema));
  }

  inativar(): void {
    this.status = Status.INATIVA;
  }

  ativar(): void {
    this.status = Status.ATIVA;
  }

  /** Adiciona uma categoria de produtos. */
  adicionarCategoria(categoria: Categoria): void {
    if (this.categorias.some((c) => c.getId().equals(categoria.getId()))) {
      throw this.duplicarCategoria(categoria.getId());
    }
    this.categorias.push(categoria);
  }

  /** Renomeia uma categoria existente. */
  renomearCategoria(categoriaId: CategoriaId, nome: NomeCategoria): void {
    this.categorias
      .find((c) => c.getId().equals(categoriaId))
      ?.renomear(nome);
  }

  /** Reposiciona uma categoria. */
  reposicionarCategoria(categoriaId: CategoriaId, ordem: Ordem): void {
    this.categorias
      .find((c) => c.getId().equals(categoriaId))
      ?.reposicionar(ordem);
  }

  /** Remove uma categoria e desvincula seus produtos. */
  removerCategoria(categoriaId: CategoriaId): void {
    const indice = this.categorias.findIndex((c) => c.getId().equals(categoriaId));
    if (indice === -1) throw new CategoriaNaoEncontrada(categoriaId.toUUID());
    this.categorias.splice(indice, 1);
    for (const produto of this.produtos) {
      if (produto.getCategoriaId()?.equals(categoriaId)) {
        produto.alterarDados({ categoriaId: null });
      }
    }
  }

  private buscarProduto(produtoId: ProdutoId): Produto {
    const produto = this.produtos.find((p) => p.getId().equals(produtoId));
    if (!produto) throw new ProdutoNaoEncontrado(produtoId.toUUID());
    return produto;
  }

  private validarCategoriaExiste(categoriaId: CategoriaId | null): void {
    if (categoriaId === null) return;
    const existe = this.categorias.some((c) => c.getId().equals(categoriaId));
    if (!existe) throw new CategoriaNaoEncontrada(categoriaId.toUUID());
  }

  private duplicarProduto(produtoId: ProdutoId): ProdutoDuplicado {
    return new ProdutoDuplicado(produtoId.toUUID());
  }

  private duplicarCategoria(categoriaId: CategoriaId): CategoriaDuplicada {
    return new CategoriaDuplicada(categoriaId.toUUID());
  }
}
