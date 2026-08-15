import { randomUUID } from "node:crypto";
import { DomainObjectId } from "../ddd/domain-object-id";

/** Identificador tipado de um produto. */
export class ProdutoId extends DomainObjectId {
  static readonly VAZIO = new ProdutoId("");

  private constructor(uuid: string) {
    super(uuid);
  }

  static random(): ProdutoId {
    return new ProdutoId(randomUUID());
  }

  static fromString(uuid: string): ProdutoId {
    return new ProdutoId(uuid);
  }

  isEmpty(): boolean {
    return this.equals(ProdutoId.VAZIO);
  }

  isPresent(): boolean {
    return !this.isEmpty();
  }
}
