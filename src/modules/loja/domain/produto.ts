import type { CategoriaId } from "@/kernel/ids/categoria-id";
import type { ProdutoId } from "@/kernel/ids/produto-id";
import { Entity } from "@/kernel/ddd/entity";
import type { Descricao } from "./vos/descricao";
import { DisponibilidadeValue } from "./vos/disponibilidade";
import type { NomeProduto } from "./vos/nome-produto";
import { Ordem } from "./vos/ordem";
import type { Preco } from "./vos/preco";
import type { Url } from "./vos/url";

/**
 * Entidade filha do agregado {@link Loja}. Nunca existe isolada: só pode ser
 * criada e alterada através da vitrine (raiz do agregado).
 */
export class Produto extends Entity<ProdutoId> {
  private nome: NomeProduto;
  private descricao: Descricao;
  private preco: Preco;
  private categoriaId: CategoriaId | null;
  private imagemUrl: Url | null;
  private disponibilidade: DisponibilidadeValue;
  private ordem: Ordem;

  private constructor(
    id: ProdutoId,
    nome: NomeProduto,
    descricao: Descricao,
    preco: Preco,
    categoriaId: CategoriaId | null,
    imagemUrl: Url | null,
    disponibilidade: DisponibilidadeValue,
    ordem: Ordem
  ) {
    super(id);
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco;
    this.categoriaId = categoriaId;
    this.imagemUrl = imagemUrl;
    this.disponibilidade = disponibilidade;
    this.ordem = ordem;
  }

  static of(params: {
    id: ProdutoId;
    nome: NomeProduto;
    descricao: Descricao;
    preco: Preco;
    categoriaId?: CategoriaId | null;
    imagemUrl?: Url | null;
    disponibilidade?: DisponibilidadeValue;
    ordem?: Ordem;
  }): Produto {
    return new Produto(
      params.id,
      params.nome,
      params.descricao,
      params.preco,
      params.categoriaId ?? null,
      params.imagemUrl ?? null,
      params.disponibilidade ?? DisponibilidadeValue.disponivel(),
      params.ordem ?? Ordem.primeira()
    );
  }

  getNome(): NomeProduto {
    return this.nome;
  }

  getDescricao(): Descricao {
    return this.descricao;
  }

  getPreco(): Preco {
    return this.preco;
  }

  getCategoriaId(): CategoriaId | null {
    return this.categoriaId;
  }

  getImagemUrl(): Url | null {
    return this.imagemUrl;
  }

  getDisponibilidade(): DisponibilidadeValue {
    return this.disponibilidade;
  }

  getOrdem(): Ordem {
    return this.ordem;
  }

  /** Atualiza os dados comerciais do produto. */
  alterarDados(params: {
    nome?: NomeProduto;
    descricao?: Descricao;
    preco?: Preco;
    categoriaId?: CategoriaId | null;
    imagemUrl?: Url | null;
  }): void {
    if (params.nome !== undefined) this.nome = params.nome;
    if (params.descricao !== undefined) this.descricao = params.descricao;
    if (params.preco !== undefined) this.preco = params.preco;
    if (params.categoriaId !== undefined) this.categoriaId = params.categoriaId;
    if (params.imagemUrl !== undefined) this.imagemUrl = params.imagemUrl;
  }

  /** Altera a disponibilidade de exibição. */
  alterarDisponibilidade(disponibilidade: DisponibilidadeValue): void {
    this.disponibilidade = disponibilidade;
  }

  /** Altera a posição de ordenação na vitrine. */
  reposicionar(ordem: Ordem): void {
    this.ordem = ordem;
  }
}
