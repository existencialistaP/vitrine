import type { DomainObject } from "./domain-object";

/**
 * ID tipado de objeto de domínio.
 *
 * Envolve um UUID em uma classe própria para evitar confusão de identificadores
 * (ex.: trocar um {@code LojaId} por um {@code ProdutoId}). Equivalent ao
 * {@code DomainObjectId} do shared kernel Java.
 */
export abstract class DomainObjectId implements DomainObject {
  private readonly uuid: string;

  protected constructor(uuid: string) {
    if (uuid === null || uuid === undefined) {
      throw new Error("uuid must not be null");
    }
    this.uuid = uuid;
  }

  /** Retorna o UUID como string. */
  toUUID(): string {
    return this.uuid;
  }

  /** Representação textual usada em logs/serialização. */
  toString(): string {
    return this.uuid;
  }

  /**
   * Igualdade tipada: dois IDs só são iguais se forem da mesma classe e
   * possuírem o mesmo UUID.
   */
  equals(other: unknown): boolean {
    if (other === null || other === undefined) return false;
    if (this.constructor !== (other as object).constructor) return false;
    return this.uuid === (other as DomainObjectId).uuid;
  }
}
