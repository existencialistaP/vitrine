import type { DomainEvent } from "@/kernel/ddd/domain-event";
import type { LojaId } from "@/kernel/ids/loja-id";
import type { LojistaId } from "@/kernel/ids/lojista-id";
import type { Loja } from "../loja";
import type { Slug } from "../vos/slug";

/** Evento publicado quando uma nova vitrine é criada. */
export class LojaCriada implements DomainEvent {
  readonly occurredOn: Date;

  private constructor(
    readonly lojaId: LojaId,
    readonly lojistaId: LojistaId,
    readonly slug: Slug,
    occurredOn: Date
  ) {
    this.occurredOn = occurredOn;
  }

  static from(loja: Loja): LojaCriada {
    return new LojaCriada(
      loja.getId(),
      loja.getLojistaId(),
      loja.getSlug(),
      new Date()
    );
  }
}
