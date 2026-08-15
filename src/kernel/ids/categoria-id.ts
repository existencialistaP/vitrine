import { randomUUID } from "node:crypto";
import { DomainObjectId } from "../ddd/domain-object-id";

/** Identificador tipado de uma categoria de produtos. */
export class CategoriaId extends DomainObjectId {
  static readonly VAZIO = new CategoriaId("");

  private constructor(uuid: string) {
    super(uuid);
  }

  static random(): CategoriaId {
    return new CategoriaId(randomUUID());
  }

  static fromString(uuid: string): CategoriaId {
    return new CategoriaId(uuid);
  }

  isEmpty(): boolean {
    return this.equals(CategoriaId.VAZIO);
  }

  isPresent(): boolean {
    return !this.isEmpty();
  }
}
