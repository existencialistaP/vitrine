import { randomUUID } from "node:crypto";
import { DomainObjectId } from "../ddd/domain-object-id";

/** Identificador tipado de um lojista. */
export class LojistaId extends DomainObjectId {
  static readonly VAZIO = new LojistaId("");

  private constructor(uuid: string) {
    super(uuid);
  }

  static random(): LojistaId {
    return new LojistaId(randomUUID());
  }

  static fromString(uuid: string): LojistaId {
    return new LojistaId(uuid);
  }

  isEmpty(): boolean {
    return this.equals(LojistaId.VAZIO);
  }

  isPresent(): boolean {
    return !this.isEmpty();
  }
}
