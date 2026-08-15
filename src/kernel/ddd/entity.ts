import type { DomainObjectId } from "./domain-object-id";
import type { IdentifiableDomainObject } from "./identifiable-domain-object";
import type { ConcurrentDomainObject } from "./concurrent-domain-object";

/**
 * Entidade base (equivalent ao {@code AbstractEntity} do JPA).
 *
 * Possui identidade própria ({@code ID}) e controle de concorrência otimista.
 * Entidades filhas (ex.: Produto dentro de Loja) herdam desta classe; agregados
 * herdam de {@link AggregateRoot}.
 */
export abstract class Entity<ID extends DomainObjectId>
  implements IdentifiableDomainObject<ID>, ConcurrentDomainObject
{
  private readonly id: ID;
  private version: number | null;

  protected constructor(id: ID, version: number | null = null) {
    if (id === null || id === undefined) {
      throw new Error("id must not be null");
    }
    this.id = id;
    this.version = version;
  }

  getId(): ID {
    return this.id;
  }

  getVersion(): number | null {
    return this.version;
  }

  bumpVersion(): void {
    this.version = (this.version ?? 0) + 1;
  }

  /** Igualdade por identidade: mesma classe e mesmo ID. */
  equals(other: unknown): boolean {
    if (other === null || other === undefined) return false;
    if (this.constructor !== (other as object).constructor) return false;
    return this.id.equals((other as Entity<ID>).getId());
  }

  toString(): string {
    return `${this.constructor.name}[${this.id}]`;
  }
}
