import type { CategoriaId } from "@/kernel/ids/categoria-id";
import { Entity } from "@/kernel/ddd/entity";
import type { NomeCategoria } from "./vos/nome-categoria";
import { Ordem } from "./vos/ordem";

/**
 * Entidade filha do agregado {@link Loja}: agrupador de produtos da vitrine.
 */
export class Categoria extends Entity<CategoriaId> {
  private nome: NomeCategoria;
  private ordem: Ordem;

  private constructor(id: CategoriaId, nome: NomeCategoria, ordem: Ordem) {
    super(id);
    this.nome = nome;
    this.ordem = ordem;
  }

  static of(params: {
    id: CategoriaId;
    nome: NomeCategoria;
    ordem?: Ordem;
  }): Categoria {
    return new Categoria(
      params.id,
      params.nome,
      params.ordem ?? Ordem.primeira()
    );
  }

  getNome(): NomeCategoria {
    return this.nome;
  }

  getOrdem(): Ordem {
    return this.ordem;
  }

  renomear(nome: NomeCategoria): void {
    this.nome = nome;
  }

  reposicionar(ordem: Ordem): void {
    this.ordem = ordem;
  }
}
