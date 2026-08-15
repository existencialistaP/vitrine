import { randomUUID } from "node:crypto";
import { DomainObjectId } from "../ddd/domain-object-id";

/** Identificador tipado de uma vitrine (loja). */
export class LojaId extends DomainObjectId {
  static readonly VAZIO = new LojaId("");

  private constructor(uuid: string) {
    super(uuid);
  }

  static random(): LojaId {
    return new LojaId(randomUUID());
  }

  static fromString(uuid: string): LojaId {
    return new LojaId(uuid);
  }

  isEmpty(): boolean {
    return this.equals(LojaId.VAZIO);
  }

  isPresent(): boolean {
    return !this.isEmpty();
  }
}
