import type { DomainEvent } from "@/kernel/ddd/domain-event";
import type { LojistaId } from "@/kernel/ids/lojista-id";
import type { Lojista } from "../lojista";
import type { Email } from "@/kernel/vos/email";

/** Evento publicado quando um novo lojista é cadastrado. */
export class LojistaCadastrado implements DomainEvent {
  readonly occurredOn: Date;

  private constructor(
    readonly lojistaId: LojistaId,
    readonly email: Email,
    occurredOn: Date
  ) {
    this.occurredOn = occurredOn;
  }

  static from(lojista: Lojista): LojistaCadastrado {
    return new LojistaCadastrado(lojista.getId(), lojista.getEmail(), new Date());
  }
}
