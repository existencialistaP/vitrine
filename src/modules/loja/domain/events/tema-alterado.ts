import type { DomainEvent } from "@/kernel/ddd/domain-event";
import type { LojaId } from "@/kernel/ids/loja-id";
import type { Loja } from "../loja";
import type { IdentidadeVisual } from "../vos/identidade-visual";

/** Evento publicado quando a identidade visual da vitrine é alterada (RF-004). */
export class TemaAlterado implements DomainEvent {
  readonly occurredOn: Date;

  private constructor(
    readonly lojaId: LojaId,
    readonly tema: IdentidadeVisual,
    occurredOn: Date
  ) {
    this.occurredOn = occurredOn;
  }

  static from(loja: Loja, tema: IdentidadeVisual): TemaAlterado {
    return new TemaAlterado(loja.getId(), tema, new Date());
  }
}
